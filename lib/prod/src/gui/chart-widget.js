import { ensureDefined, ensureNotNull } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
import { Delegate } from '../helpers/delegate';
import { ChartModel } from '../model/chart-model';
import { InvalidateMask, } from '../model/invalidate-mask';
import { Series } from '../model/series';
import { createPreconfiguredCanvas, getCanvasDevicePixelRatio, getContext2D, Size } from './canvas-utils';
import { PaneSeparator, SEPARATOR_HEIGHT } from './pane-separator';
import { PaneWidget } from './pane-widget';
import { TimeAxisWidget } from './time-axis-widget';
export class ChartWidget {
    constructor(container, options) {
        this._private__paneWidgets = [];
        this._private__paneSeparators = [];
        this._private__drawRafId = 0;
        this._private__height = 0;
        this._private__width = 0;
        this._private__leftPriceAxisWidth = 0;
        this._private__rightPriceAxisWidth = 0;
        this._private__invalidateMask = null;
        this._private__drawPlanned = false;
        this._private__clicked = new Delegate();
        this._private__crosshairMoved = new Delegate();
        this._private__options = options;
        this._private__element = document.createElement('div');
        this._private__element.classList.add('tv-lightweight-charts');
        this._private__element.style.overflow = 'hidden';
        this._private__element.style.width = '100%';
        this._private__element.style.height = '100%';
        disableSelection(this._private__element);
        this._private__tableElement = document.createElement('table');
        this._private__tableElement.setAttribute('cellspacing', '0');
        this._private__element.appendChild(this._private__tableElement);
        this._private__onWheelBound = this._private__onMousewheel.bind(this);
        this._private__element.addEventListener('wheel', this._private__onWheelBound, { passive: false });
        this._private__model = new ChartModel(this._private__invalidateHandler.bind(this), this._private__options);
        this._internal_model()._internal_crosshairMoved()._internal_subscribe(this._private__onPaneWidgetCrosshairMoved.bind(this), this);
        this._private__timeAxisWidget = new TimeAxisWidget(this);
        this._private__tableElement.appendChild(this._private__timeAxisWidget._internal_getElement());
        let width = this._private__options.width;
        let height = this._private__options.height;
        if (width === 0 || height === 0) {
            const containerRect = container.getBoundingClientRect();
            // TODO: Fix it better
            // on Hi-DPI CSS size * Device Pixel Ratio should be integer to avoid smoothing
            // For chart widget we decreases because we must be inside container.
            // For time axis this is not important, since it just affects space for pane widgets
            if (width === 0) {
                width = Math.floor(containerRect.width);
                width -= width % 2;
            }
            if (height === 0) {
                height = Math.floor(containerRect.height);
                height -= height % 2;
            }
        }
        // BEWARE: resize must be called BEFORE _syncGuiWithModel (in constructor only)
        // or after but with adjustSize to properly update time scale
        this._internal_resize(width, height);
        this._private__syncGuiWithModel();
        container.appendChild(this._private__element);
        this._private__updateTimeAxisVisibility();
        this._private__model._internal_timeScale()._internal_optionsApplied()._internal_subscribe(this._private__model._internal_fullUpdate.bind(this._private__model), this);
        this._private__model._internal_priceScalesOptionsChanged()._internal_subscribe(this._private__model._internal_fullUpdate.bind(this._private__model), this);
    }
    _internal_model() {
        return this._private__model;
    }
    _internal_options() {
        return this._private__options;
    }
    _internal_paneWidgets() {
        return this._private__paneWidgets;
    }
    _internal_timeAxisWidget() {
        return this._private__timeAxisWidget;
    }
    _internal_destroy() {
        this._private__element.removeEventListener('wheel', this._private__onWheelBound);
        if (this._private__drawRafId !== 0) {
            window.cancelAnimationFrame(this._private__drawRafId);
        }
        this._private__model._internal_crosshairMoved()._internal_unsubscribeAll(this);
        this._private__model._internal_timeScale()._internal_optionsApplied()._internal_unsubscribeAll(this);
        this._private__model._internal_priceScalesOptionsChanged()._internal_unsubscribeAll(this);
        this._private__model._internal_destroy();
        for (const paneWidget of this._private__paneWidgets) {
            this._private__tableElement.removeChild(paneWidget._internal_getElement());
            paneWidget._internal_clicked()._internal_unsubscribeAll(this);
            paneWidget._internal_destroy();
        }
        this._private__paneWidgets = [];
        for (const paneSeparator of this._private__paneSeparators) {
            this._private__destroySeparator(paneSeparator);
        }
        this._private__paneSeparators = [];
        ensureNotNull(this._private__timeAxisWidget)._internal_destroy();
        if (this._private__element.parentElement !== null) {
            this._private__element.parentElement.removeChild(this._private__element);
        }
        this._private__crosshairMoved._internal_destroy();
        this._private__clicked._internal_destroy();
    }
    _internal_resize(width, height, forceRepaint = false) {
        if (this._private__height === height && this._private__width === width) {
            return;
        }
        this._private__height = height;
        this._private__width = width;
        const heightStr = height + 'px';
        const widthStr = width + 'px';
        ensureNotNull(this._private__element).style.height = heightStr;
        ensureNotNull(this._private__element).style.width = widthStr;
        this._private__tableElement.style.height = heightStr;
        this._private__tableElement.style.width = widthStr;
        if (forceRepaint) {
            this._private__drawImpl(new InvalidateMask(3 /* Full */));
        }
        else {
            this._private__model._internal_fullUpdate();
        }
    }
    _internal_paint(invalidateMask) {
        if (invalidateMask === undefined) {
            invalidateMask = new InvalidateMask(3 /* Full */);
        }
        for (let i = 0; i < this._private__paneWidgets.length; i++) {
            this._private__paneWidgets[i]._internal_paint(invalidateMask._internal_invalidateForPane(i)._internal_level);
        }
        if (this._private__options.timeScale.visible) {
            this._private__timeAxisWidget._internal_paint(invalidateMask._internal_fullInvalidation());
        }
    }
    _internal_applyOptions(options) {
        // we don't need to merge options here because it's done in chart model
        // and since both model and widget share the same object it will be done automatically for widget as well
        // not ideal solution for sure, but it work's for now ¯\_(ツ)_/¯
        this._private__model._internal_applyOptions(options);
        this._private__updateTimeAxisVisibility();
        const width = options.width || this._private__width;
        const height = options.height || this._private__height;
        this._internal_resize(width, height);
    }
    _internal_clicked() {
        return this._private__clicked;
    }
    _internal_crosshairMoved() {
        return this._private__crosshairMoved;
    }
    _internal_takeScreenshot() {
        if (this._private__invalidateMask !== null) {
            this._private__drawImpl(this._private__invalidateMask);
            this._private__invalidateMask = null;
        }
        // calculate target size
        const firstPane = this._private__paneWidgets[0];
        const targetCanvas = createPreconfiguredCanvas(document, new Size(this._private__width, this._private__height));
        const ctx = getContext2D(targetCanvas);
        const pixelRatio = getCanvasDevicePixelRatio(targetCanvas);
        drawScaled(ctx, pixelRatio, () => {
            let targetX = 0;
            let targetY = 0;
            const drawPriceAxises = (position) => {
                for (let paneIndex = 0; paneIndex < this._private__paneWidgets.length; paneIndex++) {
                    const paneWidget = this._private__paneWidgets[paneIndex];
                    const paneWidgetHeight = paneWidget._internal_getSize()._internal_h;
                    const priceAxisWidget = ensureNotNull(position === 'left' ? paneWidget._internal_leftPriceAxisWidget() : paneWidget._internal_rightPriceAxisWidget());
                    const image = priceAxisWidget._internal_getImage();
                    ctx.drawImage(image, targetX, targetY, priceAxisWidget._internal_getWidth(), paneWidgetHeight);
                    targetY += paneWidgetHeight;
                    if (paneIndex < this._private__paneWidgets.length - 1) {
                        const separator = this._private__paneSeparators[paneIndex];
                        const separatorSize = separator._internal_getSize();
                        const separatorImage = separator._internal_getImage();
                        ctx.drawImage(separatorImage, targetX, targetY, separatorSize._internal_w, separatorSize._internal_h);
                        targetY += separatorSize._internal_h;
                    }
                }
            };
            // draw left price scale if exists
            if (this._private__isLeftAxisVisible()) {
                drawPriceAxises('left');
                targetX = ensureNotNull(firstPane._internal_leftPriceAxisWidget())._internal_getWidth();
            }
            targetY = 0;
            for (let paneIndex = 0; paneIndex < this._private__paneWidgets.length; paneIndex++) {
                const paneWidget = this._private__paneWidgets[paneIndex];
                const paneWidgetSize = paneWidget._internal_getSize();
                const image = paneWidget._internal_getImage();
                ctx.drawImage(image, targetX, targetY, paneWidgetSize._internal_w, paneWidgetSize._internal_h);
                targetY += paneWidgetSize._internal_h;
                if (paneIndex < this._private__paneWidgets.length - 1) {
                    const separator = this._private__paneSeparators[paneIndex];
                    const separatorSize = separator._internal_getSize();
                    const separatorImage = separator._internal_getImage();
                    ctx.drawImage(separatorImage, targetX, targetY, separatorSize._internal_w, separatorSize._internal_h);
                    targetY += separatorSize._internal_h;
                }
            }
            targetX += firstPane._internal_getSize()._internal_w;
            if (this._private__isRightAxisVisible()) {
                targetY = 0;
                drawPriceAxises('right');
            }
            const drawStub = (position) => {
                const stub = ensureNotNull(position === 'left' ? this._private__timeAxisWidget._internal_leftStub() : this._private__timeAxisWidget._internal_rightStub());
                const size = stub._internal_getSize();
                const image = stub._internal_getImage();
                ctx.drawImage(image, targetX, targetY, size._internal_w, size._internal_h);
            };
            // draw time scale
            if (this._private__options.timeScale.visible) {
                targetX = 0;
                if (this._private__isLeftAxisVisible()) {
                    drawStub('left');
                    targetX = ensureNotNull(firstPane._internal_leftPriceAxisWidget())._internal_getWidth();
                }
                const size = this._private__timeAxisWidget._internal_getSize();
                const image = this._private__timeAxisWidget._internal_getImage();
                ctx.drawImage(image, targetX, targetY, size._internal_w, size._internal_h);
                if (this._private__isRightAxisVisible()) {
                    targetX += firstPane._internal_getSize()._internal_w;
                    drawStub('right');
                    ctx.restore();
                }
            }
        });
        return targetCanvas;
    }
    _internal_getPriceAxisWidth(position) {
        if (position === 'left' && !this._private__isLeftAxisVisible()) {
            return 0;
        }
        if (position === 'right' && !this._private__isRightAxisVisible()) {
            return 0;
        }
        if (this._private__paneWidgets.length === 0) {
            return 0;
        }
        // we don't need to worry about exactly pane widget here
        // because all pane widgets have the same width of price axis widget
        // see _adjustSizeImpl
        const priceAxisWidget = position === 'left'
            ? this._private__paneWidgets[0]._internal_leftPriceAxisWidget()
            : this._private__paneWidgets[0]._internal_rightPriceAxisWidget();
        return ensureNotNull(priceAxisWidget)._internal_getWidth();
    }
    _internal_adjustSize() {
        this._private__adjustSizeImpl();
    }
    // eslint-disable-next-line complexity
    _private__adjustSizeImpl() {
        var _a;
        let totalStretch = 0;
        let leftPriceAxisWidth = 0;
        let rightPriceAxisWidth = 0;
        for (const paneWidget of this._private__paneWidgets) {
            if (this._private__isLeftAxisVisible()) {
                leftPriceAxisWidth = Math.max(leftPriceAxisWidth, ensureNotNull(paneWidget._internal_leftPriceAxisWidget())._internal_optimalWidth());
            }
            if (this._private__isRightAxisVisible()) {
                rightPriceAxisWidth = Math.max(rightPriceAxisWidth, ensureNotNull(paneWidget._internal_rightPriceAxisWidget())._internal_optimalWidth());
            }
            totalStretch += paneWidget._internal_stretchFactor();
        }
        const width = this._private__width;
        const height = this._private__height;
        const paneWidth = Math.max(width - leftPriceAxisWidth - rightPriceAxisWidth, 0);
        const separatorCount = this._private__paneSeparators.length;
        const separatorHeight = SEPARATOR_HEIGHT;
        const separatorsHeight = separatorHeight * separatorCount;
        const timeAxisVisible = this._private__options.timeScale.visible;
        let timeAxisHeight = timeAxisVisible ? this._private__timeAxisWidget._internal_optimalHeight() : 0;
        // TODO: Fix it better
        // on Hi-DPI CSS size * Device Pixel Ratio should be integer to avoid smoothing
        if (timeAxisHeight % 2) {
            timeAxisHeight += 1;
        }
        const otherWidgetHeight = separatorsHeight + timeAxisHeight;
        const totalPaneHeight = height < otherWidgetHeight ? 0 : height - otherWidgetHeight;
        const stretchPixels = totalPaneHeight / totalStretch;
        let accumulatedHeight = 0;
        const pixelRatio = ((_a = document.body.ownerDocument.defaultView) === null || _a === void 0 ? void 0 : _a.devicePixelRatio) || 1;
        for (let paneIndex = 0; paneIndex < this._private__paneWidgets.length; ++paneIndex) {
            const paneWidget = this._private__paneWidgets[paneIndex];
            paneWidget._internal_setState(this._private__model._internal_panes()[paneIndex]);
            let paneHeight = 0;
            let calculatePaneHeight = 0;
            if (paneIndex === this._private__paneWidgets.length - 1) {
                calculatePaneHeight = Math.ceil((totalPaneHeight - accumulatedHeight) * pixelRatio) / pixelRatio;
            }
            else {
                calculatePaneHeight = Math.round(paneWidget._internal_stretchFactor() * stretchPixels * pixelRatio) / pixelRatio;
            }
            paneHeight = Math.max(calculatePaneHeight, 2);
            accumulatedHeight += paneHeight;
            paneWidget._internal_setSize(new Size(paneWidth, paneHeight));
            if (this._private__isLeftAxisVisible()) {
                paneWidget._internal_setPriceAxisSize(leftPriceAxisWidth, 'left');
            }
            if (this._private__isRightAxisVisible()) {
                paneWidget._internal_setPriceAxisSize(rightPriceAxisWidth, 'right');
            }
            if (paneWidget._internal_state()) {
                this._private__model._internal_setPaneHeight(paneWidget._internal_state(), paneHeight);
            }
        }
        this._private__timeAxisWidget._internal_setSizes(new Size(timeAxisVisible ? paneWidth : 0, timeAxisHeight), timeAxisVisible ? leftPriceAxisWidth : 0, timeAxisVisible ? rightPriceAxisWidth : 0);
        this._private__model._internal_setWidth(paneWidth);
        if (this._private__leftPriceAxisWidth !== leftPriceAxisWidth) {
            this._private__leftPriceAxisWidth = leftPriceAxisWidth;
        }
        if (this._private__rightPriceAxisWidth !== rightPriceAxisWidth) {
            this._private__rightPriceAxisWidth = rightPriceAxisWidth;
        }
    }
    _private__onMousewheel(event) {
        let deltaX = event.deltaX / 100;
        let deltaY = -(event.deltaY / 100);
        if ((deltaX === 0 || !this._private__options.handleScroll.mouseWheel) &&
            (deltaY === 0 || !this._private__options.handleScale.mouseWheel)) {
            return;
        }
        if (event.cancelable) {
            event.preventDefault();
        }
        switch (event.deltaMode) {
            case event.DOM_DELTA_PAGE:
                // one screen at time scroll mode
                deltaX *= 120;
                deltaY *= 120;
                break;
            case event.DOM_DELTA_LINE:
                // one line at time scroll mode
                deltaX *= 32;
                deltaY *= 32;
                break;
        }
        if (deltaY !== 0 && this._private__options.handleScale.mouseWheel) {
            const zoomScale = Math.sign(deltaY) * Math.min(1, Math.abs(deltaY));
            const scrollPosition = event.clientX - this._private__element.getBoundingClientRect().left;
            this._internal_model()._internal_zoomTime(scrollPosition, zoomScale);
        }
        if (deltaX !== 0 && this._private__options.handleScroll.mouseWheel) {
            this._internal_model()._internal_scrollChart(deltaX * -80); // 80 is a made up coefficient, and minus is for the "natural" scroll
        }
    }
    _private__drawImpl(invalidateMask) {
        var _a;
        const invalidationType = invalidateMask._internal_fullInvalidation();
        // actions for full invalidation ONLY (not shared with light)
        if (invalidationType === 3 /* Full */) {
            this._private__updateGui();
        }
        // light or full invalidate actions
        if (invalidationType === 3 /* Full */ ||
            invalidationType === 2 /* Light */) {
            this._private__applyMomentaryAutoScale(invalidateMask);
            this._private__applyTimeScaleInvalidations(invalidateMask);
            this._private__timeAxisWidget._internal_update();
            this._private__paneWidgets.forEach((pane) => {
                pane._internal_updatePriceAxisWidgets();
            });
            // In the case a full invalidation has been postponed during the draw, reapply
            // the timescale invalidations. A full invalidation would mean there is a change
            // in the timescale width (caused by price scale changes) that needs to be drawn
            // right away to avoid flickering.
            if (((_a = this._private__invalidateMask) === null || _a === void 0 ? void 0 : _a._internal_fullInvalidation()) === 3 /* Full */) {
                this._private__invalidateMask._internal_merge(invalidateMask);
                this._private__updateGui();
                this._private__applyMomentaryAutoScale(this._private__invalidateMask);
                this._private__applyTimeScaleInvalidations(this._private__invalidateMask);
                invalidateMask = this._private__invalidateMask;
                this._private__invalidateMask = null;
            }
        }
        this._internal_paint(invalidateMask);
    }
    _private__applyTimeScaleInvalidations(invalidateMask) {
        const timeScaleInvalidations = invalidateMask._internal_timeScaleInvalidations();
        for (const tsInvalidation of timeScaleInvalidations) {
            this._private__applyTimeScaleInvalidation(tsInvalidation);
        }
    }
    _private__applyMomentaryAutoScale(invalidateMask) {
        const panes = this._private__model._internal_panes();
        for (let i = 0; i < panes.length; i++) {
            if (invalidateMask._internal_invalidateForPane(i)._internal_autoScale) {
                panes[i]._internal_momentaryAutoScale();
            }
        }
    }
    _private__applyTimeScaleInvalidation(invalidation) {
        const timeScale = this._private__model._internal_timeScale();
        switch (invalidation._internal_type) {
            case 0 /* FitContent */:
                timeScale._internal_fitContent();
                break;
            case 1 /* ApplyRange */:
                timeScale._internal_setLogicalRange(invalidation._internal_value);
                break;
            case 2 /* ApplyBarSpacing */:
                timeScale._internal_setBarSpacing(invalidation._internal_value);
                break;
            case 3 /* ApplyRightOffset */:
                timeScale._internal_setRightOffset(invalidation._internal_value);
                break;
            case 4 /* Reset */:
                timeScale._internal_restoreDefault();
                break;
        }
    }
    _private__invalidateHandler(invalidateMask) {
        if (this._private__invalidateMask !== null) {
            this._private__invalidateMask._internal_merge(invalidateMask);
        }
        else {
            this._private__invalidateMask = invalidateMask;
        }
        if (!this._private__drawPlanned) {
            this._private__drawPlanned = true;
            this._private__drawRafId = window.requestAnimationFrame(() => {
                this._private__drawPlanned = false;
                this._private__drawRafId = 0;
                if (this._private__invalidateMask !== null) {
                    const mask = this._private__invalidateMask;
                    this._private__invalidateMask = null;
                    this._private__drawImpl(mask);
                }
            });
        }
    }
    _private__updateGui() {
        this._private__syncGuiWithModel();
    }
    _private__destroySeparator(separator) {
        this._private__tableElement.removeChild(separator._internal_getElement());
        separator._internal_destroy();
    }
    _private__syncGuiWithModel() {
        const panes = this._private__model._internal_panes();
        const targetPaneWidgetsCount = panes.length;
        const actualPaneWidgetsCount = this._private__paneWidgets.length;
        // Remove (if needed) pane widgets and separators
        for (let i = targetPaneWidgetsCount; i < actualPaneWidgetsCount; i++) {
            const paneWidget = ensureDefined(this._private__paneWidgets.pop());
            this._private__tableElement.removeChild(paneWidget._internal_getElement());
            paneWidget._internal_clicked()._internal_unsubscribeAll(this);
            paneWidget._internal_destroy();
            const paneSeparator = this._private__paneSeparators.pop();
            if (paneSeparator !== undefined) {
                this._private__destroySeparator(paneSeparator);
            }
        }
        // Create (if needed) new pane widgets and separators
        for (let i = actualPaneWidgetsCount; i < targetPaneWidgetsCount; i++) {
            const paneWidget = new PaneWidget(this, panes[i]);
            paneWidget._internal_clicked()._internal_subscribe(this._private__onPaneWidgetClicked.bind(this), this);
            this._private__paneWidgets.push(paneWidget);
            // create and insert separator
            if (i > 0) {
                const paneSeparator = new PaneSeparator(this, i - 1, i, false);
                this._private__paneSeparators.push(paneSeparator);
                this._private__tableElement.insertBefore(paneSeparator._internal_getElement(), this._private__timeAxisWidget._internal_getElement());
            }
            // insert paneWidget
            this._private__tableElement.insertBefore(paneWidget._internal_getElement(), this._private__timeAxisWidget._internal_getElement());
        }
        for (let i = 0; i < targetPaneWidgetsCount; i++) {
            const state = panes[i];
            const paneWidget = this._private__paneWidgets[i];
            if (paneWidget._internal_state() !== state) {
                paneWidget._internal_setState(state);
            }
            else {
                paneWidget._internal_updatePriceAxisWidgetsStates();
            }
        }
        this._private__updateTimeAxisVisibility();
        this._private__adjustSizeImpl();
    }
    _private__getMouseEventParamsImpl(index, details) {
        var _a, _b;
        const seriesData = new Map();
        if (index !== null) {
            const serieses = this._private__model._internal_serieses();
            serieses.forEach((s) => {
                // TODO: replace with search left
                const data = s._internal_bars()._internal_search(index);
                if (data !== null) {
                    seriesData.set(s, data);
                }
            });
        }
        let clientTime;
        if (index !== null) {
            const timePoint = (_a = this._private__model._internal_timeScale()._internal_indexToTimeScalePoint(index)) === null || _a === void 0 ? void 0 : _a._internal_originalTime;
            if (timePoint !== undefined) {
                clientTime = timePoint;
            }
        }
        const hoveredSource = this._internal_model()._internal_hoveredSource();
        const hoveredSeries = hoveredSource !== null && hoveredSource._internal_source instanceof Series
            ? hoveredSource._internal_source
            : undefined;
        const hoveredObject = hoveredSource !== null && hoveredSource._internal_object !== undefined
            ? hoveredSource._internal_object._internal_externalId
            : undefined;
        return {
            _internal_time: clientTime,
            _internal_index: index !== null && index !== void 0 ? index : undefined,
            _internal_point: details !== null && details !== void 0 ? details : undefined,
            _internal_paneIndex: (_b = details === null || details === void 0 ? void 0 : details._internal_paneIndex) !== null && _b !== void 0 ? _b : undefined,
            _internal_hoveredSeries: hoveredSeries,
            _internal_seriesData: seriesData,
            _internal_hoveredObject: hoveredObject,
        };
    }
    _private__onPaneWidgetClicked(time, details) {
        this._private__clicked._internal_fire(() => this._private__getMouseEventParamsImpl(time, details));
    }
    _private__onPaneWidgetCrosshairMoved(time, details) {
        this._private__crosshairMoved._internal_fire(() => this._private__getMouseEventParamsImpl(time, details));
    }
    _private__updateTimeAxisVisibility() {
        const display = this._private__options.timeScale.visible ? '' : 'none';
        this._private__timeAxisWidget._internal_getElement().style.display = display;
    }
    _private__isLeftAxisVisible() {
        return this._private__paneWidgets[0]._internal_state()._internal_leftPriceScale()._internal_options().visible;
    }
    _private__isRightAxisVisible() {
        return this._private__paneWidgets[0]._internal_state()._internal_rightPriceScale()._internal_options().visible;
    }
}
function disableSelection(element) {
    element.style.userSelect = 'none';
    // eslint-disable-next-line deprecation/deprecation
    element.style.webkitUserSelect = 'none';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    element.style.msUserSelect = 'none';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    element.style.MozUserSelect = 'none';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
    element.style.webkitTapHighlightColor = 'transparent';
}

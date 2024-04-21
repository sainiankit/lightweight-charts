import { ensureNotNull } from '../helpers/assertions';
import { clearRect, clearRectWithGradient, drawScaled } from '../helpers/canvas-helpers';
import { Delegate } from '../helpers/delegate';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { KineticAnimation } from './kinetic-animation';
import { MouseEventHandler } from './mouse-event-handler';
import { PriceAxisWidget } from './price-axis-widget';
;
function drawBackground(renderer, ctx, pixelRatio, isHovered, hitTestData) {
    if (renderer._internal_drawBackground) {
        renderer._internal_drawBackground(ctx, pixelRatio, isHovered, hitTestData);
    }
}
function drawForeground(renderer, ctx, pixelRatio, isHovered, hitTestData) {
    renderer._internal_draw(ctx, pixelRatio, isHovered, hitTestData);
}
function sourcePaneViews(source, pane) {
    return source._internal_paneViews(pane);
}
function sourceLabelPaneViews(source, pane) {
    return source._internal_labelPaneViews(pane);
}
function sourceTopPaneViews(source, pane) {
    return source._internal_topPaneViews !== undefined ? source._internal_topPaneViews(pane) : [];
}
export class PaneWidget {
    constructor(chart, state) {
        this._private__size = new Size(0, 0);
        this._private__leftPriceAxisWidget = null;
        this._private__rightPriceAxisWidget = null;
        this._private__startScrollingPos = null;
        this._private__isScrolling = false;
        this._private__clicked = new Delegate();
        this._private__prevPinchScale = 0;
        this._private__longTap = false;
        this._private__startTrackPoint = null;
        this._private__exitTrackingModeOnNextTry = false;
        this._private__initCrosshairPosition = null;
        this._private__scrollXAnimation = null;
        this._private__isSettingSize = false;
        this._private__canvasConfiguredHandler = () => {
            if (this._private__isSettingSize || this._private__state === null) {
                return;
            }
            this._private__model()._internal_lightUpdate();
        };
        this._private__topCanvasConfiguredHandler = () => {
            if (this._private__isSettingSize || this._private__state === null) {
                return;
            }
            this._private__model()._internal_lightUpdate();
        };
        this._private__chart = chart;
        this._private__state = state;
        this._private__state._internal_onDestroyed()._internal_subscribe(this._private__onStateDestroyed.bind(this), this, true);
        this._private__paneCell = document.createElement('td');
        this._private__paneCell.style.padding = '0';
        this._private__paneCell.style.position = 'relative';
        const paneWrapper = document.createElement('div');
        paneWrapper.style.width = '100%';
        paneWrapper.style.height = '100%';
        paneWrapper.style.position = 'relative';
        paneWrapper.style.overflow = 'hidden';
        this._private__leftAxisCell = document.createElement('td');
        this._private__leftAxisCell.style.padding = '0';
        this._private__rightAxisCell = document.createElement('td');
        this._private__rightAxisCell.style.padding = '0';
        this._private__paneCell.appendChild(paneWrapper);
        this._private__canvasBinding = createBoundCanvas(paneWrapper, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        const canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(paneWrapper, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        const topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        this._private__rowElement = document.createElement('tr');
        this._private__rowElement.appendChild(this._private__leftAxisCell);
        this._private__rowElement.appendChild(this._private__paneCell);
        this._private__rowElement.appendChild(this._private__rightAxisCell);
        this._internal_updatePriceAxisWidgetsStates();
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, this, {
            _internal_treatVertTouchDragAsPageScroll: () => this._private__startTrackPoint === null && !this._private__chart._internal_options().handleScroll.vertTouchDrag,
            _internal_treatHorzTouchDragAsPageScroll: () => this._private__startTrackPoint === null && !this._private__chart._internal_options().handleScroll.horzTouchDrag,
        });
    }
    _internal_destroy() {
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_destroy();
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_destroy();
        }
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__mouseEventHandler._internal_destroy();
    }
    _internal_state() {
        return ensureNotNull(this._private__state);
    }
    _internal_setState(pane) {
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__state = pane;
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_subscribe(PaneWidget.prototype._private__onStateDestroyed.bind(this), this, true);
        }
        this._internal_updatePriceAxisWidgetsStates();
    }
    _internal_chart() {
        return this._private__chart;
    }
    _internal_getElement() {
        return this._private__rowElement;
    }
    _internal_updatePriceAxisWidgetsStates() {
        if (this._private__state === null) {
            return;
        }
        this._private__recreatePriceAxisWidgets();
        if (this._private__model()._internal_serieses().length === 0) {
            return;
        }
        if (this._private__leftPriceAxisWidget !== null) {
            const leftPriceScale = this._private__state._internal_leftPriceScale();
            this._private__leftPriceAxisWidget._internal_setPriceScale(ensureNotNull(leftPriceScale));
        }
        if (this._private__rightPriceAxisWidget !== null) {
            const rightPriceScale = this._private__state._internal_rightPriceScale();
            this._private__rightPriceAxisWidget._internal_setPriceScale(ensureNotNull(rightPriceScale));
        }
    }
    _internal_updatePriceAxisWidgets() {
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_update();
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_update();
        }
    }
    _internal_stretchFactor() {
        return this._private__state !== null ? this._private__state._internal_stretchFactor() : 0;
    }
    _internal_setStretchFactor(stretchFactor) {
        if (this._private__state) {
            this._private__state._internal_setStretchFactor(stretchFactor);
        }
    }
    _internal_mouseEnterEvent(event) {
        if (!this._private__state) {
            return;
        }
        this._private__onMouseEvent();
        const x = event._internal_localX;
        const y = event._internal_localY;
        this._private__setCrosshairPosition(x, y);
    }
    _internal_mouseDownEvent(event) {
        this._private__onMouseEvent();
        this._private__mouseTouchDownEvent();
        this._private__setCrosshairPosition(event._internal_localX, event._internal_localY);
    }
    _internal_mouseMoveEvent(event) {
        if (!this._private__state) {
            return;
        }
        this._private__onMouseEvent();
        const x = event._internal_localX;
        const y = event._internal_localY;
        this._private__setCrosshairPosition(x, y);
        const hitTest = this._internal_hitTest(x, y);
        this._private__model()._internal_setHoveredSource(hitTest && { _internal_source: hitTest._internal_source, _internal_object: hitTest._internal_object });
    }
    _internal_mouseClickEvent(event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        const x = event._internal_localX;
        const y = event._internal_localY;
        if (this._private__clicked._internal_hasListeners()) {
            const currentTime = this._private__model()._internal_crosshairSource()._internal_appliedIndex();
            const paneIndex = this._private__model()._internal_getPaneIndex(ensureNotNull(this._private__state));
            this._private__clicked._internal_fire(currentTime, { x, y, _internal_paneIndex: paneIndex });
        }
    }
    _internal_pressedMouseMoveEvent(event) {
        this._private__onMouseEvent();
        this._private__pressedMouseTouchMoveEvent(event);
        this._private__setCrosshairPosition(event._internal_localX, event._internal_localY);
    }
    _internal_mouseUpEvent(event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        this._private__longTap = false;
        this._private__endScroll(event);
    }
    _internal_longTapEvent(event) {
        this._private__longTap = true;
        if (this._private__startTrackPoint === null) {
            const point = { x: event._internal_localX, y: event._internal_localY };
            this._private__startTrackingMode(point, point);
        }
    }
    _internal_mouseLeaveEvent(event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        this._private__state._internal_model()._internal_setHoveredSource(null);
        this._private__clearCrosshairPosition();
    }
    _internal_clicked() {
        return this._private__clicked;
    }
    _internal_pinchStartEvent() {
        this._private__prevPinchScale = 1;
        this._private__terminateKineticAnimation();
    }
    _internal_pinchEvent(middlePoint, scale) {
        if (!this._private__chart._internal_options().handleScale.pinch) {
            return;
        }
        const zoomScale = (scale - this._private__prevPinchScale) * 5;
        this._private__prevPinchScale = scale;
        this._private__model()._internal_zoomTime(middlePoint._internal_x, zoomScale);
    }
    _internal_touchStartEvent(event) {
        this._private__longTap = false;
        this._private__exitTrackingModeOnNextTry = this._private__startTrackPoint !== null;
        this._private__mouseTouchDownEvent();
        if (this._private__startTrackPoint !== null) {
            const crosshair = this._private__model()._internal_crosshairSource();
            this._private__initCrosshairPosition = { x: crosshair._internal_appliedX(), y: crosshair._internal_appliedY() };
            this._private__startTrackPoint = { x: event._internal_localX, y: event._internal_localY };
        }
    }
    _internal_touchMoveEvent(event) {
        if (this._private__state === null) {
            return;
        }
        const x = event._internal_localX;
        const y = event._internal_localY;
        if (this._private__startTrackPoint !== null) {
            // tracking mode: move crosshair
            this._private__exitTrackingModeOnNextTry = false;
            const origPoint = ensureNotNull(this._private__initCrosshairPosition);
            const newX = origPoint.x + (x - this._private__startTrackPoint.x);
            const newY = origPoint.y + (y - this._private__startTrackPoint.y);
            this._private__setCrosshairPosition(newX, newY);
            return;
        }
        this._private__pressedMouseTouchMoveEvent(event);
    }
    _internal_touchEndEvent(event) {
        if (this._internal_chart()._internal_options().trackingMode.exitMode === 0 /* OnTouchEnd */) {
            this._private__exitTrackingModeOnNextTry = true;
        }
        this._private__tryExitTrackingMode();
        this._private__endScroll(event);
    }
    _internal_hitTest(x, y) {
        const state = this._private__state;
        if (state === null) {
            return null;
        }
        const sources = state._internal_orderedSources();
        for (const source of sources) {
            const sourceResult = this._private__hitTestPaneView(source._internal_paneViews(state), x, y);
            if (sourceResult !== null) {
                return {
                    _internal_source: source,
                    _internal_view: sourceResult._internal_view,
                    _internal_object: sourceResult._internal_object,
                };
            }
        }
        return null;
    }
    _internal_setPriceAxisSize(width, position) {
        const priceAxisWidget = position === 'left' ? this._private__leftPriceAxisWidget : this._private__rightPriceAxisWidget;
        ensureNotNull(priceAxisWidget)._internal_setSize(new Size(width, this._private__size._internal_h));
    }
    _internal_getSize() {
        return this._private__size;
    }
    _internal_setSize(size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PaneWidget ' + JSON.stringify(size));
        }
        if (this._private__size._internal_equals(size)) {
            return;
        }
        this._private__size = size;
        this._private__isSettingSize = true;
        this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
        this._private__topCanvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
        this._private__isSettingSize = false;
        this._private__paneCell.style.width = size._internal_w + 'px';
        this._private__paneCell.style.height = size._internal_h + 'px';
    }
    _internal_recalculatePriceScales() {
        const pane = ensureNotNull(this._private__state);
        pane._internal_recalculatePriceScale(pane._internal_leftPriceScale());
        pane._internal_recalculatePriceScale(pane._internal_rightPriceScale());
        for (const source of pane._internal_dataSources()) {
            if (pane._internal_isOverlay(source)) {
                const priceScale = source._internal_priceScale();
                if (priceScale !== null) {
                    pane._internal_recalculatePriceScale(priceScale);
                }
                // for overlay drawings price scale is owner's price scale
                // however owner's price scale could not contain ds
                source._internal_updateAllViews();
            }
        }
    }
    _internal_getImage() {
        return this._private__canvasBinding.canvas;
    }
    _internal_paint(type) {
        if (type === 0 /* None */) {
            return;
        }
        if (this._private__state === null) {
            return;
        }
        if (type > 1 /* Cursor */) {
            this._internal_recalculatePriceScales();
        }
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_paint(type);
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_paint(type);
        }
        if (type !== 1 /* Cursor */) {
            const ctx = getContext2D(this._private__canvasBinding.canvas);
            ctx.save();
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            if (this._private__state) {
                this._private__drawGrid(ctx, this._private__canvasBinding.pixelRatio);
                this._private__drawWatermark(ctx, this._private__canvasBinding.pixelRatio);
                this._private__drawSources(ctx, this._private__canvasBinding.pixelRatio, sourcePaneViews);
                this._private__drawSources(ctx, this._private__canvasBinding.pixelRatio, sourceLabelPaneViews);
            }
            ctx.restore();
        }
        const topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        topCtx.clearRect(0, 0, Math.ceil(this._private__size._internal_w * this._private__topCanvasBinding.pixelRatio), Math.ceil(this._private__size._internal_h * this._private__topCanvasBinding.pixelRatio));
        this._private__drawSources(topCtx, this._private__canvasBinding.pixelRatio, sourceTopPaneViews);
        this._private__drawCrosshair(topCtx, this._private__topCanvasBinding.pixelRatio);
    }
    _internal_leftPriceAxisWidget() {
        return this._private__leftPriceAxisWidget;
    }
    _internal_getPaneCell() {
        return this._private__paneCell;
    }
    _internal_rightPriceAxisWidget() {
        return this._private__rightPriceAxisWidget;
    }
    _private__onStateDestroyed() {
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__state = null;
    }
    _private__drawBackground(ctx, pixelRatio) {
        drawScaled(ctx, pixelRatio, () => {
            const model = this._private__model();
            const topColor = model._internal_backgroundTopColor();
            const bottomColor = model._internal_backgroundBottomColor();
            if (topColor === bottomColor) {
                clearRect(ctx, 0, 0, this._private__size._internal_w, this._private__size._internal_h, bottomColor);
            }
            else {
                clearRectWithGradient(ctx, 0, 0, this._private__size._internal_w, this._private__size._internal_h, topColor, bottomColor);
            }
        });
    }
    _private__drawGrid(ctx, pixelRatio) {
        const state = ensureNotNull(this._private__state);
        const paneView = state._internal_grid()._internal_paneView();
        const renderer = paneView._internal_renderer(state._internal_height(), state._internal_width(), state);
        if (renderer !== null) {
            ctx.save();
            renderer._internal_draw(ctx, pixelRatio, false);
            ctx.restore();
        }
    }
    _private__drawWatermark(ctx, pixelRatio) {
        const source = this._private__model()._internal_watermarkSource();
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawBackground, source);
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawForeground, source);
    }
    _private__drawCrosshair(ctx, pixelRatio) {
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawForeground, this._private__model()._internal_crosshairSource());
    }
    _private__drawSources(ctx, pixelRatio, paneViewsGetter) {
        const state = ensureNotNull(this._private__state);
        const sources = state._internal_orderedSources();
        for (const source of sources) {
            this._private__drawSourceImpl(ctx, pixelRatio, paneViewsGetter, drawBackground, source);
        }
        for (const source of sources) {
            this._private__drawSourceImpl(ctx, pixelRatio, paneViewsGetter, drawForeground, source);
        }
    }
    _private__drawSourceImpl(ctx, pixelRatio, paneViewsGetter, drawFn, source) {
        const state = ensureNotNull(this._private__state);
        const paneViews = paneViewsGetter(source, state);
        const height = state._internal_height();
        const width = state._internal_width();
        const hoveredSource = state._internal_model()._internal_hoveredSource();
        const isHovered = hoveredSource !== null && hoveredSource._internal_source === source;
        const objecId = hoveredSource !== null && isHovered && hoveredSource._internal_object !== undefined
            ? hoveredSource._internal_object._internal_hitTestData
            : undefined;
        for (const paneView of paneViews) {
            const renderer = paneView._internal_renderer(height, width, state);
            if (renderer !== null) {
                ctx.save();
                drawFn(renderer, ctx, pixelRatio, isHovered, objecId);
                ctx.restore();
            }
        }
    }
    _private__hitTestPaneView(paneViews, x, y) {
        const state = ensureNotNull(this._private__state);
        for (const paneView of paneViews) {
            const renderer = paneView._internal_renderer(this._private__size._internal_h, this._private__size._internal_w, state);
            if (renderer !== null && renderer._internal_hitTest) {
                const result = renderer._internal_hitTest(x, y);
                if (result !== null) {
                    return {
                        _internal_view: paneView,
                        _internal_object: result,
                    };
                }
            }
        }
        return null;
    }
    _private__recreatePriceAxisWidgets() {
        if (this._private__state === null) {
            return;
        }
        const chart = this._private__chart;
        const leftAxisVisible = this._private__state._internal_leftPriceScale()._internal_options().visible;
        const rightAxisVisible = this._private__state._internal_rightPriceScale()._internal_options().visible;
        if (!leftAxisVisible && this._private__leftPriceAxisWidget !== null) {
            this._private__leftAxisCell.removeChild(this._private__leftPriceAxisWidget._internal_getElement());
            this._private__leftPriceAxisWidget._internal_destroy();
            this._private__leftPriceAxisWidget = null;
        }
        if (!rightAxisVisible && this._private__rightPriceAxisWidget !== null) {
            this._private__rightAxisCell.removeChild(this._private__rightPriceAxisWidget._internal_getElement());
            this._private__rightPriceAxisWidget._internal_destroy();
            this._private__rightPriceAxisWidget = null;
        }
        const rendererOptionsProvider = chart._internal_model()._internal_rendererOptionsProvider();
        if (leftAxisVisible && this._private__leftPriceAxisWidget === null) {
            this._private__leftPriceAxisWidget = new PriceAxisWidget(this, chart._internal_options().layout, rendererOptionsProvider, 'left');
            this._private__leftAxisCell.appendChild(this._private__leftPriceAxisWidget._internal_getElement());
        }
        if (rightAxisVisible && this._private__rightPriceAxisWidget === null) {
            this._private__rightPriceAxisWidget = new PriceAxisWidget(this, chart._internal_options().layout, rendererOptionsProvider, 'right');
            this._private__rightAxisCell.appendChild(this._private__rightPriceAxisWidget._internal_getElement());
        }
    }
    _private__preventScroll(event) {
        return event._internal_isTouch && this._private__longTap || this._private__startTrackPoint !== null;
    }
    _private__correctXCoord(x) {
        return Math.max(0, Math.min(x, this._private__size._internal_w - 1));
    }
    _private__correctYCoord(y) {
        return Math.max(0, Math.min(y, this._private__size._internal_h - 1));
    }
    _private__setCrosshairPosition(x, y) {
        this._private__model()._internal_setAndSaveCurrentPosition(this._private__correctXCoord(x), this._private__correctYCoord(y), ensureNotNull(this._private__state));
    }
    _private__clearCrosshairPosition() {
        this._private__model()._internal_clearCurrentPosition();
    }
    _private__tryExitTrackingMode() {
        if (this._private__exitTrackingModeOnNextTry) {
            this._private__startTrackPoint = null;
            this._private__clearCrosshairPosition();
        }
    }
    _private__startTrackingMode(startTrackPoint, crossHairPosition) {
        this._private__startTrackPoint = startTrackPoint;
        this._private__exitTrackingModeOnNextTry = false;
        this._private__setCrosshairPosition(crossHairPosition.x, crossHairPosition.y);
        const crosshair = this._private__model()._internal_crosshairSource();
        this._private__initCrosshairPosition = { x: crosshair._internal_appliedX(), y: crosshair._internal_appliedY() };
    }
    _private__model() {
        return this._private__chart._internal_model();
    }
    _private__finishScroll() {
        const model = this._private__model();
        const state = this._internal_state();
        const priceScale = state._internal_defaultPriceScale();
        model._internal_endScrollPrice(state, priceScale);
        model._internal_endScrollTime();
        this._private__startScrollingPos = null;
        this._private__isScrolling = false;
    }
    _private__endScroll(event) {
        if (!this._private__isScrolling) {
            return;
        }
        const startAnimationTime = performance.now();
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_start(event._internal_localX, startAnimationTime);
        }
        if ((this._private__scrollXAnimation === null || this._private__scrollXAnimation._internal_finished(startAnimationTime))) {
            // animation is not needed
            this._private__finishScroll();
            return;
        }
        const model = this._private__model();
        const timeScale = model._internal_timeScale();
        const scrollXAnimation = this._private__scrollXAnimation;
        const animationFn = () => {
            if ((scrollXAnimation._internal_terminated())) {
                // animation terminated, see _terminateKineticAnimation
                return;
            }
            const now = performance.now();
            let xAnimationFinished = scrollXAnimation._internal_finished(now);
            if (!scrollXAnimation._internal_terminated()) {
                const prevRightOffset = timeScale._internal_rightOffset();
                model._internal_scrollTimeTo(scrollXAnimation._internal_getPosition(now));
                if (prevRightOffset === timeScale._internal_rightOffset()) {
                    xAnimationFinished = true;
                    this._private__scrollXAnimation = null;
                }
            }
            if (xAnimationFinished) {
                this._private__finishScroll();
                return;
            }
            requestAnimationFrame(animationFn);
        };
        requestAnimationFrame(animationFn);
    }
    _private__onMouseEvent() {
        this._private__startTrackPoint = null;
    }
    _private__mouseTouchDownEvent() {
        if (!this._private__state) {
            return;
        }
        this._private__terminateKineticAnimation();
        if (document.activeElement !== document.body && document.activeElement !== document.documentElement) {
            // If any focusable element except the page itself is focused, remove the focus
            ensureNotNull(document.activeElement).blur();
        }
        else {
            // Clear selection
            const selection = document.getSelection();
            if (selection !== null) {
                selection.removeAllRanges();
            }
        }
        const priceScale = this._private__state._internal_defaultPriceScale();
        if (priceScale._internal_isEmpty() || this._private__model()._internal_timeScale()._internal_isEmpty()) {
            return;
        }
    }
    // eslint-disable-next-line complexity
    _private__pressedMouseTouchMoveEvent(event) {
        if (this._private__state === null) {
            return;
        }
        const model = this._private__model();
        if (model._internal_timeScale()._internal_isEmpty()) {
            return;
        }
        const chartOptions = this._private__chart._internal_options();
        const scrollOptions = chartOptions.handleScroll;
        const kineticScrollOptions = chartOptions.kineticScroll;
        if ((!scrollOptions.pressedMouseMove || event._internal_isTouch) &&
            (!scrollOptions.horzTouchDrag && !scrollOptions.vertTouchDrag || !event._internal_isTouch)) {
            return;
        }
        const priceScale = this._private__state._internal_defaultPriceScale();
        const now = performance.now();
        if (this._private__startScrollingPos === null && !this._private__preventScroll(event)) {
            this._private__startScrollingPos = {
                x: event._internal_clientX,
                y: event._internal_clientY,
                _internal_timestamp: now,
                _internal_localX: event._internal_localX,
                _internal_localY: event._internal_localY,
            };
        }
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_addPosition(event._internal_localX, now);
        }
        if (this._private__startScrollingPos !== null &&
            !this._private__isScrolling &&
            (this._private__startScrollingPos.x !== event._internal_clientX || this._private__startScrollingPos.y !== event._internal_clientY)) {
            if (this._private__scrollXAnimation === null && (event._internal_isTouch && kineticScrollOptions.touch ||
                !event._internal_isTouch && kineticScrollOptions.mouse)) {
                this._private__scrollXAnimation = new KineticAnimation(0.2 /* MinScrollSpeed */, 7 /* MaxScrollSpeed */, 0.997 /* DumpingCoeff */, 15 /* ScrollMinMove */);
                this._private__scrollXAnimation._internal_addPosition(this._private__startScrollingPos._internal_localX, this._private__startScrollingPos._internal_timestamp);
                this._private__scrollXAnimation._internal_addPosition(event._internal_localX, now);
            }
            if (!priceScale._internal_isEmpty()) {
                model._internal_startScrollPrice(this._private__state, priceScale, event._internal_localY);
            }
            model._internal_startScrollTime(event._internal_localX);
            this._private__isScrolling = true;
        }
        if (this._private__isScrolling) {
            // this allows scrolling not default price scales
            if (!priceScale._internal_isEmpty()) {
                model._internal_scrollPriceTo(this._private__state, priceScale, event._internal_localY);
            }
            model._internal_scrollTimeTo(event._internal_localX);
        }
    }
    _private__terminateKineticAnimation() {
        const now = performance.now();
        const xAnimationFinished = this._private__scrollXAnimation === null || this._private__scrollXAnimation._internal_finished(now);
        if (this._private__scrollXAnimation !== null) {
            if (!xAnimationFinished) {
                this._private__finishScroll();
            }
        }
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_terminate();
            this._private__scrollXAnimation = null;
        }
    }
}

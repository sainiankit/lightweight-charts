import { ensureNotNull } from '../helpers/assertions';
import { clearRect, clearRectWithGradient, drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { LabelsImageCache } from './labels-image-cache';
import { MouseEventHandler } from './mouse-event-handler';
;
;
export class PriceAxisWidget {
    constructor(pane, options, rendererOptionsProvider, side) {
        this._private__priceScale = null;
        this._private__size = null;
        this._private__mousedown = false;
        this._private__widthCache = new TextWidthCache(50);
        this._private__tickMarksCache = new LabelsImageCache(11, '#000');
        this._private__color = null;
        this._private__font = null;
        this._private__prevOptimalWidth = 0;
        this._private__isSettingSize = false;
        this._private__canvasConfiguredHandler = () => {
            this._private__recreateTickMarksCache(this._private__rendererOptionsProvider._internal_options());
            if (!this._private__isSettingSize) {
                this._private__pane._internal_chart()._internal_model()._internal_lightUpdate();
            }
        };
        this._private__topCanvasConfiguredHandler = () => {
            if (this._private__isSettingSize) {
                return;
            }
            this._private__pane._internal_chart()._internal_model()._internal_lightUpdate();
        };
        this._private__pane = pane;
        this._private__options = options;
        this._private__rendererOptionsProvider = rendererOptionsProvider;
        this._private__isLeft = side === 'left';
        this._private__cell = document.createElement('div');
        this._private__cell.style.height = '100%';
        this._private__cell.style.overflow = 'hidden';
        this._private__cell.style.width = '25px';
        this._private__cell.style.left = '0';
        this._private__cell.style.position = 'relative';
        this._private__canvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        const canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        const topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        const handler = {
            _internal_mouseDownEvent: this._private__mouseDownEvent.bind(this),
            _internal_touchStartEvent: this._private__mouseDownEvent.bind(this),
            _internal_pressedMouseMoveEvent: this._private__pressedMouseMoveEvent.bind(this),
            _internal_touchMoveEvent: this._private__pressedMouseMoveEvent.bind(this),
            _internal_mouseDownOutsideEvent: this._private__mouseDownOutsideEvent.bind(this),
            _internal_mouseUpEvent: this._private__mouseUpEvent.bind(this),
            _internal_touchEndEvent: this._private__mouseUpEvent.bind(this),
            _internal_mouseDoubleClickEvent: this._private__mouseDoubleClickEvent.bind(this),
            _internal_doubleTapEvent: this._private__mouseDoubleClickEvent.bind(this),
            _internal_mouseEnterEvent: this._private__mouseEnterEvent.bind(this),
            _internal_mouseLeaveEvent: this._private__mouseLeaveEvent.bind(this),
        };
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, handler, {
            _internal_treatVertTouchDragAsPageScroll: () => false,
            _internal_treatHorzTouchDragAsPageScroll: () => true,
        });
    }
    _internal_destroy() {
        this._private__mouseEventHandler._internal_destroy();
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
        if (this._private__priceScale !== null) {
            this._private__priceScale._internal_onMarksChanged()._internal_unsubscribeAll(this);
        }
        this._private__priceScale = null;
        this._private__tickMarksCache._internal_destroy();
    }
    _internal_getElement() {
        return this._private__cell;
    }
    _internal_lineColor() {
        return ensureNotNull(this._private__priceScale)._internal_options().borderColor;
    }
    _internal_textColor() {
        return this._private__options.textColor;
    }
    _internal_fontSize() {
        return this._private__options.fontSize;
    }
    _internal_baseFont() {
        return makeFont(this._internal_fontSize(), this._private__options.fontFamily);
    }
    _internal_rendererOptions() {
        const options = this._private__rendererOptionsProvider._internal_options();
        const isColorChanged = this._private__color !== options._internal_color;
        const isFontChanged = this._private__font !== options._internal_font;
        if (isColorChanged || isFontChanged) {
            this._private__recreateTickMarksCache(options);
            this._private__color = options._internal_color;
        }
        if (isFontChanged) {
            this._private__widthCache._internal_reset();
            this._private__font = options._internal_font;
        }
        return options;
    }
    _internal_optimalWidth() {
        if (this._private__priceScale === null) {
            return 0;
        }
        let tickMarkMaxWidth = 0;
        const rendererOptions = this._internal_rendererOptions();
        const ctx = getContext2D(this._private__canvasBinding.canvas);
        const tickMarks = this._private__priceScale._internal_marks();
        ctx.font = this._internal_baseFont();
        if (tickMarks.length > 0) {
            tickMarkMaxWidth = Math.max(this._private__widthCache._internal_measureText(ctx, tickMarks[0]._internal_label), this._private__widthCache._internal_measureText(ctx, tickMarks[tickMarks.length - 1]._internal_label));
        }
        const views = this._private__backLabels();
        for (let j = views.length; j--;) {
            const width = this._private__widthCache._internal_measureText(ctx, views[j]._internal_text());
            if (width > tickMarkMaxWidth) {
                tickMarkMaxWidth = width;
            }
        }
        const firstValue = this._private__priceScale._internal_firstValue();
        if (firstValue !== null && this._private__size !== null) {
            const topValue = this._private__priceScale._internal_coordinateToPrice(1, firstValue);
            const bottomValue = this._private__priceScale._internal_coordinateToPrice(this._private__size._internal_h - 2, firstValue);
            tickMarkMaxWidth = Math.max(tickMarkMaxWidth, this._private__widthCache._internal_measureText(ctx, this._private__priceScale._internal_formatPrice(Math.floor(Math.min(topValue, bottomValue)) + 0.11111111111111, firstValue)), this._private__widthCache._internal_measureText(ctx, this._private__priceScale._internal_formatPrice(Math.ceil(Math.max(topValue, bottomValue)) - 0.11111111111111, firstValue)));
        }
        const resultTickMarksMaxWidth = tickMarkMaxWidth || 34 /* DefaultOptimalWidth */;
        let res = Math.ceil(rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_paddingInner +
            rendererOptions._internal_paddingOuter +
            resultTickMarksMaxWidth);
        // make it even
        res += res % 2;
        return res;
    }
    _internal_setSize(size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PriceAxisWidget ' + JSON.stringify(size));
        }
        if (this._private__size === null || !this._private__size._internal_equals(size)) {
            this._private__size = size;
            this._private__isSettingSize = true;
            this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__topCanvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__isSettingSize = false;
            this._private__cell.style.width = size._internal_w + 'px';
            // need this for IE11
            this._private__cell.style.height = size._internal_h + 'px';
            this._private__cell.style.minWidth = size._internal_w + 'px'; // for right calculate position of .pane-legend
        }
    }
    _internal_getWidth() {
        return ensureNotNull(this._private__size)._internal_w;
    }
    _internal_setPriceScale(priceScale) {
        if (this._private__priceScale === priceScale) {
            return;
        }
        if (this._private__priceScale !== null) {
            this._private__priceScale._internal_onMarksChanged()._internal_unsubscribeAll(this);
        }
        this._private__priceScale = priceScale;
        priceScale._internal_onMarksChanged()._internal_subscribe(this._private__onMarksChanged.bind(this), this);
    }
    _internal_priceScale() {
        return this._private__priceScale;
    }
    _internal_reset() {
        const pane = this._private__pane._internal_state();
        const model = this._private__pane._internal_chart()._internal_model();
        model._internal_resetPriceScale(pane, ensureNotNull(this._internal_priceScale()));
    }
    _internal_paint(type) {
        if (this._private__size === null) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            const ctx = getContext2D(this._private__canvasBinding.canvas);
            this._private__alignLabels();
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawTickMarks(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBackLabels(ctx, this._private__canvasBinding.pixelRatio);
        }
        const topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        const width = this._private__size._internal_w;
        const height = this._private__size._internal_h;
        drawScaled(topCtx, this._private__topCanvasBinding.pixelRatio, () => {
            topCtx.clearRect(0, 0, width, height);
        });
        this._private__drawCrosshairLabel(topCtx, this._private__topCanvasBinding.pixelRatio);
    }
    _internal_getImage() {
        return this._private__canvasBinding.canvas;
    }
    _internal_update() {
        var _a;
        // this call has side-effect - it regenerates marks on the price scale
        (_a = this._private__priceScale) === null || _a === void 0 ? void 0 : _a._internal_marks();
    }
    _private__mouseDownEvent(e) {
        if (this._private__priceScale === null || this._private__priceScale._internal_isEmpty() || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        const model = this._private__pane._internal_chart()._internal_model();
        const pane = this._private__pane._internal_state();
        this._private__mousedown = true;
        model._internal_startScalePrice(pane, this._private__priceScale, e._internal_localY);
    }
    _private__pressedMouseMoveEvent(e) {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        const model = this._private__pane._internal_chart()._internal_model();
        const pane = this._private__pane._internal_state();
        const priceScale = this._private__priceScale;
        model._internal_scalePriceTo(pane, priceScale, e._internal_localY);
    }
    _private__mouseDownOutsideEvent() {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        const model = this._private__pane._internal_chart()._internal_model();
        const pane = this._private__pane._internal_state();
        const priceScale = this._private__priceScale;
        if (this._private__mousedown) {
            this._private__mousedown = false;
            model._internal_endScalePrice(pane, priceScale);
        }
    }
    _private__mouseUpEvent(e) {
        if (this._private__priceScale === null || !this._private__pane._internal_chart()._internal_options().handleScale.axisPressedMouseMove.price) {
            return;
        }
        const model = this._private__pane._internal_chart()._internal_model();
        const pane = this._private__pane._internal_state();
        this._private__mousedown = false;
        model._internal_endScalePrice(pane, this._private__priceScale);
    }
    _private__mouseDoubleClickEvent(e) {
        if (this._private__pane._internal_chart()._internal_options().handleScale.axisDoubleClickReset) {
            this._internal_reset();
        }
    }
    _private__mouseEnterEvent(e) {
        if (this._private__priceScale === null) {
            return;
        }
        const model = this._private__pane._internal_chart()._internal_model();
        if (model._internal_options().handleScale.axisPressedMouseMove.price && !this._private__priceScale._internal_isPercentage() && !this._private__priceScale._internal_isIndexedTo100()) {
            this._private__setCursor(1 /* NsResize */);
        }
    }
    _private__mouseLeaveEvent(e) {
        this._private__setCursor(0 /* Default */);
    }
    _private__backLabels() {
        const res = [];
        const priceScale = (this._private__priceScale === null) ? undefined : this._private__priceScale;
        const addViewsForSources = (sources) => {
            for (let i = 0; i < sources.length; ++i) {
                const source = sources[i];
                const views = source._internal_priceAxisViews(this._private__pane._internal_state(), priceScale);
                for (let j = 0; j < views.length; j++) {
                    res.push(views[j]);
                }
            }
        };
        // calculate max and min coordinates for views on selection
        // crosshair individually
        addViewsForSources(this._private__pane._internal_state()._internal_orderedSources());
        return res;
    }
    _private__drawBackground(ctx, pixelRatio) {
        if (this._private__size === null) {
            return;
        }
        const width = this._private__size._internal_w;
        const height = this._private__size._internal_h;
        drawScaled(ctx, pixelRatio, () => {
            const model = this._private__pane._internal_state()._internal_model();
            const topColor = model._internal_backgroundTopColor();
            const bottomColor = model._internal_backgroundBottomColor();
            if (topColor === bottomColor) {
                clearRect(ctx, 0, 0, width, height, topColor);
            }
            else {
                clearRectWithGradient(ctx, 0, 0, width, height, topColor, bottomColor);
            }
        });
    }
    _private__drawBorder(ctx, pixelRatio) {
        if (this._private__size === null || this._private__priceScale === null || !this._private__priceScale._internal_options().borderVisible) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this._internal_lineColor();
        const borderSize = Math.max(1, Math.floor(this._internal_rendererOptions()._internal_borderSize * pixelRatio));
        let left;
        if (this._private__isLeft) {
            left = Math.floor(this._private__size._internal_w * pixelRatio) - borderSize;
        }
        else {
            left = 0;
        }
        ctx.fillRect(left, 0, borderSize, Math.ceil(this._private__size._internal_h * pixelRatio));
        ctx.restore();
    }
    _private__drawTickMarks(ctx, pixelRatio) {
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        const tickMarks = this._private__priceScale._internal_marks();
        ctx.save();
        ctx.strokeStyle = this._internal_lineColor();
        ctx.font = this._internal_baseFont();
        ctx.fillStyle = this._internal_lineColor();
        const rendererOptions = this._internal_rendererOptions();
        const tickMarkLeftX = this._private__isLeft ?
            Math.floor((this._private__size._internal_w - rendererOptions._internal_tickLength) * pixelRatio - rendererOptions._internal_borderSize * pixelRatio) :
            Math.floor(rendererOptions._internal_borderSize * pixelRatio);
        const textLeftX = this._private__isLeft ?
            Math.round(tickMarkLeftX - rendererOptions._internal_paddingInner * pixelRatio) :
            Math.round(tickMarkLeftX + rendererOptions._internal_tickLength * pixelRatio + rendererOptions._internal_paddingInner * pixelRatio);
        const textAlign = this._private__isLeft ? 'right' : 'left';
        const tickHeight = Math.max(1, Math.floor(pixelRatio));
        const tickOffset = Math.floor(pixelRatio * 0.5);
        const options = this._private__priceScale._internal_options();
        if (options.borderVisible && options.ticksVisible) {
            const tickLength = Math.round(rendererOptions._internal_tickLength * pixelRatio);
            ctx.beginPath();
            for (const tickMark of tickMarks) {
                ctx.rect(tickMarkLeftX, Math.round(tickMark._internal_coord * pixelRatio) - tickOffset, tickLength, tickHeight);
            }
            ctx.fill();
        }
        ctx.fillStyle = this._internal_textColor();
        for (const tickMark of tickMarks) {
            this._private__tickMarksCache._internal_paintTo(ctx, tickMark._internal_label, textLeftX, Math.round(tickMark._internal_coord * pixelRatio), textAlign);
        }
        ctx.restore();
    }
    _private__alignLabels() {
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        let center = this._private__size._internal_h / 2;
        const views = [];
        const orderedSources = this._private__priceScale._internal_orderedSources().slice(); // Copy of array
        const pane = this._private__pane;
        const paneState = pane._internal_state();
        const rendererOptions = this._internal_rendererOptions();
        // if we are default price scale, append labels from no-scale
        const isDefault = this._private__priceScale === paneState._internal_defaultVisiblePriceScale();
        if (isDefault) {
            this._private__pane._internal_state()._internal_orderedSources().forEach((source) => {
                if (paneState._internal_isOverlay(source)) {
                    orderedSources.push(source);
                }
            });
        }
        // we can use any, but let's use the first source as "center" one
        const centerSource = this._private__priceScale._internal_dataSources()[0];
        const priceScale = this._private__priceScale;
        const updateForSources = (sources) => {
            sources.forEach((source) => {
                const sourceViews = source._internal_priceAxisViews(paneState, priceScale);
                // never align selected sources
                sourceViews.forEach((view) => {
                    view._internal_setFixedCoordinate(null);
                    if (view._internal_isVisible()) {
                        views.push(view);
                    }
                });
                if (centerSource === source && sourceViews.length > 0) {
                    center = sourceViews[0]._internal_coordinate();
                }
            });
        };
        // crosshair individually
        updateForSources(orderedSources);
        // split into two parts
        const top = views.filter((view) => view._internal_coordinate() <= center);
        const bottom = views.filter((view) => view._internal_coordinate() > center);
        // sort top from center to top
        top.sort((l, r) => r._internal_coordinate() - l._internal_coordinate());
        // share center label
        if (top.length && bottom.length) {
            bottom.push(top[0]);
        }
        bottom.sort((l, r) => l._internal_coordinate() - r._internal_coordinate());
        views.forEach((view) => view._internal_setFixedCoordinate(view._internal_coordinate()));
        const options = this._private__priceScale._internal_options();
        if (!options.alignLabels) {
            return;
        }
        for (let i = 1; i < top.length; i++) {
            const view = top[i];
            const prev = top[i - 1];
            const height = prev._internal_height(rendererOptions, false);
            const coordinate = view._internal_coordinate();
            const prevFixedCoordinate = prev._internal_getFixedCoordinate();
            if (coordinate > prevFixedCoordinate - height) {
                view._internal_setFixedCoordinate(prevFixedCoordinate - height);
            }
        }
        for (let j = 1; j < bottom.length; j++) {
            const view = bottom[j];
            const prev = bottom[j - 1];
            const height = prev._internal_height(rendererOptions, true);
            const coordinate = view._internal_coordinate();
            const prevFixedCoordinate = prev._internal_getFixedCoordinate();
            if (coordinate < prevFixedCoordinate + height) {
                view._internal_setFixedCoordinate(prevFixedCoordinate + height);
            }
        }
    }
    _private__drawBackLabels(ctx, pixelRatio) {
        if (this._private__size === null) {
            return;
        }
        ctx.save();
        const size = this._private__size;
        const views = this._private__backLabels();
        const rendererOptions = this._internal_rendererOptions();
        const align = this._private__isLeft ? 'right' : 'left';
        views.forEach((view) => {
            if (view._internal_isAxisLabelVisible()) {
                const renderer = view._internal_renderer(ensureNotNull(this._private__priceScale));
                ctx.save();
                renderer._internal_draw(ctx, rendererOptions, this._private__widthCache, size._internal_w, align, pixelRatio);
                ctx.restore();
            }
        });
        ctx.restore();
    }
    _private__drawCrosshairLabel(ctx, pixelRatio) {
        if (this._private__size === null || this._private__priceScale === null) {
            return;
        }
        ctx.save();
        const size = this._private__size;
        const model = this._private__pane._internal_chart()._internal_model();
        const views = []; // array of arrays
        const pane = this._private__pane._internal_state();
        const v = model._internal_crosshairSource()._internal_priceAxisViews(pane, this._private__priceScale);
        if (v.length) {
            views.push(v);
        }
        const ro = this._internal_rendererOptions();
        const align = this._private__isLeft ? 'right' : 'left';
        views.forEach((arr) => {
            arr.forEach((view) => {
                ctx.save();
                view._internal_renderer(ensureNotNull(this._private__priceScale))._internal_draw(ctx, ro, this._private__widthCache, size._internal_w, align, pixelRatio);
                ctx.restore();
            });
        });
        ctx.restore();
    }
    _private__setCursor(type) {
        this._private__cell.style.cursor = type === 1 /* NsResize */ ? 'ns-resize' : 'default';
    }
    _private__onMarksChanged() {
        const width = this._internal_optimalWidth();
        // avoid price scale is shrunk
        // using < instead !== to avoid infinite changes
        if (this._private__prevOptimalWidth < width) {
            this._private__pane._internal_chart()._internal_model()._internal_fullUpdate();
        }
        this._private__prevOptimalWidth = width;
    }
    _private__recreateTickMarksCache(options) {
        this._private__tickMarksCache._internal_destroy();
        this._private__tickMarksCache = new LabelsImageCache(options._internal_fontSize, options._internal_color, options._internal_fontFamily);
    }
}

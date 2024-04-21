import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { Delegate } from '../helpers/delegate';
import { makeFont } from '../helpers/make-font';
import { TextWidthCache } from '../model/text-width-cache';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { MouseEventHandler } from './mouse-event-handler';
import { PriceAxisStub } from './price-axis-stub';
;
;
function markWithGreaterWeight(a, b) {
    return a._internal_weight > b._internal_weight ? a : b;
}
export class TimeAxisWidget {
    constructor(chartWidget) {
        this._private__leftStub = null;
        this._private__rightStub = null;
        this._private__rendererOptions = null;
        this._private__mouseDown = false;
        this._private__size = new Size(0, 0);
        this._private__sizeChanged = new Delegate();
        this._private__widthCache = new TextWidthCache(5);
        this._private__isSettingSize = false;
        this._private__canvasConfiguredHandler = () => {
            if (!this._private__isSettingSize) {
                this._private__chart._internal_model()._internal_lightUpdate();
            }
        };
        this._private__topCanvasConfiguredHandler = () => {
            if (!this._private__isSettingSize) {
                this._private__chart._internal_model()._internal_lightUpdate();
            }
        };
        this._private__chart = chartWidget;
        this._private__options = chartWidget._internal_options().layout;
        this._private__element = document.createElement('tr');
        this._private__leftStubCell = document.createElement('td');
        this._private__leftStubCell.style.padding = '0';
        this._private__rightStubCell = document.createElement('td');
        this._private__rightStubCell.style.padding = '0';
        this._private__cell = document.createElement('td');
        this._private__cell.style.height = '25px';
        this._private__cell.style.padding = '0';
        this._private__dv = document.createElement('div');
        this._private__dv.style.width = '100%';
        this._private__dv.style.height = '100%';
        this._private__dv.style.position = 'relative';
        this._private__dv.style.overflow = 'hidden';
        this._private__cell.appendChild(this._private__dv);
        this._private__canvasBinding = createBoundCanvas(this._private__dv, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        const canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(this._private__dv, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        const topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        this._private__element.appendChild(this._private__leftStubCell);
        this._private__element.appendChild(this._private__cell);
        this._private__element.appendChild(this._private__rightStubCell);
        this._private__recreateStubs();
        this._private__chart._internal_model()._internal_priceScalesOptionsChanged()._internal_subscribe(this._private__recreateStubs.bind(this), this);
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, this, {
            _internal_treatVertTouchDragAsPageScroll: () => true,
            _internal_treatHorzTouchDragAsPageScroll: () => false,
        });
    }
    _internal_destroy() {
        this._private__mouseEventHandler._internal_destroy();
        if (this._private__leftStub !== null) {
            this._private__leftStub._internal_destroy();
        }
        if (this._private__rightStub !== null) {
            this._private__rightStub._internal_destroy();
        }
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
    }
    _internal_getElement() {
        return this._private__element;
    }
    _internal_leftStub() {
        return this._private__leftStub;
    }
    _internal_rightStub() {
        return this._private__rightStub;
    }
    _internal_mouseDownEvent(event) {
        if (this._private__mouseDown) {
            return;
        }
        this._private__mouseDown = true;
        const model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() || !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_startScaleTime(event._internal_localX);
    }
    _internal_touchStartEvent(event) {
        this._internal_mouseDownEvent(event);
    }
    _internal_mouseDownOutsideEvent() {
        const model = this._private__chart._internal_model();
        if (!model._internal_timeScale()._internal_isEmpty() && this._private__mouseDown) {
            this._private__mouseDown = false;
            if (this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
                model._internal_endScaleTime();
            }
        }
    }
    _internal_pressedMouseMoveEvent(event) {
        const model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() || !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_scaleTimeTo(event._internal_localX);
    }
    _internal_touchMoveEvent(event) {
        this._internal_pressedMouseMoveEvent(event);
    }
    _internal_mouseUpEvent() {
        this._private__mouseDown = false;
        const model = this._private__chart._internal_model();
        if (model._internal_timeScale()._internal_isEmpty() && !this._private__chart._internal_options().handleScale.axisPressedMouseMove.time) {
            return;
        }
        model._internal_endScaleTime();
    }
    _internal_touchEndEvent() {
        this._internal_mouseUpEvent();
    }
    _internal_mouseDoubleClickEvent() {
        if (this._private__chart._internal_options().handleScale.axisDoubleClickReset) {
            this._private__chart._internal_model()._internal_resetTimeScale();
        }
    }
    _internal_doubleTapEvent() {
        this._internal_mouseDoubleClickEvent();
    }
    _internal_mouseEnterEvent() {
        if (this._private__chart._internal_model()._internal_options().handleScale.axisPressedMouseMove.time) {
            this._private__setCursor(1 /* EwResize */);
        }
    }
    _internal_mouseLeaveEvent() {
        this._private__setCursor(0 /* Default */);
    }
    _internal_getSize() {
        return this._private__size;
    }
    _internal_sizeChanged() {
        return this._private__sizeChanged;
    }
    _internal_setSizes(timeAxisSize, leftStubWidth, rightStubWidth) {
        if (!this._private__size || !this._private__size._internal_equals(timeAxisSize)) {
            this._private__size = timeAxisSize;
            this._private__isSettingSize = true;
            this._private__canvasBinding.resizeCanvas({ width: timeAxisSize._internal_w, height: timeAxisSize._internal_h });
            this._private__topCanvasBinding.resizeCanvas({ width: timeAxisSize._internal_w, height: timeAxisSize._internal_h });
            this._private__isSettingSize = false;
            this._private__cell.style.width = timeAxisSize._internal_w + 'px';
            this._private__cell.style.height = timeAxisSize._internal_h + 'px';
            this._private__sizeChanged._internal_fire(timeAxisSize);
        }
        if (this._private__leftStub !== null) {
            this._private__leftStub._internal_setSize(new Size(leftStubWidth, timeAxisSize._internal_h));
        }
        if (this._private__rightStub !== null) {
            this._private__rightStub._internal_setSize(new Size(rightStubWidth, timeAxisSize._internal_h));
        }
    }
    _internal_optimalHeight() {
        const rendererOptions = this._private__getRendererOptions();
        return Math.ceil(
        // rendererOptions.offsetSize +
        rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_fontSize +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_paddingBottom);
    }
    _internal_update() {
        // this call has side-effect - it regenerates marks on the time scale
        this._private__chart._internal_model()._internal_timeScale()._internal_marks();
    }
    _internal_getImage() {
        return this._private__canvasBinding.canvas;
    }
    _internal_paint(type) {
        if (type === 0 /* None */) {
            return;
        }
        if (type !== 1 /* Cursor */) {
            const ctx = getContext2D(this._private__canvasBinding.canvas);
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
            this._private__drawTickMarks(ctx, this._private__canvasBinding.pixelRatio);
            // atm we don't have sources to be drawn on time axis except crosshair which is rendered on top level canvas
            // so let's don't call this code at all for now
            // this._drawLabels(this._chart.model().dataSources(), ctx, pixelRatio);
            if (this._private__leftStub !== null) {
                this._private__leftStub._internal_paint(type);
            }
            if (this._private__rightStub !== null) {
                this._private__rightStub._internal_paint(type);
            }
        }
        const topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        const pixelRatio = this._private__topCanvasBinding.pixelRatio;
        topCtx.clearRect(0, 0, Math.ceil(this._private__size._internal_w * pixelRatio), Math.ceil(this._private__size._internal_h * pixelRatio));
        this._private__drawLabels([this._private__chart._internal_model()._internal_crosshairSource()], topCtx, pixelRatio);
    }
    _private__drawBackground(ctx, pixelRatio) {
        drawScaled(ctx, pixelRatio, () => {
            clearRect(ctx, 0, 0, this._private__size._internal_w, this._private__size._internal_h, this._private__chart._internal_model()._internal_backgroundBottomColor());
        });
    }
    _private__drawBorder(ctx, pixelRatio) {
        if (this._private__chart._internal_options().timeScale.borderVisible) {
            ctx.save();
            ctx.fillStyle = this._private__lineColor();
            const borderSize = Math.max(1, Math.floor(this._private__getRendererOptions()._internal_borderSize * pixelRatio));
            ctx.fillRect(0, 0, Math.ceil(this._private__size._internal_w * pixelRatio), borderSize);
            ctx.restore();
        }
    }
    _private__drawTickMarks(ctx, pixelRatio) {
        const timeScale = this._private__chart._internal_model()._internal_timeScale();
        const tickMarks = timeScale._internal_marks();
        if (!tickMarks || tickMarks.length === 0) {
            return;
        }
        let maxWeight = tickMarks.reduce(markWithGreaterWeight, tickMarks[0])._internal_weight;
        // special case: it looks strange if 15:00 is bold but 14:00 is not
        // so if maxWeight > TickMarkWeight.Hour1 and < TickMarkWeight.Day reduce it to TickMarkWeight.Hour1
        if (maxWeight > 30 /* Hour1 */ && maxWeight < 50 /* Day */) {
            maxWeight = 30 /* Hour1 */;
        }
        ctx.save();
        ctx.strokeStyle = this._private__lineColor();
        const rendererOptions = this._private__getRendererOptions();
        const yText = (rendererOptions._internal_borderSize +
            rendererOptions._internal_tickLength +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_fontSize -
            rendererOptions._internal_baselineOffset);
        ctx.textAlign = 'center';
        ctx.fillStyle = this._private__lineColor();
        const borderSize = Math.floor(this._private__getRendererOptions()._internal_borderSize * pixelRatio);
        const tickWidth = Math.max(1, Math.floor(pixelRatio));
        const tickOffset = Math.floor(pixelRatio * 0.5);
        const options = timeScale._internal_options();
        if (options.borderVisible && options.ticksVisible) {
            ctx.beginPath();
            const tickLen = Math.round(rendererOptions._internal_tickLength * pixelRatio);
            for (let index = tickMarks.length; index--;) {
                const x = Math.round(tickMarks[index]._internal_coord * pixelRatio);
                ctx.rect(x - tickOffset, borderSize, tickWidth, tickLen);
            }
            ctx.fill();
        }
        ctx.fillStyle = this._private__textColor();
        drawScaled(ctx, pixelRatio, () => {
            // draw base marks
            ctx.font = this._private__baseFont();
            for (const tickMark of tickMarks) {
                if (tickMark._internal_weight < maxWeight) {
                    const coordinate = tickMark._internal_needAlignCoordinate ? this._private__alignTickMarkLabelCoordinate(ctx, tickMark._internal_coord, tickMark._internal_label) : tickMark._internal_coord;
                    ctx.fillText(tickMark._internal_label, coordinate, yText);
                }
            }
            ctx.font = this._private__baseBoldFont();
            for (const tickMark of tickMarks) {
                if (tickMark._internal_weight >= maxWeight) {
                    const coordinate = tickMark._internal_needAlignCoordinate ? this._private__alignTickMarkLabelCoordinate(ctx, tickMark._internal_coord, tickMark._internal_label) : tickMark._internal_coord;
                    ctx.fillText(tickMark._internal_label, coordinate, yText);
                }
            }
        });
        ctx.restore();
    }
    _private__alignTickMarkLabelCoordinate(ctx, coordinate, labelText) {
        const labelWidth = this._private__widthCache._internal_measureText(ctx, labelText);
        const labelWidthHalf = labelWidth / 2;
        const leftTextCoordinate = Math.floor(coordinate - labelWidthHalf) + 0.5;
        if (leftTextCoordinate < 0) {
            coordinate = coordinate + Math.abs(0 - leftTextCoordinate);
        }
        else if (leftTextCoordinate + labelWidth > this._private__size._internal_w) {
            coordinate = coordinate - Math.abs(this._private__size._internal_w - (leftTextCoordinate + labelWidth));
        }
        return coordinate;
    }
    _private__drawLabels(sources, ctx, pixelRatio) {
        const rendererOptions = this._private__getRendererOptions();
        for (const source of sources) {
            for (const view of source._internal_timeAxisViews()) {
                ctx.save();
                view._internal_renderer()._internal_draw(ctx, rendererOptions, pixelRatio);
                ctx.restore();
            }
        }
    }
    _private__lineColor() {
        return this._private__chart._internal_options().timeScale.borderColor;
    }
    _private__textColor() {
        return this._private__options.textColor;
    }
    _private__fontSize() {
        return this._private__options.fontSize;
    }
    _private__baseFont() {
        return makeFont(this._private__fontSize(), this._private__options.fontFamily);
    }
    _private__baseBoldFont() {
        return makeFont(this._private__fontSize(), this._private__options.fontFamily, 'bold');
    }
    _private__getRendererOptions() {
        if (this._private__rendererOptions === null) {
            this._private__rendererOptions = {
                _internal_borderSize: 1 /* BorderSize */,
                _internal_baselineOffset: NaN,
                _internal_paddingTop: NaN,
                _internal_paddingBottom: NaN,
                _internal_paddingHorizontal: NaN,
                _internal_tickLength: 3 /* TickLength */,
                _internal_fontSize: NaN,
                _internal_font: '',
                _internal_widthCache: new TextWidthCache(),
            };
        }
        const rendererOptions = this._private__rendererOptions;
        const newFont = this._private__baseFont();
        if (rendererOptions._internal_font !== newFont) {
            const fontSize = this._private__fontSize();
            rendererOptions._internal_fontSize = fontSize;
            rendererOptions._internal_font = newFont;
            rendererOptions._internal_paddingTop = Math.ceil(fontSize / 2.5);
            rendererOptions._internal_paddingBottom = rendererOptions._internal_paddingTop;
            rendererOptions._internal_paddingHorizontal = Math.ceil(fontSize / 2);
            rendererOptions._internal_baselineOffset = Math.round(this._private__fontSize() / 5);
            rendererOptions._internal_widthCache._internal_reset();
        }
        return this._private__rendererOptions;
    }
    _private__setCursor(type) {
        this._private__cell.style.cursor = type === 1 /* EwResize */ ? 'ew-resize' : 'default';
    }
    _private__recreateStubs() {
        const model = this._private__chart._internal_model();
        const options = model._internal_options();
        if (!options.leftPriceScale.visible && this._private__leftStub !== null) {
            this._private__leftStubCell.removeChild(this._private__leftStub._internal_getElement());
            this._private__leftStub._internal_destroy();
            this._private__leftStub = null;
        }
        if (!options.rightPriceScale.visible && this._private__rightStub !== null) {
            this._private__rightStubCell.removeChild(this._private__rightStub._internal_getElement());
            this._private__rightStub._internal_destroy();
            this._private__rightStub = null;
        }
        const rendererOptionsProvider = this._private__chart._internal_model()._internal_rendererOptionsProvider();
        const params = {
            _internal_rendererOptionsProvider: rendererOptionsProvider,
        };
        const borderVisibleGetter = () => {
            return options.leftPriceScale.borderVisible && model._internal_timeScale()._internal_options().borderVisible;
        };
        const bottomColorGetter = () => model._internal_backgroundBottomColor();
        if (options.leftPriceScale.visible && this._private__leftStub === null) {
            this._private__leftStub = new PriceAxisStub('left', options, params, borderVisibleGetter, bottomColorGetter);
            this._private__leftStubCell.appendChild(this._private__leftStub._internal_getElement());
        }
        if (options.rightPriceScale.visible && this._private__rightStub === null) {
            this._private__rightStub = new PriceAxisStub('right', options, params, borderVisibleGetter, bottomColorGetter);
            this._private__rightStubCell.appendChild(this._private__rightStub._internal_getElement());
        }
    }
}

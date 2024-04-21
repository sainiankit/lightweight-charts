import { clearRect, drawScaled } from '../helpers/canvas-helpers';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
export class PriceAxisStub {
    constructor(side, options, params, borderVisible, bottomColor) {
        this._private__invalidated = true;
        this._private__size = new Size(0, 0);
        this._private__canvasConfiguredHandler = () => this._internal_paint(3 /* Full */);
        this._private__isLeft = side === 'left';
        this._private__rendererOptionsProvider = params._internal_rendererOptionsProvider;
        this._private__options = options;
        this._private__borderVisible = borderVisible;
        this._private__bottomColor = bottomColor;
        this._private__cell = document.createElement('div');
        this._private__cell.style.width = '25px';
        this._private__cell.style.height = '100%';
        this._private__cell.style.overflow = 'hidden';
        this._private__canvasBinding = createBoundCanvas(this._private__cell, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
    }
    _internal_destroy() {
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
    }
    _internal_getElement() {
        return this._private__cell;
    }
    _internal_getSize() {
        return this._private__size;
    }
    _internal_setSize(size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PriceAxisStub ' + JSON.stringify(size));
        }
        if (!this._private__size._internal_equals(size)) {
            this._private__size = size;
            this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
            this._private__cell.style.width = `${size._internal_w}px`;
            this._private__cell.style.minWidth = `${size._internal_w}px`; // for right calculate position of .pane-legend
            this._private__cell.style.height = `${size._internal_h}px`;
            this._private__invalidated = true;
        }
    }
    _internal_paint(type) {
        if (type < 3 /* Full */ && !this._private__invalidated) {
            return;
        }
        if (this._private__size._internal_w === 0 || this._private__size._internal_h === 0) {
            return;
        }
        this._private__invalidated = false;
        const ctx = getContext2D(this._private__canvasBinding.canvas);
        this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
        this._private__drawBorder(ctx, this._private__canvasBinding.pixelRatio);
    }
    _internal_getImage() {
        return this._private__canvasBinding.canvas;
    }
    _private__drawBorder(ctx, pixelRatio) {
        if (!this._private__borderVisible()) {
            return;
        }
        const width = this._private__size._internal_w;
        ctx.save();
        ctx.fillStyle = this._private__options.timeScale.borderColor;
        const borderSize = Math.floor(this._private__rendererOptionsProvider._internal_options()._internal_borderSize * pixelRatio);
        const left = (this._private__isLeft) ? Math.round(width * pixelRatio) - borderSize : 0;
        ctx.fillRect(left, 0, borderSize, borderSize);
        ctx.restore();
    }
    _private__drawBackground(ctx, pixelRatio) {
        drawScaled(ctx, pixelRatio, () => {
            clearRect(ctx, 0, 0, this._private__size._internal_w, this._private__size._internal_h, this._private__bottomColor());
        });
    }
}

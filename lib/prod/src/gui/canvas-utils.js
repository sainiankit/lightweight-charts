import { bindToDevicePixelRatio } from 'fancy-canvas/coordinate-space';
import { ensureNotNull } from '../helpers/assertions';
export class Size {
    constructor(w, h) {
        this._internal_w = w;
        this._internal_h = h;
    }
    _internal_equals(size) {
        return (this._internal_w === size._internal_w) && (this._internal_h === size._internal_h);
    }
}
export function getCanvasDevicePixelRatio(canvas) {
    return canvas.ownerDocument &&
        canvas.ownerDocument.defaultView &&
        canvas.ownerDocument.defaultView.devicePixelRatio
        || 1;
}
export function getContext2D(canvas) {
    const ctx = ensureNotNull(canvas.getContext('2d'));
    // sometimes (very often) ctx getContext returns the same context every time
    // and there might be previous transformation
    // so let's reset it to be sure that everything is ok
    // do no use resetTransform to respect Edge
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return ctx;
}
export function createPreconfiguredCanvas(doc, size) {
    const canvas = doc.createElement('canvas');
    const pixelRatio = getCanvasDevicePixelRatio(canvas);
    // we should keep the layout size...
    canvas.style.width = `${size._internal_w}px`;
    canvas.style.height = `${size._internal_h}px`;
    // ...but multiply coordinate space dimensions to device pixel ratio
    canvas.width = size._internal_w * pixelRatio;
    canvas.height = size._internal_h * pixelRatio;
    return canvas;
}
export function createBoundCanvas(parentElement, size) {
    const doc = ensureNotNull(parentElement.ownerDocument);
    const canvas = doc.createElement('canvas');
    parentElement.appendChild(canvas);
    const binding = bindToDevicePixelRatio(canvas, { allowDownsampling: false });
    binding.resizeCanvas({
        width: size._internal_w,
        height: size._internal_h,
    });
    return binding;
}
export function drawScaled(ctx, ratio, func) {
    ctx.save();
    ctx.scale(ratio, ratio);
    func();
    ctx.restore();
}

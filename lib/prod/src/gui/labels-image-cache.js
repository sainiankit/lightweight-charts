import { createPreconfiguredCanvas, getCanvasDevicePixelRatio, getContext2D, Size } from '../gui/canvas-utils';
import { ensureDefined } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
import { makeFont } from '../helpers/make-font';
import { ceiledEven } from '../helpers/mathex';
import { TextWidthCache } from '../model/text-width-cache';
const MAX_COUNT = 200;
export class LabelsImageCache {
    constructor(fontSize, color, fontFamily, fontStyle) {
        this._private__textWidthCache = new TextWidthCache(MAX_COUNT);
        this._private__fontSize = 0;
        this._private__color = '';
        this._private__font = '';
        this._private__keys = [];
        this._private__hash = new Map();
        this._private__fontSize = fontSize;
        this._private__color = color;
        this._private__font = makeFont(fontSize, fontFamily, fontStyle);
    }
    _internal_destroy() {
        this._private__textWidthCache._internal_reset();
        this._private__keys = [];
        this._private__hash.clear();
    }
    _internal_paintTo(ctx, text, x, y, align) {
        const label = this._private__getLabelImage(ctx, text);
        if (align !== 'left') {
            const pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            x -= Math.floor(label._internal_textWidth * pixelRatio);
        }
        y -= Math.floor(label._internal_height / 2);
        ctx.drawImage(label._internal_canvas, x, y, label._internal_width, label._internal_height);
    }
    _private__getLabelImage(ctx, text) {
        let item;
        if (this._private__hash.has(text)) {
            // Cache hit!
            item = ensureDefined(this._private__hash.get(text));
        }
        else {
            if (this._private__keys.length >= MAX_COUNT) {
                const key = ensureDefined(this._private__keys.shift());
                this._private__hash.delete(key);
            }
            const pixelRatio = getCanvasDevicePixelRatio(ctx.canvas);
            const margin = Math.ceil(this._private__fontSize / 4.5);
            const baselineOffset = Math.round(this._private__fontSize / 10);
            const textWidth = Math.ceil(this._private__textWidthCache._internal_measureText(ctx, text));
            const width = ceiledEven(Math.round(textWidth + margin * 2));
            const height = ceiledEven(this._private__fontSize + margin * 2);
            const canvas = createPreconfiguredCanvas(document, new Size(width, height));
            // Allocate new
            item = {
                _internal_text: text,
                _internal_textWidth: Math.round(Math.max(1, textWidth)),
                _internal_width: Math.ceil(width * pixelRatio),
                _internal_height: Math.ceil(height * pixelRatio),
                _internal_canvas: canvas,
            };
            if (textWidth !== 0) {
                this._private__keys.push(item._internal_text);
                this._private__hash.set(item._internal_text, item);
            }
            ctx = getContext2D(item._internal_canvas);
            drawScaled(ctx, pixelRatio, () => {
                ctx.font = this._private__font;
                ctx.fillStyle = this._private__color;
                ctx.fillText(text, 0, height - margin - baselineOffset);
            });
        }
        return item;
    }
}

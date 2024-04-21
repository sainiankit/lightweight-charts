import { ScaledRenderer } from './scaled-renderer';
export class WatermarkRenderer extends ScaledRenderer {
    constructor(data) {
        super();
        this._private__metricsCache = new Map();
        this._private__data = data;
    }
    _internal__drawImpl(ctx) { }
    _internal__drawBackgroundImpl(ctx) {
        if (!this._private__data._internal_visible) {
            return;
        }
        ctx.save();
        let textHeight = 0;
        for (const line of this._private__data._internal_lines) {
            if (line._internal_text.length === 0) {
                continue;
            }
            ctx.font = line._internal_font;
            const textWidth = this._private__metrics(ctx, line._internal_text);
            if (textWidth > this._private__data._internal_width) {
                line._internal_zoom = this._private__data._internal_width / textWidth;
            }
            else {
                line._internal_zoom = 1;
            }
            textHeight += line._internal_lineHeight * line._internal_zoom;
        }
        let vertOffset = 0;
        switch (this._private__data._internal_vertAlign) {
            case 'top':
                vertOffset = 0;
                break;
            case 'center':
                vertOffset = Math.max((this._private__data._internal_height - textHeight) / 2, 0);
                break;
            case 'bottom':
                vertOffset = Math.max((this._private__data._internal_height - textHeight), 0);
                break;
        }
        ctx.fillStyle = this._private__data._internal_color;
        for (const line of this._private__data._internal_lines) {
            ctx.save();
            let horzOffset = 0;
            switch (this._private__data._internal_horzAlign) {
                case 'left':
                    ctx.textAlign = 'left';
                    horzOffset = line._internal_lineHeight / 2;
                    break;
                case 'center':
                    ctx.textAlign = 'center';
                    horzOffset = this._private__data._internal_width / 2;
                    break;
                case 'right':
                    ctx.textAlign = 'right';
                    horzOffset = this._private__data._internal_width - 1 - line._internal_lineHeight / 2;
                    break;
            }
            ctx.translate(horzOffset, vertOffset);
            ctx.textBaseline = 'top';
            ctx.font = line._internal_font;
            ctx.scale(line._internal_zoom, line._internal_zoom);
            ctx.fillText(line._internal_text, 0, line._internal_vertOffset);
            ctx.restore();
            vertOffset += line._internal_lineHeight * line._internal_zoom;
        }
        ctx.restore();
    }
    _private__metrics(ctx, text) {
        const fontCache = this._private__fontCache(ctx.font);
        let result = fontCache.get(text);
        if (result === undefined) {
            result = ctx.measureText(text).width;
            fontCache.set(text, result);
        }
        return result;
    }
    _private__fontCache(font) {
        let fontCache = this._private__metricsCache.get(font);
        if (fontCache === undefined) {
            fontCache = new Map();
            this._private__metricsCache.set(font, fontCache);
        }
        return fontCache;
    }
}

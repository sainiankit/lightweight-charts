import { ensureNotNull } from '../helpers/assertions';
import { drawScaled } from '../helpers/canvas-helpers';
const optimizationReplacementRe = /[1-9]/g;
export class TimeAxisViewRenderer {
    constructor() {
        this._private__data = null;
    }
    _internal_setData(data) {
        this._private__data = data;
    }
    _internal_draw(ctx, rendererOptions, pixelRatio) {
        if (this._private__data === null || this._private__data._internal_visible === false || this._private__data._internal_text.length === 0) {
            return;
        }
        ctx.font = rendererOptions._internal_font;
        const textWidth = Math.round(rendererOptions._internal_widthCache._internal_measureText(ctx, this._private__data._internal_text, optimizationReplacementRe));
        if (textWidth <= 0) {
            return;
        }
        ctx.save();
        const horzMargin = rendererOptions._internal_paddingHorizontal;
        const labelWidth = textWidth + 2 * horzMargin;
        const labelWidthHalf = labelWidth / 2;
        const timeScaleWidth = this._private__data._internal_width;
        let coordinate = this._private__data._internal_coordinate;
        let x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        if (x1 < 0) {
            coordinate = coordinate + Math.abs(0 - x1);
            x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        }
        else if (x1 + labelWidth > timeScaleWidth) {
            coordinate = coordinate - Math.abs(timeScaleWidth - (x1 + labelWidth));
            x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
        }
        const x2 = x1 + labelWidth;
        const y1 = 0;
        const y2 = (y1 +
            rendererOptions._internal_borderSize +
            rendererOptions._internal_paddingTop +
            rendererOptions._internal_fontSize +
            rendererOptions._internal_paddingBottom);
        ctx.fillStyle = this._private__data._internal_background;
        const x1scaled = Math.round(x1 * pixelRatio);
        const y1scaled = Math.round(y1 * pixelRatio);
        const x2scaled = Math.round(x2 * pixelRatio);
        const y2scaled = Math.round(y2 * pixelRatio);
        ctx.fillRect(x1scaled, y1scaled, x2scaled - x1scaled, y2scaled - y1scaled);
        if (this._private__data._internal_tickVisible) {
            const tickX = Math.round(this._private__data._internal_coordinate * pixelRatio);
            const tickTop = y1scaled;
            const tickBottom = Math.round((tickTop + rendererOptions._internal_borderSize + rendererOptions._internal_tickLength) * pixelRatio);
            ctx.fillStyle = this._private__data._internal_color;
            const tickWidth = Math.max(1, Math.floor(pixelRatio));
            const tickOffset = Math.floor(pixelRatio * 0.5);
            ctx.fillRect(tickX - tickOffset, tickTop, tickWidth, tickBottom - tickTop);
        }
        const yText = y2 - rendererOptions._internal_baselineOffset - rendererOptions._internal_paddingBottom;
        ctx.textAlign = 'left';
        ctx.fillStyle = this._private__data._internal_color;
        drawScaled(ctx, pixelRatio, () => {
            ctx.fillText(ensureNotNull(this._private__data)._internal_text, x1 + horzMargin, yText);
        });
        ctx.restore();
    }
}

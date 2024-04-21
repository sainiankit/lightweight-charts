import { ensureNotNull } from '../helpers/assertions';
import { setLineStyle, strokeInPixel } from './draw-line';
export class GridRenderer {
    constructor() {
        this._private__data = null;
    }
    _internal_setData(data) {
        this._private__data = data;
    }
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null) {
            return;
        }
        const lineWidth = Math.max(1, Math.floor(pixelRatio));
        ctx.lineWidth = lineWidth;
        const height = Math.ceil(this._private__data._internal_h * pixelRatio);
        const width = Math.ceil(this._private__data._internal_w * pixelRatio);
        strokeInPixel(ctx, () => {
            const data = ensureNotNull(this._private__data);
            if (data._internal_vertLinesVisible) {
                ctx.strokeStyle = data._internal_vertLinesColor;
                setLineStyle(ctx, data._internal_vertLineStyle);
                ctx.beginPath();
                for (const timeMark of data._internal_timeMarks) {
                    const x = Math.round(timeMark._internal_coord * pixelRatio);
                    ctx.moveTo(x, -lineWidth);
                    ctx.lineTo(x, height + lineWidth);
                }
                ctx.stroke();
            }
            if (data._internal_horzLinesVisible) {
                ctx.strokeStyle = data._internal_horzLinesColor;
                setLineStyle(ctx, data._internal_horzLineStyle);
                ctx.beginPath();
                for (const priceMark of data._internal_priceMarks) {
                    const y = Math.round(priceMark._internal_coord * pixelRatio);
                    ctx.moveTo(-lineWidth, y);
                    ctx.lineTo(width + lineWidth, y);
                }
                ctx.stroke();
            }
        });
    }
}

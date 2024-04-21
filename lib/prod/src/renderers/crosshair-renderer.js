import { drawHorizontalLine, drawVerticalLine, setLineStyle } from './draw-line';
export class CrosshairRenderer {
    constructor(data) {
        this._private__data = data;
    }
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null) {
            return;
        }
        const vertLinesVisible = this._private__data._internal_vertLine._internal_visible;
        const horzLinesVisible = this._private__data._internal_horzLine._internal_visible;
        if (!vertLinesVisible && !horzLinesVisible) {
            return;
        }
        ctx.save();
        const x = Math.round(this._private__data._internal_x * pixelRatio);
        const y = Math.round(this._private__data._internal_y * pixelRatio);
        const w = Math.ceil(this._private__data._internal_w * pixelRatio);
        const h = Math.ceil(this._private__data._internal_h * pixelRatio);
        ctx.lineCap = 'butt';
        if (vertLinesVisible && x >= 0) {
            ctx.lineWidth = Math.floor(this._private__data._internal_vertLine._internal_lineWidth * pixelRatio);
            ctx.strokeStyle = this._private__data._internal_vertLine._internal_color;
            ctx.fillStyle = this._private__data._internal_vertLine._internal_color;
            setLineStyle(ctx, this._private__data._internal_vertLine._internal_lineStyle);
            drawVerticalLine(ctx, x, 0, h);
        }
        if (horzLinesVisible && y >= 0) {
            ctx.lineWidth = Math.floor(this._private__data._internal_horzLine._internal_lineWidth * pixelRatio);
            ctx.strokeStyle = this._private__data._internal_horzLine._internal_color;
            ctx.fillStyle = this._private__data._internal_horzLine._internal_color;
            setLineStyle(ctx, this._private__data._internal_horzLine._internal_lineStyle);
            drawHorizontalLine(ctx, y, 0, w);
        }
        ctx.restore();
    }
}

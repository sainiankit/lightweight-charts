import { drawHorizontalLine, setLineStyle } from './draw-line';
export class HorizontalLineRenderer {
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
        if (this._private__data._internal_visible === false) {
            return;
        }
        const y = Math.round(this._private__data._internal_y * pixelRatio);
        if (y < 0 || y > Math.ceil(this._private__data._internal_height * pixelRatio)) {
            return;
        }
        const width = Math.ceil(this._private__data._internal_width * pixelRatio);
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this._private__data._internal_color;
        ctx.lineWidth = Math.floor(this._private__data._internal_lineWidth * pixelRatio);
        setLineStyle(ctx, this._private__data._internal_lineStyle);
        drawHorizontalLine(ctx, y, 0, width);
    }
}

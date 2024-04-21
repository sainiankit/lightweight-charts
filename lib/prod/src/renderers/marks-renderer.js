import { ScaledRenderer } from './scaled-renderer';
export class PaneRendererMarks extends ScaledRenderer {
    constructor() {
        super(...arguments);
        this._internal__data = null;
    }
    _internal_setData(data) {
        this._internal__data = data;
    }
    _internal__drawImpl(ctx) {
        if (this._internal__data === null || this._internal__data._internal_visibleRange === null) {
            return;
        }
        const visibleRange = this._internal__data._internal_visibleRange;
        const data = this._internal__data;
        const draw = (radius) => {
            ctx.beginPath();
            for (let i = visibleRange.to - 1; i >= visibleRange.from; --i) {
                const point = data._internal_items[i];
                ctx.moveTo(point._internal_x, point._internal_y);
                ctx.arc(point._internal_x, point._internal_y, radius, 0, Math.PI * 2);
            }
            ctx.fill();
        };
        ctx.fillStyle = data._internal_backColor;
        draw(data._internal_radius + 2);
        ctx.fillStyle = data._internal_lineColor;
        draw(data._internal_radius);
    }
}

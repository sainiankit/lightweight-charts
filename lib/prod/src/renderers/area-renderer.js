import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
export class PaneRendererAreaBase extends ScaledRenderer {
    constructor() {
        super(...arguments);
        this._internal__data = null;
    }
    _internal_setData(data) {
        this._internal__data = data;
    }
    _internal__drawImpl(ctx) {
        if (this._internal__data === null || this._internal__data._internal_items.length === 0 || this._internal__data._internal_visibleRange === null) {
            return;
        }
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        // walk lines with width=1 to have more accurate gradient's filling
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this._internal__data._internal_items.length === 1) {
            const point = this._internal__data._internal_items[0];
            const halfBarWidth = this._internal__data._internal_barWidth / 2;
            ctx.moveTo(point._internal_x - halfBarWidth, this._internal__data._internal_baseLevelCoordinate);
            ctx.lineTo(point._internal_x - halfBarWidth, point._internal_y);
            ctx.lineTo(point._internal_x + halfBarWidth, point._internal_y);
            ctx.lineTo(point._internal_x + halfBarWidth, this._internal__data._internal_baseLevelCoordinate);
        }
        else {
            ctx.moveTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_baseLevelCoordinate);
            ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_y);
            walkLine(ctx, this._internal__data._internal_items, this._internal__data._internal_lineType, this._internal__data._internal_visibleRange);
            if (this._internal__data._internal_visibleRange.to > this._internal__data._internal_visibleRange.from) {
                ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.to - 1]._internal_x, this._internal__data._internal_baseLevelCoordinate);
                ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_baseLevelCoordinate);
            }
        }
        ctx.closePath();
        ctx.fillStyle = this._internal__fillStyle(ctx);
        ctx.fill();
    }
}
export class PaneRendererArea extends PaneRendererAreaBase {
    _internal__fillStyle(ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = this._internal__data;
        const gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        gradient.addColorStop(0, data._internal_topColor);
        gradient.addColorStop(1, data._internal_bottomColor);
        return gradient;
    }
}

import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { getControlPoints, walkLine } from './walk-line';
export class PaneRendererLineBase extends ScaledRenderer {
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
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        ctx.strokeStyle = this._internal__strokeStyle(ctx);
        ctx.lineJoin = 'round';
        if (this._internal__data._internal_items.length === 1) {
            ctx.beginPath();
            const point = this._internal__data._internal_items[0];
            ctx.moveTo(point._internal_x - this._internal__data._internal_barWidth / 2, point._internal_y);
            ctx.lineTo(point._internal_x + this._internal__data._internal_barWidth / 2, point._internal_y);
            if (point._internal_color !== undefined) {
                ctx.strokeStyle = point._internal_color;
            }
            ctx.stroke();
        }
        else {
            this._internal__drawLine(ctx, this._internal__data);
        }
    }
    _internal__drawLine(ctx, data) {
        ctx.beginPath();
        walkLine(ctx, data._internal_items, data._internal_lineType, data._internal_visibleRange);
        ctx.stroke();
    }
}
export class PaneRendererLine extends PaneRendererLineBase {
    /**
     * Similar to {@link walkLine}, but supports color changes
     */
    _internal__drawLine(ctx, data) {
        var _a, _b;
        const { _internal_items: items, _internal_visibleRange: visibleRange, _internal_lineType: lineType, _internal_lineColor: lineColor } = data;
        if (items.length === 0 || visibleRange === null) {
            return;
        }
        ctx.beginPath();
        const firstItem = items[visibleRange.from];
        ctx.moveTo(firstItem._internal_x, firstItem._internal_y);
        let prevStrokeStyle = (_a = firstItem._internal_color) !== null && _a !== void 0 ? _a : lineColor;
        ctx.strokeStyle = prevStrokeStyle;
        const changeColor = (color) => {
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = color;
            prevStrokeStyle = color;
        };
        for (let i = visibleRange.from + 1; i < visibleRange.to; ++i) {
            const currItem = items[i];
            const currentStrokeStyle = (_b = currItem._internal_color) !== null && _b !== void 0 ? _b : lineColor;
            switch (lineType) {
                case 0 /* Simple */:
                    ctx.lineTo(currItem._internal_x, currItem._internal_y);
                    break;
                case 1 /* WithSteps */:
                    ctx.lineTo(currItem._internal_x, items[i - 1]._internal_y);
                    if (currentStrokeStyle !== prevStrokeStyle) {
                        changeColor(currentStrokeStyle);
                        ctx.lineTo(currItem._internal_x, items[i - 1]._internal_y);
                    }
                    ctx.lineTo(currItem._internal_x, currItem._internal_y);
                    break;
                case 2 /* Curved */: {
                    const [cp1, cp2] = getControlPoints(items, i - 1, i);
                    ctx.bezierCurveTo(cp1._internal_x, cp1._internal_y, cp2._internal_x, cp2._internal_y, currItem._internal_x, currItem._internal_y);
                    break;
                }
            }
            if (lineType !== 1 /* WithSteps */ && currentStrokeStyle !== prevStrokeStyle) {
                changeColor(currentStrokeStyle);
                ctx.moveTo(currItem._internal_x, currItem._internal_y);
            }
        }
        ctx.stroke();
    }
    _internal__strokeStyle() {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._internal__data._internal_lineColor;
    }
}

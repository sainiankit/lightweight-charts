import { ensureNotNull } from '../helpers/assertions';
import { optimalBarWidth } from './optimal-bar-width';
export class PaneRendererBars {
    constructor() {
        this._private__data = null;
        this._private__barWidth = 0;
        this._private__barLineWidth = 0;
    }
    _internal_setData(data) {
        this._private__data = data;
    }
    // eslint-disable-next-line complexity
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null || this._private__data._internal_bars.length === 0 || this._private__data._internal_visibleRange === null) {
            return;
        }
        this._private__barWidth = this._private__calcBarWidth(pixelRatio);
        // grid and crosshair have line width = Math.floor(pixelRatio)
        // if this value is odd, we have to make bars' width odd
        // if this value is even, we have to make bars' width even
        // in order of keeping crosshair-over-bar drawing symmetric
        if (this._private__barWidth >= 2) {
            const lineWidth = Math.max(1, Math.floor(pixelRatio));
            if ((lineWidth % 2) !== (this._private__barWidth % 2)) {
                this._private__barWidth--;
            }
        }
        // if scale is compressed, bar could become less than 1 CSS pixel
        this._private__barLineWidth = this._private__data._internal_thinBars ? Math.min(this._private__barWidth, Math.floor(pixelRatio)) : this._private__barWidth;
        let prevColor = null;
        const drawOpenClose = this._private__barLineWidth <= this._private__barWidth && this._private__data._internal_barSpacing >= Math.floor(1.5 * pixelRatio);
        for (let i = this._private__data._internal_visibleRange.from; i < this._private__data._internal_visibleRange.to; ++i) {
            const bar = this._private__data._internal_bars[i];
            if (prevColor !== bar._internal_color) {
                ctx.fillStyle = bar._internal_color;
                prevColor = bar._internal_color;
            }
            const bodyWidthHalf = Math.floor(this._private__barLineWidth * 0.5);
            const bodyCenter = Math.round(bar._internal_x * pixelRatio);
            const bodyLeft = bodyCenter - bodyWidthHalf;
            const bodyWidth = this._private__barLineWidth;
            const bodyRight = bodyLeft + bodyWidth - 1;
            const high = Math.min(bar._internal_highY, bar._internal_lowY);
            const low = Math.max(bar._internal_highY, bar._internal_lowY);
            const bodyTop = Math.round(high * pixelRatio) - bodyWidthHalf;
            const bodyBottom = Math.round(low * pixelRatio) + bodyWidthHalf;
            const bodyHeight = Math.max((bodyBottom - bodyTop), this._private__barLineWidth);
            ctx.fillRect(bodyLeft, bodyTop, bodyWidth, bodyHeight);
            const sideWidth = Math.ceil(this._private__barWidth * 1.5);
            if (drawOpenClose) {
                if (this._private__data._internal_openVisible) {
                    const openLeft = bodyCenter - sideWidth;
                    let openTop = Math.max(bodyTop, Math.round(bar._internal_openY * pixelRatio) - bodyWidthHalf);
                    let openBottom = openTop + bodyWidth - 1;
                    if (openBottom > bodyTop + bodyHeight - 1) {
                        openBottom = bodyTop + bodyHeight - 1;
                        openTop = openBottom - bodyWidth + 1;
                    }
                    ctx.fillRect(openLeft, openTop, bodyLeft - openLeft, openBottom - openTop + 1);
                }
                const closeRight = bodyCenter + sideWidth;
                let closeTop = Math.max(bodyTop, Math.round(bar._internal_closeY * pixelRatio) - bodyWidthHalf);
                let closeBottom = closeTop + bodyWidth - 1;
                if (closeBottom > bodyTop + bodyHeight - 1) {
                    closeBottom = bodyTop + bodyHeight - 1;
                    closeTop = closeBottom - bodyWidth + 1;
                }
                ctx.fillRect(bodyRight + 1, closeTop, closeRight - bodyRight, closeBottom - closeTop + 1);
            }
        }
    }
    _private__calcBarWidth(pixelRatio) {
        const limit = Math.floor(pixelRatio);
        return Math.max(limit, Math.floor(optimalBarWidth(ensureNotNull(this._private__data)._internal_barSpacing, pixelRatio)));
    }
}

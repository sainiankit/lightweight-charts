import { fillRectInnerBorder } from '../helpers/canvas-helpers';
import { optimalCandlestickWidth } from './optimal-bar-width';
;
export class PaneRendererCandlesticks {
    constructor() {
        this._private__data = null;
        // scaled with pixelRatio
        this._private__barWidth = 0;
    }
    _internal_setData(data) {
        this._private__data = data;
    }
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        if (this._private__data === null || this._private__data._internal_bars.length === 0 || this._private__data._internal_visibleRange === null) {
            return;
        }
        // now we know pixelRatio and we could calculate barWidth effectively
        this._private__barWidth = optimalCandlestickWidth(this._private__data._internal_barSpacing, pixelRatio);
        // grid and crosshair have line width = Math.floor(pixelRatio)
        // if this value is odd, we have to make candlesticks' width odd
        // if this value is even, we have to make candlesticks' width even
        // in order of keeping crosshair-over-candlesticks drawing symmetric
        if (this._private__barWidth >= 2) {
            const wickWidth = Math.floor(pixelRatio);
            if ((wickWidth % 2) !== (this._private__barWidth % 2)) {
                this._private__barWidth--;
            }
        }
        const bars = this._private__data._internal_bars;
        if (this._private__data._internal_wickVisible) {
            this._private__drawWicks(ctx, bars, this._private__data._internal_visibleRange, pixelRatio);
        }
        if (this._private__data._internal_borderVisible) {
            this._private__drawBorder(ctx, bars, this._private__data._internal_visibleRange, this._private__data._internal_barSpacing, pixelRatio);
        }
        const borderWidth = this._private__calculateBorderWidth(pixelRatio);
        if (!this._private__data._internal_borderVisible || this._private__barWidth > borderWidth * 2) {
            this._private__drawCandles(ctx, bars, this._private__data._internal_visibleRange, pixelRatio);
        }
    }
    _private__drawWicks(ctx, bars, visibleRange, pixelRatio) {
        if (this._private__data === null) {
            return;
        }
        let prevWickColor = '';
        let wickWidth = Math.min(Math.floor(pixelRatio), Math.floor(this._private__data._internal_barSpacing * pixelRatio));
        wickWidth = Math.max(Math.floor(pixelRatio), Math.min(wickWidth, this._private__barWidth));
        const wickOffset = Math.floor(wickWidth * 0.5);
        let prevEdge = null;
        for (let i = visibleRange.from; i < visibleRange.to; i++) {
            const bar = bars[i];
            if (bar._internal_wickColor !== prevWickColor) {
                ctx.fillStyle = bar._internal_wickColor;
                prevWickColor = bar._internal_wickColor;
            }
            const top = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            const bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            const high = Math.round(bar._internal_highY * pixelRatio);
            const low = Math.round(bar._internal_lowY * pixelRatio);
            const scaledX = Math.round(pixelRatio * bar._internal_x);
            let left = scaledX - wickOffset;
            const right = left + wickWidth - 1;
            if (prevEdge !== null) {
                left = Math.max(prevEdge + 1, left);
                left = Math.min(left, right);
            }
            const width = right - left + 1;
            ctx.fillRect(left, high, width, top - high);
            ctx.fillRect(left, bottom + 1, width, low - bottom);
            prevEdge = right;
        }
    }
    _private__calculateBorderWidth(pixelRatio) {
        let borderWidth = Math.floor(1 /* BarBorderWidth */ * pixelRatio);
        if (this._private__barWidth <= 2 * borderWidth) {
            borderWidth = Math.floor((this._private__barWidth - 1) * 0.5);
        }
        const res = Math.max(Math.floor(pixelRatio), borderWidth);
        if (this._private__barWidth <= res * 2) {
            // do not draw bodies, restore original value
            return Math.max(Math.floor(pixelRatio), Math.floor(1 /* BarBorderWidth */ * pixelRatio));
        }
        return res;
    }
    _private__drawBorder(ctx, bars, visibleRange, barSpacing, pixelRatio) {
        if (this._private__data === null) {
            return;
        }
        let prevBorderColor = '';
        const borderWidth = this._private__calculateBorderWidth(pixelRatio);
        let prevEdge = null;
        for (let i = visibleRange.from; i < visibleRange.to; i++) {
            const bar = bars[i];
            if (bar._internal_borderColor !== prevBorderColor) {
                ctx.fillStyle = bar._internal_borderColor;
                prevBorderColor = bar._internal_borderColor;
            }
            let left = Math.round(bar._internal_x * pixelRatio) - Math.floor(this._private__barWidth * 0.5);
            // this is important to calculate right before patching left
            const right = left + this._private__barWidth - 1;
            const top = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            const bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            if (prevEdge !== null) {
                left = Math.max(prevEdge + 1, left);
                left = Math.min(left, right);
            }
            if (this._private__data._internal_barSpacing * pixelRatio > 2 * borderWidth) {
                fillRectInnerBorder(ctx, left, top, right - left + 1, bottom - top + 1, borderWidth);
            }
            else {
                const width = right - left + 1;
                ctx.fillRect(left, top, width, bottom - top + 1);
            }
            prevEdge = right;
        }
    }
    _private__drawCandles(ctx, bars, visibleRange, pixelRatio) {
        if (this._private__data === null) {
            return;
        }
        let prevBarColor = '';
        const borderWidth = this._private__calculateBorderWidth(pixelRatio);
        for (let i = visibleRange.from; i < visibleRange.to; i++) {
            const bar = bars[i];
            let top = Math.round(Math.min(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            let bottom = Math.round(Math.max(bar._internal_openY, bar._internal_closeY) * pixelRatio);
            let left = Math.round(bar._internal_x * pixelRatio) - Math.floor(this._private__barWidth * 0.5);
            let right = left + this._private__barWidth - 1;
            if (bar._internal_color !== prevBarColor) {
                const barColor = bar._internal_color;
                ctx.fillStyle = barColor;
                prevBarColor = barColor;
            }
            if (this._private__data._internal_borderVisible) {
                left += borderWidth;
                top += borderWidth;
                right -= borderWidth;
                bottom -= borderWidth;
            }
            if (top > bottom) {
                continue;
            }
            ctx.fillRect(left, top, right - left + 1, bottom - top + 1);
        }
    }
}

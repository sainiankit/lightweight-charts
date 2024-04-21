import { drawScaled } from '../helpers/canvas-helpers';
export class PriceAxisViewRenderer {
    constructor(data, commonData) {
        this._internal_setData(data, commonData);
    }
    _internal_setData(data, commonData) {
        this._private__data = data;
        this._private__commonData = commonData;
    }
    _internal_draw(ctx, rendererOptions, textWidthCache, width, align, pixelRatio) {
        if (!this._private__data._internal_visible) {
            return;
        }
        ctx.font = rendererOptions._internal_font;
        const tickSize = (this._private__data._internal_tickVisible || !this._private__data._internal_moveTextToInvisibleTick) ? rendererOptions._internal_tickLength : 0;
        const horzBorder = rendererOptions._internal_borderSize;
        const paddingTop = rendererOptions._internal_paddingTop;
        const paddingBottom = rendererOptions._internal_paddingBottom;
        const paddingInner = rendererOptions._internal_paddingInner;
        const paddingOuter = rendererOptions._internal_paddingOuter;
        const text = this._private__data._internal_text;
        const textWidth = Math.ceil(textWidthCache._internal_measureText(ctx, text));
        const baselineOffset = rendererOptions._internal_baselineOffset;
        const totalHeight = rendererOptions._internal_fontSize + paddingTop + paddingBottom;
        const halfHeigth = Math.ceil(totalHeight * 0.5);
        const totalWidth = horzBorder + textWidth + paddingInner + paddingOuter + tickSize;
        let yMid = this._private__commonData._internal_coordinate;
        if (this._private__commonData._internal_fixedCoordinate) {
            yMid = this._private__commonData._internal_fixedCoordinate;
        }
        yMid = Math.round(yMid);
        const yTop = yMid - halfHeigth;
        const yBottom = yTop + totalHeight;
        const alignRight = align === 'right';
        const xInside = alignRight ? width : 0;
        const rightScaled = Math.ceil(width * pixelRatio);
        let xOutside = xInside;
        let xTick;
        let xText;
        ctx.fillStyle = this._private__commonData._internal_background;
        ctx.lineWidth = 1;
        ctx.lineCap = 'butt';
        if (text) {
            if (alignRight) {
                // 2               1
                //
                //              6  5
                //
                // 3               4
                xOutside = xInside - totalWidth;
                xTick = xInside - tickSize;
                xText = xOutside + paddingOuter;
            }
            else {
                // 1               2
                //
                // 6  5
                //
                // 4               3
                xOutside = xInside + totalWidth;
                xTick = xInside + tickSize;
                xText = xInside + horzBorder + tickSize + paddingInner;
            }
            const tickHeight = Math.max(1, Math.floor(pixelRatio));
            const horzBorderScaled = Math.max(1, Math.floor(horzBorder * pixelRatio));
            const xInsideScaled = alignRight ? rightScaled : 0;
            const yTopScaled = Math.round(yTop * pixelRatio);
            const xOutsideScaled = Math.round(xOutside * pixelRatio);
            const yMidScaled = Math.round(yMid * pixelRatio) - Math.floor(pixelRatio * 0.5);
            const yBottomScaled = yMidScaled + tickHeight + (yMidScaled - yTopScaled);
            const xTickScaled = Math.round(xTick * pixelRatio);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(xInsideScaled, yTopScaled);
            ctx.lineTo(xOutsideScaled, yTopScaled);
            ctx.lineTo(xOutsideScaled, yBottomScaled);
            ctx.lineTo(xInsideScaled, yBottomScaled);
            ctx.fill();
            // draw border
            ctx.fillStyle = this._private__data._internal_borderColor;
            ctx.fillRect(alignRight ? rightScaled - horzBorderScaled : 0, yTopScaled, horzBorderScaled, yBottomScaled - yTopScaled);
            if (this._private__data._internal_tickVisible) {
                ctx.fillStyle = this._private__commonData._internal_color;
                ctx.fillRect(xInsideScaled, yMidScaled, xTickScaled - xInsideScaled, tickHeight);
            }
            ctx.textAlign = 'left';
            ctx.fillStyle = this._private__commonData._internal_color;
            drawScaled(ctx, pixelRatio, () => {
                ctx.fillText(text, xText, yBottom - paddingBottom - baselineOffset);
            });
            ctx.restore();
        }
    }
    _internal_height(rendererOptions, useSecondLine) {
        if (!this._private__data._internal_visible) {
            return 0;
        }
        return rendererOptions._internal_fontSize + rendererOptions._internal_paddingTop + rendererOptions._internal_paddingBottom;
    }
}

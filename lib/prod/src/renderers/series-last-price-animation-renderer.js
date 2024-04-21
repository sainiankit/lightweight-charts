export class SeriesLastPriceAnimationRenderer {
    constructor() {
        this._private__data = null;
    }
    _internal_setData(data) {
        this._private__data = data;
    }
    _internal_data() {
        return this._private__data;
    }
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        const data = this._private__data;
        if (data === null) {
            return;
        }
        ctx.save();
        const tickWidth = Math.max(1, Math.floor(pixelRatio));
        const correction = (tickWidth % 2) / 2;
        const centerX = Math.round(data._internal_center.x * pixelRatio) + correction; // correct x coordinate only
        const centerY = data._internal_center.y * pixelRatio;
        ctx.fillStyle = data._internal_seriesLineColor;
        ctx.beginPath();
        const centerPointRadius = Math.max(2, data._internal_seriesLineWidth * 1.5) * pixelRatio;
        ctx.arc(centerX, centerY, centerPointRadius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = data._internal_fillColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, data._internal_radius * pixelRatio, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.lineWidth = tickWidth;
        ctx.strokeStyle = data._internal_strokeColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, data._internal_radius * pixelRatio + tickWidth / 2, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.restore();
    }
}

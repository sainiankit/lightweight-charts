import { shapeSize } from './series-markers-utils';
export function drawCircle(ctx, centerX, centerY, size) {
    const circleSize = shapeSize('circle', size);
    const halfSize = (circleSize - 1) / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize, 0, 2 * Math.PI, false);
    ctx.fill();
}
export function hitTestCircle(centerX, centerY, size, x, y) {
    const circleSize = shapeSize('circle', size);
    const tolerance = 2 + circleSize / 2;
    const xOffset = centerX - x;
    const yOffset = centerY - y;
    const dist = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
    return dist <= tolerance;
}

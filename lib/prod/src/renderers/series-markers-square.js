import { shapeSize } from './series-markers-utils';
export function drawSquare(ctx, centerX, centerY, size) {
    const squareSize = shapeSize('square', size);
    const halfSize = (squareSize - 1) / 2;
    const left = centerX - halfSize;
    const top = centerY - halfSize;
    ctx.fillRect(left, top, squareSize, squareSize);
}
export function hitTestSquare(centerX, centerY, size, x, y) {
    const squareSize = shapeSize('square', size);
    const halfSize = (squareSize - 1) / 2;
    const left = centerX - halfSize;
    const top = centerY - halfSize;
    return x >= left && x <= left + squareSize &&
        y >= top && y <= top + squareSize;
}

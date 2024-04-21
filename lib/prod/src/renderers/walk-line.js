/**
 * BEWARE: The method must be called after beginPath and before stroke/fill/closePath/etc
 */
export function walkLine(ctx, points, lineType, visibleRange) {
    if (points.length === 0) {
        return;
    }
    const x = points[visibleRange.from]._internal_x;
    const y = points[visibleRange.from]._internal_y;
    ctx.moveTo(x, y);
    for (let i = visibleRange.from + 1; i < visibleRange.to; ++i) {
        const currItem = points[i];
        switch (lineType) {
            case 0 /* Simple */:
                ctx.lineTo(currItem._internal_x, currItem._internal_y);
                break;
            case 1 /* WithSteps */: {
                ctx.lineTo(currItem._internal_x, points[i - 1]._internal_y);
                ctx.lineTo(currItem._internal_x, currItem._internal_y);
                break;
            }
            case 2 /* Curved */: {
                const [cp1, cp2] = getControlPoints(points, i - 1, i);
                ctx.bezierCurveTo(cp1._internal_x, cp1._internal_y, cp2._internal_x, cp2._internal_y, currItem._internal_x, currItem._internal_y);
                break;
            }
        }
    }
}
const curveTension = 6;
function subtract(p1, p2) {
    return { _internal_x: p1._internal_x - p2._internal_x, _internal_y: p1._internal_y - p2._internal_y };
}
function add(p1, p2) {
    return { _internal_x: p1._internal_x + p2._internal_x, _internal_y: p1._internal_y + p2._internal_y };
}
function divide(p1, n) {
    return { _internal_x: p1._internal_x / n, _internal_y: p1._internal_y / n };
}
/**
 * @returns Two control points that can be used as arguments to {@link CanvasRenderingContext2D.bezierCurveTo} to draw a curved line between `points[fromPointIndex]` and `points[toPointIndex]`.
 */
export function getControlPoints(points, fromPointIndex, toPointIndex) {
    const beforeFromPointIndex = Math.max(0, fromPointIndex - 1);
    const afterToPointIndex = Math.min(points.length - 1, toPointIndex + 1);
    const cp1 = add(points[fromPointIndex], divide(subtract(points[toPointIndex], points[beforeFromPointIndex]), curveTension));
    const cp2 = subtract(points[toPointIndex], divide(subtract(points[afterToPointIndex], points[fromPointIndex]), curveTension));
    return [cp1, cp2];
}

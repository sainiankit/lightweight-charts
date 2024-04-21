import { SeriesItemsIndexesRange } from '../model/time-data';
import { LinePoint, LineType } from './draw-line';
/**
 * BEWARE: The method must be called after beginPath and before stroke/fill/closePath/etc
 */
export declare function walkLine(ctx: CanvasRenderingContext2D, points: readonly LinePoint[], lineType: LineType, visibleRange: SeriesItemsIndexesRange): void;
/**
 * @returns Two control points that can be used as arguments to {@link CanvasRenderingContext2D.bezierCurveTo} to draw a curved line between `points[fromPointIndex]` and `points[toPointIndex]`.
 */
export declare function getControlPoints(points: readonly LinePoint[], fromPointIndex: number, toPointIndex: number): [LinePoint, LinePoint];

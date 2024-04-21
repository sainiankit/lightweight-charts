import { TickMark } from './tick-marks';
export declare type FormatFunction = (tickMark: TickMark) => string;
export declare class FormattedLabelsCache {
    private readonly _format;
    private readonly _maxSize;
    private _actualSize;
    private _usageTick;
    private _oldestTick;
    private _cache;
    private _tick2Labels;
    constructor(format: FormatFunction, size?: number);
    format(tickMark: TickMark): string;
}

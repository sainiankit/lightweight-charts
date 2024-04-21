import { DeepPartial } from '../helpers/strict-type-checks';
import { LineStyle, LineType, LineWidth } from '../renderers/draw-line';
import { AutoScaleMargins } from './autoscale-info-impl';
import { PriceFormatterFn } from './price-formatter-fn';
/**
 * Represents style options for a candlestick series.
 */
export interface CandlestickStyleOptions {
    /**
     * Color of rising candles.
     *
     * @defaultValue `'#26a69a'`
     */
    upColor: string;
    /**
     * Color of falling candles.
     *
     * @defaultValue `'#ef5350'`
     */
    downColor: string;
    /**
     * Enable high and low prices candle wicks.
     *
     * @defaultValue `true`
     */
    wickVisible: boolean;
    /**
     * Enable candle borders.
     *
     * @defaultValue `true`
     */
    borderVisible: boolean;
    /**
     * Border color.
     *
     * @defaultValue `'#378658'`
     */
    borderColor: string;
    /**
     * Border color of rising candles.
     *
     * @defaultValue `'#26a69a'`
     */
    borderUpColor: string;
    /**
     * Border color of falling candles.
     *
     * @defaultValue `'#ef5350'`
     */
    borderDownColor: string;
    /**
     * Wick color.
     *
     * @defaultValue `'#737375'`
     */
    wickColor: string;
    /**
     * Wick color of rising candles.
     *
     * @defaultValue `'#26a69a'`
     */
    wickUpColor: string;
    /**
     * Wick color of falling candles.
     *
     * @defaultValue `'#ef5350'`
     */
    wickDownColor: string;
}
export declare function fillUpDownCandlesticksColors(options: Partial<CandlestickStyleOptions>): void;
/**
 * Represents the type of the last price animation for series such as area or line.
 */
export declare const enum LastPriceAnimationMode {
    /**
     * Animation is always disabled
     */
    Disabled = 0,
    /**
     * Animation is always enabled.
     */
    Continuous = 1,
    /**
     * Animation is active after new data.
     */
    OnDataUpdate = 2
}
/**
 * Represents style options for a bar series.
 */
export interface BarStyleOptions {
    /**
     * Color of rising bars.
     *
     * @defaultValue `'#26a69a'`
     */
    upColor: string;
    /**
     * Color of falling bars.
     *
     * @defaultValue `'#ef5350'`
     */
    downColor: string;
    /**
     * Show open lines on bars.
     *
     * @defaultValue `true`
     */
    openVisible: boolean;
    /**
     * Show bars as sticks.
     *
     * @defaultValue `true`
     */
    thinBars: boolean;
}
/**
 * Represents style options for a line series.
 */
export interface LineStyleOptions {
    /**
     * Line color.
     *
     * @defaultValue `'#2196f3'`
     */
    color: string;
    /**
     * Line style.
     *
     * @defaultValue {@link LineStyle.Solid}
     */
    lineStyle: LineStyle;
    /**
     * Line width in pixels.
     *
     * @defaultValue `3`
     */
    lineWidth: LineWidth;
    /**
     * Line type.
     *
     * @defaultValue {@link LineType.Simple}
     */
    lineType: LineType;
    /**
     * Show the crosshair marker.
     *
     * @defaultValue `true`
     */
    crosshairMarkerVisible: boolean;
    /**
     * Crosshair marker radius in pixels.
     *
     * @defaultValue `4`
     */
    crosshairMarkerRadius: number;
    /**
     * Crosshair marker border color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBorderColor: string;
    /**
     * The crosshair marker background color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBackgroundColor: string;
    /**
     * Last price animation mode.
     *
     * @defaultValue {@link LastPriceAnimationMode.Disabled}
     */
    lastPriceAnimation: LastPriceAnimationMode;
}
/**
 * Represents style options for an area series.
 */
export interface AreaStyleOptions {
    /**
     * Color of the top part of the area.
     *
     * @defaultValue `'rgba( 46, 220, 135, 0.4)'`
     */
    topColor: string;
    /**
     * Color of the bottom part of the area.
     *
     * @defaultValue `'rgba( 40, 221, 100, 0)'`
     */
    bottomColor: string;
    /**
     * Line color.
     *
     * @defaultValue `'#33D778'`
     */
    lineColor: string;
    /**
     * Line style.
     *
     * @defaultValue {@link LineStyle.Solid}
     */
    lineStyle: LineStyle;
    /**
     * Line width in pixels.
     *
     * @defaultValue `3`
     */
    lineWidth: LineWidth;
    /**
     * Line type.
     *
     * @defaultValue {@link LineType.Simple}
     */
    lineType: LineType;
    /**
     * Show the crosshair marker.
     *
     * @defaultValue `true`
     */
    crosshairMarkerVisible: boolean;
    /**
     * Crosshair marker radius in pixels.
     *
     * @defaultValue `4`
     */
    crosshairMarkerRadius: number;
    /**
     * Crosshair marker border color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBorderColor: string;
    /**
     * The crosshair marker background color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBackgroundColor: string;
    /**
     * Last price animation mode.
     *
     * @defaultValue {@link LastPriceAnimationMode.Disabled}
     */
    lastPriceAnimation: LastPriceAnimationMode;
}
/**
 * Represents a type of priced base value of baseline series type.
 */
export interface BaseValuePrice {
    /**
     * Distinguished type value.
     */
    type: 'price';
    /**
     * Price value.
     */
    price: number;
}
/**
 * Represents a type of a base value of baseline series type.
 */
export declare type BaseValueType = BaseValuePrice;
/**
 * Represents style options for a baseline series.
 */
export interface BaselineStyleOptions {
    /**
     * Base value of the series.
     *
     * @defaultValue `{ type: 'price', price: 0 }`
     */
    baseValue: BaseValueType;
    /**
     * The first color of the top area.
     *
     * @defaultValue `'rgba(38, 166, 154, 0.28)'`
     */
    topFillColor1: string;
    /**
     * The second color of the top area.
     *
     * @defaultValue `'rgba(38, 166, 154, 0.05)'`
     */
    topFillColor2: string;
    /**
     * The line color of the top area.
     *
     * @defaultValue `'rgba(38, 166, 154, 1)'`
     */
    topLineColor: string;
    /**
     * The first color of the bottom area.
     *
     * @defaultValue `'rgba(239, 83, 80, 0.05)'`
     */
    bottomFillColor1: string;
    /**
     * The second color of the bottom area.
     *
     * @defaultValue `'rgba(239, 83, 80, 0.28)'`
     */
    bottomFillColor2: string;
    /**
     * The line color of the bottom area.
     *
     * @defaultValue `'rgba(239, 83, 80, 1)'`
     */
    bottomLineColor: string;
    /**
     * Line width.
     *
     * @defaultValue `3`
     */
    lineWidth: LineWidth;
    /**
     * Line style.
     *
     * @defaultValue {@link LineStyle.Solid}
     */
    lineStyle: LineStyle;
    /**
     * Line type.
     *
     * @defaultValue {@link LineType.Simple}
     */
    lineType: LineType;
    /**
     * Show the crosshair marker.
     *
     * @defaultValue `true`
     */
    crosshairMarkerVisible: boolean;
    /**
     * Crosshair marker radius in pixels.
     *
     * @defaultValue `4`
     */
    crosshairMarkerRadius: number;
    /**
     * Crosshair marker border color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBorderColor: string;
    /**
     * The crosshair marker background color. An empty string falls back to the the color of the series under the crosshair.
     *
     * @defaultValue `''`
     */
    crosshairMarkerBackgroundColor: string;
    /**
     * Last price animation mode.
     *
     * @defaultValue {@link LastPriceAnimationMode.Disabled}
     */
    lastPriceAnimation: LastPriceAnimationMode;
}
/**
 * Represents style options for a histogram series.
 */
export interface HistogramStyleOptions {
    /**
     * Column color.
     *
     * @defaultValue `'#26a69a'`
     */
    color: string;
    /**
     * Initial level of histogram columns.
     *
     * @defaultValue `0`
     */
    base: number;
}
/**
 * Represents series value formatting options.
 * The precision and minMove properties allow wide customization of formatting.
 *
 * @example
 * `minMove=0.01`, `precision` is not specified - prices will change like 1.13, 1.14, 1.15 etc.
 * @example
 * `minMove=0.01`, `precision=3` - prices will change like 1.130, 1.140, 1.150 etc.
 * @example
 * `minMove=0.05`, `precision` is not specified - prices will change like 1.10, 1.15, 1.20 etc.
 */
export interface PriceFormatBuiltIn {
    /**
     * Built-in price formats:
     * - `'price'` is the most common choice; it allows customization of precision and rounding of prices.
     * - `'volume'` uses abbreviation for formatting prices like `1.2K` or `12.67M`.
     * - `'percent'` uses `%` sign at the end of prices.
     */
    type: 'price' | 'volume' | 'percent';
    /**
     * Number of digits after the decimal point.
     * If it is not set, then its value is calculated automatically based on minMove.
     *
     * @defaultValue `2` if both {@link minMove} and {@link precision} are not provided, calculated automatically based on {@link minMove} otherwise.
     */
    precision: number;
    /**
     * The minimum possible step size for price value movement. This value shouldn't have more decimal digits than the precision.
     *
     * @defaultValue `0.01`
     */
    minMove: number;
}
/**
 * Represents series value formatting options.
 */
export interface PriceFormatCustom {
    /**
     * The custom price format.
     */
    type: 'custom';
    /**
     * Override price formatting behaviour. Can be used for cases that can't be covered with built-in price formats.
     */
    formatter: PriceFormatterFn;
    /**
     * The minimum possible step size for price value movement.
     *
     * @defaultValue `0.01`
     */
    minMove: number;
}
/**
 * Represents information used to format prices.
 */
export declare type PriceFormat = PriceFormatBuiltIn | PriceFormatCustom;
export declare function precisionByMinMove(minMove: number): number;
export declare const enum PriceAxisLastValueMode {
    LastPriceAndPercentageValue = 0,
    LastValueAccordingToScale = 1
}
/**
 * Represents the source of data to be used for the horizontal price line.
 */
export declare const enum PriceLineSource {
    /**
     * Use the last bar data.
     */
    LastBar = 0,
    /**
     * Use the last visible data of the chart viewport.
     */
    LastVisible = 1
}
/**
 * Represents a price range.
 */
export interface PriceRange {
    /**
     * Maximum value in the range.
     */
    minValue: number;
    /**
     * Minimum value in the range.
     */
    maxValue: number;
}
/**
 * Represents information used to update a price scale.
 */
export interface AutoscaleInfo {
    /**
     * Price range.
     */
    priceRange: PriceRange;
    /**
     * Scale margins.
     */
    margins?: AutoScaleMargins;
}
/**
 * A custom function used to get autoscale information.
 *
 * @param baseImplementation - The default implementation of autoscale algorithm, you can use it to adjust the result.
 */
declare type AutoscaleInfoProvider = (baseImplementation: () => AutoscaleInfo | null) => AutoscaleInfo | null;
/**
 * Represents options common for all types of series
 */
export interface SeriesOptionsCommon {
    /**
     * Visibility of the label with the latest visible price on the price scale.
     *
     * @defaultValue `true`
     */
    lastValueVisible: boolean;
    /**
     * You can name series when adding it to a chart. This name will be displayed on the label next to the last value label.
     *
     * @defaultValue `''`
     */
    title: string;
    /**
     * Target price scale to bind new series to.
     *
     * @defaultValue `'right'` if right scale is visible and `'left'` otherwise
     */
    priceScaleId?: string;
    /**
     * Visibility of the series.
     * If the series is hidden, everything including price lines, baseline, price labels and markers, will also be hidden.
     * Please note that hiding a series is not equivalent to deleting it, since hiding does not affect the timeline at all, unlike deleting where the timeline can be changed (some points can be deleted).
     *
     * @defaultValue `true`
     */
    visible: boolean;
    /**
     * Show the price line. Price line is a horizontal line indicating the last price of the series.
     *
     * @defaultValue `true`
     */
    priceLineVisible: boolean;
    /**
     * The source to use for the value of the price line.
     *
     * @defaultValue {@link PriceLineSource.LastBar}
     */
    priceLineSource: PriceLineSource;
    /**
     * Width of the price line.
     *
     * @defaultValue `1`
     */
    priceLineWidth: LineWidth;
    /**
     * Color of the price line.
     * By default, its color is set by the last bar color (or by line color on Line and Area charts).
     *
     * @defaultValue `''`
     */
    priceLineColor: string;
    /**
     * Price line style.
     *
     * @defaultValue {@link LineStyle.Dashed}
     */
    priceLineStyle: LineStyle;
    /**
     * Price format.
     *
     * @defaultValue `{ type: 'price', precision: 2, minMove: 0.01 }`
     */
    priceFormat: PriceFormat;
    /**
     * Visibility of base line. Suitable for percentage and `IndexedTo100` scales.
     *
     * @defaultValue `true`
     */
    baseLineVisible: boolean;
    /**
     * Color of the base line in `IndexedTo100` mode.
     *
     * @defaultValue `'#B2B5BE'`
     */
    baseLineColor: string;
    /**
     * Base line width. Suitable for percentage and `IndexedTo10` scales.
     *
     * @defaultValue `1`
     */
    baseLineWidth: LineWidth;
    /**
     * Base line style. Suitable for percentage and indexedTo100 scales.
     *
     * @defaultValue {@link LineStyle.Solid}
     */
    baseLineStyle: LineStyle;
    /**
     * Override the default {@link AutoscaleInfo} provider.
     * By default, the chart scales data automatically based on visible data range.
     * However, for some reasons one could require overriding this behavior.
     *
     * @defaultValue `undefined`
     * @example Use price range from 0 to 100 regardless the current visible range
     * ```js
     * const firstSeries = chart.addLineSeries({
     *     autoscaleInfoProvider: () => ({
     *         priceRange: {
     *             minValue: 0,
     *             maxValue: 100,
     *         },
     *     }),
     * });
     * ```
     * @example Adding a small pixel margins to the price range
     * ```js
     * const firstSeries = chart.addLineSeries({
     *     autoscaleInfoProvider: () => ({
     *         priceRange: {
     *             minValue: 0,
     *             maxValue: 100,
     *         },
     *         margins: {
     *             above: 10,
     *             below: 10,
     *         },
     *     }),
     * });
     * ```
     * @example Using the default implementation to adjust the result
     * ```js
     * const firstSeries = chart.addLineSeries({
     *     autoscaleInfoProvider: original => {
     *         const res = original();
     *         if (res !== null) {
     *             res.priceRange.minValue -= 10;
     *             res.priceRange.maxValue += 10;
     *         }
     *         return res;
     *     },
     * });
     * ```
     */
    autoscaleInfoProvider?: AutoscaleInfoProvider;
    /** Panel this series to be added */
    pane?: number;
}
/**
 * Represents the intersection of a series type `T`'s options and common series options.
 *
 * @see {@link SeriesOptionsCommon} for common options.
 */
export declare type SeriesOptions<T> = T & SeriesOptionsCommon;
/**
 * Represents a {@link SeriesOptions} where every property is optional.
 */
export declare type SeriesPartialOptions<T> = DeepPartial<T & SeriesOptionsCommon>;
/**
 * Represents area series options.
 */
export declare type AreaSeriesOptions = SeriesOptions<AreaStyleOptions>;
/**
 * Represents area series options where all properties are optional.
 */
export declare type AreaSeriesPartialOptions = SeriesPartialOptions<AreaStyleOptions>;
/**
 * Structure describing baseline series options.
 */
export declare type BaselineSeriesOptions = SeriesOptions<BaselineStyleOptions>;
/**
 * Represents baseline series options where all properties are options.
 */
export declare type BaselineSeriesPartialOptions = SeriesPartialOptions<BaselineStyleOptions>;
/**
 * Represents bar series options.
 */
export declare type BarSeriesOptions = SeriesOptions<BarStyleOptions>;
/**
 * Represents bar series options where all properties are options.
 */
export declare type BarSeriesPartialOptions = SeriesPartialOptions<BarStyleOptions>;
/**
 * Represents candlestick series options.
 */
export declare type CandlestickSeriesOptions = SeriesOptions<CandlestickStyleOptions>;
/**
 * Represents candlestick series options where all properties are optional.
 */
export declare type CandlestickSeriesPartialOptions = SeriesPartialOptions<CandlestickStyleOptions>;
/**
 * Represents histogram series options.
 */
export declare type HistogramSeriesOptions = SeriesOptions<HistogramStyleOptions>;
/**
 * Represents histogram series options where all properties are optional.
 */
export declare type HistogramSeriesPartialOptions = SeriesPartialOptions<HistogramStyleOptions>;
/**
 * Represents line series options.
 */
export declare type LineSeriesOptions = SeriesOptions<LineStyleOptions>;
/**
 * Represents line series options where all properties are optional.
 */
export declare type LineSeriesPartialOptions = SeriesPartialOptions<LineStyleOptions>;
/**
 * Represents the type of options for each series type.
 *
 * For example a bar series has options represented by {@link BarSeriesOptions}.
 */
export interface SeriesOptionsMap {
    /**
     * The type of bar series options.
     */
    Bar: BarSeriesOptions;
    /**
     * The type of candlestick series options.
     */
    Candlestick: CandlestickSeriesOptions;
    /**
     * The type of area series options.
     */
    Area: AreaSeriesOptions;
    /**
     * The type of baseline series options.
     */
    Baseline: BaselineSeriesOptions;
    /**
     * The type of line series options.
     */
    Line: LineSeriesOptions;
    /**
     * The type of histogram series options.
     */
    Histogram: HistogramSeriesOptions;
}
/**
 * Represents the type of partial options for each series type.
 *
 * For example a bar series has options represented by {@link BarSeriesPartialOptions}.
 */
export interface SeriesPartialOptionsMap {
    /**
     * The type of bar series partial options.
     */
    Bar: BarSeriesPartialOptions;
    /**
     * The type of candlestick series partial options.
     */
    Candlestick: CandlestickSeriesPartialOptions;
    /**
     * The type of area series partial options.
     */
    Area: AreaSeriesPartialOptions;
    /**
     * The type of baseline series partial options.
     */
    Baseline: BaselineSeriesPartialOptions;
    /**
     * The type of line series partial options.
     */
    Line: LineSeriesPartialOptions;
    /**
     * The type of histogram series partial options.
     */
    Histogram: HistogramSeriesPartialOptions;
}
/**
 * Represents a type of series.
 *
 * @see {@link SeriesOptionsMap}
 */
export declare type SeriesType = keyof SeriesOptionsMap;
export {};
import { ensure, ensureNotNull } from '../helpers/assertions';
const emptyResult = {
    _internal_barColor: '',
    _internal_barBorderColor: '',
    _internal_barWickColor: '',
};
export class SeriesBarColorer {
    constructor(series) {
        this._private__series = series;
    }
    _internal_barStyle(barIndex, precomputedBars) {
        // precomputedBars: {value: [Array BarValues], previousValue: [Array BarValues] | undefined}
        // Used to avoid binary search if bars are already known
        const targetType = this._private__series._internal_seriesType();
        const seriesOptions = this._private__series._internal_options();
        switch (targetType) {
            case 'Line':
                return this._private__lineStyle(seriesOptions, barIndex, precomputedBars);
            case 'Area':
                return this._private__areaStyle(seriesOptions);
            case 'Baseline':
                return this._private__baselineStyle(seriesOptions, barIndex, precomputedBars);
            case 'Bar':
                return this._private__barStyle(seriesOptions, barIndex, precomputedBars);
            case 'Candlestick':
                return this._private__candleStyle(seriesOptions, barIndex, precomputedBars);
            case 'Histogram':
                return this._private__histogramStyle(seriesOptions, barIndex, precomputedBars);
        }
        throw new Error('Unknown chart style');
    }
    _private__barStyle(barStyle, barIndex, precomputedBars) {
        const result = Object.assign({}, emptyResult);
        const upColor = barStyle.upColor;
        const downColor = barStyle.downColor;
        const borderUpColor = upColor;
        const borderDownColor = downColor;
        const currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        const isUp = ensure(currentBar._internal_value[0 /* Open */]) <= ensure(currentBar._internal_value[3 /* Close */]);
        if (currentBar._internal_color !== undefined) {
            result._internal_barColor = currentBar._internal_color;
            result._internal_barBorderColor = currentBar._internal_color;
        }
        else {
            result._internal_barColor = isUp ? upColor : downColor;
            result._internal_barBorderColor = isUp ? borderUpColor : borderDownColor;
        }
        return result;
    }
    _private__candleStyle(candlestickStyle, barIndex, precomputedBars) {
        var _a, _b, _c;
        const result = Object.assign({}, emptyResult);
        const upColor = candlestickStyle.upColor;
        const downColor = candlestickStyle.downColor;
        const borderUpColor = candlestickStyle.borderUpColor;
        const borderDownColor = candlestickStyle.borderDownColor;
        const wickUpColor = candlestickStyle.wickUpColor;
        const wickDownColor = candlestickStyle.wickDownColor;
        const currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        const isUp = ensure(currentBar._internal_value[0 /* Open */]) <= ensure(currentBar._internal_value[3 /* Close */]);
        result._internal_barColor = (_a = currentBar._internal_color) !== null && _a !== void 0 ? _a : (isUp ? upColor : downColor);
        result._internal_barBorderColor = (_b = currentBar._internal_borderColor) !== null && _b !== void 0 ? _b : (isUp ? borderUpColor : borderDownColor);
        result._internal_barWickColor = (_c = currentBar._internal_wickColor) !== null && _c !== void 0 ? _c : (isUp ? wickUpColor : wickDownColor);
        return result;
    }
    _private__areaStyle(areaStyle) {
        return Object.assign(Object.assign({}, emptyResult), { _internal_barColor: areaStyle.lineColor });
    }
    _private__baselineStyle(baselineStyle, barIndex, precomputedBars) {
        const currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        const isAboveBaseline = currentBar._internal_value[3 /* Close */] >= baselineStyle.baseValue.price;
        return Object.assign(Object.assign({}, emptyResult), { _internal_barColor: isAboveBaseline ? baselineStyle.topLineColor : baselineStyle.bottomLineColor });
    }
    _private__lineStyle(lineStyle, barIndex, precomputedBars) {
        var _a;
        const currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        return Object.assign(Object.assign({}, emptyResult), { _internal_barColor: (_a = currentBar._internal_color) !== null && _a !== void 0 ? _a : lineStyle.color });
    }
    _private__histogramStyle(histogramStyle, barIndex, precomputedBars) {
        const result = Object.assign({}, emptyResult);
        const currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        result._internal_barColor = currentBar._internal_color !== undefined ? currentBar._internal_color : histogramStyle.color;
        return result;
    }
    _private__findBar(barIndex, precomputedBars) {
        if (precomputedBars !== undefined) {
            return precomputedBars._internal_value;
        }
        return this._private__series._internal_bars()._internal_valueAt(barIndex);
    }
}

import { isWhitespaceData } from './data-consumer';
function getLineBasedSeriesPlotRow(time, index, item, originalTime) {
    const val = item.value;
    return { _internal_index: index, _internal_time: time, _internal_value: [val, val, val, val], _internal_originalTime: originalTime };
}
function getColoredLineBasedSeriesPlotRow(time, index, item, originalTime) {
    const val = item.value;
    const res = { _internal_index: index, _internal_time: time, _internal_value: [val, val, val, val], _internal_originalTime: originalTime };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    return res;
}
function getBarSeriesPlotRow(time, index, item, originalTime) {
    const res = { _internal_index: index, _internal_time: time, _internal_value: [item.open, item.high, item.low, item.close], _internal_originalTime: originalTime };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    return res;
}
function getCandlestickSeriesPlotRow(time, index, item, originalTime) {
    const res = { _internal_index: index, _internal_time: time, _internal_value: [item.open, item.high, item.low, item.close], _internal_originalTime: originalTime };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    // 'borderColor' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('borderColor' in item && item.borderColor !== undefined) {
        res._internal_borderColor = item.borderColor;
    }
    // 'wickColor' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('wickColor' in item && item.wickColor !== undefined) {
        res._internal_wickColor = item.wickColor;
    }
    return res;
}
export function isSeriesPlotRow(row) {
    return row._internal_value !== undefined;
}
function wrapWhitespaceData(createPlotRowFn) {
    return (time, index, bar, originalTime) => {
        if (isWhitespaceData(bar)) {
            return { _internal_time: time, _internal_index: index, _internal_originalTime: originalTime };
        }
        return createPlotRowFn(time, index, bar, originalTime);
    };
}
const seriesPlotRowFnMap = {
    Candlestick: wrapWhitespaceData(getCandlestickSeriesPlotRow),
    Bar: wrapWhitespaceData(getBarSeriesPlotRow),
    Area: wrapWhitespaceData(getLineBasedSeriesPlotRow),
    Baseline: wrapWhitespaceData(getLineBasedSeriesPlotRow),
    Histogram: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
    Line: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
};
export function getSeriesPlotRowCreator(seriesType) {
    return seriesPlotRowFnMap[seriesType];
}

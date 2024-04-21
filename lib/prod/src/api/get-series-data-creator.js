function singleValueData(plotRow) {
    return {
        value: plotRow._internal_value[3 /* Close */],
        time: plotRow._internal_originalTime,
    };
}
function lineData(plotRow) {
    const result = singleValueData(plotRow);
    if (plotRow._internal_color !== undefined) {
        result.color = plotRow._internal_color;
    }
    return result;
}
function ohlcData(plotRow) {
    return {
        open: plotRow._internal_value[0 /* Open */],
        high: plotRow._internal_value[1 /* High */],
        low: plotRow._internal_value[2 /* Low */],
        close: plotRow._internal_value[3 /* Close */],
        time: plotRow._internal_originalTime,
    };
}
function barData(plotRow) {
    const result = ohlcData(plotRow);
    if (plotRow._internal_color !== undefined) {
        result.color = plotRow._internal_color;
    }
    return result;
}
function candlestickData(plotRow) {
    const result = ohlcData(plotRow);
    const { _internal_color: color, _internal_borderColor: borderColor, _internal_wickColor: wickColor } = plotRow;
    if (color !== undefined) {
        result.color = color;
    }
    if (borderColor !== undefined) {
        result.borderColor = borderColor;
    }
    if (wickColor !== undefined) {
        result.wickColor = wickColor;
    }
    return result;
}
const seriesPlotRowToDataMap = {
    Area: singleValueData,
    Line: lineData,
    Baseline: singleValueData,
    Histogram: lineData,
    Bar: barData,
    Candlestick: candlestickData,
};
export function getSeriesDataCreator(seriesType) {
    return seriesPlotRowToDataMap[seriesType];
}

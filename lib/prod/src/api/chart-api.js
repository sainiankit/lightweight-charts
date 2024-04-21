import { ChartWidget } from '../gui/chart-widget';
import { assert, ensureDefined } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone, isBoolean, merge } from '../helpers/strict-type-checks';
import { fillUpDownCandlesticksColors, precisionByMinMove, } from '../model/series-options';
import { CandlestickSeriesApi } from './candlestick-series-api';
import { isFulfilledData } from './data-consumer';
import { DataLayer } from './data-layer';
import { getSeriesDataCreator } from './get-series-data-creator';
import { chartOptionsDefaults } from './options/chart-options-defaults';
import { areaStyleDefaults, barStyleDefaults, baselineStyleDefaults, candlestickStyleDefaults, histogramStyleDefaults, lineStyleDefaults, seriesOptionsDefaults, } from './options/series-options-defaults';
import { PriceScaleApi } from './price-scale-api';
import { SeriesApi } from './series-api';
import { TimeScaleApi } from './time-scale-api';
function patchPriceFormat(priceFormat) {
    if (priceFormat === undefined || priceFormat.type === 'custom') {
        return;
    }
    const priceFormatBuiltIn = priceFormat;
    if (priceFormatBuiltIn.minMove !== undefined && priceFormatBuiltIn.precision === undefined) {
        priceFormatBuiltIn.precision = precisionByMinMove(priceFormatBuiltIn.minMove);
    }
}
function migrateHandleScaleScrollOptions(options) {
    if (isBoolean(options.handleScale)) {
        const handleScale = options.handleScale;
        options.handleScale = {
            axisDoubleClickReset: handleScale,
            axisPressedMouseMove: {
                time: handleScale,
                price: handleScale,
            },
            mouseWheel: handleScale,
            pinch: handleScale,
        };
    }
    else if (options.handleScale !== undefined && isBoolean(options.handleScale.axisPressedMouseMove)) {
        const axisPressedMouseMove = options.handleScale.axisPressedMouseMove;
        options.handleScale.axisPressedMouseMove = {
            time: axisPressedMouseMove,
            price: axisPressedMouseMove,
        };
    }
    const handleScroll = options.handleScroll;
    if (isBoolean(handleScroll)) {
        options.handleScroll = {
            horzTouchDrag: handleScroll,
            vertTouchDrag: handleScroll,
            mouseWheel: handleScroll,
            pressedMouseMove: handleScroll,
        };
    }
}
function toInternalOptions(options) {
    migrateHandleScaleScrollOptions(options);
    return options;
}
export class ChartApi {
    constructor(container, options) {
        this._private__dataLayer = new DataLayer();
        this._private__seriesMap = new Map();
        this._private__seriesMapReversed = new Map();
        this._private__clickedDelegate = new Delegate();
        this._private__crosshairMovedDelegate = new Delegate();
        const internalOptions = (options === undefined) ?
            clone(chartOptionsDefaults) :
            merge(clone(chartOptionsDefaults), toInternalOptions(options));
        this._private__chartWidget = new ChartWidget(container, internalOptions);
        this._private__chartWidget._internal_clicked()._internal_subscribe((paramSupplier) => {
            if (this._private__clickedDelegate._internal_hasListeners()) {
                this._private__clickedDelegate._internal_fire(this._private__convertMouseParams(paramSupplier()));
            }
        }, this);
        this._private__chartWidget._internal_crosshairMoved()._internal_subscribe((paramSupplier) => {
            if (this._private__crosshairMovedDelegate._internal_hasListeners()) {
                this._private__crosshairMovedDelegate._internal_fire(this._private__convertMouseParams(paramSupplier()));
            }
        }, this);
        const model = this._private__chartWidget._internal_model();
        this._private__timeScaleApi = new TimeScaleApi(model, this._private__chartWidget._internal_timeAxisWidget());
    }
    remove() {
        this._private__chartWidget._internal_clicked()._internal_unsubscribeAll(this);
        this._private__chartWidget._internal_crosshairMoved()._internal_unsubscribeAll(this);
        this._private__timeScaleApi._internal_destroy();
        this._private__chartWidget._internal_destroy();
        this._private__seriesMap.clear();
        this._private__seriesMapReversed.clear();
        this._private__clickedDelegate._internal_destroy();
        this._private__crosshairMovedDelegate._internal_destroy();
        this._private__dataLayer._internal_destroy();
    }
    resize(width, height, forceRepaint) {
        this._private__chartWidget._internal_resize(width, height, forceRepaint);
    }
    addAreaSeries(options = {}) {
        patchPriceFormat(options.priceFormat);
        const strictOptions = merge(clone(seriesOptionsDefaults), areaStyleDefaults, options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Area', strictOptions);
        const res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    addBaselineSeries(options = {}) {
        patchPriceFormat(options.priceFormat);
        // to avoid assigning fields to defaults we have to clone them
        const strictOptions = merge(clone(seriesOptionsDefaults), clone(baselineStyleDefaults), options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Baseline', strictOptions);
        const res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    addBarSeries(options = {}) {
        patchPriceFormat(options.priceFormat);
        const strictOptions = merge(clone(seriesOptionsDefaults), barStyleDefaults, options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Bar', strictOptions);
        const res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    addCandlestickSeries(options = {}) {
        fillUpDownCandlesticksColors(options);
        patchPriceFormat(options.priceFormat);
        const strictOptions = merge(clone(seriesOptionsDefaults), candlestickStyleDefaults, options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Candlestick', strictOptions);
        const res = new CandlestickSeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    addHistogramSeries(options = {}) {
        patchPriceFormat(options.priceFormat);
        const strictOptions = merge(clone(seriesOptionsDefaults), histogramStyleDefaults, options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Histogram', strictOptions);
        const res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    addLineSeries(options = {}) {
        patchPriceFormat(options.priceFormat);
        const strictOptions = merge(clone(seriesOptionsDefaults), lineStyleDefaults, options);
        const series = this._private__chartWidget._internal_model()._internal_createSeries('Line', strictOptions);
        const res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    }
    removeSeries(seriesApi) {
        const series = ensureDefined(this._private__seriesMap.get(seriesApi));
        const update = this._private__dataLayer._internal_removeSeries(series);
        const model = this._private__chartWidget._internal_model();
        model._internal_removeSeries(series);
        this._private__sendUpdateToChart(update);
        this._private__seriesMap.delete(seriesApi);
        this._private__seriesMapReversed.delete(series);
    }
    _internal_applyNewData(series, data) {
        this._private__sendUpdateToChart(this._private__dataLayer._internal_setSeriesData(series, data));
    }
    _internal_updateData(series, data) {
        this._private__sendUpdateToChart(this._private__dataLayer._internal_updateSeriesData(series, data));
    }
    subscribeClick(handler) {
        this._private__clickedDelegate._internal_subscribe(handler);
    }
    unsubscribeClick(handler) {
        this._private__clickedDelegate._internal_unsubscribe(handler);
    }
    subscribeCrosshairMove(handler) {
        this._private__crosshairMovedDelegate._internal_subscribe(handler);
    }
    unsubscribeCrosshairMove(handler) {
        this._private__crosshairMovedDelegate._internal_unsubscribe(handler);
    }
    priceScale(priceScaleId) {
        return new PriceScaleApi(this._private__chartWidget, priceScaleId);
    }
    timeScale() {
        return this._private__timeScaleApi;
    }
    applyOptions(options) {
        this._private__chartWidget._internal_applyOptions(toInternalOptions(options));
    }
    options() {
        return this._private__chartWidget._internal_options();
    }
    takeScreenshot() {
        return this._private__chartWidget._internal_takeScreenshot();
    }
    removePane(index) {
        this._private__chartWidget._internal_model()._internal_removePane(index);
    }
    swapPane(first, second) {
        this._private__chartWidget._internal_model()._internal_swapPane(first, second);
    }
    getPaneElements() {
        return this._private__chartWidget._internal_paneWidgets().map((paneWidget) => paneWidget._internal_getPaneCell());
    }
    _private__sendUpdateToChart(update) {
        const model = this._private__chartWidget._internal_model();
        model._internal_updateTimeScale(update._internal_timeScale._internal_baseIndex, update._internal_timeScale._internal_points, update._internal_timeScale._internal_firstChangedPointIndex);
        update._internal_series.forEach((value, series) => series._internal_setData(value._internal_data, value._internal_info));
        model._internal_recalculateAllPanes();
    }
    _private__mapSeriesToApi(series) {
        return ensureDefined(this._private__seriesMapReversed.get(series));
    }
    _private__convertMouseParams(param) {
        const seriesData = new Map();
        param._internal_seriesData.forEach((plotRow, series) => {
            const data = getSeriesDataCreator(series._internal_seriesType())(plotRow);
            assert(isFulfilledData(data));
            seriesData.set(this._private__mapSeriesToApi(series), data);
        });
        const hoveredSeries = param._internal_hoveredSeries === undefined ? undefined : this._private__mapSeriesToApi(param._internal_hoveredSeries);
        return {
            time: param._internal_time,
            logical: param._internal_index,
            point: param._internal_point,
            paneIndex: param._internal_paneIndex,
            hoveredSeries,
            hoveredMarkerId: param._internal_hoveredObject,
            seriesData,
        };
    }
}

import { __rest } from "tslib";
import { ensureNotNull } from '../helpers/assertions';
import { clone, merge } from '../helpers/strict-type-checks';
import { RangeImpl } from '../model/range-impl';
import { TimeScaleVisibleRange } from '../model/time-scale-visible-range';
import { convertTime } from './data-layer';
import { checkItemsAreOrdered, checkPriceLineOptions, checkSeriesValuesType } from './data-validators';
import { getSeriesDataCreator } from './get-series-data-creator';
import { priceLineOptionsDefaults } from './options/price-line-options-defaults';
import { PriceLine } from './price-line-api';
export class SeriesApi {
    constructor(series, dataUpdatesConsumer, priceScaleApiProvider) {
        this._internal__series = series;
        this._internal__dataUpdatesConsumer = dataUpdatesConsumer;
        this._private__priceScaleApiProvider = priceScaleApiProvider;
    }
    priceFormatter() {
        return this._internal__series._internal_formatter();
    }
    priceToCoordinate(price) {
        const firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._internal__series._internal_priceScale()._internal_priceToCoordinate(price, firstValue._internal_value);
    }
    coordinateToPrice(coordinate) {
        const firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        return this._internal__series._internal_priceScale()._internal_coordinateToPrice(coordinate, firstValue._internal_value);
    }
    // eslint-disable-next-line complexity
    barsInLogicalRange(range) {
        if (range === null) {
            return null;
        }
        // we use TimeScaleVisibleRange here to convert LogicalRange to strict range properly
        const correctedRange = new TimeScaleVisibleRange(new RangeImpl(range.from, range.to))._internal_strictRange();
        const bars = this._internal__series._internal_bars();
        if (bars._internal_isEmpty()) {
            return null;
        }
        const dataFirstBarInRange = bars._internal_search(correctedRange._internal_left(), 1 /* NearestRight */);
        const dataLastBarInRange = bars._internal_search(correctedRange._internal_right(), -1 /* NearestLeft */);
        const dataFirstIndex = ensureNotNull(bars._internal_firstIndex());
        const dataLastIndex = ensureNotNull(bars._internal_lastIndex());
        // this means that we request data in the data gap
        // e.g. let's say we have series with data [0..10, 30..60]
        // and we request bars info in range [15, 25]
        // thus, dataFirstBarInRange will be with index 30 and dataLastBarInRange with 10
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null && dataFirstBarInRange._internal_index > dataLastBarInRange._internal_index) {
            return {
                barsBefore: range.from - dataFirstIndex,
                barsAfter: dataLastIndex - range.to,
            };
        }
        const barsBefore = (dataFirstBarInRange === null || dataFirstBarInRange._internal_index === dataFirstIndex)
            ? range.from - dataFirstIndex
            : dataFirstBarInRange._internal_index - dataFirstIndex;
        const barsAfter = (dataLastBarInRange === null || dataLastBarInRange._internal_index === dataLastIndex)
            ? dataLastIndex - range.to
            : dataLastIndex - dataLastBarInRange._internal_index;
        const result = { barsBefore, barsAfter };
        // actually they can't exist separately
        if (dataFirstBarInRange !== null && dataLastBarInRange !== null) {
            result.from = dataFirstBarInRange._internal_time._internal_businessDay || dataFirstBarInRange._internal_time._internal_timestamp;
            result.to = dataLastBarInRange._internal_time._internal_businessDay || dataLastBarInRange._internal_time._internal_timestamp;
        }
        return result;
    }
    setData(data) {
        checkItemsAreOrdered(data);
        checkSeriesValuesType(this._internal__series._internal_seriesType(), data);
        this._internal__dataUpdatesConsumer._internal_applyNewData(this._internal__series, data);
    }
    update(bar) {
        checkSeriesValuesType(this._internal__series._internal_seriesType(), [bar]);
        this._internal__dataUpdatesConsumer._internal_updateData(this._internal__series, bar);
    }
    dataByIndex(logicalIndex, mismatchDirection) {
        const data = this._internal__series._internal_bars()._internal_search(logicalIndex, mismatchDirection);
        if (data === null) {
            // actually it can be a whitespace
            return null;
        }
        return getSeriesDataCreator(this.seriesType())(data);
    }
    setMarkers(data) {
        checkItemsAreOrdered(data, true);
        const convertedMarkers = data.map((marker) => (Object.assign(Object.assign({}, marker), { originalTime: marker.time, time: convertTime(marker.time) })));
        this._internal__series._internal_setMarkers(convertedMarkers);
    }
    markers() {
        return this._internal__series._internal_markers().map((internalItem) => {
            const { originalTime, time } = internalItem, item = __rest(internalItem, ["originalTime", "time"]);
            return Object.assign({ time: originalTime }, item);
        });
    }
    applyOptions(options) {
        this._internal__series._internal_applyOptions(options);
    }
    options() {
        return clone(this._internal__series._internal_options());
    }
    priceScale() {
        return this._private__priceScaleApiProvider.priceScale(this._internal__series._internal_priceScale()._internal_id());
    }
    createPriceLine(options) {
        checkPriceLineOptions(options);
        const strictOptions = merge(clone(priceLineOptionsDefaults), options);
        const priceLine = this._internal__series._internal_createPriceLine(strictOptions);
        return new PriceLine(priceLine);
    }
    removePriceLine(line) {
        this._internal__series._internal_removePriceLine(line._internal_priceLine());
    }
    seriesType() {
        return this._internal__series._internal_seriesType();
    }
}

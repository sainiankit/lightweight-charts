import { ensureNotNull } from '../../helpers/assertions';
import { visibleTimedValues } from '../../model/time-data';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererHistogram } from '../../renderers/histogram-renderer';
import { SeriesPaneViewBase } from './series-pane-view-base';
function createEmptyHistogramData(barSpacing) {
    return {
        _internal_items: [],
        _internal_barSpacing: barSpacing,
        _internal_histogramBase: NaN,
        _internal_visibleRange: null,
    };
}
function createRawItem(time, price, color) {
    return {
        _internal_time: time,
        _internal_price: price,
        _internal_x: NaN,
        _internal_y: NaN,
        _internal_color: color,
    };
}
export class SeriesHistogramPaneView extends SeriesPaneViewBase {
    constructor(series, model) {
        super(series, model, false);
        this._private__compositeRenderer = new CompositeRenderer();
        this._private__histogramData = createEmptyHistogramData(0);
        this._private__renderer = new PaneRendererHistogram();
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        this._internal__makeValid();
        return this._private__compositeRenderer;
    }
    _internal__fillRawPoints() {
        const barSpacing = this._internal__model._internal_timeScale()._internal_barSpacing();
        this._private__histogramData = createEmptyHistogramData(barSpacing);
        let targetIndex = 0;
        let itemIndex = 0;
        const defaultColor = this._internal__series._internal_options().color;
        for (const row of this._internal__series._internal_bars()._internal_rows()) {
            const value = row._internal_value[3 /* Close */];
            const color = row._internal_color !== undefined ? row._internal_color : defaultColor;
            const item = createRawItem(row._internal_index, value, color);
            targetIndex++;
            if (targetIndex < this._private__histogramData._internal_items.length) {
                this._private__histogramData._internal_items[targetIndex] = item;
            }
            else {
                this._private__histogramData._internal_items.push(item);
            }
            this._internal__items[itemIndex++] = { _internal_time: row._internal_index, _internal_x: 0 };
        }
        this._private__renderer._internal_setData(this._private__histogramData);
        this._private__compositeRenderer._internal_setRenderers([this._private__renderer]);
    }
    _internal__updateOptions() { }
    _internal__clearVisibleRange() {
        super._internal__clearVisibleRange();
        this._private__histogramData._internal_visibleRange = null;
    }
    _internal__convertToCoordinates(priceScale, timeScale, firstValue) {
        if (this._internal__itemsVisibleRange === null) {
            return;
        }
        const barSpacing = timeScale._internal_barSpacing();
        const visibleBars = ensureNotNull(timeScale._internal_visibleStrictRange());
        const histogramBase = priceScale._internal_priceToCoordinate(this._internal__series._internal_options().base, firstValue);
        timeScale._internal_indexesToCoordinates(this._private__histogramData._internal_items);
        priceScale._internal_pointsArrayToCoordinates(this._private__histogramData._internal_items, firstValue);
        this._private__histogramData._internal_histogramBase = histogramBase;
        this._private__histogramData._internal_visibleRange = visibleTimedValues(this._private__histogramData._internal_items, visibleBars, false);
        this._private__histogramData._internal_barSpacing = barSpacing;
        // need this to update cache
        this._private__renderer._internal_setData(this._private__histogramData);
    }
}

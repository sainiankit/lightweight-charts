import { ensureNotNull } from '../../helpers/assertions';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererMarks } from '../../renderers/marks-renderer';
function createEmptyMarkerData() {
    return {
        _internal_items: [{
                _internal_x: 0,
                _internal_y: 0,
                _internal_time: 0,
                _internal_price: 0,
            }],
        _internal_lineColor: '',
        _internal_backColor: '',
        _internal_radius: 0,
        _internal_visibleRange: null,
    };
}
const rangeForSinglePoint = { from: 0, to: 1 };
export class CrosshairMarksPaneView {
    constructor(chartModel, crosshair) {
        this._private__compositeRenderer = new CompositeRenderer();
        this._private__markersRenderers = [];
        this._private__markersData = [];
        this._private__validated = new Map();
        this._private__chartModel = chartModel;
        this._private__crosshair = crosshair;
        this._private__compositeRenderer._internal_setRenderers(this._private__markersRenderers);
    }
    _internal_update(updateType) {
        const serieses = this._private__chartModel._internal_serieses();
        if (serieses.length !== this._private__markersRenderers.length) {
            this._private__markersData = serieses.map(createEmptyMarkerData);
            this._private__markersRenderers = this._private__markersData.map((data) => {
                const res = new PaneRendererMarks();
                res._internal_setData(data);
                return res;
            });
            this._private__compositeRenderer._internal_setRenderers(this._private__markersRenderers);
        }
        this._private__validated.clear();
    }
    _internal_renderer(height, width, pane, addAnchors) {
        let renderers = this._private__validated.get(pane);
        if (!renderers) {
            renderers = this._private__updateImpl(pane, height);
            this._private__validated.set(pane, renderers);
            const compositeRenderer = new CompositeRenderer();
            compositeRenderer._internal_setRenderers(renderers);
            return compositeRenderer;
        }
        const compositeRenderer = new CompositeRenderer();
        compositeRenderer._internal_setRenderers(renderers);
        return compositeRenderer;
        // return this._compositeRenderer;
    }
    _private__updateImpl(pane, height) {
        const serieses = this._private__chartModel._internal_serieses()
            .map((datasource, index) => [datasource, index])
            .filter((entry) => pane._internal_dataSources().includes(entry[0]));
        const timePointIndex = this._private__crosshair._internal_appliedIndex();
        const timeScale = this._private__chartModel._internal_timeScale();
        return serieses.map(([s, index]) => {
            var _a;
            const data = this._private__markersData[index];
            const seriesData = s._internal_markerDataAtIndex(timePointIndex);
            if (seriesData === null || !s._internal_visible()) {
                data._internal_visibleRange = null;
            }
            else {
                const firstValue = ensureNotNull(s._internal_firstValue());
                data._internal_lineColor = seriesData._internal_backgroundColor;
                data._internal_radius = seriesData._internal_radius;
                data._internal_items[0]._internal_price = seriesData._internal_price;
                data._internal_items[0]._internal_y = s._internal_priceScale()._internal_priceToCoordinate(seriesData._internal_price, firstValue._internal_value);
                data._internal_backColor = (_a = seriesData._internal_borderColor) !== null && _a !== void 0 ? _a : this._private__chartModel._internal_backgroundColorAtYPercentFromTop(data._internal_items[0]._internal_y / height);
                data._internal_items[0]._internal_time = timePointIndex;
                data._internal_items[0]._internal_x = timeScale._internal_indexToCoordinate(timePointIndex);
                data._internal_visibleRange = rangeForSinglePoint;
            }
            return this._private__markersRenderers[index];
        });
    }
}

import { PaneRendererBaselineArea, PaneRendererBaselineLine } from '../../renderers/baseline-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export class SeriesBaselinePaneView extends LinePaneViewBase {
    constructor(series, model) {
        super(series, model);
        this._private__baselineAreaRenderer = new PaneRendererBaselineArea();
        this._private__baselineLineRenderer = new PaneRendererBaselineLine();
        this._private__compositeRenderer = new CompositeRenderer();
        this._private__compositeRenderer._internal_setRenderers([this._private__baselineAreaRenderer, this._private__baselineLineRenderer]);
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        const firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        const baselineProps = this._internal__series._internal_options();
        this._internal__makeValid();
        const baseLevelCoordinate = this._internal__series._internal_priceScale()._internal_priceToCoordinate(baselineProps.baseValue.price, firstValue._internal_value);
        const barWidth = this._internal__model._internal_timeScale()._internal_barSpacing();
        this._private__baselineAreaRenderer._internal_setData({
            _internal_items: this._internal__items,
            _internal_topFillColor1: baselineProps.topFillColor1,
            _internal_topFillColor2: baselineProps.topFillColor2,
            _internal_bottomFillColor1: baselineProps.bottomFillColor1,
            _internal_bottomFillColor2: baselineProps.bottomFillColor2,
            _internal_lineWidth: baselineProps.lineWidth,
            _internal_lineStyle: baselineProps.lineStyle,
            _internal_lineType: baselineProps.lineType,
            _internal_baseLevelCoordinate: baseLevelCoordinate,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: barWidth,
        });
        this._private__baselineLineRenderer._internal_setData({
            _internal_items: this._internal__items,
            _internal_topColor: baselineProps.topLineColor,
            _internal_bottomColor: baselineProps.bottomLineColor,
            _internal_lineWidth: baselineProps.lineWidth,
            _internal_lineStyle: baselineProps.lineStyle,
            _internal_lineType: baselineProps.lineType,
            _internal_baseLevelCoordinate: baseLevelCoordinate,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: barWidth,
        });
        return this._private__compositeRenderer;
    }
    _internal__createRawItem(time, price) {
        return this._internal__createRawItemBase(time, price);
    }
}

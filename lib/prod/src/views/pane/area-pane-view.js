import { PaneRendererArea } from '../../renderers/area-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererLine } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export class SeriesAreaPaneView extends LinePaneViewBase {
    constructor(series, model) {
        super(series, model);
        this._private__renderer = new CompositeRenderer();
        this._private__areaRenderer = new PaneRendererArea();
        this._private__lineRenderer = new PaneRendererLine();
        this._private__renderer._internal_setRenderers([this._private__areaRenderer, this._private__lineRenderer]);
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        const areaStyleProperties = this._internal__series._internal_options();
        this._internal__makeValid();
        this._private__areaRenderer._internal_setData({
            _internal_lineType: areaStyleProperties.lineType,
            _internal_items: this._internal__items,
            _internal_lineStyle: areaStyleProperties.lineStyle,
            _internal_lineWidth: areaStyleProperties.lineWidth,
            _internal_topColor: areaStyleProperties.topColor,
            _internal_bottomColor: areaStyleProperties.bottomColor,
            _internal_baseLevelCoordinate: height,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        });
        this._private__lineRenderer._internal_setData({
            _internal_lineType: areaStyleProperties.lineType,
            _internal_items: this._internal__items,
            _internal_lineColor: areaStyleProperties.lineColor,
            _internal_lineStyle: areaStyleProperties.lineStyle,
            _internal_lineWidth: areaStyleProperties.lineWidth,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        });
        return this._private__renderer;
    }
    _internal__createRawItem(time, price) {
        return this._internal__createRawItemBase(time, price);
    }
}

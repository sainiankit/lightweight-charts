import { PaneRendererLine } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export class SeriesLinePaneView extends LinePaneViewBase {
    // eslint-disable-next-line no-useless-constructor
    constructor(series, model) {
        super(series, model);
        this._private__lineRenderer = new PaneRendererLine();
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        const lineStyleProps = this._internal__series._internal_options();
        this._internal__makeValid();
        const data = {
            _internal_items: this._internal__items,
            _internal_lineColor: lineStyleProps.color,
            _internal_lineStyle: lineStyleProps.lineStyle,
            _internal_lineType: lineStyleProps.lineType,
            _internal_lineWidth: lineStyleProps.lineWidth,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        };
        this._private__lineRenderer._internal_setData(data);
        return this._private__lineRenderer;
    }
    _internal__updateOptions() {
        this._internal__items.forEach((item) => {
            item._internal_color = this._internal__series._internal_barColorer()._internal_barStyle(item._internal_time)._internal_barColor;
        });
    }
    _internal__createRawItem(time, price, colorer) {
        const item = this._internal__createRawItemBase(time, price);
        item._internal_color = colorer._internal_barStyle(time)._internal_barColor;
        return item;
    }
}

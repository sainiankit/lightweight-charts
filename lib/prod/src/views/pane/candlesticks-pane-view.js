import { PaneRendererCandlesticks, } from '../../renderers/candlesticks-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export class SeriesCandlesticksPaneView extends BarsPaneViewBase {
    constructor() {
        super(...arguments);
        this._private__renderer = new PaneRendererCandlesticks();
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        const candlestickStyleProps = this._internal__series._internal_options();
        this._internal__makeValid();
        const data = {
            _internal_bars: this._internal__items,
            _internal_barSpacing: this._internal__model._internal_timeScale()._internal_barSpacing(),
            _internal_wickVisible: candlestickStyleProps.wickVisible,
            _internal_borderVisible: candlestickStyleProps.borderVisible,
            _internal_visibleRange: this._internal__itemsVisibleRange,
        };
        this._private__renderer._internal_setData(data);
        return this._private__renderer;
    }
    _internal__updateOptions() {
        this._internal__items.forEach((item) => {
            const style = this._internal__series._internal_barColorer()._internal_barStyle(item._internal_time);
            item._internal_color = style._internal_barColor;
            item._internal_wickColor = style._internal_barWickColor;
            item._internal_borderColor = style._internal_barBorderColor;
        });
    }
    _internal__createRawItem(time, bar, colorer) {
        const style = colorer._internal_barStyle(time);
        return Object.assign(Object.assign({}, this._internal__createDefaultItem(time, bar, colorer)), { _internal_color: style._internal_barColor, _internal_wickColor: style._internal_barWickColor, _internal_borderColor: style._internal_barBorderColor });
    }
}

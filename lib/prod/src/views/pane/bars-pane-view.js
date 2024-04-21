import { PaneRendererBars, } from '../../renderers/bars-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export class SeriesBarsPaneView extends BarsPaneViewBase {
    constructor() {
        super(...arguments);
        this._private__renderer = new PaneRendererBars();
    }
    _internal_renderer(height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        const barStyleProps = this._internal__series._internal_options();
        this._internal__makeValid();
        const data = {
            _internal_bars: this._internal__items,
            _internal_barSpacing: this._internal__model._internal_timeScale()._internal_barSpacing(),
            _internal_openVisible: barStyleProps.openVisible,
            _internal_thinBars: barStyleProps.thinBars,
            _internal_visibleRange: this._internal__itemsVisibleRange,
        };
        this._private__renderer._internal_setData(data);
        return this._private__renderer;
    }
    _internal__updateOptions() {
        this._internal__items.forEach((item) => {
            item._internal_color = this._internal__series._internal_barColorer()._internal_barStyle(item._internal_time)._internal_barColor;
        });
    }
    _internal__createRawItem(time, bar, colorer) {
        return Object.assign(Object.assign({}, this._internal__createDefaultItem(time, bar, colorer)), { _internal_color: colorer._internal_barStyle(time)._internal_barColor });
    }
}

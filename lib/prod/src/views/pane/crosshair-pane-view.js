import { ensureNotNull } from '../../helpers/assertions';
import { CrosshairRenderer } from '../../renderers/crosshair-renderer';
export class CrosshairPaneView {
    constructor(source) {
        this._private__validated = new Map();
        this._private__rendererData = {
            _internal_vertLine: {
                _internal_lineWidth: 1,
                _internal_lineStyle: 0,
                _internal_color: '',
                _internal_visible: false,
            },
            _internal_horzLine: {
                _internal_lineWidth: 1,
                _internal_lineStyle: 0,
                _internal_color: '',
                _internal_visible: false,
            },
            _internal_w: 0,
            _internal_h: 0,
            _internal_x: 0,
            _internal_y: 0,
        };
        this._private__renderer = new CrosshairRenderer(this._private__rendererData);
        this._private__source = source;
    }
    _internal_update() {
        this._private__validated.clear();
    }
    _internal_renderer(height, width, pane) {
        this._private__updateImpl(pane);
        // TODO rendererData needs to be cached per pane.
        /* if (!this._validated.get(pane)) {
            this._updateImpl(pane);
            this._validated.set(pane, true);
        } else {
            console.warn(`unexpected validated renderer, height: ${pane.height()}`);
        }*/
        return this._private__renderer;
    }
    _private__updateImpl(renderingPane) {
        const visible = this._private__source._internal_visible();
        const pane = ensureNotNull(this._private__source._internal_pane());
        const crosshairOptions = pane._internal_model()._internal_options().crosshair;
        const data = this._private__rendererData;
        data._internal_horzLine._internal_visible = visible && this._private__source._internal_horzLineVisible(renderingPane);
        data._internal_vertLine._internal_visible = visible && this._private__source._internal_vertLineVisible();
        data._internal_horzLine._internal_lineWidth = crosshairOptions.horzLine.width;
        data._internal_horzLine._internal_lineStyle = crosshairOptions.horzLine.style;
        data._internal_horzLine._internal_color = crosshairOptions.horzLine.color;
        data._internal_vertLine._internal_lineWidth = crosshairOptions.vertLine.width;
        data._internal_vertLine._internal_lineStyle = crosshairOptions.vertLine.style;
        data._internal_vertLine._internal_color = crosshairOptions.vertLine.color;
        data._internal_w = renderingPane._internal_width();
        data._internal_h = renderingPane._internal_height();
        data._internal_x = this._private__source._internal_appliedX();
        data._internal_y = this._private__source._internal_appliedY();
    }
}

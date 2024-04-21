import { makeFont } from '../../helpers/make-font';
import { WatermarkRenderer } from '../../renderers/watermark-renderer';
export class WatermarkPaneView {
    constructor(source) {
        this._private__invalidated = true;
        this._private__rendererData = {
            _internal_visible: false,
            _internal_color: '',
            _internal_height: 0,
            _internal_width: 0,
            _internal_lines: [],
            _internal_vertAlign: 'center',
            _internal_horzAlign: 'center',
        };
        this._private__renderer = new WatermarkRenderer(this._private__rendererData);
        this._private__source = source;
    }
    _internal_update() {
        this._private__invalidated = true;
    }
    _internal_renderer(height, width) {
        if (this._private__invalidated) {
            this._private__updateImpl(height, width);
            this._private__invalidated = false;
        }
        return this._private__renderer;
    }
    _private__updateImpl(height, width) {
        const options = this._private__source._internal_options();
        const data = this._private__rendererData;
        data._internal_visible = options.visible;
        if (!data._internal_visible) {
            return;
        }
        data._internal_color = options.color;
        data._internal_width = width;
        data._internal_height = height;
        data._internal_horzAlign = options.horzAlign;
        data._internal_vertAlign = options.vertAlign;
        data._internal_lines = [
            {
                _internal_text: options.text,
                _internal_font: makeFont(options.fontSize, options.fontFamily, options.fontStyle),
                _internal_lineHeight: options.fontSize * 1.2,
                _internal_vertOffset: 0,
                _internal_zoom: 0,
            },
        ];
    }
}

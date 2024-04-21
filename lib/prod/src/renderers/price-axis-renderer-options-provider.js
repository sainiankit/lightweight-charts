import { makeFont } from '../helpers/make-font';
;
export class PriceAxisRendererOptionsProvider {
    constructor(chartModel) {
        this._private__rendererOptions = {
            _internal_borderSize: 1 /* BorderSize */,
            _internal_tickLength: 4 /* TickLength */,
            _internal_fontSize: NaN,
            _internal_font: '',
            _internal_fontFamily: '',
            _internal_color: '',
            _internal_paddingBottom: 0,
            _internal_paddingInner: 0,
            _internal_paddingOuter: 0,
            _internal_paddingTop: 0,
            _internal_baselineOffset: 0,
        };
        this._private__chartModel = chartModel;
    }
    _internal_options() {
        const rendererOptions = this._private__rendererOptions;
        const currentFontSize = this._private__fontSize();
        const currentFontFamily = this._private__fontFamily();
        if (rendererOptions._internal_fontSize !== currentFontSize || rendererOptions._internal_fontFamily !== currentFontFamily) {
            rendererOptions._internal_fontSize = currentFontSize;
            rendererOptions._internal_fontFamily = currentFontFamily;
            rendererOptions._internal_font = makeFont(currentFontSize, currentFontFamily);
            rendererOptions._internal_paddingTop = Math.floor(currentFontSize / 3.5);
            rendererOptions._internal_paddingBottom = rendererOptions._internal_paddingTop;
            rendererOptions._internal_paddingInner = Math.max(Math.ceil(currentFontSize / 2 - rendererOptions._internal_tickLength / 2), 0);
            rendererOptions._internal_paddingOuter = Math.ceil(currentFontSize / 2 + rendererOptions._internal_tickLength / 2);
            rendererOptions._internal_baselineOffset = Math.round(currentFontSize / 10);
        }
        rendererOptions._internal_color = this._private__textColor();
        return this._private__rendererOptions;
    }
    _private__textColor() {
        return this._private__chartModel._internal_options().layout.textColor;
    }
    _private__fontSize() {
        return this._private__chartModel._internal_options().layout.fontSize;
    }
    _private__fontFamily() {
        return this._private__chartModel._internal_options().layout.fontFamily;
    }
}

import { clamp } from '../helpers/mathex';
import { PaneRendererAreaBase } from './area-renderer';
import { PaneRendererLineBase } from './line-renderer';
export class PaneRendererBaselineArea extends PaneRendererAreaBase {
    _internal__fillStyle(ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = this._internal__data;
        const gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        const baselinePercent = clamp(data._internal_baseLevelCoordinate / data._internal_bottom, 0, 1);
        gradient.addColorStop(0, data._internal_topFillColor1);
        gradient.addColorStop(baselinePercent, data._internal_topFillColor2);
        gradient.addColorStop(baselinePercent, data._internal_bottomFillColor1);
        gradient.addColorStop(1, data._internal_bottomFillColor2);
        return gradient;
    }
}
export class PaneRendererBaselineLine extends PaneRendererLineBase {
    _internal__strokeStyle(ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = this._internal__data;
        const gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        const baselinePercent = clamp(data._internal_baseLevelCoordinate / data._internal_bottom, 0, 1);
        gradient.addColorStop(0, data._internal_topColor);
        gradient.addColorStop(baselinePercent, data._internal_topColor);
        gradient.addColorStop(baselinePercent, data._internal_bottomColor);
        gradient.addColorStop(1, data._internal_bottomColor);
        return gradient;
    }
}

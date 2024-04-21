import { ChartModel } from '../../model/chart-model';
import { Crosshair } from '../../model/crosshair';
import { Pane } from '../../model/pane';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';
export declare class CrosshairMarksPaneView implements IUpdatablePaneView {
    private readonly _chartModel;
    private readonly _crosshair;
    private readonly _compositeRenderer;
    private _markersRenderers;
    private _markersData;
    private _validated;
    constructor(chartModel: ChartModel, crosshair: Crosshair);
    update(updateType?: UpdateType): void;
    renderer(height: number, width: number, pane: Pane, addAnchors?: boolean): IPaneRenderer | null;
    private _updateImpl;
}

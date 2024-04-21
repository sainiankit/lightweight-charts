import { Crosshair } from '../../model/crosshair';
import { Pane } from '../../model/pane';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IPaneView } from './ipane-view';
export declare class CrosshairPaneView implements IPaneView {
    private _validated;
    private readonly _source;
    private readonly _rendererData;
    private _renderer;
    constructor(source: Crosshair);
    update(): void;
    renderer(height: number, width: number, pane: Pane): IPaneRenderer;
    private _updateImpl;
}

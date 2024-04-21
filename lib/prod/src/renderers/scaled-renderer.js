export class ScaledRenderer {
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        ctx.save();
        // actually we must be sure that this scaling applied only once at the same time
        // currently ScaledRenderer could be only nodes renderer (not top-level renderers like CompositeRenderer or something)
        // so this "constraint" is fulfilled for now
        ctx.scale(pixelRatio, pixelRatio);
        this._internal__drawImpl(ctx, isHovered, hitTestData);
        ctx.restore();
    }
    _internal_drawBackground(ctx, pixelRatio, isHovered, hitTestData) {
        ctx.save();
        // actually we must be sure that this scaling applied only once at the same time
        // currently ScaledRenderer could be only nodes renderer (not top-level renderers like CompositeRenderer or something)
        // so this "constraint" is fulfilled for now
        ctx.scale(pixelRatio, pixelRatio);
        this._internal__drawBackgroundImpl(ctx, isHovered, hitTestData);
        ctx.restore();
    }
    _internal__drawBackgroundImpl(ctx, isHovered, hitTestData) { }
}

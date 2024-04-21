export class CompositeRenderer {
    constructor() {
        this._private__renderers = [];
    }
    _internal_setRenderers(renderers) {
        this._private__renderers = renderers;
    }
    _internal_draw(ctx, pixelRatio, isHovered, hitTestData) {
        this._private__renderers.forEach((r) => {
            ctx.save();
            r._internal_draw(ctx, pixelRatio, isHovered, hitTestData);
            ctx.restore();
        });
    }
}

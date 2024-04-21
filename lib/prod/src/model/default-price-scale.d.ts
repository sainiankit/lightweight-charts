export declare const enum DefaultPriceScaleId {
    Left = "left",
    Right = "right",
    NonPrimary = "non-primary"
}
export declare function isDefaultPriceScale(priceScaleId: string): priceScaleId is DefaultPriceScaleId;

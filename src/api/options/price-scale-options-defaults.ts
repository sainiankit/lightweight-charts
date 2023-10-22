import { PriceScaleMode, PriceScaleOptions } from '../../model/price-scale';

export const priceScaleOptionsDefaults: PriceScaleOptions = {
	autoScale: true,
	mode: PriceScaleMode.Normal,
	invertScale: false,
	alignLabels: true,
	borderVisible: true,
	borderColor: '#efefef',
	entireTextOnly: false,
	visible: false,
	ticksVisible: true,
	scaleMargins: {
		bottom: 0.1,
		top: 0.2,
	},
};

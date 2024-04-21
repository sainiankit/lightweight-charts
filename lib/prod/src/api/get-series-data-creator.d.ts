import { SeriesPlotRow } from '../model/series-data';
import { SeriesType } from '../model/series-options';
import { SeriesDataItemTypeMap } from './data-consumer';
export declare function getSeriesDataCreator<TSeriesType extends SeriesType>(seriesType: TSeriesType): (plotRow: SeriesPlotRow<TSeriesType>) => SeriesDataItemTypeMap[TSeriesType];

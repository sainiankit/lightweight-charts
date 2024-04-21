import { assert } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone } from '../helpers/strict-type-checks';
import { convertTime } from './data-layer';
;
export class TimeScaleApi {
    constructor(model, timeAxisWidget) {
        this._private__timeRangeChanged = new Delegate();
        this._private__logicalRangeChanged = new Delegate();
        this._private__sizeChanged = new Delegate();
        this._private__model = model;
        this._private__timeScale = model._internal_timeScale();
        this._private__timeAxisWidget = timeAxisWidget;
        this._private__timeScale._internal_visibleBarsChanged()._internal_subscribe(this._private__onVisibleBarsChanged.bind(this));
        this._private__timeScale._internal_logicalRangeChanged()._internal_subscribe(this._private__onVisibleLogicalRangeChanged.bind(this));
        this._private__timeAxisWidget._internal_sizeChanged()._internal_subscribe(this._private__onSizeChanged.bind(this));
    }
    _internal_destroy() {
        this._private__timeScale._internal_visibleBarsChanged()._internal_unsubscribeAll(this);
        this._private__timeScale._internal_logicalRangeChanged()._internal_unsubscribeAll(this);
        this._private__timeAxisWidget._internal_sizeChanged()._internal_unsubscribeAll(this);
        this._private__timeRangeChanged._internal_destroy();
        this._private__logicalRangeChanged._internal_destroy();
        this._private__sizeChanged._internal_destroy();
    }
    scrollPosition() {
        return this._private__timeScale._internal_rightOffset();
    }
    scrollToPosition(position, animated) {
        if (!animated) {
            this._private__model._internal_setRightOffset(position);
            return;
        }
        this._private__timeScale._internal_scrollToOffsetAnimated(position, 1000 /* AnimationDurationMs */);
    }
    scrollToRealTime() {
        this._private__timeScale._internal_scrollToRealTime();
    }
    getVisibleRange() {
        var _a, _b;
        const timeRange = this._private__timeScale._internal_visibleTimeRange();
        if (timeRange === null) {
            return null;
        }
        return {
            from: (_a = timeRange.from._internal_businessDay) !== null && _a !== void 0 ? _a : timeRange.from._internal_timestamp,
            to: (_b = timeRange.to._internal_businessDay) !== null && _b !== void 0 ? _b : timeRange.to._internal_timestamp,
        };
    }
    setVisibleRange(range) {
        const convertedRange = {
            from: convertTime(range.from),
            to: convertTime(range.to),
        };
        const logicalRange = this._private__timeScale._internal_logicalRangeForTimeRange(convertedRange);
        this._private__model._internal_setTargetLogicalRange(logicalRange);
    }
    getVisibleLogicalRange() {
        const logicalRange = this._private__timeScale._internal_visibleLogicalRange();
        if (logicalRange === null) {
            return null;
        }
        return {
            from: logicalRange._internal_left(),
            to: logicalRange._internal_right(),
        };
    }
    setVisibleLogicalRange(range) {
        assert(range.from <= range.to, 'The from index cannot be after the to index.');
        this._private__model._internal_setTargetLogicalRange(range);
    }
    resetTimeScale() {
        this._private__model._internal_resetTimeScale();
    }
    fitContent() {
        this._private__model._internal_fitContent();
    }
    logicalToCoordinate(logical) {
        const timeScale = this._private__model._internal_timeScale();
        if (timeScale._internal_isEmpty()) {
            return null;
        }
        else {
            return timeScale._internal_indexToCoordinate(logical);
        }
    }
    coordinateToLogical(x) {
        if (this._private__timeScale._internal_isEmpty()) {
            return null;
        }
        else {
            return this._private__timeScale._internal_coordinateToIndex(x);
        }
    }
    timeToCoordinate(time) {
        const timePoint = convertTime(time);
        const timePointIndex = this._private__timeScale._internal_timeToIndex(timePoint, false);
        if (timePointIndex === null) {
            return null;
        }
        return this._private__timeScale._internal_indexToCoordinate(timePointIndex);
    }
    coordinateToTime(x) {
        var _a;
        const timeScale = this._private__model._internal_timeScale();
        const timePointIndex = timeScale._internal_coordinateToIndex(x);
        const timePoint = timeScale._internal_indexToTime(timePointIndex);
        if (timePoint === null) {
            return null;
        }
        return (_a = timePoint._internal_businessDay) !== null && _a !== void 0 ? _a : timePoint._internal_timestamp;
    }
    width() {
        return this._private__timeAxisWidget._internal_getSize()._internal_w;
    }
    height() {
        return this._private__timeAxisWidget._internal_getSize()._internal_h;
    }
    subscribeVisibleTimeRangeChange(handler) {
        this._private__timeRangeChanged._internal_subscribe(handler);
    }
    unsubscribeVisibleTimeRangeChange(handler) {
        this._private__timeRangeChanged._internal_unsubscribe(handler);
    }
    subscribeVisibleLogicalRangeChange(handler) {
        this._private__logicalRangeChanged._internal_subscribe(handler);
    }
    unsubscribeVisibleLogicalRangeChange(handler) {
        this._private__logicalRangeChanged._internal_unsubscribe(handler);
    }
    subscribeSizeChange(handler) {
        this._private__sizeChanged._internal_subscribe(handler);
    }
    unsubscribeSizeChange(handler) {
        this._private__sizeChanged._internal_unsubscribe(handler);
    }
    applyOptions(options) {
        this._private__timeScale._internal_applyOptions(options);
    }
    options() {
        return clone(this._private__timeScale._internal_options());
    }
    _private__onVisibleBarsChanged() {
        if (this._private__timeRangeChanged._internal_hasListeners()) {
            this._private__timeRangeChanged._internal_fire(this.getVisibleRange());
        }
    }
    _private__onVisibleLogicalRangeChanged() {
        if (this._private__logicalRangeChanged._internal_hasListeners()) {
            this._private__logicalRangeChanged._internal_fire(this.getVisibleLogicalRange());
        }
    }
    _private__onSizeChanged(size) {
        this._private__sizeChanged._internal_fire(size._internal_w, size._internal_h);
    }
}

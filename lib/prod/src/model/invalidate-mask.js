;
function mergePaneInvalidation(beforeValue, newValue) {
    if (beforeValue === undefined) {
        return newValue;
    }
    const level = Math.max(beforeValue._internal_level, newValue._internal_level);
    const autoScale = beforeValue._internal_autoScale || newValue._internal_autoScale;
    return { _internal_level: level, _internal_autoScale: autoScale };
}
;
export class InvalidateMask {
    constructor(globalLevel) {
        this._private__invalidatedPanes = new Map();
        this._private__timeScaleInvalidations = [];
        this._private__globalLevel = globalLevel;
    }
    _internal_invalidatePane(paneIndex, invalidation) {
        const prevValue = this._private__invalidatedPanes.get(paneIndex);
        const newValue = mergePaneInvalidation(prevValue, invalidation);
        this._private__invalidatedPanes.set(paneIndex, newValue);
    }
    _internal_fullInvalidation() {
        return this._private__globalLevel;
    }
    _internal_invalidateForPane(paneIndex) {
        const paneInvalidation = this._private__invalidatedPanes.get(paneIndex);
        if (paneInvalidation === undefined) {
            return {
                _internal_level: this._private__globalLevel,
            };
        }
        return {
            _internal_level: Math.max(this._private__globalLevel, paneInvalidation._internal_level),
            _internal_autoScale: paneInvalidation._internal_autoScale,
        };
    }
    _internal_setFitContent() {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 0 /* FitContent */ }];
    }
    _internal_applyRange(range) {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 1 /* ApplyRange */, _internal_value: range }];
    }
    _internal_resetTimeScale() {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 4 /* Reset */ }];
    }
    _internal_setBarSpacing(barSpacing) {
        this._private__timeScaleInvalidations.push({ _internal_type: 2 /* ApplyBarSpacing */, _internal_value: barSpacing });
    }
    _internal_setRightOffset(offset) {
        this._private__timeScaleInvalidations.push({ _internal_type: 3 /* ApplyRightOffset */, _internal_value: offset });
    }
    _internal_timeScaleInvalidations() {
        return this._private__timeScaleInvalidations;
    }
    _internal_merge(other) {
        for (const tsInvalidation of other._private__timeScaleInvalidations) {
            this._private__applyTimeScaleInvalidation(tsInvalidation);
        }
        this._private__globalLevel = Math.max(this._private__globalLevel, other._private__globalLevel);
        other._private__invalidatedPanes.forEach((invalidation, index) => {
            this._internal_invalidatePane(index, invalidation);
        });
    }
    _private__applyTimeScaleInvalidation(invalidation) {
        switch (invalidation._internal_type) {
            case 0 /* FitContent */:
                this._internal_setFitContent();
                break;
            case 1 /* ApplyRange */:
                this._internal_applyRange(invalidation._internal_value);
                break;
            case 2 /* ApplyBarSpacing */:
                this._internal_setBarSpacing(invalidation._internal_value);
                break;
            case 3 /* ApplyRightOffset */:
                this._internal_setRightOffset(invalidation._internal_value);
                break;
            case 4 /* Reset */:
                this._internal_resetTimeScale();
                break;
        }
    }
}

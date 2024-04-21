import { lowerbound } from '../helpers/algorithms';
import { ensureDefined } from '../helpers/assertions';
export class TickMarks {
    constructor() {
        this._private__marksByWeight = new Map();
        this._private__cache = null;
    }
    _internal_setTimeScalePoints(newPoints, firstChangedPointIndex) {
        this._private__removeMarksSinceIndex(firstChangedPointIndex);
        this._private__cache = null;
        for (let index = firstChangedPointIndex; index < newPoints.length; ++index) {
            const point = newPoints[index];
            let marksForWeight = this._private__marksByWeight.get(point._internal_timeWeight);
            if (marksForWeight === undefined) {
                marksForWeight = [];
                this._private__marksByWeight.set(point._internal_timeWeight, marksForWeight);
            }
            marksForWeight.push({
                _internal_index: index,
                _internal_time: point._internal_time,
                _internal_weight: point._internal_timeWeight,
                _internal_originalTime: point._internal_originalTime,
            });
        }
    }
    _internal_build(spacing, maxWidth) {
        const maxIndexesPerMark = Math.ceil(maxWidth / spacing);
        if (this._private__cache === null || this._private__cache._internal_maxIndexesPerMark !== maxIndexesPerMark) {
            this._private__cache = {
                _internal_marks: this._private__buildMarksImpl(maxIndexesPerMark),
                _internal_maxIndexesPerMark: maxIndexesPerMark,
            };
        }
        return this._private__cache._internal_marks;
    }
    _private__removeMarksSinceIndex(sinceIndex) {
        if (sinceIndex === 0) {
            this._private__marksByWeight.clear();
            return;
        }
        const weightsToClear = [];
        this._private__marksByWeight.forEach((marks, timeWeight) => {
            if (sinceIndex <= marks[0]._internal_index) {
                weightsToClear.push(timeWeight);
            }
            else {
                marks.splice(lowerbound(marks, sinceIndex, (tm) => tm._internal_index < sinceIndex), Infinity);
            }
        });
        for (const weight of weightsToClear) {
            this._private__marksByWeight.delete(weight);
        }
    }
    _private__buildMarksImpl(maxIndexesPerMark) {
        let marks = [];
        for (const weight of Array.from(this._private__marksByWeight.keys()).sort((a, b) => b - a)) {
            if (!this._private__marksByWeight.get(weight)) {
                continue;
            }
            // Built tickMarks are now prevMarks, and marks it as new array
            const prevMarks = marks;
            marks = [];
            const prevMarksLength = prevMarks.length;
            let prevMarksPointer = 0;
            const currentWeight = ensureDefined(this._private__marksByWeight.get(weight));
            const currentWeightLength = currentWeight.length;
            let rightIndex = Infinity;
            let leftIndex = -Infinity;
            for (let i = 0; i < currentWeightLength; i++) {
                const mark = currentWeight[i];
                const currentIndex = mark._internal_index;
                // Determine indexes with which current index will be compared
                // All marks to the right is moved to new array
                while (prevMarksPointer < prevMarksLength) {
                    const lastMark = prevMarks[prevMarksPointer];
                    const lastIndex = lastMark._internal_index;
                    if (lastIndex < currentIndex) {
                        prevMarksPointer++;
                        marks.push(lastMark);
                        leftIndex = lastIndex;
                        rightIndex = Infinity;
                    }
                    else {
                        rightIndex = lastIndex;
                        break;
                    }
                }
                if (rightIndex - currentIndex >= maxIndexesPerMark && currentIndex - leftIndex >= maxIndexesPerMark) {
                    // TickMark fits. Place it into new array
                    marks.push(mark);
                    leftIndex = currentIndex;
                }
            }
            // Place all unused tickMarks into new array;
            for (; prevMarksPointer < prevMarksLength; prevMarksPointer++) {
                marks.push(prevMarks[prevMarksPointer]);
            }
        }
        return marks;
    }
}

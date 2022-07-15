import { forwardFindIndex, reverseFindIndex } from './find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
import { SliceMode } from './slice-mode.js';
import { ArrayPositions } from './time-entry.js';
import { whatsMyType } from './what-is-my-type.js';
export class TimestampsClass extends Float64Array {
    indexSlice(start, end) {
        return Object.assign(new TimestampsClass((end !== null && end !== void 0 ? end : this.length) - start), this.slice(start, end));
    }
    sortAndRemoveDuplicates() {
        const tempTimestamps = Float64Array.from([...new Set(this.sort((a, b) => a.valueOf() - b.valueOf()))]);
        const returnTimestamps = new TimestampsClass(tempTimestamps.length);
        returnTimestamps.set(tempTimestamps);
        return returnTimestamps;
    }
    /**
     * Will combine two time series timestamp arrays
     * @param combineTimestamps The array of new timestamps to combine with
     * @returns A new TimestampsClass array object
     */
    combine(combineTimestamps) {
        const combinedTimestamps = new TimestampsClass(this.length + combineTimestamps.length);
        combinedTimestamps.set(this);
        combinedTimestamps.set(combineTimestamps, this.length);
        return combinedTimestamps.sortAndRemoveDuplicates();
    }
}
export class StatusesClass extends Uint32Array {
}
export class Vector {
    constructor(config) {
        if (config) {
            this.timestamps = new TimestampsClass(config.length);
            switch (whatsMyType(config.dataType)) {
                case 'Uint8Array':
                    this.values = new Uint8Array(config.length);
                    break;
                case 'Uint32Array':
                    this.values = new Uint32Array(config.length);
                    break;
                case 'Float64Array':
                    this.values = new Float64Array(config.length);
                    break;
                case 'Array':
                    this.values = new Array(config.length);
                    break;
                default:
                    throw Error(`Invalid dataType ${whatsMyType(config.dataType)}`);
            }
            this.statuses = new StatusesClass(config.length);
        }
    }
    deepClone() {
        const returnVector = new Vector({ dataType: this.values, length: this.timestamps.length });
        returnVector.set(this);
        return returnVector;
    }
    set(vector) {
        this.timestamps.set(vector.timestamps);
        this.statuses.set(vector.statuses);
        switch (whatsMyType(vector.values)) {
            case 'Uint8Array':
                this.values.set(vector.values);
                break;
            case 'Uint32Array':
                this.values.set(vector.values);
                break;
            case 'Float64Array':
                this.values.set(vector.values);
                break;
            case 'Array':
                for (let i = 0; i < vector.values.length; i++) {
                    this.values[i] = vector.values[i];
                }
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(vector.values)}`);
        }
    }
    validate() {
        var _a, _b, _c, _d;
        // Array lengths
        return (((_a = this.timestamps) === null || _a === void 0 ? void 0 : _a.length) === ((_b = this.values) === null || _b === void 0 ? void 0 : _b.length) &&
            ((_c = this.timestamps) === null || _c === void 0 ? void 0 : _c.length) === ((_d = this.statuses) === null || _d === void 0 ? void 0 : _d.length));
    }
    createElements(length) {
        this.timestamps = new TimestampsClass(length);
        switch (whatsMyType(this.values)) {
            case 'Uint8Array':
                this.values = new Uint8Array(length);
                break;
            case 'Uint32Array':
                this.values = new Uint32Array(length);
                break;
            case 'Float64Array':
                this.values = new Float64Array(length);
                break;
            case 'Array':
                this.values = new Array(length);
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
        }
        this.statuses = new StatusesClass(length);
        return this;
    }
    /**
     * Warning, methods with set in the name change the vector. They are mutable.
     * @returns An altered Vector
     */
    setBad() {
        switch (whatsMyType(this.values)) {
            case 'Uint32Array':
                this.values.fill(NaN);
                break;
            case 'Uint8Array':
                this.values.fill(NaN);
                break;
            case 'Float64Array':
                this.values.fill(NaN);
                break;
            case 'Array':
                for (let i = 0; i < this.values.length; i++) {
                    this.values[i] = null;
                }
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
        }
        this.statuses.fill(Severity.Bad);
        return this;
    }
    /**
     * Creates a new vector from the passed in elements (timestamp, value, status)
     * @param timestamps
     * @param values
     * @param statuses
     * @returns A new Vector
     */
    static fromElements(timestamps, values, statuses) {
        // let dataType: ValueType;
        const returnVector = new Vector({ dataType: values, length: timestamps.length });
        returnVector.timestamps.set(timestamps);
        if (statuses) {
            returnVector.statuses.set(statuses);
        }
        else {
            returnVector.statuses.fill(0);
        }
        switch (whatsMyType(values)) {
            case 'Uint8Array':
                returnVector.values.set(values);
                break;
            case 'Uint32Array':
                returnVector.values.set(values);
                break;
            case 'Float64Array':
                returnVector.values.set(values);
                break;
            case 'Array':
                for (let i = 0; i < values.length; i++) {
                    returnVector.values[i] = values[i];
                }
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(values)}`);
        }
        return returnVector;
    }
    /**
     * Creates a new vector from an array of time entries [{t,v,s}...{t,v,s}]
     * @param timeEntries in the format [{t,v,s}...{t,v,s}]
     * @returns A new Vector
     */
    static fromTimeEntries(timeEntries) {
        if (timeEntries.length === 0) {
            throw Error('Unable to tell data type from an array with length 0');
        }
        let returnVector;
        switch (whatsMyType(timeEntries[0].v)) {
            case 'Number':
                returnVector = new Vector({ dataType: FloatDataType, length: timeEntries.length });
                break;
            case 'String':
                returnVector = new Vector({ dataType: StringDataType, length: timeEntries.length });
                break;
            case 'Boolean':
                returnVector = new Vector({ dataType: BooleanDataType, length: timeEntries.length });
                break;
            case 'Object':
                returnVector = new Vector({ dataType: ObjectDataType, length: timeEntries.length });
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(timeEntries[0].v)}`);
        }
        for (let i = 0; i < timeEntries.length; i++) {
            returnVector.timestamps[i] = timeEntries[i].t;
            returnVector.values[i] = timeEntries[i].v;
            returnVector.statuses[i] = timeEntries[i].s || 0;
        }
        return returnVector;
    }
    /**
     * Creates a new vector from an array of time entry arrays [[t,v,s]...[t,v,s]]
     * @param timeEntryArrays in the format [[t,v,s]...[t,v,s]]
     * @returns A new Vector
     */
    static fromTimeEntryArrays(timeEntryArrays) {
        if (timeEntryArrays.length === 0) {
            throw Error('Unable to tell data type from an array with length 0');
        }
        let returnVector;
        switch (whatsMyType(timeEntryArrays[0][ArrayPositions.VALUE])) {
            case 'Number':
                returnVector = new Vector({ dataType: FloatDataType, length: timeEntryArrays.length });
                break;
            case 'String':
                returnVector = new Vector({ dataType: StringDataType, length: timeEntryArrays.length });
                break;
            case 'Boolean':
                returnVector = new Vector({ dataType: BooleanDataType, length: timeEntryArrays.length });
                break;
            case 'Object':
                returnVector = new Vector({ dataType: ObjectDataType, length: timeEntryArrays.length });
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(timeEntryArrays[0][ArrayPositions.VALUE])}`);
        }
        for (let i = 0; i < timeEntryArrays.length; i++) {
            returnVector.timestamps[i] = timeEntryArrays[i][ArrayPositions.TIMESTAMP];
            returnVector.values[i] = timeEntryArrays[i][ArrayPositions.VALUE];
            returnVector.statuses[i] = timeEntryArrays[i][ArrayPositions.STATUS_CODE] || 0;
        }
        return returnVector;
    }
    /**
     *
     * @returns An array of TimeEntry [{t,v,s}...{t,v,s}]
     */
    getTimeEntries() {
        const timeEntries = [];
        for (let i = 0; i < this.timestamps.length; i++) {
            timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
        }
        return timeEntries;
    }
    /**
     *
     * @returns An array of TimeEntryArray [[t,v,s]...[t,v,s]]
     */
    getTimeEntryArrays() {
        const timeEntries = [];
        for (let i = 0; i < this.timestamps.length; i++) {
            timeEntries.push([this.timestamps[i], this.values[i], this.statuses[i]]);
        }
        return timeEntries;
    }
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in timestamps
     * @param fromTimestamp The from timestamp position
     * @param toTimestamp The to timestamp position
     * @param mode
     * @returns a new Vector created by the underlying slice method
     */
    sliceTime(fromTimestamp, toTimestamp = this.timestamps[this.timestamps.length - 1], mode = SliceMode.IncludeOverflow) {
        /** An array that will contain all the time series path objects to be returned */
        const foundStartIndex = forwardFindIndex(this.timestamps, fromTimestamp, mode === SliceMode.ExcludeOverflow ? IndexMode.ExcludeOverflow : IndexMode.IncludeOverflow);
        const foundEndIndex = reverseFindIndex(this.timestamps, toTimestamp, mode === SliceMode.ExcludeOverflow ? IndexMode.ExcludeOverflow : IndexMode.IncludeOverflow);
        return this.slice(foundStartIndex, foundEndIndex + 1);
    }
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in index positions
     * @param fromIndex The start index position
     * @param toIndex The to index position
     *
     * @returns a new Vector
     */
    slice(fromIndex, toIndex) {
        return Vector.fromElements(this.timestamps.indexSlice(fromIndex, toIndex), this.values.slice(fromIndex, toIndex), this.statuses.slice(fromIndex, toIndex));
    }
    /**
     * Portion (divide) the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param portionSize The maximum number of time series entries in each object
     */
    portion(portionSize) {
        /** An array that will contain all the time series path objects to be returned */
        const returnTimeSeriesVectors = [];
        /** The number of objects that will be created */
        const numberOfObjects = Math.ceil(this.timestamps.length / portionSize);
        for (let i = 0; i < numberOfObjects; i++) {
            const newVector = this.slice(i * portionSize, (i + 1) * portionSize);
            returnTimeSeriesVectors.push(newVector);
        }
        return returnTimeSeriesVectors;
    }
    /**
     * Concat adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the concatenatedTimeSeriesPath will take precedence
     * @param concatVector The time series path that will be added
     * @returns A new time series path
     */
    concat(concatVector) {
        if (concatVector.timestamps.length === 0) {
            return this.deepClone();
        }
        /** The place where the original vector will be cut off */
        const cutOffIndex = forwardFindIndex(this.timestamps, concatVector.timestamps[0], IndexMode.Exclusive);
        /** Adjusted for not finding the cut off point, which means that the start of the concatVector is before the start of the original vector */
        const adjustedCutOffIndex = cutOffIndex === null ? 0 : cutOffIndex + 1;
        /** The length of the new vector */
        const newLength = adjustedCutOffIndex + concatVector.timestamps.length;
        /** The vector for storing the results */
        const returnVector = new Vector({ dataType: this.values, length: newLength });
        // Only use the portion of the original vector up to where the cut off is
        if (adjustedCutOffIndex > 0) {
            // This if statement is only there for performance reasons, it avoids copying the whole memory
            returnVector.timestamps.set(this.timestamps.indexSlice(0, adjustedCutOffIndex));
        }
        returnVector.timestamps.set(concatVector.timestamps, adjustedCutOffIndex);
        switch (whatsMyType(this.values)) {
            case 'Uint8Array':
                returnVector.values.set(this.values.slice(0, adjustedCutOffIndex));
                returnVector.values.set(concatVector.values, adjustedCutOffIndex);
                break;
            case 'Uint32Array':
                returnVector.values.set(this.values.slice(0, adjustedCutOffIndex));
                returnVector.values.set(concatVector.values, adjustedCutOffIndex);
                break;
            case 'Float64Array':
                returnVector.values.set(this.values.slice(0, adjustedCutOffIndex));
                returnVector.values.set(concatVector.values, adjustedCutOffIndex);
                break;
            case 'Array':
                for (let i = 0; i < adjustedCutOffIndex; i++) {
                    returnVector.values[i] = this.values[i];
                }
                for (let i = 0; i < concatVector.timestamps.length; i++) {
                    returnVector.values[adjustedCutOffIndex + i] = concatVector.values[i];
                }
                break;
            default:
                throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
        }
        returnVector.statuses.set(this.statuses.slice(0, adjustedCutOffIndex));
        returnVector.statuses.set(concatVector.statuses, adjustedCutOffIndex);
        return returnVector;
    }
    /**
     * Will concat multiple time series paths together
     * @param concatVectors The array of time series paths that shall be concatenated together
     * @returns A single time series path with all the paths concatenated together
     */
    static multiConcat(concatVectors) {
        if (concatVectors.length === 0) {
            return;
        }
        else {
            let returnVector = new Vector({ dataType: concatVectors[0].values, length: 0 });
            for (const concatVector of concatVectors) {
                returnVector = returnVector.concat(concatVector);
            }
            return returnVector;
        }
    }
    /**
     * Replaces the section of the existing vector with the time period for the new vector
     * @param timeSeriesVector The new time series vector that will be used to replace the existing
     * @returns A new Vector
     */
    replace(timeSeriesVector) {
        // If the vector that comes in is empty, then just return what we have, there is nothing to replace
        if (timeSeriesVector.timestamps.length === 0) {
            return this.deepClone();
        }
        const startIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[0], IndexMode.Exclusive);
        const adjustedStartIndex = startIndex === null ? 0 : startIndex + 1;
        const endIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[timeSeriesVector.timestamps.length - 1], IndexMode.DiscontinuityInclusive);
        const adjustedEndIndex = endIndex === null ? this.timestamps.length : endIndex + 1;
        // Replace it in the middle
        return this.slice(0, adjustedStartIndex).concat(timeSeriesVector).concat(this.slice(adjustedEndIndex));
    }
    /**
     * Will resample the Vector using the None interpolation method.
     * This method is "semi-private" as the Vector does not know what it's own interpolation method is
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    _resampleNone(targetTimestamps) {
        const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
        returnVector.timestamps = targetTimestamps;
        returnVector.setBad();
        let objectIndex = 0;
        let targetIndex = 0;
        let found;
        while (targetIndex < targetTimestamps.length) {
            // while we need to find all the target timestamps
            found = false;
            // Check to see if the target is in the range of the data
            if (targetTimestamps[targetIndex] >= this.timestamps[0] &&
                targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]) {
                while (!found) {
                    //   objectIndex < this.timestamps.length && // while we are still in the array
                    //   this.timestamps[objectIndex] <= targetTimestamps[targetIndex] // Don't even start looping if we are past the target timestamp
                    // )
                    if (this.timestamps[objectIndex] === targetTimestamps[targetIndex]) {
                        // The object timestamp is equal to the current timestamp
                        found = true;
                    }
                    else if (objectIndex + 1 < this.timestamps.length &&
                        this.timestamps[objectIndex + 1] <= targetTimestamps[targetIndex]) {
                        // Try matching on the next timestamp
                        objectIndex++;
                    }
                    else {
                        break;
                    }
                }
            }
            // The current object timestamp is the one we need to use
            this._setResampleValue(found, objectIndex, targetIndex, returnVector.values, returnVector.statuses);
            targetIndex++;
        }
        return returnVector;
    }
    _resamplePrevious(targetTimestamps) {
        const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
        returnVector.timestamps = targetTimestamps;
        returnVector.setBad();
        let objectIndex = 0;
        let targetIndex = 0;
        let found;
        while (targetIndex < targetTimestamps.length) {
            // while we need to find all the target timestamps
            found = false;
            // Check to see if the target is in the range of the data
            if (targetTimestamps[targetIndex] >= this.timestamps[0]) {
                while (!found) {
                    if (targetTimestamps[targetIndex] < this.timestamps[objectIndex + 1] || // The target timestamp is less than the next timestamp
                        objectIndex + 1 === this.timestamps.length // We are at the end of the array, there are no more timestamps
                    ) {
                        // We have a match
                        found = true;
                    }
                    else if (objectIndex + 1 < this.timestamps.length) {
                        // Try matching on the next timestamp
                        objectIndex++;
                    }
                    else {
                        // We have reached the end of available timestamps, exit the while loop
                        break;
                    }
                }
            }
            // The current object timestamp is the one we need to use
            this._setResampleValue(found, objectIndex, targetIndex, returnVector.values, returnVector.statuses);
            targetIndex++;
        }
        return returnVector;
    }
    _resampleNext(targetTimestamps) {
        const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
        returnVector.timestamps = targetTimestamps;
        returnVector.setBad();
        let objectIndex = 0;
        let targetIndex = 0;
        let found;
        while (targetIndex < targetTimestamps.length) {
            // we need to find all the target timestamps
            found = false;
            if (targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]) {
                // There is no next value after the last element
                while (!found) {
                    if (targetTimestamps[targetIndex] <= this.timestamps[objectIndex] // We have a match
                    ) {
                        found = true;
                    }
                    else if (objectIndex + 1 <
                        this.timestamps.length // There is still room in the array to search
                    ) {
                        objectIndex++;
                    }
                    else {
                        break;
                    }
                }
            }
            // The current object timestamp is the one we need to use
            this._setResampleValue(found, objectIndex, targetIndex, returnVector.values, returnVector.statuses);
            targetIndex++;
        }
        return returnVector;
    }
    _setResampleValue(found, objectIndex, targetIndex, targetValues, targetStatuses) {
        if (found) {
            targetValues[targetIndex] = this.values[objectIndex];
            targetStatuses[targetIndex] = this.statuses[objectIndex];
        }
        else {
            // We did not find a match
            targetValues[targetIndex] = NaN;
            targetStatuses[targetIndex] = Severity.Bad;
        }
    }
    _resampleLinear(targetTimestamps) {
        const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
        returnVector.timestamps = targetTimestamps;
        returnVector.setBad();
        let objectIndex = 0;
        let targetIndex = 0;
        let found;
        while (targetIndex < targetTimestamps.length) {
            // we need to find all the target timestamps
            found = false;
            // Check to see if the target is in the range of the data
            if (targetTimestamps[targetIndex] >= this.timestamps[0] &&
                targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]) {
                while (!found) {
                    if ((this.timestamps[objectIndex] <= targetTimestamps[targetIndex] && // The target timestamp is in the range
                        targetTimestamps[targetIndex] <= this.timestamps[objectIndex + 1]) || // Inclusive, it is a path
                        this.timestamps[objectIndex] === targetTimestamps[targetIndex] // Or it is an exact match
                    ) {
                        // We have a match
                        found = true;
                    }
                    else if (objectIndex + 1 < this.timestamps.length) {
                        // Try matching on the next timestamp
                        objectIndex++;
                    }
                    else {
                        // We have reached the end of available timestamps, exit the while loop
                        break;
                    }
                }
            }
            // Now the next object timestamp is the one we need to use
            if (found) {
                if (this.timestamps[objectIndex + 1] === undefined) {
                    returnVector.values[targetIndex] = this.values[objectIndex];
                    returnVector.statuses[targetIndex] = this.statuses[objectIndex];
                }
                else {
                    returnVector.values[targetIndex] =
                        this.values[objectIndex] +
                            ((this.values[objectIndex + 1] - this.values[objectIndex]) *
                                (targetTimestamps[targetIndex].valueOf() - this.timestamps[objectIndex].valueOf())) /
                                (this.timestamps[objectIndex + 1].valueOf() - this.timestamps[objectIndex].valueOf());
                    returnVector.statuses[targetIndex] =
                        this.statuses[objectIndex] > this.statuses[objectIndex + 1]
                            ? this.statuses[objectIndex]
                            : this.statuses[objectIndex + 1];
                }
            }
            else {
                returnVector.values[targetIndex] = NaN;
                returnVector.statuses[targetIndex] = Severity.Bad;
            }
            targetIndex++;
        }
        return returnVector;
    }
}
export const FloatDataType = new Float64Array();
export const BooleanDataType = new Uint8Array();
export const StringDataType = [];
export const ObjectDataType = [];
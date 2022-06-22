import { forwardFindIndex } from './forward-find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
/**
 * Three arrays for timestamps, values, and statuses
 */
export class TimeSeriesVector {
    constructor() {
        this.timestamps = [];
        this.values = [];
        this.statuses = [];
    }
    set(timestamps, values, statuses) {
        this.timestamps = timestamps;
        this.values = values;
        this.statuses = statuses !== null && statuses !== void 0 ? statuses : new Array(timestamps.length).fill(Severity.Good);
        return this;
    }
    /**
     * Split the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param sliceSize The maximum number of time series entries in each object
     */
    split(sliceSize) {
        /** An array that will contain all the time series path objects to be returned */
        const returnTimeSeriesPaths = [];
        /** The number of objects that will be created */
        const numberOfObjects = Math.ceil(this.timestamps.length / sliceSize);
        for (let i = 0; i < numberOfObjects; i++) {
            const newVector = new TimeSeriesVector();
            newVector.timestamps = this.timestamps.slice(i * sliceSize, (i + 1) * sliceSize);
            newVector.values = this.values.slice(i * sliceSize, (i + 1) * sliceSize);
            newVector.statuses = this.statuses.slice(i * sliceSize, (i + 1) * sliceSize);
            returnTimeSeriesPaths.push(newVector);
        }
        return returnTimeSeriesPaths;
    }
    /**
     * Append adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the appendedTimeSeriesPath will take precedence
     * @param appendedTimeSeriesPath The time series path that will be added
     * @returns A new time series path
     */
    append(appendedTimeSeriesPath) {
        const returnTimeSeriesVector = new TimeSeriesVector();
        const foundIndex = forwardFindIndex(this.timestamps, appendedTimeSeriesPath.timestamps[0], IndexMode.Exclusive);
        returnTimeSeriesVector.timestamps = this.timestamps
            .slice(0, foundIndex === null ? 0 : foundIndex + 1)
            .concat(appendedTimeSeriesPath.timestamps);
        returnTimeSeriesVector.values = this.values
            .slice(0, foundIndex === null ? 0 : foundIndex + 1)
            .concat(appendedTimeSeriesPath.values);
        returnTimeSeriesVector.statuses = this.statuses
            .slice(0, foundIndex === null ? 0 : foundIndex + 1)
            .concat(appendedTimeSeriesPath.statuses);
        return returnTimeSeriesVector;
    }
    /**
     * Will append multiple time series paths together
     * @param appendedTimeSeriesVectors The array of time series paths that shall be appended together
     * @returns A single time series path with all the paths appended together
     */
    static multiAppend(appendedTimeSeriesVectors) {
        const returnTimeSeriesVector = new TimeSeriesVector();
        if (appendedTimeSeriesVectors.length === 0) {
            return returnTimeSeriesVector;
        }
        else {
            for (const appendTimeSeriesVector of appendedTimeSeriesVectors) {
                returnTimeSeriesVector.timestamps = returnTimeSeriesVector.timestamps.concat(appendTimeSeriesVector.timestamps);
                returnTimeSeriesVector.values = returnTimeSeriesVector.values.concat(appendTimeSeriesVector.values);
                returnTimeSeriesVector.statuses = returnTimeSeriesVector.statuses.concat(appendTimeSeriesVector.statuses);
            }
            return returnTimeSeriesVector;
        }
    }
    /**
     * Replaces (by inserting) a new time series vector into section of the original time series vector.
     * Overlapping time ranges in the original time series vector will be removed and replaced with the new points
     * @param timeSeriesVector The time series vector that shall be inserted into the original time series path
     * @returns A new time series vector
     */
    replace(timeSeriesVector) {
        var _a, _b, _c;
        const returnTimeSeriesPeriod = new TimeSeriesVector();
        const foundStartIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[0], IndexMode.Exclusive);
        const foundEndIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[timeSeriesVector.timestamps.length - 1], IndexMode.DiscontinuityInclusive);
        returnTimeSeriesPeriod.timestamps = this.timestamps
            .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
            .concat(timeSeriesVector.timestamps)
            .concat(this.timestamps.slice((_a = foundEndIndex + 1) !== null && _a !== void 0 ? _a : this.statuses.length));
        returnTimeSeriesPeriod.values = this.values
            .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
            .concat(timeSeriesVector.values)
            .concat(this.values.slice((_b = foundEndIndex + 1) !== null && _b !== void 0 ? _b : this.statuses.length));
        returnTimeSeriesPeriod.statuses = this.statuses
            .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
            .concat(timeSeriesVector.statuses)
            .concat(this.statuses.slice((_c = foundEndIndex + 1) !== null && _c !== void 0 ? _c : this.statuses.length));
        return returnTimeSeriesPeriod;
    }
}

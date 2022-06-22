import { Severity } from './severity.js';
import { Values } from './values.js';
/**
 * Three arrays for timestamps, values, and statuses
 */
export declare class TimeSeriesVector {
    timestamps: number[];
    values: unknown[];
    statuses: Severity[];
    set(timestamps: number[], values: Values, statuses?: Severity[]): this;
    /**
     * Split the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param sliceSize The maximum number of time series entries in each object
     */
    split(sliceSize: number): TimeSeriesVector[];
    /**
     * Append adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the appendedTimeSeriesPath will take precedence
     * @param appendedTimeSeriesPath The time series path that will be added
     * @returns A new time series path
     */
    append(appendedTimeSeriesPath: TimeSeriesVector): TimeSeriesVector;
    /**
     * Will append multiple time series paths together
     * @param appendedTimeSeriesVectors The array of time series paths that shall be appended together
     * @returns A single time series path with all the paths appended together
     */
    static multiAppend(appendedTimeSeriesVectors: TimeSeriesVector[]): TimeSeriesVector;
    /**
     * Replaces (by inserting) a new time series vector into section of the original time series vector.
     * Overlapping time ranges in the original time series vector will be removed and replaced with the new points
     * @param timeSeriesVector The time series vector that shall be inserted into the original time series path
     * @returns A new time series vector
     */
    replace(timeSeriesVector: TimeSeriesVector): TimeSeriesVector;
}

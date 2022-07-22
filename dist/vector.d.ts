import { ValueArrayType } from './values.js';
import { SliceMode } from './slice-mode.js';
import { TimeEntry, TimeEntryArray } from './time-entry.js';
import { ValueType } from './values.js';
import { timestamp, TimestampArray } from './timestamp.js';
/**
 * Takes a set of unordered and duplicated timestamps, sorts them, and removes the duplicates
 * @returns a new array of sorted unique timestamps
 */
export declare function sortAndRemoveDuplicates(timestamps: TimestampArray): TimestampArray;
/**
 * Will combine two time series timestamp arrays
 * @param timestamps1 The first timestamp array
 * @param timestamps2 The second timestamp array
 * @returns The resulting timestamp array
 */
export declare function combine(timestamps1: TimestampArray, timestamps2: TimestampArray): TimestampArray;
/**
 * A Vector is a combination of timestamps, values and status codes in one object.
 * Vectors pivots the traditional thinking of a row per point with timestamps, value, status.
 *
 * The advantages of vectors are:
 * * The ability to use Javascript ArrayTypes for timestamps, values, and status codes. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 * * ArrayTypes brings: Lower memory usage, Faster execution of code, and Faster serialization to files
 *
 * Vectors enables multiple arrays for values to be represented in the same Vector (beyond this Vector class). This allows aggregators to communicate max, min, average, sum in an expanded vector.
 */
export declare class Vector<ThisValueArrayType extends ValueArrayType> {
    timestamps: TimestampArray;
    values: ThisValueArrayType;
    statuses: Uint32Array;
    /**
     * Creates a new Vector.
     * @param config An object that contains: 1. a variable with the data type you want the values array to represent (Float64Array, Uint8Array, string[], object[]).
     * Often represented using the constants NumberArrayDataType, BooleanArrayDataType, StringArrayDataType, ObjectArrayDataType. 2. The length of the Vector.
     */
    constructor(config?: {
        dataType: ThisValueArrayType;
        length: number;
    });
    /**
     * Creates a completely new Vector that is value-wise identical to the original Vector but share no objects.
     * @returns A new Vector
     */
    deepClone(): Vector<ThisValueArrayType>;
    /**
     * Copies the values across from one Vector to this Vector
     * @param vector The Vector that the current Vector will be set to match.
     */
    set(vector: Vector<ThisValueArrayType>): void;
    /**
     * Validates that the Vector is valid
     */
    validate(): boolean;
    /**
     * This will create new elements on an existing Vector. Used to reset the Vector.
     * @param length The lengths of the array elements
     * @returns
     */
    createElements(length: number): Vector<ThisValueArrayType>;
    /**
     * Warning, methods with set in the name change the vector. They are mutable.
     * @returns An altered Vector
     */
    setBad(): Vector<ThisValueArrayType>;
    /**
     * Creates a new vector from the passed in elements (timestamp, value, status)
     * @param timestamps
     * @param values
     * @param statuses
     * @returns A new Vector
     */
    static fromElements<ValueType extends ValueArrayType>(timestamps: TimestampArray, values: ValueType, statuses?: Uint32Array): Vector<ValueType>;
    /**
     * Creates a new vector from an array of time entries [{t,v,s}...{t,v,s}]
     * @param timeEntries in the format [{t,v,s}...{t,v,s}]
     * @returns A new Vector
     */
    static fromTimeEntries(timeEntries: TimeEntry<ValueType>[]): Vector<ValueArrayType>;
    /**
     * Creates a new vector from an array of time entry arrays [[t,v,s]...[t,v,s]]
     * @param timeEntryArrays in the format [[t,v,s]...[t,v,s]]
     * @returns A new Vector
     */
    static fromTimeEntryArrays(timeEntryArrays: TimeEntryArray<ValueType>[]): Vector<ValueArrayType>;
    /**
     *
     * @returns An array of TimeEntry [{t,v,s}...{t,v,s}]
     */
    getTimeEntries(): TimeEntry<ValueType>[];
    /**
     *
     * @returns An array of TimeEntryArray [[t,v,s]...[t,v,s]]
     */
    getTimeEntryArrays(): TimeEntryArray<ValueType>[];
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in timestamps
     * @param fromTimestamp The from timestamp position
     * @param toTimestamp The to timestamp position
     * @param mode
     * @returns a new Vector created by the underlying slice method
     */
    sliceTime(fromTimestamp: timestamp, toTimestamp?: timestamp, mode?: SliceMode): Vector<ThisValueArrayType>;
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in index positions
     * @param fromIndex The start index position
     * @param toIndex The to index position
     *
     * @returns a new Vector
     */
    slice(fromIndex: number, toIndex?: number): Vector<ThisValueArrayType>;
    /**
     * Portion (divide, disjoin, or de-concatenate) the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param portionSize The maximum number of time series entries in each object
     */
    portion(portionSize: number): Vector<ThisValueArrayType>[];
    /**
     * Concat adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the concatenatedTimeSeriesPath will take precedence
     * @param concatVector The time series path that will be added
     * @returns A new time series path
     */
    concat(concatVector: Vector<ThisValueArrayType>): Vector<ThisValueArrayType>;
    /**
     * Will concat multiple time series paths together
     * @param concatVectors The array of time series paths that shall be concatenated together
     * @returns A single time series path with all the paths concatenated together
     */
    static multiConcat<ValueType extends ValueArrayType>(concatVectors: Vector<ValueType>[]): Vector<ValueType>;
    /**
     * Replaces the section of the existing vector with the time period for the new vector
     * @param timeSeriesVector The new time series vector that will be used to replace the existing
     * @returns A new Vector
     */
    replace(timeSeriesVector: Vector<ThisValueArrayType>): Vector<ThisValueArrayType>;
    /**
     * Will resample the Vector using the None interpolation method.
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    resampleNone(targetTimestamps: TimestampArray): Vector<ThisValueArrayType>;
    /**
     * Will resample the Vector using the Previous interpolation method.
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    resamplePrevious(targetTimestamps: TimestampArray): Vector<ThisValueArrayType>;
    /**
     * Will resample the Vector using the Next interpolation method.
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    resampleNext(targetTimestamps: TimestampArray): Vector<ThisValueArrayType>;
    /**
     * Sets the resampled value depending on whether it has been found
     * @param found A flag indicating that it has been found
     * @param objectIndex The index of the current object (this)
     * @param targetIndex The index of the object that is being created
     * @param targetValues The array where the resulting values are put into
     * @param targetStatuses The array where the resulting statuses are put into
     */
    private _setResampleValue;
    /**
     * Will resample the Vector using the Linear interpolation method.
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    resampleLinear(targetTimestamps: TimestampArray): Vector<ThisValueArrayType>;
}

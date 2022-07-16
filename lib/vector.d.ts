import { SliceMode } from './slice-mode.js';
import { TimeEntry, TimeEntryArray } from './time-entry.js';
export declare class TimestampsClass extends Float64Array {
    indexSlice(start: number, end?: number): TimestampsClass;
    sortAndRemoveDuplicates(): TimestampsClass;
    /**
     * Will combine two time series timestamp arrays
     * @param combineTimestamps The array of new timestamps to combine with
     * @returns A new TimestampsClass array object
     */
    combine(combineTimestamps: TimestampsClass): TimestampsClass;
}
export declare class StatusesClass extends Uint32Array {
}
/**
 * UInt8Array is for boolean
 */
export declare type ValueArrayType = Uint32Array | Float64Array | Uint8Array | string[] | object[];
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
export declare class Vector<ValueType extends ValueArrayType> {
    timestamps: TimestampsClass;
    values: ValueType;
    statuses: StatusesClass;
    dataType: ValueType;
    /**
     *
     * @param config An object that contains a variable with the data type you want the values array to represent (Float64Array, Uint32Array, Uint8Array, string[], object[], etc).
     * Often represented using the constants BooleanDataType,
     */
    constructor(config?: {
        dataType: ValueType;
        length: number;
    });
    /**
     * Creates a completely new Vector that is value-wise identical to the original Vector but share no objects.
     * @returns A new Vector
     */
    deepClone(): Vector<ValueType>;
    set(vector: Vector<ValueType>): void;
    validate(): boolean;
    createElements(length: number): Vector<ValueType>;
    /**
     * Warning, methods with set in the name change the vector. They are mutable.
     * @returns An altered Vector
     */
    setBad(): Vector<ValueType>;
    /**
     * Creates a new vector from the passed in elements (timestamp, value, status)
     * @param timestamps
     * @param values
     * @param statuses
     * @returns A new Vector
     */
    static fromElements<ValueType extends ValueArrayType>(timestamps: TimestampsClass, values: ValueType, statuses?: StatusesClass): Vector<ValueType>;
    /**
     * Creates a new vector from an array of time entries [{t,v,s}...{t,v,s}]
     * @param timeEntries in the format [{t,v,s}...{t,v,s}]
     * @returns A new Vector
     */
    static fromTimeEntries(timeEntries: TimeEntry[]): Vector<ValueArrayType>;
    /**
     * Creates a new vector from an array of time entry arrays [[t,v,s]...[t,v,s]]
     * @param timeEntryArrays in the format [[t,v,s]...[t,v,s]]
     * @returns A new Vector
     */
    static fromTimeEntryArrays(timeEntryArrays: TimeEntryArray[]): Vector<ValueArrayType>;
    /**
     *
     * @returns An array of TimeEntry [{t,v,s}...{t,v,s}]
     */
    getTimeEntries(): TimeEntry[];
    /**
     *
     * @returns An array of TimeEntryArray [[t,v,s]...[t,v,s]]
     */
    getTimeEntryArrays(): TimeEntryArray[];
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in timestamps
     * @param fromTimestamp The from timestamp position
     * @param toTimestamp The to timestamp position
     * @param mode
     * @returns a new Vector created by the underlying slice method
     */
    sliceTime(fromTimestamp: number, toTimestamp?: number, mode?: SliceMode): Vector<ValueType>;
    /**
     * Slice the time series vector by cutting off beginning and end based on passed in index positions
     * @param fromIndex The start index position
     * @param toIndex The to index position
     *
     * @returns a new Vector
     */
    slice(fromIndex: number, toIndex?: number): Vector<ValueType>;
    /**
     * Portion (divide) the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param portionSize The maximum number of time series entries in each object
     */
    portion(portionSize: number): Vector<ValueType>[];
    /**
     * Concat adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the concatenatedTimeSeriesPath will take precedence
     * @param concatVector The time series path that will be added
     * @returns A new time series path
     */
    concat(concatVector: Vector<ValueType>): Vector<ValueType>;
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
    replace(timeSeriesVector: Vector<ValueType>): Vector<ValueType>;
    /**
     * Will resample the Vector using the None interpolation method.
     * This method is "semi-private" as the Vector does not know what it's own interpolation method is
     * @param targetTimestamps The timestamps that we will resample to
     * @returns A new Vector
     */
    _resampleNone(targetTimestamps: TimestampsClass): Vector<ValueType>;
    _resamplePrevious(targetTimestamps: TimestampsClass): Vector<ValueType>;
    _resampleNext(targetTimestamps: TimestampsClass): Vector<ValueType>;
    private _setResampleValue;
    _resampleLinear(targetTimestamps: TimestampsClass): Vector<ValueType>;
}
export declare const NumberDataType: Float64Array;
export declare const BooleanDataType: Uint8Array;
export declare const StringDataType: string[];
export declare const ObjectDataType: object[];

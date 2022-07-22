import { InterpolationMethod } from './interpolation-method.js';
import { TimeEntry, TimeEntryArray } from './time-entry.js';
import { Vector } from './vector.js';
import { ValueArrayType } from './values.js';
import { ValueType } from './values.js';
import { TimestampArray } from './timestamp.js';
/**
 * A rich class representing time series data as a path
 */
export declare class TimeSeriesPath<ThisValueType extends ValueArrayType> {
    interpolationMethod: InterpolationMethod;
    vector: Vector<ThisValueType>;
    quantityKind?: string;
    measurementUnit?: string;
    measurementUnitMultiplier?: number;
    measurementUnitOffset?: number;
    name?: string;
    description?: string;
    expression?: string;
    error?: Error;
    hint?: string;
    constructor(interpolationMethod: InterpolationMethod, quantityKind?: string, measurementUnit?: string, measurementUnitMultiplier?: number, measurementUnitOffset?: number, name?: string, description?: string, expression?: string);
    /**
     * Validates the integrity of the object
     * @returns true if the object is valid, false if it is not
     */
    validate(): boolean;
    /**
     * Creates a shallow copy of the TimeSeriesPath. This is faster, but the objects share properties.
     * @returns A new TimeSeriesPath
     */
    clone(): TimeSeriesPath<ThisValueType>;
    /**
     * Creates a deep copy of the TimeSeriesPath. This will ensure that all objects are recreated with new objects
     * @returns A new TimeSeriesPath
     */
    deepClone(): TimeSeriesPath<ThisValueType>;
    /**
     * Creates and sets a new vector based on the passed in elements
     * @param timestamps
     * @param values
     * @param statuses
     * @returns
     */
    newVectorFromElements(timestamps: TimestampArray, values: ThisValueType, statuses?: Uint32Array): TimeSeriesPath<ThisValueType>;
    /**
     * Creates and sets a new vector based on the passed in array of time entries
     * @param timeEntries
     * @returns
     */
    newVectorFromTimeEntries(timeEntries: TimeEntry<ValueType>[]): TimeSeriesPath<ThisValueType>;
    /**
     * Creates and sets a new vector based on the passed in array of time entry arrays
     * @param timeEntryArrays
     * @returns
     */
    newVectorFromTimeEntryArrays(timeEntryArrays: TimeEntryArray<ValueType>[]): TimeSeriesPath<ThisValueType>;
    /**
     *
     * @returns The current Vector as an array of TimeEntries
     */
    getTimeEntries(): TimeEntry<ValueType>[];
    /**
     * Resamples in place an mutilates the current TimeSeriesPath (this)
     * @param targetTimestamps The timestamps for resampling
     * @returns The current TimeSeriesPath
     */
    mutableResample(targetTimestamps: TimestampArray): TimeSeriesPath<ThisValueType>;
    /**
     * Resamples and returns a new TimeSeriesPath (does not mutilate)
     * @param targetTimestamps The timestamps for resampling
     * @returns A new TimeSeriesPath
     */
    resample(targetTimestamps: TimestampArray): TimeSeriesPath<ThisValueType>;
    /**
     * Performs a Scalar or TimeSeries arithmetic operation on the TimeSeriesPath
     * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
     * @param operand The operand that is used to operate on this
     * @returns
     */
    private arithmeticOperator;
    /**
     * Performs a Scalar or TimeSeries comparison operation on the TimeSeriesPath
     * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
     * @param operand The operand that is used to operate on this
     * @returns
     */
    private comparisonOperator;
    /**
     * Performs a Scalar arithmetic operation on the TimeSeriesPath
     * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
     * @param operand The operand that is used to operate on this
     * @returns
     */
    private arithmeticOperatorScalar;
    /**
     * Performs a Scalar comparison operation on the TimeSeriesPath
     * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
     * @param operand The operand that is used to operate on this
     * @returns
     */
    private comparisonOperatorScalar;
    /**
     * Performs a Time Series arithmetic operation on the TimeSeriesPath
     * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
     * @param operand The operand that is used to operate on this
     * @returns
     */
    private arithmeticOperatorTS;
    add(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    subtract(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    multiply(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    divide(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    pow(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    remainder(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array>;
    lt(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Uint8Array>;
    negate(): TimeSeriesPath<ThisValueType>;
    private static aggregate;
    static sum(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array>;
    static avg(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array>;
    static min(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array>;
    static max(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array>;
    static range(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array>;
}

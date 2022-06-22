import { InterpolationMethod } from './interpolation-method.js';
import { DataType } from './datatype.js';
import { Values } from './values.js';
import { TimeEntry } from './time-entry.js';
import { TimeSegment } from './time-segment.js';
import { Severity } from './severity.js';
import { TimeSeriesVector } from './time-series-vector.js';
interface Samplable {
    mutableResample(targetTimestamps: number[]): TimeSeriesPath;
}
export declare class TimeSeriesPath implements Samplable {
    dataType: DataType;
    interpolationMethod: InterpolationMethod;
    timestamps: number[];
    values: unknown[];
    statuses: Severity[];
    startTimestamp?: number;
    endTimestamp?: number;
    quantityKind?: string;
    measurementUnit?: string;
    measurementUnitMultiplier?: number;
    measurementUnitOffset?: number;
    name?: string;
    description?: string;
    expression?: string;
    error?: Error;
    hint?: string;
    constructor(dataType: DataType, interpolationMethod: InterpolationMethod, startTimestamp?: number, endTimestamp?: number, quantityKind?: string, measurementUnit?: string, measurementUnitMultiplier?: number, measurementUnitOffset?: number, name?: string, description?: string, expression?: string);
    validate(): boolean;
    clone(): TimeSeriesPath;
    deepClone(): TimeSeriesPath;
    setTimeVector(timestamps: number[], values: Values, statuses?: Severity[]): TimeSeriesPath;
    setTimeEntries(timeEntries: TimeEntry[]): TimeSeriesPath;
    getTimeEntries(): TimeEntry[];
    setTimeSegments(timeSegments: TimeSegment[]): TimeSeriesPath;
    getTimeSegments(): TimeSegment[];
    private _resampleNone;
    private _resamplePrevious;
    private _resampleNext;
    private _setResampleValue;
    protected _resampleLinear(targetTimestamps: number[]): TimeSeriesPath;
    mutableResample(targetTimestamps: number[]): TimeSeriesPath;
    resample(targetTimestamps: number[]): TimeSeriesPath;
    private operator;
    private operatorScalar;
    private operatorTS;
    add(arg: unknown): TimeSeriesPath;
    subtract(arg: unknown): TimeSeriesPath;
    multiply(arg: unknown): TimeSeriesPath;
    divide(arg: unknown): TimeSeriesPath;
    pow(arg: unknown): TimeSeriesPath;
    remainder(arg: unknown): TimeSeriesPath;
    lt(arg: unknown): TimeSeriesPath;
    negate(): TimeSeriesPath;
    /**
     * Append adds a first time series path to a second time series path.
     * If there is overlap between the two paths, then the appendedTimeSeriesPath will take precedence
     * @param appendedTimeSeriesPath The time series path that will be added
     * @returns A new time series path
     */
    append(appendedTimeSeriesPath: TimeSeriesVector): TimeSeriesPath;
    /**
     * Will append multiple time series paths together
     * @param appendedTimeSeriesVectors The array of time series paths that shall be appended together
     * @returns A single time series path with all the paths appended together
     */
    static multiAppend(appendedTimeSeriesVectors: TimeSeriesVector[]): TimeSeriesVector;
    /**
     * Split the time series path into one or multiple objects, each object having no more than sliceSize time series entries
     * The last object will contain the remainder time series entries
     * @param sliceSize The maximum number of time series entries in each object
     */
    split(sliceSize: number): TimeSeriesPath[];
    /**
     * Replaces (by inserting) a new time series path into section of the original time series path.
     * Overlapping time ranges in the original time series path will be removed and replaced with the new points
     * @param timeSeriesVector The time series path that shall be inserted into the original time series path
     * @returns A new time series path
     */
    replace(timeSeriesVector: TimeSeriesVector): TimeSeriesPath;
    private static aggregate;
    static sum(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static avg(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static min(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static max(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static range(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
}
export {};

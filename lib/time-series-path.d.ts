import { InterpolationMethod } from './interpolation-method.js';
import { DataType } from './datatype.js';
import { Values } from './values.js';
import { TimeEntry } from './time-entry.js';
import { TimeSegment } from './time-segment.js';
import { Severity } from './severity.js';
import { IndexMode } from './index-mode.js';
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
     * Returns an index value representing the found targetTimestamp
     * Developer note: We could possibly have used Array.findIndex(), but it does not seem to be a good idea on very large arrays such as time series data
     * @param targetTimestamp The timestamp that you are looking for
     * @param mode The type of search
     * @returns The found index number
     */
    forwardFindIndex(targetTimestamp: number, mode?: IndexMode): number;
    append(appendedTimeSeriesPath: TimeSeriesPath): TimeSeriesPath;
    private static aggregate;
    static sum(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static avg(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static min(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static max(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static range(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
}
export {};

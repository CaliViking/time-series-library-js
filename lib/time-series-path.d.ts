import { InterpolationMethod } from "./interpolationmethod";
import { DataType } from "./datatype";
import { Values } from "./values";
import { TimeEntry } from "./time-entry";
import { TimeSegment } from "./time-segment";
export interface Samplable {
    /**
     * resampleable
     * */
    mutableResample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeriesPath;
}
/**
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */
export declare class TimeSeriesPath implements Samplable {
    dataType: DataType;
    interpolationMethod: InterpolationMethod;
    timestamps: DOMHighResTimeStamp[];
    values: any[];
    statuses: number[];
    startTimestamp?: DOMHighResTimeStamp;
    endTimestamp?: DOMHighResTimeStamp;
    quantityKind?: string;
    measurementUnit?: string;
    measurementUnitMultiplier?: number;
    measurementUnitOffset?: number;
    name?: string;
    description?: string;
    expression?: string;
    error?: Error;
    hint?: string;
    /**
     *
     * @param dataType
     * @param interpolationMethod
     * @param startTimestamp
     * @param endTimestamp
     * @param quantityKind
     * @param measurementUnit
     * @param measurementUnitMultiplier
     * @param measurementUnitOffset
     * @param name
     * @param description
     * @param expression
     */
    constructor(dataType: DataType, interpolationMethod: InterpolationMethod, startTimestamp?: DOMHighResTimeStamp, endTimestamp?: DOMHighResTimeStamp, quantityKind?: string, measurementUnit?: string, measurementUnitMultiplier?: number, measurementUnitOffset?: number, name?: string, description?: string, expression?: string);
    validate(): boolean;
    clone(): TimeSeriesPath;
    deepClone(): TimeSeriesPath;
    setTimeVector(timestamps: DOMHighResTimeStamp[], values: Values, statuses: number[]): TimeSeriesPath;
    setTimeEntries(timeEntries: TimeEntry[]): TimeSeriesPath;
    getTimeEntries(): TimeEntry[];
    setTimeSegments(timeSegments: TimeSegment[]): TimeSeriesPath;
    getTimeSegments(): TimeSegment[];
    private _resampleNone;
    private _resamplePrevious;
    private _resampleNext;
    private _setResampleValue;
    protected _resampleLinear(targetTimestamps: number[]): TimeSeriesPath;
    mutableResample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeriesPath;
    resample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeriesPath;
    private operator;
    private operatorScalar;
    private operatorTS;
    add(arg: any): TimeSeriesPath;
    subtract(arg: any): TimeSeriesPath;
    multiply(arg: any): TimeSeriesPath;
    divide(arg: any): TimeSeriesPath;
    pow(arg: any): TimeSeriesPath;
    remainder(arg: any): TimeSeriesPath;
    lt(arg: any): TimeSeriesPath;
    negate(): TimeSeriesPath;
    private static aggregate;
    static sum(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static avg(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static min(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static max(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
    static range(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath;
}

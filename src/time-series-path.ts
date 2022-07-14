/* *
 *
 *  (c) 2022 Niels E. Andersen
 *
 *  License: https://creativecommons.org/licenses/by-nc/4.0/legalcode
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

import { InterpolationMethod } from './interpolation-method.js';
import { TimeEntry, TimeEntryArray } from './time-entry.js';
import { Severity } from './severity.js';
import { BooleanDataType, FloatDataType, StatusesClass, TimestampsClass, ValueArrayType, Vector } from './vector.js';
import { whatsMyType } from './what-is-my-type.js';

/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */

export class TimeSeriesPath<ValueType extends ValueArrayType> {
  //  dataType: DataType;
  interpolationMethod: InterpolationMethod;
  vector: Vector<ValueType>;
  quantityKind?: string;
  measurementUnit?: string;
  measurementUnitMultiplier?: number;
  measurementUnitOffset?: number;
  name?: string;
  description?: string;
  expression?: string;
  error?: Error;
  hint?: string;

  public constructor(
    //    dataType: DataType,
    interpolationMethod: InterpolationMethod,
    quantityKind?: string,
    measurementUnit?: string,
    measurementUnitMultiplier?: number,
    measurementUnitOffset?: number,
    name?: string,
    description?: string,
    expression?: string
  ) {
    //    (this.dataType = dataType),
    this.interpolationMethod = interpolationMethod;
    this.quantityKind = quantityKind;
    this.measurementUnit = measurementUnit;
    this.measurementUnitMultiplier = measurementUnitMultiplier;
    this.measurementUnitOffset = measurementUnitOffset;
    this.name = name;
    this.description = description;
    this.expression = expression;

    this.validate();
  }

  public validate(): boolean {
    // Array lengths
    const arraySizeOK: boolean = this.vector.validate();

    // interpolation methods and data types
    let interpolationMethodOK = false;
    if (this.interpolationMethod === undefined) {
      interpolationMethodOK = false;
    } else {
      switch (whatsMyType(this.vector.dataType)) {
        case 'Float64Array':
          interpolationMethodOK = true;
          break;
        case 'Uint32Array':
        case 'Array':
          if (this.interpolationMethod === InterpolationMethod.linear) {
            interpolationMethodOK = false;
          } else {
            interpolationMethodOK = true;
          }
          break;
      }
    }

    return arraySizeOK && interpolationMethodOK;
  }

  public clone(): TimeSeriesPath<ValueType> {
    return Object.create(this);
  }

  public deepClone(): TimeSeriesPath<ValueType> {
    return structuredClone(this);
  }

  public setTimeVector(
    timestamps: TimestampsClass,
    values: ValueType,
    statuses?: StatusesClass
  ): TimeSeriesPath<ValueType> {
    this.vector = Vector.fromElements(timestamps, values, statuses);
    return this;
  }

  public setTimeEntries(timeEntries: TimeEntry[]): TimeSeriesPath<ValueType> {
    this.vector = Vector.fromTimeEntries(timeEntries) as Vector<ValueType>;
    return this;
  }

  public setTimeEntriesArray(timeEntries: TimeEntryArray[]): TimeSeriesPath<ValueType> {
    this.vector = Vector.fromTimeEntriesArray(timeEntries) as Vector<ValueType>;
    return this;
  }

  public getTimeEntries(): TimeEntry[] {
    return this.vector.getTimeEntries();
  }

  /*  public setTimeSegments(timeSegments: TimeSegment[]): TimeSeriesPath {
    const timestamps: number[] = [];
    let values: unknown[];
    const statuses: Severity[] = [];

    switch (
      this.dataType // TODO: Is this necessary?
    ) {
      case DataType.Date: {
        values = Array<Date>();
        break;
      }
      case DataType.string: {
        values = Array<string>();
        break;
      }
      case DataType.number: {
        values = Array<number>();
        break;
      }
      case DataType.JSON: {
        values = Array<JSON>();
        break;
      }
      default: {
        throw new Error(`Unexpected dataType ${this.dataType}`);
      }
    }

    for (const timeSegment of timeSegments) {
      timestamps.push(timeSegment.t1);
      values.push(timeSegment.v1);
      statuses.push(timeSegment.s1);
    }

    // Push the last segment value
    timestamps.push(timeSegments[timeSegments.length].t2);
    values.push(timeSegments[timeSegments.length].v2);
    statuses.push(timeSegments[timeSegments.length].s2);

    this.timestamps = timestamps;
    this.values = values;
    this.statuses = statuses;

    return this;
  }
*/
  /*  public getTimeSegments(): TimeSegment[] {
    const timeSegments: TimeSegment[] = [];

    for (let i = 0; i + 1 < this.timestamps.length; i++) {
      timeSegments.push({
        t1: this.timestamps[i],
        t2: this.timestamps[i + 1],
        v1: this.values[i],
        v2: this.values[i + 1],
        s1: this.statuses[i],
        s2: this.statuses[i + 1],
      });
    }

    return timeSegments;
  }
*/
  public mutableResample(targetTimestamps: TimestampsClass): TimeSeriesPath<ValueType> {
    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        this.vector = this.vector._resampleNone(targetTimestamps);
        return this;
      }
      case InterpolationMethod.previous: {
        this.vector = this.vector._resamplePrevious(targetTimestamps);
        return;
        this;
      }
      case InterpolationMethod.next: {
        this.vector = this.vector._resampleNext(targetTimestamps);
        return this;
      }
      case InterpolationMethod.linear: {
        this.vector = this.vector._resampleLinear(targetTimestamps);
        return this;
      }
    }
  }

  public resample(targetTimestamps: TimestampsClass): TimeSeriesPath<ValueType> {
    const returnTimeSeriesPeriod: TimeSeriesPath<ValueType> = this.deepClone();

    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        returnTimeSeriesPeriod.vector = this.vector._resampleNone(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.previous: {
        returnTimeSeriesPeriod.vector = this.vector._resamplePrevious(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.next: {
        returnTimeSeriesPeriod.vector = this.vector._resampleNext(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.linear: {
        returnTimeSeriesPeriod.vector = this.vector._resampleLinear(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
    }
  }

  private arithmeticOperator(operator: string, arg: unknown): TimeSeriesPath<Float64Array> {
    let returnTimeSeriesPeriod: TimeSeriesPath<Float64Array>;
    switch (typeof arg) {
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string': {
        returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, arg);
        break;
      }
      case 'object': {
        if (arg === null) {
          returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, arg);
        } else if (arg instanceof TimeSeriesPath) {
          returnTimeSeriesPeriod = this.arithmeticOperatorTS(operator, arg);
        } else {
          throw new Error(`Unexpected arg ${arg}`);
        }
        break;
      }
      default: {
        throw new Error(`Unexpected operator ${operator}`);
      }
    }
    return returnTimeSeriesPeriod;
  }

  private comparisonOperator(operator: string, arg: unknown): TimeSeriesPath<Uint8Array> {
    let returnTimeSeriesPeriod: TimeSeriesPath<Uint8Array>;
    switch (typeof arg) {
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string': {
        returnTimeSeriesPeriod = this.comparisonOperatorScalar(operator, arg);
        break;
      }
      case 'object': {
        if (arg === null) {
          returnTimeSeriesPeriod = this.comparisonOperatorScalar(operator, arg);
        } else if (arg instanceof TimeSeriesPath) {
          throw Error(`function comparisonOperatorTS not implemented`);
          // returnTimeSeriesPeriod = this.comparisonOperatorTS(operator, arg);
        } else {
          throw new Error(`Unexpected arg ${arg}`);
        }
        break;
      }
      default: {
        throw new Error(`Unexpected operator ${operator}`);
      }
    }
    return returnTimeSeriesPeriod;
  }

  private arithmeticOperatorScalar(operator: string, arg: unknown): TimeSeriesPath<Float64Array> {
    let thisTimeSeriesPeriod: TimeSeriesPath<Float64Array>; // = this.deepClone();

    if (arg === null) {
      thisTimeSeriesPeriod = new TimeSeriesPath<Float64Array>(this.interpolationMethod);
      thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
      thisTimeSeriesPeriod.vector = thisTimeSeriesPeriod.vector.setBad();
    } else {
      // Arithmetic operators
      switch (operator) {
        case '+': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) + (arg as number);
          }
          break;
        }
        case '-': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) - (arg as number);
          }
          break;
        }
        case '*': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) * (arg as number);
          }
          break;
        }
        case '/': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) / (arg as number);
          }
          break;
        }
        case '**': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] =
              (thisTimeSeriesPeriod.vector.values[i] as number) ** (arg as number);
          }
          break;
        }
        case '%': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) % (arg as number);
          }
          break;
        }
      }
    }

    return thisTimeSeriesPeriod;
  }

  private comparisonOperatorScalar(operator: string, arg: unknown): TimeSeriesPath<Uint8Array> {
    let thisTimeSeriesPeriod: TimeSeriesPath<Uint8Array>;

    if (arg === null) {
      thisTimeSeriesPeriod = new TimeSeriesPath<Uint8Array>(InterpolationMethod.none);
      thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
      thisTimeSeriesPeriod.vector = thisTimeSeriesPeriod.vector.setBad();
    } else {
      // Comparison operator
      switch (operator) {
        case '<': {
          thisTimeSeriesPeriod.vector = new Vector<Uint8Array>(
            BooleanDataType,
            thisTimeSeriesPeriod.vector.timestamps.length
          ); // dataType = DataType.boolean;
          thisTimeSeriesPeriod.interpolationMethod = InterpolationMethod.previous;
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (thisTimeSeriesPeriod.vector.values[i] as number) < (arg as number);
          }
          break;
        }
      }
    }

    return thisTimeSeriesPeriod;
  }

  private arithmeticOperatorTS(operator: string, arg: TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    const returnTimeSeriesPath = new TimeSeriesPath<Float64Array>(this.interpolationMethod);

    // Create a unique array of all the timestamps
    const targetTimestamps: TimestampsClass = Object.assign(
      new TimestampsClass(),
      TimestampsClass.from([
        ...new Set(this.vector.timestamps.combine(arg.vector.timestamps).sort((a, b) => a.valueOf() - b.valueOf())),
      ])
    );
    // Arithmetic Operators only work on numbers
    const targetVector = new Vector<Float64Array>(FloatDataType, targetTimestamps.length);
    targetVector.timestamps = targetTimestamps;

    const thisTimeSeriesPeriod = this.resample(targetTimestamps);
    const argTimeSeriesPeriod = arg.resample(targetTimestamps);

    switch (operator) {
      case '+': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) + (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
      case '-': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) - (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
      case '*': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) * (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
      case '/': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) / (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
      case '**': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) ** (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
      case '%': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetVector.values[i] =
            (thisTimeSeriesPeriod.vector.values[i] as number) % (argTimeSeriesPeriod.vector.values[i] as number);
          targetVector.statuses[i] =
            thisTimeSeriesPeriod.vector.statuses[i] > argTimeSeriesPeriod.vector.statuses[i]
              ? thisTimeSeriesPeriod.vector.statuses[i]
              : argTimeSeriesPeriod.vector.statuses[i];
        }
        break;
      }
    }

    returnTimeSeriesPath.vector = targetVector;

    return returnTimeSeriesPath;
  }

  public add(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('+', arg);
  }

  public subtract(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('-', arg);
  }

  public multiply(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('*', arg);
  }

  public divide(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('/', arg);
  }

  public pow(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('**', arg);
  }

  public remainder(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    return this.arithmeticOperator('%', arg);
  }

  public lt(arg: number | TimeSeriesPath<Float64Array>): TimeSeriesPath<Uint8Array> {
    return this.comparisonOperator('<', arg);
  }

  public negate(): TimeSeriesPath<ValueType> {
    const thisTimeSeriesPeriod = this.deepClone();
    let index = 0;

    for (index = 0; index < (thisTimeSeriesPeriod.vector.values as ValueType).length; index++) {
      thisTimeSeriesPeriod.vector.values[index] = -(thisTimeSeriesPeriod.vector.values[index] as number);
    }

    return thisTimeSeriesPeriod;
  }

  // TODO: Implement map, filter, reduce
  // Ideally this would be aware of interpolation so that it would use an iterated object of segments, or double segments

  //   private static generateCyclicTimeSeriesData(
  //     startTimestamp: number,
  //     endTimestamp: number,
  //     sampleInterval: number,
  //     shape: 'sine' | 'square' | 'sawtooth' | 'triangle',
  //     waveLength: number,
  //     minValue?: number = 0,
  //     maxValue?: number = 1
  //   ): TimeSeriesPath {
  //     // Create an array with all the timestamps
  //     const numEntries: number = Math.floor((endTimestamp - startTimestamp) / sampleInterval);
  //     const targetTimestamps: number[] = Array.from(Array(numEntries).keys()).map(
  //       (index) => index * sampleInterval + startTimestamp
  //     );
  //     let targetValues: number[] = Array(numEntries);
  //     const targetStatuses: Severity[] = Array(numEntries);
  //     const interimTimeSeriesPeriods: TimeSeriesPath[] = [];
  //     const returnTimeSeriesPeriod: TimeSeriesPath = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);

  //     switch (shape) {
  //       case 'sine':
  //         targetValues = Array.from(targetTimestamps.values()).map((timestamp) =>
  //           (Math.sin((((timestamp - startTimestamp) % sampleInterval) / sampleInterval) * 2 * Math.PI) + (-1 + minValue))
  //         );
  //         break;
  //       case 'square':
  //       case 'sawtooth':
  //       case 'triangle':
  //     }
  //   }

  private static aggregate<ValueType extends ValueArrayType>(
    method: string,
    timeSeriesPeriods: TimeSeriesPath<ValueType>[]
  ): TimeSeriesPath<ValueType> {
    let targetTimestamps: TimestampsClass = new TimestampsClass();
    const interimTimeSeriesPeriods: TimeSeriesPath<ValueType>[] = [];
    const returnTimeSeriesPeriod: TimeSeriesPath<ValueType> = new TimeSeriesPath<ValueType>(InterpolationMethod.linear);

    // Get all unique timestamps
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      targetTimestamps = targetTimestamps.combine(timeSeriesPeriod.vector.timestamps);
    }

    const vector = new Vector(FloatDataType, targetTimestamps.length);
    vector.timestamps = targetTimestamps;

    // Resample
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      interimTimeSeriesPeriods.push(timeSeriesPeriod.resample(targetTimestamps));
    }

    switch (method) {
      case 'sum': {
        for (let timeIndex = 0; timeIndex < vector.timestamps.length; timeIndex++) {
          let aggValue = 0;
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue += interimTimeSeriesPeriod.vector.values[timeIndex] as number;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.vector.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.vector.statuses[timeIndex];
          }
          vector.values[timeIndex] = aggValue;
          vector.statuses[timeIndex] = aggStatus;
        }
        break;
      }
      case 'avg': {
        for (let timeIndex = 0; timeIndex < vector.timestamps.length; timeIndex++) {
          let aggValue = 0;
          let aggStatus = Severity.Good;
          let aggCount = 0;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue += interimTimeSeriesPeriod.vector.values[timeIndex] as number;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.vector.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.vector.statuses[timeIndex];
            aggCount += interimTimeSeriesPeriod.vector.values[timeIndex] ? 1 : 0;
          }
          vector.values[timeIndex] = aggValue / aggCount;
          vector.statuses[timeIndex] = aggStatus;
        }
        break;
      }
      case 'min': {
        for (let timeIndex = 0; timeIndex < vector.timestamps.length; timeIndex++) {
          let aggValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex];
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue =
              (interimTimeSeriesPeriod.vector.values[timeIndex] as number) < (aggValue as number)
                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                : aggValue;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.vector.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.vector.statuses[timeIndex];
          }
          vector.values[timeIndex] = aggValue;
          vector.statuses[timeIndex] = aggStatus;
        }
        break;
      }
      case 'max': {
        for (let timeIndex = 0; timeIndex < vector.timestamps.length; timeIndex++) {
          let aggValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex];
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue = // If aggValue is undefined, then take the first value, else take the max value
              (interimTimeSeriesPeriod.vector.values[timeIndex] as number) > (aggValue as number)
                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                : aggValue;
            aggStatus =
              aggStatus < interimTimeSeriesPeriod.vector.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.vector.statuses[timeIndex];
          }
          vector.values[timeIndex] = aggValue;
          vector.statuses[timeIndex] = aggStatus;
        }
        break;
      }
      case 'range': {
        for (let timeIndex = 0; timeIndex < vector.timestamps.length; timeIndex++) {
          let aggMinValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex];
          let aggMaxValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex];
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggMinValue = // If aggValue is undefined, then take the first value, else take the min value
              (interimTimeSeriesPeriod.vector.values[timeIndex] as number) < (aggMinValue as number)
                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                : aggMinValue;
            aggMaxValue = // If aggValue is undefined, then take the first value, else take the max value
              (interimTimeSeriesPeriod.vector.values[timeIndex] as number) > (aggMaxValue as number)
                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                : aggMaxValue;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.vector.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.vector.statuses[timeIndex];
          }
          vector.values[timeIndex] = aggMaxValue - aggMinValue;
          vector.statuses[timeIndex] = aggStatus;
        }
        break;
      }
    }
    returnTimeSeriesPeriod.vector = vector;

    return returnTimeSeriesPeriod;
  }

  static sum(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array> {
    return this.aggregate('sum', timeSeriesPeriods);
  }

  static avg(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array> {
    return this.aggregate('avg', timeSeriesPeriods);
  }

  static min(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array> {
    return this.aggregate('min', timeSeriesPeriods);
  }

  static max(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array> {
    return this.aggregate('max', timeSeriesPeriods);
  }

  static range(timeSeriesPeriods: TimeSeriesPath<Float64Array>[]): TimeSeriesPath<Float64Array> {
    return this.aggregate('range', timeSeriesPeriods);
  }

  /*
    public upsample(interval: number | timeSeriesObject | number[] | number[], anchorTimestamp?: number | number): timeSeriesObject {
        return new timeSeriesObject;
    }

    public downsample(interval: number | timeSeriesObject | number[] | number[], anchorTimestamp?: number | number): timeSeriesObject {
        return new timeSeriesObject;
    }

    public aggregate(interval: number | timeSeriesObject | number[] | number[], anchorTimestamp?: number | number): timeSeriesObject {
        return new timeSeriesObject;
    }

    public add(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }

    public subtract(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    public multiply(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    public divide(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    public floor(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    public subtract(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    */
}

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
import { DataType } from './datatype.js';
import { Values } from './values.js';
import { TimeEntry } from './time-entry.js';
import { TimeSegment } from './time-segment.js';
import { StatusType } from './status-type.js';

interface Samplable {
  /*
   * resampleable
   */
  mutableResample(targetTimestamps: Date[]): TimeSeriesPath;
  // downsample(targetTimestamps: Date[]): this;
  // upsample(targetTimestamps: Date[]): this;
}

/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */

export class TimeSeriesPath implements Samplable {
  dataType: DataType;
  interpolationMethod: InterpolationMethod;
  timestamps: Date[] = [];
  values: unknown[] = [];
  statuses: StatusType[] = [];
  startTimestamp?: Date;
  endTimestamp?: Date;
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
    dataType: DataType,
    interpolationMethod: InterpolationMethod,
    startTimestamp?: Date,
    endTimestamp?: Date,
    quantityKind?: string,
    measurementUnit?: string,
    measurementUnitMultiplier?: number,
    measurementUnitOffset?: number,
    name?: string,
    description?: string,
    expression?: string
  ) {
    (this.dataType = dataType),
      (this.interpolationMethod = interpolationMethod),
      (this.startTimestamp = startTimestamp),
      (this.endTimestamp = endTimestamp),
      (this.quantityKind = quantityKind),
      (this.measurementUnit = measurementUnit),
      (this.measurementUnitMultiplier = measurementUnitMultiplier),
      (this.measurementUnitOffset = measurementUnitOffset),
      (this.name = name),
      (this.description = description),
      (this.expression = expression);

    switch (this.dataType) {
      case 'Date': {
        this.values = Array<Date>();
        break;
      }
      case 'string': {
        this.values = Array<string>();
        break;
      }
      case 'number': {
        this.values = Array<number>();
        break;
      }
      case 'JSON': {
        this.values = Array<JSON>();
        break;
      }
    }

    this.validate();
  }

  public validate(): boolean {
    // Array lengths
    // interpolation methods and data types
    const arraySizeOK: boolean =
      this.timestamps.length === this.values.length &&
      this.timestamps.length === this.statuses.length;
    let interpolationMethodOK = false;

    if (this.interpolationMethod === undefined) {
      interpolationMethodOK = false;
    } else {
      switch (this.dataType) {
        case 'number':
        case 'Date': {
          interpolationMethodOK = true;
          break;
        }
        case 'JSON':
        case 'string': {
          if (this.interpolationMethod === 'linear') {
            interpolationMethodOK = false;
          } else {
            interpolationMethodOK = true;
          }
          break;
        }
      }
    }

    return arraySizeOK && interpolationMethodOK;
  }

  public clone(): TimeSeriesPath {
    const cloneTimeSeriesPeriod = new (this.constructor as new () => TimeSeriesPath)();
    Object.assign(cloneTimeSeriesPeriod, this);

    return cloneTimeSeriesPeriod;
  }

  public deepClone(): TimeSeriesPath {
    const cloneTimeSeriesPeriod: TimeSeriesPath = this.clone();
    cloneTimeSeriesPeriod.timestamps = Array.from(this.timestamps);
    cloneTimeSeriesPeriod.values = Array.from(this.values);
    cloneTimeSeriesPeriod.statuses = Array.from(this.statuses);

    return cloneTimeSeriesPeriod;
  }

  public setTimeVector(
    timestamps: Date[],
    values: Values,
    statuses?: StatusType[]
  ): TimeSeriesPath {
    this.timestamps = timestamps;
    this.values = values;
    this.statuses = statuses ?? new Array(timestamps.length).fill(StatusType.Good);

    return this;
  }

  public setTimeEntries(timeEntries: TimeEntry[]): TimeSeriesPath {
    const timestamps: Date[] = [];
    let values: unknown[];
    const statuses: StatusType[] = [];

    switch (
      this.dataType // TODO: Is this necessary?
    ) {
      case 'Date': {
        values = Array<Date>();
        break;
      }
      case 'string': {
        values = Array<string>();
        break;
      }
      case 'number': {
        values = Array<number>();
        break;
      }
      case 'JSON': {
        values = Array<JSON>();
        break;
      }
      default: {
        throw new Error(`Unexpected dataType ${this.dataType}`);
      }
    }

    for (const timeEntry of timeEntries) {
      timestamps.push(timeEntry.t);
      values.push(timeEntry.v);
      statuses.push(timeEntry.s ?? StatusType.Good);
    }

    this.timestamps = timestamps;
    this.values = values;
    this.statuses = statuses;

    return this;
  }

  public getTimeEntries(): TimeEntry[] {
    const timeEntries: TimeEntry[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
    }

    return timeEntries;
  }

  public setTimeSegments(timeSegments: TimeSegment[]): TimeSeriesPath {
    const timestamps: Date[] = [];
    let values: unknown[];
    const statuses: StatusType[] = [];

    switch (
      this.dataType // TODO: Is this necessary?
    ) {
      case 'Date': {
        values = Array<Date>();
        break;
      }
      case 'string': {
        values = Array<string>();
        break;
      }
      case 'number': {
        values = Array<number>();
        break;
      }
      case 'JSON': {
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

  public getTimeSegments(): TimeSegment[] {
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

  private _resampleNone(targetTimestamps: Date[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: StatusType[] = [];
    let indexObjectTs = 0;
    let indexTargetTs = 0;
    let found: boolean;

    while (indexTargetTs < targetTimestamps.length) {
      // while we need to find all the target timestamps
      found = false;
      while (
        indexObjectTs < this.timestamps.length && // while we are still in the array
        this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
      ) {
        if (this.timestamps[indexObjectTs] === targetTimestamps[indexTargetTs]) {
          // The object timestamp is equal to the current timestamp
          found = true;
          break;
        }
        if (
          indexObjectTs + 1 < this.timestamps.length && // Stay in the array
          this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]
        ) {
          indexObjectTs++;
        } else {
          break;
        }
      }

      // The current object timestamp is the one we need to use
      this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

      indexTargetTs++;
    }
    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _resamplePrevious(targetTimestamps: Date[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: StatusType[] = [];
    let indexObjectTs = 0;
    let indexTargetTs = 0;
    let found: boolean;

    while (indexTargetTs < targetTimestamps.length) {
      // while we need to find all the target timestamps
      found = false;
      while (
        indexObjectTs < this.timestamps.length && // while we are still in the array
        this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
      ) {
        if (
          this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
          !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
        ) {
          // We have a match
          found = true;
          break;
        }
        if (
          indexObjectTs + 1 < this.timestamps.length && // Stay in the array
          this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]
        ) {
          indexObjectTs++;
        } else {
          break;
        }
      }

      // The current object timestamp is the one we need to use
      this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

      indexTargetTs++;
    }
    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _resampleNext(targetTimestamps: Date[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: StatusType[] = [];
    let indexObjectTs = 0;
    let indexTargetTs = 0;
    let found = false;

    while (indexTargetTs < targetTimestamps.length) {
      // we need to find all the target timestamps
      while (
        indexObjectTs < this.timestamps.length && // we are still in the array
        !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // Don't even start looping if we are past the target timestamp
      ) {
        if (
          this.timestamps[indexObjectTs] >= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
          !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // The previous object timestamp is not after or equal to the target timestamp
        ) {
          // We have a match
          found = true;
          break;
        }
        if (
          indexObjectTs + 1 < this.timestamps.length && // Stay in the array
          this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs]
        ) {
          indexObjectTs++;
        } else {
          break;
        }
      }

      // The current object timestamp is the one we need to use
      this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

      indexTargetTs++;
    }

    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _setResampleValue(
    found: boolean,
    targetValues: unknown[],
    indexObjectTs: number,
    targetStatuses: StatusType[]
  ) {
    if (found) {
      targetValues.push(this.values[indexObjectTs]);
      targetStatuses.push(this.statuses[indexObjectTs]);
    } else {
      // We did not find a match
      targetValues.push(null);
      targetStatuses.push(StatusType.Bad);
    }
  }

  protected _resampleLinear(targetTimestamps: Date[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: StatusType[] = [];
    let indexObjectTs = 0;
    let indexTargetTs = 0;
    let found: boolean;

    while (indexTargetTs < targetTimestamps.length) {
      // we need to find all the target timestamps
      found = false;
      while (
        indexObjectTs < this.timestamps.length && // we are still in the array
        this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs + 1] // The object timestamp is not past the target timestamp
      ) {
        if (
          this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
          !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
        ) {
          // We have a match
          found = true;
          break;
        }
        if (
          indexObjectTs + 1 < this.timestamps.length && // Stay in the array
          this.timestamps[indexObjectTs + 1] >= targetTimestamps[indexTargetTs]
        ) {
          indexObjectTs++;
        } else {
          break;
        }
      }

      // Now the next object timestamp is the one we need to use
      if (found) {
        if (this.timestamps[indexObjectTs + 1] === undefined) {
          targetValues.push(this.values[indexObjectTs]);
          targetStatuses.push(this.statuses[indexObjectTs]); // TODO: Uncertain
        } else {
          targetValues.push(
            (this.values[indexObjectTs] as number) +
              (((this.values[indexObjectTs + 1] as number) -
                (this.values[indexObjectTs] as number)) *
                (targetTimestamps[indexTargetTs].valueOf() -
                  this.timestamps[indexObjectTs].valueOf())) /
                (this.timestamps[indexObjectTs + 1].valueOf() -
                  this.timestamps[indexObjectTs].valueOf())
          );
          targetStatuses.push(
            this.statuses[indexObjectTs] > this.statuses[indexObjectTs + 1]
              ? this.statuses[indexObjectTs]
              : this.statuses[indexObjectTs + 1]
          );
        }
      } else {
        targetValues.push(null);
        targetStatuses.push(StatusType.Bad);
      }

      indexTargetTs++;
    }

    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  public mutableResample(targetTimestamps: Date[]): TimeSeriesPath {
    switch (this.interpolationMethod) {
      case 'none': {
        return this._resampleNone(targetTimestamps);
      }
      case 'previous': {
        return this._resamplePrevious(targetTimestamps);
      }
      case 'next': {
        return this._resampleNext(targetTimestamps);
      }
      case 'linear': {
        return this._resampleLinear(targetTimestamps);
      }
    }
  }

  public resample(targetTimestamps: Date[]): TimeSeriesPath {
    const returnTimeSeriesPeriod: TimeSeriesPath = this.deepClone();

    switch (this.interpolationMethod) {
      case 'none': {
        return returnTimeSeriesPeriod._resampleNone(targetTimestamps);
      }
      case 'previous': {
        return returnTimeSeriesPeriod._resamplePrevious(targetTimestamps);
      }
      case 'next': {
        return returnTimeSeriesPeriod._resampleNext(targetTimestamps);
      }
      case 'linear': {
        return returnTimeSeriesPeriod._resampleLinear(targetTimestamps);
      }
    }
  }

  private operator(operator: string, arg: unknown): TimeSeriesPath {
    let returnTimeSeriesPeriod: TimeSeriesPath;
    switch (typeof arg) {
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string': {
        returnTimeSeriesPeriod = this.operatorScalar(operator, arg);
        break;
      }
      case 'object': {
        if (arg === null) {
          returnTimeSeriesPeriod = this.operatorScalar(operator, arg);
        } else if (arg instanceof TimeSeriesPath) {
          returnTimeSeriesPeriod = this.operatorTS(operator, arg);
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

  private operatorScalar(operator: string, arg: unknown): TimeSeriesPath {
    const thisTimeSeriesPeriod = this.deepClone();

    if (arg === null) {
      thisTimeSeriesPeriod.values.fill(null);
      thisTimeSeriesPeriod.statuses.fill(StatusType.Bad);
    } else {
      switch (operator) {
        case '+': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) + (arg as number);
          }
          break;
        }
        case '-': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) - (arg as number);
          }
          break;
        }
        case '*': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) * (arg as number);
          }
          break;
        }
        case '/': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) / (arg as number);
          }
          break;
        }
        case '**': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) ** (arg as number);
          }
          break;
        }
        case '%': {
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) % (arg as number);
          }
          break;
        }
        case '<': {
          thisTimeSeriesPeriod.dataType = 'boolean';
          thisTimeSeriesPeriod.interpolationMethod = 'previous';
          for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
            thisTimeSeriesPeriod.values[i] =
              (thisTimeSeriesPeriod.values[i] as number) < (arg as number);
          }
          break;
        }
      }
    }

    return thisTimeSeriesPeriod;
  }

  private operatorTS(operator: string, arg: TimeSeriesPath): TimeSeriesPath {
    // Create a unique array of all the timestamps
    const targetTimestamps: Date[] = [
      ...new Set(this.timestamps.concat(arg.timestamps).sort((a, b) => a.valueOf() - b.valueOf())),
    ];
    const targetValues: unknown[] = [];
    const targetStatuses: StatusType[] = [];
    const thisTimeSeriesPeriod = this.resample(targetTimestamps);
    const argTimeSeriesPeriod = arg.resample(targetTimestamps);

    switch (operator) {
      case '+': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) + (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
      case '-': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) - (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
      case '*': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) * (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
      case '/': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) / (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
      case '**': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) ** (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
      case '%': {
        for (let i = 0; i < targetTimestamps.length; i++) {
          targetValues.push(
            (thisTimeSeriesPeriod.values[i] as number) % (argTimeSeriesPeriod.values[i] as number)
          );
          targetStatuses.push(
            thisTimeSeriesPeriod.statuses[i] > argTimeSeriesPeriod.statuses[i]
              ? thisTimeSeriesPeriod.statuses[i]
              : argTimeSeriesPeriod.statuses[i]
          );
        }
        break;
      }
    }

    thisTimeSeriesPeriod.values = targetValues;
    thisTimeSeriesPeriod.statuses = targetStatuses;

    return thisTimeSeriesPeriod;
  }

  public add(arg: unknown): TimeSeriesPath {
    return this.operator('+', arg);
  }

  public subtract(arg: unknown): TimeSeriesPath {
    return this.operator('-', arg);
  }

  public multiply(arg: unknown): TimeSeriesPath {
    return this.operator('*', arg);
  }

  public divide(arg: unknown): TimeSeriesPath {
    return this.operator('/', arg);
  }

  public pow(arg: unknown): TimeSeriesPath {
    return this.operator('**', arg);
  }

  public remainder(arg: unknown): TimeSeriesPath {
    return this.operator('%', arg);
  }

  public lt(arg: unknown): TimeSeriesPath {
    return this.operator('<', arg);
  }

  public negate(): TimeSeriesPath {
    const thisTimeSeriesPeriod = this.deepClone();
    let index = 0;

    for (index = 0; index < thisTimeSeriesPeriod.values.length; index++) {
      thisTimeSeriesPeriod.values[index] = -(thisTimeSeriesPeriod.values[index] as number);
    }

    return thisTimeSeriesPeriod;
  }

  // TODO: Implement map, filter, reduce
  // Ideally this would be aware of interpolation so that it would use an iterated object of segments, or double segments

  //   private static generateCyclicTimeSeriesData(
  //     startTimestamp: Date,
  //     endTimestamp: Date,
  //     sampleInterval: number,
  //     shape: 'sine' | 'square' | 'sawtooth' | 'triangle',
  //     waveLength: number,
  //     minValue?: number = 0,
  //     maxValue?: number = 1
  //   ): TimeSeriesPath {
  //     // Create an array with all the timestamps
  //     const numEntries: number = Math.floor((endTimestamp - startTimestamp) / sampleInterval);
  //     const targetTimestamps: Date[] = Array.from(Array(numEntries).keys()).map(
  //       (index) => index * sampleInterval + startTimestamp
  //     );
  //     let targetValues: number[] = Array(numEntries);
  //     const targetStatuses: StatusType[] = Array(numEntries);
  //     const interimTimeSeriesPeriods: TimeSeriesPath[] = [];
  //     const returnTimeSeriesPeriod: TimeSeriesPath = new TimeSeriesPath('number', 'linear');

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

  private static aggregate(method: string, timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    let targetTimestamps: Date[] = [];
    const targetValues: number[] = [];
    const targetStatuses: StatusType[] = [];
    const interimTimeSeriesPeriods: TimeSeriesPath[] = [];
    const returnTimeSeriesPeriod: TimeSeriesPath = new TimeSeriesPath('number', 'linear');

    // Get all common timestamps
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      targetTimestamps = targetTimestamps.concat(timeSeriesPeriod.timestamps);
    }

    // Sort and remove the duplicates
    targetTimestamps = [...new Set(targetTimestamps.sort((a, b) => a.valueOf() - b.valueOf()))];

    // Resample
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      interimTimeSeriesPeriods.push(timeSeriesPeriod.resample(targetTimestamps));
    }

    switch (method) {
      case 'sum': {
        for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
          let aggValue = 0;
          let aggStatus = StatusType.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue += interimTimeSeriesPeriod.values[timeIndex] as number;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.statuses[timeIndex];
          }
          targetValues.push(aggValue);
          targetStatuses.push(aggStatus);
        }
        break;
      }
      case 'avg': {
        for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
          let aggValue = 0;
          let aggStatus = StatusType.Good;
          let aggCount = 0;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue += interimTimeSeriesPeriod.values[timeIndex] as number;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.statuses[timeIndex];
            aggCount += interimTimeSeriesPeriod.values[timeIndex] ? 1 : 0;
          }
          targetValues.push(aggValue / aggCount);
          targetStatuses.push(aggStatus);
        }
        break;
      }
      case 'min': {
        for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
          let aggValue = interimTimeSeriesPeriods[0].values[timeIndex];
          let aggStatus = StatusType.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue =
              (interimTimeSeriesPeriod.values[timeIndex] as number) < (aggValue as number)
                ? interimTimeSeriesPeriod.values[timeIndex]
                : aggValue;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.statuses[timeIndex];
          }
          targetValues.push(aggValue as number);
          targetStatuses.push(aggStatus);
        }
        break;
      }
      case 'max': {
        for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
          let aggValue = interimTimeSeriesPeriods[0].values[timeIndex];
          let aggStatus = StatusType.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue = // If aggValue is undefined, then take the first value, else take the max value
              (interimTimeSeriesPeriod.values[timeIndex] as number) > (aggValue as number)
                ? interimTimeSeriesPeriod.values[timeIndex]
                : aggValue;
            aggStatus =
              aggStatus < interimTimeSeriesPeriod.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.statuses[timeIndex];
          }
          targetValues.push(aggValue as number);
          targetStatuses.push(aggStatus);
        }
        break;
      }
      case 'range': {
        for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
          let aggMinValue = interimTimeSeriesPeriods[0].values[timeIndex];
          let aggMaxValue = interimTimeSeriesPeriods[0].values[timeIndex];
          let aggStatus = StatusType.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggMinValue = // If aggValue is undefined, then take the first value, else take the min value
              (interimTimeSeriesPeriod.values[timeIndex] as number) < (aggMinValue as number)
                ? interimTimeSeriesPeriod.values[timeIndex]
                : aggMinValue;
            aggMaxValue = // If aggValue is undefined, then take the first value, else take the max value
              (interimTimeSeriesPeriod.values[timeIndex] as number) > (aggMaxValue as number)
                ? interimTimeSeriesPeriod.values[timeIndex]
                : aggMaxValue;
            aggStatus =
              aggStatus > interimTimeSeriesPeriod.statuses[timeIndex]
                ? aggStatus
                : interimTimeSeriesPeriod.statuses[timeIndex];
          }
          targetValues.push((aggMaxValue as number) - (aggMinValue as number));
          targetStatuses.push(aggStatus);
        }
        break;
      }
    }
    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  static sum(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    return this.aggregate('sum', timeSeriesPeriods);
  }

  static avg(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    return this.aggregate('avg', timeSeriesPeriods);
  }

  static min(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    return this.aggregate('min', timeSeriesPeriods);
  }

  static max(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    return this.aggregate('max', timeSeriesPeriods);
  }

  static range(timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    return this.aggregate('range', timeSeriesPeriods);
  }

  /*
    public upsample(interval: number | timeSeriesObject | Date[] | Date[], anchorTimestamp?: Date | Date): timeSeriesObject {
        return new timeSeriesObject;
    }

    public downsample(interval: number | timeSeriesObject | Date[] | Date[], anchorTimestamp?: Date | Date): timeSeriesObject {
        return new timeSeriesObject;
    }

    public aggregate(interval: number | timeSeriesObject | Date[] | Date[], anchorTimestamp?: Date | Date): timeSeriesObject {
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

// const myTS = new TimeSeriesPeriod("number", "linear");    //[1,2,3], [1.1,1.2,1.3],[0,0,0]
// myTS.timestamps = [1,2,3,4];
// myTS.values = [11,12,13,24];
// myTS.statuses = [0,0,0];

// console.log(myTS);
// console.log(myTS.validate());
// console.log(myTS.resample([1,1.4,2,2.1,2.5,3]));

// console.log(myTS.operateOnTSP('+', myTS));

// console.log(myTS.operateOnTSP('-', myTS));
// console.log(myTS.operateOnTSP('*', myTS));
// console.log(myTS.operateOnTSP('**', myTS));

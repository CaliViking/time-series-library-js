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
import { Severity } from './severity.js';
import { IndexMode } from './index-mode.js';
import { TimeSeriesVector } from './time-series-vector.js';
import { forwardFindIndex } from './forward-find-index.js';

interface Samplable {
  /*
   * resampleable
   */
  mutableResample(targetTimestamps: number[]): TimeSeriesPath;
  // downsample(targetTimestamps: number[]): this;
  // upsample(targetTimestamps: number[]): this;
}

/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */

export class TimeSeriesPath implements Samplable {
  dataType: DataType;
  interpolationMethod: InterpolationMethod;
  timestamps: number[] = [];
  values: unknown[] = [];
  statuses: Severity[] = [];
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

  public constructor(
    dataType: DataType,
    interpolationMethod: InterpolationMethod,
    startTimestamp?: number,
    endTimestamp?: number,
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
      case DataType.Date: {
        this.values = Array<Date>();
        break;
      }
      case DataType.string: {
        this.values = Array<string>();
        break;
      }
      case DataType.number: {
        this.values = Array<number>();
        break;
      }
      case DataType.JSON: {
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
        case DataType.number:
        case DataType.Date: {
          interpolationMethodOK = true;
          break;
        }
        case DataType.JSON:
        case DataType.string: {
          if (this.interpolationMethod === InterpolationMethod.linear) {
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
    timestamps: number[],
    values: Values,
    statuses?: Severity[]
  ): TimeSeriesPath {
    this.timestamps = timestamps;
    this.values = values;
    this.statuses = statuses ?? new Array(timestamps.length).fill(Severity.Good);

    return this;
  }

  public setTimeEntries(timeEntries: TimeEntry[]): TimeSeriesPath {
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

    for (const timeEntry of timeEntries) {
      timestamps.push(timeEntry.t);
      values.push(timeEntry.v);
      statuses.push(timeEntry.s ?? Severity.Good);
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

  private _resampleNone(targetTimestamps: number[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: Severity[] = [];
    let objectIndex = 0;
    let targetIndex = 0;
    let found: boolean;

    while (targetIndex < targetTimestamps.length) {
      // while we need to find all the target timestamps
      found = false;
      // Check to see if the target is in the range of the data
      if (
        targetTimestamps[targetIndex] >= this.timestamps[0] &&
        targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]
      ) {
        while (!found) {
          //   objectIndex < this.timestamps.length && // while we are still in the array
          //   this.timestamps[objectIndex] <= targetTimestamps[targetIndex] // Don't even start looping if we are past the target timestamp
          // )
          if (this.timestamps[objectIndex] === targetTimestamps[targetIndex]) {
            // The object timestamp is equal to the current timestamp
            found = true;
          } else if (
            objectIndex + 1 < this.timestamps.length &&
            this.timestamps[objectIndex + 1] <= targetTimestamps[targetIndex]
          ) {
            // Try matching on the next timestamp
            objectIndex++;
          } else {
            break;
          }
        }
      }

      // The current object timestamp is the one we need to use
      this._setResampleValue(found, objectIndex, targetValues, targetStatuses);

      targetIndex++;
    }
    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _resamplePrevious(targetTimestamps: number[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: Severity[] = [];
    let objectIndex = 0;
    let targetIndex = 0;
    let found: boolean;

    while (targetIndex < targetTimestamps.length) {
      // while we need to find all the target timestamps
      found = false;
      // Check to see if the target is in the range of the data
      if (targetTimestamps[targetIndex] >= this.timestamps[0]) {
        while (!found) {
          if (
            targetTimestamps[targetIndex] < this.timestamps[objectIndex + 1] || // The target timestamp is less than the next timestamp
            objectIndex + 1 === this.timestamps.length // We are at the end of the array, there are no more timestamps
          ) {
            // We have a match
            found = true;
          } else if (objectIndex + 1 < this.timestamps.length) {
            // Try matching on the next timestamp
            objectIndex++;
          } else {
            // We have reached the end of available timestamps, exit the while loop
            break;
          }
        }
      }
      // The current object timestamp is the one we need to use
      this._setResampleValue(found, objectIndex, targetValues, targetStatuses);
      targetIndex++;
    }
    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _resampleNext(targetTimestamps: number[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: Severity[] = [];
    let objectIndex = 0;
    let targetIndex = 0;
    let found: boolean;

    while (targetIndex < targetTimestamps.length) {
      // we need to find all the target timestamps
      found = false;
      if (targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]) {
        // There is no next value after the last element
        while (!found) {
          if (
            targetTimestamps[targetIndex] <= this.timestamps[objectIndex] // We have a match
          ) {
            found = true;
          } else if (
            objectIndex + 1 <
            this.timestamps.length // There is still room in the array to search
          ) {
            objectIndex++;
          } else {
            break;
          }
        }
      }

      // The current object timestamp is the one we need to use
      this._setResampleValue(found, objectIndex, targetValues, targetStatuses);
      targetIndex++;
    }

    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  private _setResampleValue(
    found: boolean,
    indexObjectTs: number,
    targetValues: unknown[],
    targetStatuses: Severity[]
  ) {
    if (found) {
      targetValues.push(this.values[indexObjectTs]);
      targetStatuses.push(this.statuses[indexObjectTs]);
    } else {
      // We did not find a match
      targetValues.push(null);
      targetStatuses.push(Severity.Bad);
    }
  }

  protected _resampleLinear(targetTimestamps: number[]): TimeSeriesPath {
    const returnTimeSeriesPeriod = this.clone();
    const targetValues: unknown[] = [];
    const targetStatuses: Severity[] = [];
    let objectIndex = 0;
    let targetIndex = 0;
    let found: boolean;

    while (targetIndex < targetTimestamps.length) {
      // we need to find all the target timestamps
      found = false;
      // Check to see if the target is in the range of the data
      if (
        targetTimestamps[targetIndex] >= this.timestamps[0] &&
        targetTimestamps[targetIndex] <= this.timestamps[this.timestamps.length - 1]
      ) {
        while (!found) {
          if (
            (this.timestamps[objectIndex] <= targetTimestamps[targetIndex] && // The target timestamp is in the range
              targetTimestamps[targetIndex] <= this.timestamps[objectIndex + 1]) || // Inclusive, it is a path
            this.timestamps[objectIndex] === targetTimestamps[targetIndex] // Or it is an exact match
          ) {
            // We have a match
            found = true;
          } else if (objectIndex + 1 < this.timestamps.length) {
            // Try matching on the next timestamp
            objectIndex++;
          } else {
            // We have reached the end of available timestamps, exit the while loop
            break;
          }
        }
      }

      // Now the next object timestamp is the one we need to use
      if (found) {
        if (this.timestamps[objectIndex + 1] === undefined) {
          targetValues.push(this.values[objectIndex]);
          targetStatuses.push(this.statuses[objectIndex]); // TODO: Uncertain
        } else {
          targetValues.push(
            (this.values[objectIndex] as number) +
              (((this.values[objectIndex + 1] as number) - (this.values[objectIndex] as number)) *
                (targetTimestamps[targetIndex].valueOf() -
                  this.timestamps[objectIndex].valueOf())) /
                (this.timestamps[objectIndex + 1].valueOf() -
                  this.timestamps[objectIndex].valueOf())
          );
          targetStatuses.push(
            this.statuses[objectIndex] > this.statuses[objectIndex + 1]
              ? this.statuses[objectIndex]
              : this.statuses[objectIndex + 1]
          );
        }
      } else {
        targetValues.push(null);
        targetStatuses.push(Severity.Bad);
      }

      targetIndex++;
    }

    returnTimeSeriesPeriod.timestamps = targetTimestamps;
    returnTimeSeriesPeriod.values = targetValues;
    returnTimeSeriesPeriod.statuses = targetStatuses;

    return returnTimeSeriesPeriod;
  }

  public mutableResample(targetTimestamps: number[]): TimeSeriesPath {
    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        return this._resampleNone(targetTimestamps);
      }
      case InterpolationMethod.previous: {
        return this._resamplePrevious(targetTimestamps);
      }
      case InterpolationMethod.next: {
        return this._resampleNext(targetTimestamps);
      }
      case InterpolationMethod.linear: {
        return this._resampleLinear(targetTimestamps);
      }
    }
  }

  public resample(targetTimestamps: number[]): TimeSeriesPath {
    const returnTimeSeriesPeriod: TimeSeriesPath = this.deepClone();

    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        return returnTimeSeriesPeriod._resampleNone(targetTimestamps);
      }
      case InterpolationMethod.previous: {
        return returnTimeSeriesPeriod._resamplePrevious(targetTimestamps);
      }
      case InterpolationMethod.next: {
        return returnTimeSeriesPeriod._resampleNext(targetTimestamps);
      }
      case InterpolationMethod.linear: {
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
      thisTimeSeriesPeriod.statuses.fill(Severity.Bad);
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
          thisTimeSeriesPeriod.dataType = DataType.boolean;
          thisTimeSeriesPeriod.interpolationMethod = InterpolationMethod.previous;
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
    const targetTimestamps: number[] = [
      ...new Set(this.timestamps.concat(arg.timestamps).sort((a, b) => a.valueOf() - b.valueOf())),
    ];
    const targetValues: unknown[] = [];
    const targetStatuses: Severity[] = [];
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

  /**
   * Append adds a first time series path to a second time series path.
   * If there is overlap between the two paths, then the appendedTimeSeriesPath will take precedence
   * @param appendedTimeSeriesPath The time series path that will be added
   * @returns A new time series path
   */
  public append(appendedTimeSeriesPath: TimeSeriesVector): TimeSeriesPath {
    const returnTimeSeriesPeriod: TimeSeriesPath = this.clone();

    const foundIndex = forwardFindIndex(
      this.timestamps,
      appendedTimeSeriesPath.timestamps[0],
      IndexMode.Exclusive
    );

    returnTimeSeriesPeriod.timestamps = this.timestamps
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.timestamps);

    returnTimeSeriesPeriod.values = this.values
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.values);

    returnTimeSeriesPeriod.statuses = this.statuses
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.statuses);

    return returnTimeSeriesPeriod;
  }

  /**
   * Will append multiple time series paths together
   * @param appendedTimeSeriesVectors The array of time series paths that shall be appended together
   * @returns A single time series path with all the paths appended together
   */
  public static multiAppend(appendedTimeSeriesVectors: TimeSeriesVector[]): TimeSeriesVector {
    const returnTimeSeriesVector = new TimeSeriesVector();
    if (appendedTimeSeriesVectors.length === 0) {
      return returnTimeSeriesVector;
    } else {
      for (const appendTimeSeriesVector of appendedTimeSeriesVectors) {
        returnTimeSeriesVector.timestamps = returnTimeSeriesVector.timestamps.concat(
          appendTimeSeriesVector.timestamps
        );
        returnTimeSeriesVector.values = returnTimeSeriesVector.values.concat(
          appendTimeSeriesVector.values
        );
        returnTimeSeriesVector.statuses = returnTimeSeriesVector.statuses.concat(
          appendTimeSeriesVector.statuses
        );
      }
      return returnTimeSeriesVector;
    }
  }

  /**
   * Split the time series path into one or multiple objects, each object having no more than sliceSize time series entries
   * The last object will contain the remainder time series entries
   * @param sliceSize The maximum number of time series entries in each object
   */
  public split(sliceSize: number): TimeSeriesPath[] {
    /** An array that will contain all the time series path objects to be returned */
    const returnTimeSeriesPaths: TimeSeriesPath[] = [];

    /** The number of objects that will be created */
    const numberOfObjects = Math.ceil(this.timestamps.length / sliceSize);

    for (let i = 0; i < numberOfObjects; i++) {
      returnTimeSeriesPaths.push(new TimeSeriesPath(this.dataType, this.interpolationMethod));
      returnTimeSeriesPaths[i].timestamps = this.timestamps.slice(
        i * sliceSize,
        (i + 1) * sliceSize
      );
      returnTimeSeriesPaths[i].values = this.values.slice(i * sliceSize, (i + 1) * sliceSize);
      returnTimeSeriesPaths[i].statuses = this.statuses.slice(i * sliceSize, (i + 1) * sliceSize);
    }

    return returnTimeSeriesPaths;
  }

  /**
   * Replaces (by inserting) a new time series path into section of the original time series path.
   * Overlapping time ranges in the original time series path will be removed and replaced with the new points
   * @param timeSeriesVector The time series path that shall be inserted into the original time series path
   * @returns A new time series path
   */
  public replace(timeSeriesVector: TimeSeriesVector): TimeSeriesPath {
    const returnTimeSeriesPeriod: TimeSeriesPath = this.clone();

    const foundStartIndex = forwardFindIndex(
      this.timestamps,
      timeSeriesVector.timestamps[0],
      IndexMode.Exclusive
    );

    const foundEndIndex = forwardFindIndex(
      this.timestamps,
      timeSeriesVector.timestamps[timeSeriesVector.timestamps.length - 1],
      IndexMode.DiscontinuityInclusive
    );

    returnTimeSeriesPeriod.timestamps = this.timestamps
      .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
      .concat(timeSeriesVector.timestamps)
      .concat(this.timestamps.slice(foundEndIndex + 1 ?? this.statuses.length));

    returnTimeSeriesPeriod.values = this.values
      .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
      .concat(timeSeriesVector.values)
      .concat(this.values.slice(foundEndIndex + 1 ?? this.statuses.length));

    returnTimeSeriesPeriod.statuses = this.statuses
      .slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
      .concat(timeSeriesVector.statuses)
      .concat(this.statuses.slice(foundEndIndex + 1 ?? this.statuses.length));

    return returnTimeSeriesPeriod;
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

  private static aggregate(method: string, timeSeriesPeriods: TimeSeriesPath[]): TimeSeriesPath {
    let targetTimestamps: number[] = [];
    const targetValues: number[] = [];
    const targetStatuses: Severity[] = [];
    const interimTimeSeriesPeriods: TimeSeriesPath[] = [];
    const returnTimeSeriesPeriod: TimeSeriesPath = new TimeSeriesPath(
      DataType.number,
      InterpolationMethod.linear
    );

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
          let aggStatus = Severity.Good;
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
          let aggStatus = Severity.Good;
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
          let aggStatus = Severity.Good;
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
          let aggStatus = Severity.Good;
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
          let aggStatus = Severity.Good;
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

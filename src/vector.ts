import { forwardFindIndex, reverseFindIndex } from './find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
import { SliceMode } from './slice-mode.js';
import { ArrayPositions, TimeEntry, TimeEntryArray } from './time-entry.js';
import { whatsMyType } from './what-is-my-type.js';

export class TimestampsClass extends Float64Array {
  slice(start: number, end?: number): TimestampsClass {
    return Object.assign(new TimestampsClass((end ?? this.length) - start), (this as Float64Array).slice(start, end));
  }
  public sortAndRemoveDuplicates(): TimestampsClass {
    return Object.assign(
      new TimestampsClass(),
      TimestampsClass.from([...new Set(this.sort((a, b) => a.valueOf() - b.valueOf()))])
    );
  }

  /**
   * Will combine two time series timestamp arrays
   * @param combineTimestamps The array of new timestamps to combine with
   * @returns A new TimestampsClass array object
   */
  public combine(combineTimestamps: TimestampsClass): TimestampsClass {
    const bigArray = new TimestampsClass(this.length + combineTimestamps.length);
    bigArray.set(this);
    bigArray.set(combineTimestamps, this.length);
    return bigArray.sortAndRemoveDuplicates();
  }
}

export class StatusesClass extends Uint32Array {}

/**
 * UInt8Array is for boolean
 */
export type ValueArrayType = Uint32Array | Float64Array | Uint8Array | string[] | object[];

interface VectorInterface {
  length: number;
  concat(vector: VectorInterface): VectorInterface;
  slice(start: number, end?: number): VectorInterface;
  portion(portionSize: number): VectorInterface[];
}

export class Vector<ValueType extends ValueArrayType> {
  timestamps: TimestampsClass;
  values: unknown;
  statuses: StatusesClass;
  dataType: ValueType;

  constructor(dataType: ValueType, length: number) {
    this.timestamps = new TimestampsClass(length);
    switch (whatsMyType(dataType)) {
      case 'Uint8Array':
        this.values = new Uint8Array(length);
        break;
      case 'Uint32Array':
        this.values = new Uint32Array(length);
        break;
      case 'Float64Array':
        this.values = new Float64Array(length);
        break;
      case 'Array':
        this.values = new Array(length);
        break;
      default:
        throw Error('Invalid dataType');
    }
    this.statuses = new StatusesClass(length);
  }

  public validate(): boolean {
    // Array lengths
    return (
      this.timestamps.length === (this.values as ValueType).length && this.timestamps.length === this.statuses.length
    );
  }

  public setBad(): Vector<ValueType> {
    const vector = new Vector(FloatDataType, this.timestamps.length);
    vector.timestamps.set(this.timestamps);
    switch (whatsMyType(this.dataType)) {
      case 'Uint32Array':
        (vector.values as Uint32Array).fill(null);
        break;
      case 'Uint8Array':
        (vector.values as Uint8Array).fill(null);
        break;
      case 'Float64Array':
        (vector.values as Float64Array).fill(null);
        break;
      // TODO: Other arrays
    }
    vector.statuses.fill(Severity.Bad);
    return vector;
  }

  public static fromElements<ValueType extends ValueArrayType>(
    timestamps: TimestampsClass,
    values: ValueType,
    statuses?: StatusesClass
  ): Vector<ValueType> {
    const returnVector = new Vector<ValueType>(timestamps.length);

    returnVector.timestamps.set(timestamps);
    returnVector.statuses.set(statuses);
    switch (whatsMyType(values)) {
      case 'Uint8Array':
        (returnVector.values as Uint8Array).set(values as Uint8Array);
        break;
      case 'Uint32Array':
        (returnVector.values as Uint32Array).set(values as Uint32Array);
        break;
      case 'Float64Array':
        (returnVector.values as Float64Array).set(values as Float64Array);
        break;
      case 'Array':
        for (let i = 0; i < values.length; i++) {
          returnVector.values[i] = values[i];
        }
        break;
    }
    return returnVector;
  }

  public static fromTimeEntries(timeEntries: TimeEntry[]): Vector<ValueArrayType> {
    if (timeEntries.length === 0) {
      throw Error('Array length is 0');
    }

    let returnVector: Vector<ValueArrayType>;

    switch (whatsMyType(timeEntries[0].v)) {
      case 'number':
        returnVector = new Vector<Float64Array>(timeEntries.length);
        break;
      case 'string':
        returnVector = new Vector<string[]>(timeEntries.length);
        break;
      case 'boolean':
        returnVector = new Vector<Uint8Array>(timeEntries.length);
        break;
      case 'object':
        returnVector = new Vector<object[]>(timeEntries.length);
    }

    for (let i = 0; i < timeEntries.length; i++) {
      returnVector.timestamps[i] = timeEntries[i].t;
      returnVector.values[i] = timeEntries[i].v;
      returnVector.statuses[i] = timeEntries[i].s || 0;
    }
    return returnVector;
  }

  public static fromTimeEntriesArray(timeEntries: TimeEntryArray[]): Vector<ValueArrayType> {
    if (timeEntries.length === 0) {
      throw Error('Array length is 0');
    }

    let returnVector: Vector<ValueArrayType>;

    switch (whatsMyType(timeEntries[0][ArrayPositions.VALUE])) {
      case 'number':
        returnVector = new Vector<Float64Array>(timeEntries.length);
        break;
      case 'string':
        returnVector = new Vector<string[]>(timeEntries.length);
        break;
      case 'boolean':
        returnVector = new Vector<Uint8Array>(timeEntries.length);
        break;
      case 'object':
        returnVector = new Vector<object[]>(timeEntries.length);
    }

    for (let i = 0; i < timeEntries.length; i++) {
      returnVector.timestamps[i] = timeEntries[i][ArrayPositions.TIMESTAMP];
      returnVector.values[i] = timeEntries[i][ArrayPositions.VALUE];
      returnVector.statuses[i] = timeEntries[i][ArrayPositions.STATUS_CODE] || 0;
    }
    return returnVector;
  }

  public getTimeEntries(): TimeEntry[] {
    const timeEntries: TimeEntry[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
    }

    return timeEntries;
  }

  public getTimeEntriesArray(): TimeEntryArray[] {
    const timeEntries: TimeEntryArray[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push([this.timestamps[i], this.values[i], this.statuses[i]]);
    }

    return timeEntries;
  }

  /**
   * Slice the time series vector by cutting off beginning and end
   * @param sliceSize The maximum number of time series entries in each object
   */
  public sliceTime(
    fromTimestamp: number,
    toTimestamp: number = this.timestamps[this.timestamps.length - 1],
    mode: SliceMode = SliceMode.IncludeOverflow
  ): Vector<ValueType> {
    /** An array that will contain all the time series path objects to be returned */
    const foundStartIndex = forwardFindIndex(
      this.timestamps,
      fromTimestamp,
      mode === SliceMode.ExcludeOverflow ? IndexMode.ExcludeOverflow : IndexMode.IncludeOverflow
    );

    const foundEndIndex = reverseFindIndex(
      this.timestamps,
      toTimestamp,
      mode === SliceMode.ExcludeOverflow ? IndexMode.ExcludeOverflow : IndexMode.IncludeOverflow
    );

    return this.slice(foundStartIndex, foundEndIndex + 1);
  }

  public slice(start: number, end?: number): Vector<ValueType> {
    this.timestamps = this.timestamps.slice(start, end);
    this.values = (this.values as ValueType).slice(start, end) as ValueType;
    this.statuses = this.statuses.slice(start, end);
    return this;
  }

  /**
   * Portion (divide) the time series path into one or multiple objects, each object having no more than sliceSize time series entries
   * The last object will contain the remainder time series entries
   * @param portionSize The maximum number of time series entries in each object
   */
  public portion(portionSize: number): Vector<ValueType>[] {
    /** An array that will contain all the time series path objects to be returned */
    const returnTimeSeriesVectors: Vector<ValueType>[] = [];

    /** The number of objects that will be created */
    const numberOfObjects = Math.ceil(this.timestamps.length / portionSize);

    for (let i = 0; i < numberOfObjects; i++) {
      const newVector = this.slice(i * portionSize, (i + 1) * portionSize);
      returnTimeSeriesVectors.push(newVector);
    }

    return returnTimeSeriesVectors;
  }

  /**
   * Concat adds a first time series path to a second time series path.
   * If there is overlap between the two paths, then the concatenatedTimeSeriesPath will take precedence
   * @param concatVector The time series path that will be added
   * @returns A new time series path
   */
  public concat(concatVector: Vector<ValueType>): Vector<ValueType> {
    const newLength = this.timestamps.length + concatVector.timestamps.length;
    const returnVector = new Vector<ValueType>(newLength);

    const foundIndex = forwardFindIndex(this.timestamps, concatVector.timestamps[0], IndexMode.Exclusive);
    const adjustedFoundIndex = foundIndex === null ? 0 : foundIndex + 1;

    returnVector.timestamps.set(this.timestamps.slice(0, adjustedFoundIndex));
    returnVector.timestamps.set(concatVector.timestamps, adjustedFoundIndex);

    switch (whatsMyType(this.dataType)) {
      case 'Uint8Array':
        (returnVector.values as Uint8Array).set((this.values as Uint8Array).slice(0, adjustedFoundIndex));
        (returnVector.values as Uint8Array).set(concatVector.values as Uint8Array, adjustedFoundIndex);
        break;
      case 'Uint32Array':
        (returnVector.values as Uint32Array).set((this.values as Uint32Array).slice(0, adjustedFoundIndex));
        (returnVector.values as Uint32Array).set(concatVector.values as Uint32Array, adjustedFoundIndex);
        break;
      case 'Float64Array':
        (returnVector.values as Float64Array).set((this.values as Float64Array).slice(0, adjustedFoundIndex));
        (returnVector.values as Float64Array).set(concatVector.values as Float64Array, adjustedFoundIndex);
        break;
      case 'Array':
        for (let i = 0; i < adjustedFoundIndex; i++) {
          returnVector.values[i] = this.values[i];
        }
        for (let i = 0; i < concatVector.timestamps.length; i++) {
          returnVector.values[adjustedFoundIndex + i] = concatVector.values[i];
        }
        break;
    }

    returnVector.statuses.set(this.statuses.slice(0, adjustedFoundIndex));
    returnVector.statuses.set(concatVector.statuses, adjustedFoundIndex);

    return returnVector;
  }

  /**
   * Will concat multiple time series paths together
   * @param concatVectors The array of time series paths that shall be concatenated together
   * @returns A single time series path with all the paths concatenated together
   */
  public static multiConcat<ValueType extends ValueArrayType>(concatVectors: Vector<ValueType>[]): Vector<ValueType> {
    const returnVector = new Vector<ValueType>(0);
    if (concatVectors.length === 0) {
      return returnVector;
    } else {
      for (const concatVector of concatVectors) {
        returnVector.concat(concatVector);
      }
      return returnVector;
    }
  }

  public replace(timeSeriesVector: Vector<ValueType>): Vector<ValueType> {
    // If the vector that comes in is empty, then just return what we have, there is nothing to replace
    if (timeSeriesVector.timestamps.length === 0) {
      return this;
    }

    // If the original vector is empty, return the new vector.
    if (this.timestamps.length === 0) {
      return timeSeriesVector;
    }
    const foundStartIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[0], IndexMode.Exclusive);

    const foundEndIndex = forwardFindIndex(
      this.timestamps,
      timeSeriesVector.timestamps[timeSeriesVector.timestamps.length - 1],
      IndexMode.DiscontinuityInclusive
    );

    // Replace it in the middle
    return this.slice(0, foundStartIndex === null ? 0 : foundStartIndex + 1)
      .concat(timeSeriesVector)
      .concat(this.slice(foundEndIndex + 1 ?? this.timestamps.length));
  }

  public _resampleNone(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const vector = new Vector<ValueType>(targetTimestamps.length);
    vector.timestamps = targetTimestamps;
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
      this._setResampleValue(found, objectIndex, vector.values as ValueType, vector.statuses);

      targetIndex++;
    }

    return vector;
  }

  public _resamplePrevious(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const vector = new Vector<ValueType>(targetTimestamps.length);
    vector.timestamps = targetTimestamps;

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
      this._setResampleValue(found, objectIndex, vector.values as ValueType, vector.statuses);

      targetIndex++;
    }

    return vector;
  }

  public _resampleNext(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const vector = new Vector<ValueType>(targetTimestamps.length);
    vector.timestamps = targetTimestamps;

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
      this._setResampleValue(found, objectIndex, vector.values as ValueType, vector.statuses);
      targetIndex++;
    }

    return vector;
  }

  private _setResampleValue(
    found: boolean,
    indexObjectTs: number,
    targetValues: ValueType,
    targetStatuses: StatusesClass
  ) {
    if (found) {
      targetValues[indexObjectTs] = this.values[indexObjectTs];
      targetStatuses[indexObjectTs] = this.statuses[indexObjectTs];
    } else {
      // We did not find a match
      targetValues[indexObjectTs] = null;
      targetStatuses[indexObjectTs] = Severity.Bad;
    }
  }

  public _resampleLinear(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const vector = new Vector<ValueType>(targetTimestamps.length);
    vector.timestamps = targetTimestamps;

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
          vector.values[targetIndex] = this.values[objectIndex];
          vector.statuses[targetIndex] = this.statuses[objectIndex];
        } else {
          vector.values[targetIndex] =
            (this.values[objectIndex] as number) +
            (((this.values[objectIndex + 1] as number) - (this.values[objectIndex] as number)) *
              (targetTimestamps[targetIndex].valueOf() - this.timestamps[objectIndex].valueOf())) /
              (this.timestamps[objectIndex + 1].valueOf() - this.timestamps[objectIndex].valueOf());
          vector.statuses[targetIndex] =
            this.statuses[objectIndex] > this.statuses[objectIndex + 1]
              ? this.statuses[objectIndex]
              : this.statuses[objectIndex + 1];
        }
      } else {
        vector.values[targetIndex] = null;
        vector.values[targetIndex] = Severity.Bad;
      }

      targetIndex++;
    }

    return vector;
  }
}

export let FloatDataType: Float64Array;
export let BooleanDataType: Uint8Array;

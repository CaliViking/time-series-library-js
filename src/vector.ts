import { forwardFindIndex, reverseFindIndex } from './find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
import { SliceMode } from './slice-mode.js';
import { ArrayPositions, TimeEntry, TimeEntryArray } from './time-entry.js';
import { whatsMyType } from './what-is-my-type.js';

export class TimestampsClass extends Float64Array {
  indexSlice(start: number, end?: number): TimestampsClass {
    return Object.assign(new TimestampsClass((end ?? this.length) - start), (this as Float64Array).slice(start, end));
  }
  public sortAndRemoveDuplicates(): TimestampsClass {
    const tempTimestamps = Float64Array.from([...new Set(this.sort((a, b) => a.valueOf() - b.valueOf()))]);
    const returnTimestamps = new TimestampsClass(tempTimestamps.length);
    returnTimestamps.set(tempTimestamps);
    return returnTimestamps;
  }

  /**
   * Will combine two time series timestamp arrays
   * @param combineTimestamps The array of new timestamps to combine with
   * @returns A new TimestampsClass array object
   */
  public combine(combineTimestamps: TimestampsClass): TimestampsClass {
    const combinedTimestamps = new TimestampsClass(this.length + combineTimestamps.length);
    combinedTimestamps.set(this);
    combinedTimestamps.set(combineTimestamps, this.length);
    return combinedTimestamps.sortAndRemoveDuplicates();
  }
}

export class StatusesClass extends Uint32Array {}

/**
 * UInt8Array is for boolean
 */
export type ValueArrayType = Uint32Array | Float64Array | Uint8Array | string[] | object[];

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
export class Vector<ValueType extends ValueArrayType> {
  timestamps: TimestampsClass;
  values: ValueType;
  statuses: StatusesClass;
  dataType: ValueType;

  /**
   * Creates a new Vector.
   * @param config An object that contains: 1. a variable with the data type you want the values array to represent (Float64Array, Uint32Array, Uint8Array, string[], object[], etc).
   * Often represented using the constants NumberDataType, BooleanDataType, StringDataType, ObjectDataType. 2. The length of the Vector.
   */
  constructor(config?: { dataType: ValueType; length: number }) {
    if (config) {
      this.timestamps = new TimestampsClass(config.length);
      switch (whatsMyType(config.dataType)) {
        case 'Uint8Array':
          (this.values as Uint8Array) = new Uint8Array(config.length);
          break;
        case 'Uint32Array':
          (this.values as Uint32Array) = new Uint32Array(config.length);
          break;
        case 'Float64Array':
          (this.values as Float64Array) = new Float64Array(config.length);
          break;
        case 'Array':
          (this.values as unknown[]) = new Array(config.length);
          break;
        default:
          throw Error(`Invalid dataType ${whatsMyType(config.dataType)}`);
      }
      this.statuses = new StatusesClass(config.length);
    }
  }

  /**
   * Creates a completely new Vector that is value-wise identical to the original Vector but share no objects.
   * @returns A new Vector
   */
  public deepClone(): Vector<ValueType> {
    const returnVector = new Vector<ValueType>({ dataType: this.values, length: this.timestamps.length });
    returnVector.set(this);
    return returnVector;
  }

  /**
   * Copies the values across from one Vector to this Vector
   * @param vector The Vector that the current Vector will be set to match.
   */
  public set(vector: Vector<ValueType>): void {
    this.timestamps.set(vector.timestamps);
    this.statuses.set(vector.statuses);
    switch (whatsMyType(vector.values)) {
      case 'Uint8Array':
        (this.values as Uint8Array).set(vector.values as Uint8Array);
        break;
      case 'Uint32Array':
        (this.values as Uint32Array).set(vector.values as Uint32Array);
        break;
      case 'Float64Array':
        (this.values as Float64Array).set(vector.values as Float64Array);
        break;
      case 'Array':
        for (let i = 0; i < vector.values.length; i++) {
          this.values[i] = vector.values[i];
        }
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(vector.values)}`);
    }
  }

  /**
   * Validates that the Vector is valid
   */
  public validate(): boolean {
    // Array lengths
    return (
      this.timestamps?.length === (this.values as ValueType)?.length &&
      this.timestamps?.length === this.statuses?.length
    );
  }

  /**
   * This will create new elements on an existing Vector. Used to reset the Vector.
   * @param length The lengths of the array elements
   * @returns
   */
  public createElements(length: number): Vector<ValueType> {
    this.timestamps = new TimestampsClass(length);
    switch (whatsMyType(this.values)) {
      case 'Uint8Array':
        (this.values as Uint8Array) = new Uint8Array(length);
        break;
      case 'Uint32Array':
        (this.values as Uint32Array) = new Uint32Array(length);
        break;
      case 'Float64Array':
        (this.values as Float64Array) = new Float64Array(length);
        break;
      case 'Array':
        (this.values as unknown[]) = new Array(length);
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
    }
    this.statuses = new StatusesClass(length);
    return this;
  }

  /**
   * Warning, methods with set in the name change the vector. They are mutable.
   * @returns An altered Vector
   */
  public setBad(): Vector<ValueType> {
    switch (whatsMyType(this.values)) {
      case 'Uint32Array':
        (this.values as Uint32Array).fill(NaN);
        break;
      case 'Uint8Array':
        (this.values as Uint8Array).fill(NaN);
        break;
      case 'Float64Array':
        (this.values as Float64Array).fill(NaN);
        break;
      case 'Array':
        for (let i = 0; i < this.values.length; i++) {
          this.values[i] = null;
        }
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
    }
    this.statuses.fill(Severity.Bad);
    return this;
  }

  /**
   * Creates a new vector from the passed in elements (timestamp, value, status)
   * @param timestamps
   * @param values
   * @param statuses
   * @returns A new Vector
   */
  public static fromElements<ValueType extends ValueArrayType>(
    timestamps: TimestampsClass,
    values: ValueType,
    statuses?: StatusesClass
  ): Vector<ValueType> {
    // let dataType: ValueType;
    const returnVector = new Vector({ dataType: values, length: timestamps.length });

    returnVector.timestamps.set(timestamps);
    if (statuses) {
      returnVector.statuses.set(statuses);
    } else {
      returnVector.statuses.fill(0);
    }
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
      default:
        throw Error(`Invalid dataType ${whatsMyType(values)}`);
    }
    return returnVector;
  }

  /**
   * Creates a new vector from an array of time entries [{t,v,s}...{t,v,s}]
   * @param timeEntries in the format [{t,v,s}...{t,v,s}]
   * @returns A new Vector
   */
  public static fromTimeEntries(timeEntries: TimeEntry[]): Vector<ValueArrayType> {
    if (timeEntries.length === 0) {
      throw Error('Unable to tell data type from an array with length 0');
    }

    let returnVector: Vector<ValueArrayType>;

    switch (whatsMyType(timeEntries[0].v)) {
      case 'Number':
        returnVector = new Vector<Float64Array>({ dataType: NumberDataType, length: timeEntries.length });
        break;
      case 'String':
        returnVector = new Vector<string[]>({ dataType: StringDataType, length: timeEntries.length });
        break;
      case 'Boolean':
        returnVector = new Vector<Uint8Array>({ dataType: BooleanDataType, length: timeEntries.length });
        break;
      case 'Object':
        returnVector = new Vector<object[]>({ dataType: ObjectDataType, length: timeEntries.length });
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(timeEntries[0].v)}`);
    }

    for (let i = 0; i < timeEntries.length; i++) {
      returnVector.timestamps[i] = timeEntries[i].t;
      (returnVector.values[i] as unknown) = timeEntries[i].v;
      returnVector.statuses[i] = timeEntries[i].s || 0;
    }
    return returnVector;
  }

  /**
   * Creates a new vector from an array of time entry arrays [[t,v,s]...[t,v,s]]
   * @param timeEntryArrays in the format [[t,v,s]...[t,v,s]]
   * @returns A new Vector
   */
  public static fromTimeEntryArrays(timeEntryArrays: TimeEntryArray[]): Vector<ValueArrayType> {
    if (timeEntryArrays.length === 0) {
      throw Error('Unable to tell data type from an array with length 0');
    }
    let returnVector: Vector<ValueArrayType>;

    switch (whatsMyType(timeEntryArrays[0][ArrayPositions.VALUE])) {
      case 'Number':
        returnVector = new Vector({ dataType: NumberDataType, length: timeEntryArrays.length });
        break;
      case 'String':
        returnVector = new Vector({ dataType: StringDataType, length: timeEntryArrays.length });
        break;
      case 'Boolean':
        returnVector = new Vector({ dataType: BooleanDataType, length: timeEntryArrays.length });
        break;
      case 'Object':
        returnVector = new Vector({ dataType: ObjectDataType, length: timeEntryArrays.length });
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(timeEntryArrays[0][ArrayPositions.VALUE])}`);
    }

    for (let i = 0; i < timeEntryArrays.length; i++) {
      returnVector.timestamps[i] = timeEntryArrays[i][ArrayPositions.TIMESTAMP];
      (returnVector.values[i] as unknown) = timeEntryArrays[i][ArrayPositions.VALUE];
      returnVector.statuses[i] = timeEntryArrays[i][ArrayPositions.STATUS_CODE] || 0;
    }
    return returnVector;
  }

  /**
   *
   * @returns An array of TimeEntry [{t,v,s}...{t,v,s}]
   */
  public getTimeEntries(): TimeEntry[] {
    const timeEntries: TimeEntry[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
    }

    return timeEntries;
  }

  /**
   *
   * @returns An array of TimeEntryArray [[t,v,s]...[t,v,s]]
   */
  public getTimeEntryArrays(): TimeEntryArray[] {
    const timeEntries: TimeEntryArray[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push([this.timestamps[i], this.values[i], this.statuses[i]]);
    }

    return timeEntries;
  }

  /**
   * Slice the time series vector by cutting off beginning and end based on passed in timestamps
   * @param fromTimestamp The from timestamp position
   * @param toTimestamp The to timestamp position
   * @param mode
   * @returns a new Vector created by the underlying slice method
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

  /**
   * Slice the time series vector by cutting off beginning and end based on passed in index positions
   * @param fromIndex The start index position
   * @param toIndex The to index position
   *
   * @returns a new Vector
   */
  public slice(fromIndex: number, toIndex?: number): Vector<ValueType> {
    return Vector.fromElements(
      this.timestamps.indexSlice(fromIndex, toIndex),
      (this.values as ValueType).slice(fromIndex, toIndex) as ValueType,
      this.statuses.slice(fromIndex, toIndex)
    );
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
    if (concatVector.timestamps.length === 0) {
      return this.deepClone();
    }

    /** The place where the original vector will be cut off */
    const cutOffIndex = forwardFindIndex(this.timestamps, concatVector.timestamps[0], IndexMode.Exclusive);
    /** Adjusted for not finding the cut off point, which means that the start of the concatVector is before the start of the original vector */
    const adjustedCutOffIndex = cutOffIndex === null ? 0 : cutOffIndex + 1;

    /** The length of the new vector */
    const newLength = adjustedCutOffIndex + concatVector.timestamps.length;
    /** The vector for storing the results */
    const returnVector = new Vector<ValueType>({ dataType: this.values, length: newLength });

    // Only use the portion of the original vector up to where the cut off is
    if (adjustedCutOffIndex > 0) {
      // This if statement is only there for performance reasons, it avoids copying the whole memory
      returnVector.timestamps.set(this.timestamps.indexSlice(0, adjustedCutOffIndex));
    }
    returnVector.timestamps.set(concatVector.timestamps, adjustedCutOffIndex);

    switch (whatsMyType(this.values)) {
      case 'Uint8Array':
        (returnVector.values as Uint8Array).set((this.values as Uint8Array).slice(0, adjustedCutOffIndex));
        (returnVector.values as Uint8Array).set(concatVector.values as Uint8Array, adjustedCutOffIndex);
        break;
      case 'Uint32Array':
        (returnVector.values as Uint32Array).set((this.values as Uint32Array).slice(0, adjustedCutOffIndex));
        (returnVector.values as Uint32Array).set(concatVector.values as Uint32Array, adjustedCutOffIndex);
        break;
      case 'Float64Array':
        (returnVector.values as Float64Array).set((this.values as Float64Array).slice(0, adjustedCutOffIndex));
        (returnVector.values as Float64Array).set(concatVector.values as Float64Array, adjustedCutOffIndex);
        break;
      case 'Array':
        for (let i = 0; i < adjustedCutOffIndex; i++) {
          returnVector.values[i] = this.values[i];
        }
        for (let i = 0; i < concatVector.timestamps.length; i++) {
          returnVector.values[adjustedCutOffIndex + i] = concatVector.values[i];
        }
        break;
      default:
        throw Error(`Invalid dataType ${whatsMyType(this.values)}`);
    }

    returnVector.statuses.set(this.statuses.slice(0, adjustedCutOffIndex));
    returnVector.statuses.set(concatVector.statuses, adjustedCutOffIndex);

    return returnVector;
  }

  /**
   * Will concat multiple time series paths together
   * @param concatVectors The array of time series paths that shall be concatenated together
   * @returns A single time series path with all the paths concatenated together
   */
  public static multiConcat<ValueType extends ValueArrayType>(concatVectors: Vector<ValueType>[]): Vector<ValueType> {
    if (concatVectors.length === 0) {
      return;
    } else {
      let returnVector = new Vector({ dataType: concatVectors[0].values, length: 0 });
      for (const concatVector of concatVectors) {
        returnVector = returnVector.concat(concatVector);
      }
      return returnVector;
    }
  }

  /**
   * Replaces the section of the existing vector with the time period for the new vector
   * @param timeSeriesVector The new time series vector that will be used to replace the existing
   * @returns A new Vector
   */
  public replace(timeSeriesVector: Vector<ValueType>): Vector<ValueType> {
    // If the vector that comes in is empty, then just return what we have, there is nothing to replace
    if (timeSeriesVector.timestamps.length === 0) {
      return this.deepClone();
    }

    const startIndex = forwardFindIndex(this.timestamps, timeSeriesVector.timestamps[0], IndexMode.Exclusive);
    const adjustedStartIndex = startIndex === null ? 0 : startIndex + 1;

    const endIndex = forwardFindIndex(
      this.timestamps,
      timeSeriesVector.timestamps[timeSeriesVector.timestamps.length - 1],
      IndexMode.DiscontinuityInclusive
    );
    const adjustedEndIndex = endIndex === null ? this.timestamps.length : endIndex + 1;

    // Replace it in the middle
    return this.slice(0, adjustedStartIndex).concat(timeSeriesVector).concat(this.slice(adjustedEndIndex));
  }

  /**
   * Will resample the Vector using the None interpolation method.
   * This method is "semi-private" as the Vector does not know what it's own interpolation method is
   * @param targetTimestamps The timestamps that we will resample to
   * @returns A new Vector
   */
  public _resampleNone(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const returnVector = new Vector<ValueType>({ dataType: this.values, length: targetTimestamps.length });
    returnVector.timestamps = targetTimestamps;
    returnVector.setBad();
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
      this._setResampleValue(found, objectIndex, targetIndex, returnVector.values as ValueType, returnVector.statuses);

      targetIndex++;
    }

    return returnVector;
  }

  public _resamplePrevious(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const returnVector = new Vector<ValueType>({ dataType: this.values, length: targetTimestamps.length });
    returnVector.timestamps = targetTimestamps;
    returnVector.setBad();

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
      this._setResampleValue(found, objectIndex, targetIndex, returnVector.values as ValueType, returnVector.statuses);

      targetIndex++;
    }

    return returnVector;
  }

  public _resampleNext(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
    returnVector.timestamps = targetTimestamps;
    returnVector.setBad();

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
      this._setResampleValue(found, objectIndex, targetIndex, returnVector.values as ValueType, returnVector.statuses);
      targetIndex++;
    }

    return returnVector;
  }

  private _setResampleValue(
    found: boolean,
    objectIndex: number,
    targetIndex: number,
    targetValues: ValueType,
    targetStatuses: StatusesClass
  ) {
    if (found) {
      targetValues[targetIndex] = this.values[objectIndex];
      targetStatuses[targetIndex] = this.statuses[objectIndex];
    } else {
      // We did not find a match
      targetValues[targetIndex] = NaN;
      targetStatuses[targetIndex] = Severity.Bad;
    }
  }

  public _resampleLinear(targetTimestamps: TimestampsClass): Vector<ValueType> {
    const returnVector = new Vector({ dataType: this.values, length: targetTimestamps.length });
    returnVector.timestamps = targetTimestamps;
    returnVector.setBad();

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
          returnVector.values[targetIndex] = this.values[objectIndex];
          returnVector.statuses[targetIndex] = this.statuses[objectIndex];
        } else {
          returnVector.values[targetIndex] =
            (this.values[objectIndex] as number) +
            (((this.values[objectIndex + 1] as number) - (this.values[objectIndex] as number)) *
              (targetTimestamps[targetIndex].valueOf() - this.timestamps[objectIndex].valueOf())) /
              (this.timestamps[objectIndex + 1].valueOf() - this.timestamps[objectIndex].valueOf());
          returnVector.statuses[targetIndex] =
            this.statuses[objectIndex] > this.statuses[objectIndex + 1]
              ? this.statuses[objectIndex]
              : this.statuses[objectIndex + 1];
        }
      } else {
        returnVector.values[targetIndex] = NaN;
        returnVector.statuses[targetIndex] = Severity.Bad;
      }

      targetIndex++;
    }

    return returnVector;
  }
}

export const NumberDataType = new Float64Array();
export const BooleanDataType = new Uint8Array();
export const StringDataType: string[] = [];
export const ObjectDataType: object[] = [];

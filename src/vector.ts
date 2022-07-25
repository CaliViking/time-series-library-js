import { forwardFindIndex, reverseFindIndex } from './find-index.js';
import { IndexMode } from './index-mode.js';
import {
  NumberArrayDataType,
  StringArrayDataType,
  BooleanArrayDataType,
  ObjectArrayDataType,
  ValueArrayType,
} from './values.js';
import { Severity } from './severity.js';
import { SliceMode } from './slice-mode.js';
import { ArrayPositions, TimeEntry, TimeEntryArray } from './time-entry.js';
import { ValueType } from './values.js';
import { whatsMyType } from './what-is-my-type.js';
import { timestamp, TimestampArray } from './timestamp.js';

/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use Typed Arrays where this is possible (performance and space)
 * - I have chosen to use array.push() method to extend arrays (that are not TypedArrays). This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */

/**
 * Takes a set of unordered and duplicated timestamps, sorts them, and removes the duplicates
 * @returns a new array of sorted unique timestamps
 */
export function sortAndRemoveDuplicates(timestamps: TimestampArray): TimestampArray {
  return TimestampArray.from([...new Set(timestamps.sort())]);
}

/**
 * Will combine two time series timestamp arrays
 * @param timestamps1 The first timestamp array
 * @param timestamps2 The second timestamp array
 * @returns The resulting timestamp array
 */
export function combine(timestamps1: TimestampArray, timestamps2: TimestampArray): TimestampArray {
  const combinedTimestamps = new TimestampArray(timestamps1.length + timestamps2.length);
  combinedTimestamps.set(timestamps1);
  combinedTimestamps.set(timestamps2, timestamps1.length);
  return sortAndRemoveDuplicates(combinedTimestamps);
}

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
export class Vector<ThisValueArrayType extends ValueArrayType> {
  timestamps: TimestampArray;
  values: ThisValueArrayType;
  statuses: Uint32Array;

  /**
   * Creates a new Vector.
   * @param config An object that contains: 1. a variable with the data type you want the values array to represent (Float64Array, Uint8Array, string[], object[]).
   * Often represented using the constants NumberArrayDataType, BooleanArrayDataType, StringArrayDataType, ObjectArrayDataType. 2. The length of the Vector.
   */
  constructor(config?: { dataType: ThisValueArrayType; length: number }) {
    if (config) {
      this.timestamps = new TimestampArray(config.length);
      switch (whatsMyType(config.dataType)) {
        case 'Uint8Array':
          (this.values as Uint8Array) = new Uint8Array(config.length);
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
      this.statuses = new Uint32Array(config.length);
    }
  }

  /**
   * Creates a completely new Vector that is value-wise identical to the original Vector but share no objects.
   * @returns A new Vector
   */
  public deepClone(): Vector<ThisValueArrayType> {
    const returnVector = new Vector<ThisValueArrayType>({ dataType: this.values, length: this.timestamps.length });
    returnVector.set(structuredClone(this));
    return returnVector;
  }

  /**
   * Copies the values across from one Vector to this Vector
   * @param vector The Vector that the current Vector will be set to match.
   */
  public set(vector: Vector<ThisValueArrayType>): void {
    this.timestamps.set(vector.timestamps);
    this.statuses.set(vector.statuses);
    switch (whatsMyType(vector.values)) {
      case 'Uint8Array':
        (this.values as Uint8Array).set(vector.values as Uint8Array);
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
      this.timestamps?.length === (this.values as ThisValueArrayType)?.length &&
      this.timestamps?.length === this.statuses?.length
    );
  }

  /**
   * This will create new elements on an existing Vector. Used to reset the Vector.
   * @param length The lengths of the array elements
   * @returns
   */
  public createElements(length: number): Vector<ThisValueArrayType> {
    this.timestamps = new TimestampArray(length);
    switch (whatsMyType(this.values)) {
      case 'Uint8Array':
        (this.values as Uint8Array) = new Uint8Array(length);
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
    this.statuses = new Uint32Array(length);
    return this;
  }

  /**
   * Warning, methods with set in the name change the vector. They are mutable.
   * @returns An altered Vector
   */
  public setBad(): Vector<ThisValueArrayType> {
    switch (whatsMyType(this.values)) {
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
  public static fromElements<ThisValueArrayType extends ValueArrayType>(
    timestamps: TimestampArray,
    values: ThisValueArrayType,
    statuses?: Uint32Array
  ): Vector<ThisValueArrayType> {
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
  public static fromTimeEntries<ThisValueType extends ValueType>(timeEntries: TimeEntry<ThisValueType>[]): Vector<ValueArrayType> {
    if (timeEntries.length === 0) {
      throw Error('Unable to tell data type from an array with length 0');
    }

    let returnVector: Vector<ValueArrayType>;

    switch (typeof timeEntries[0].v) {
      case 'number':
        returnVector = new Vector<Float64Array>({ dataType: NumberArrayDataType, length: timeEntries.length });
        break;
      case 'string':
        returnVector = new Vector<string[]>({ dataType: StringArrayDataType, length: timeEntries.length });
        break;
      case 'boolean':
        returnVector = new Vector<Uint8Array>({ dataType: BooleanArrayDataType, length: timeEntries.length });
        break;
      case 'object':
        returnVector = new Vector<object[]>({ dataType: ObjectArrayDataType, length: timeEntries.length });
        break;
      default:
        throw Error(`Invalid dataType ${typeof timeEntries[0].v}, timeEntries: ${timeEntries.slice(0,2)}`);
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
  public static fromTimeEntryArrays<ThisValueType extends ValueType>(timeEntryArrays: TimeEntryArray<ThisValueType>[]): Vector<ValueArrayType> {
    if (timeEntryArrays.length === 0) {
      throw Error('Unable to tell data type from an array with length 0');
    }
    let returnVector: Vector<ValueArrayType>;

    switch (typeof timeEntryArrays[0][ArrayPositions.VALUE]) {
      case 'number':
        returnVector = new Vector({ dataType: NumberArrayDataType, length: timeEntryArrays.length });
        break;
      case 'string':
        returnVector = new Vector({ dataType: StringArrayDataType, length: timeEntryArrays.length });
        break;
      case 'boolean':
        returnVector = new Vector({ dataType: BooleanArrayDataType, length: timeEntryArrays.length });
        break;
      case 'object':
        returnVector = new Vector({ dataType: ObjectArrayDataType, length: timeEntryArrays.length });
        break;
      default:
        throw Error(`Invalid dataType ${typeof timeEntryArrays[0][ArrayPositions.VALUE]} for timeEntryArrays ${timeEntryArrays.slice(0,2)}`);
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
  public getTimeEntries(): TimeEntry<ValueType>[] {
    const timeEntries: TimeEntry<ValueType>[] = [];

    for (let i = 0; i < this.timestamps.length; i++) {
      timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
    }

    return timeEntries;
  }

  /**
   *
   * @returns An array of TimeEntryArray [[t,v,s]...[t,v,s]]
   */
  public getTimeEntryArrays(): TimeEntryArray<ValueType>[] {
    const timeEntries: TimeEntryArray<ValueType>[] = [];

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
    fromTimestamp: timestamp,
    toTimestamp: timestamp = this.timestamps[this.timestamps.length - 1],
    mode: SliceMode = SliceMode.IncludeOverflow
  ): Vector<ThisValueArrayType> {
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
  public slice(fromIndex: number, toIndex?: number): Vector<ThisValueArrayType> {
    return Vector.fromElements(
      this.timestamps.slice(fromIndex, toIndex),
      (this.values as ThisValueArrayType).slice(fromIndex, toIndex) as ThisValueArrayType,
      this.statuses.slice(fromIndex, toIndex)
    );
  }

  /**
   * Portion (divide, disjoin, or de-concatenate) the time series path into one or multiple objects, each object having no more than sliceSize time series entries
   * The last object will contain the remainder time series entries
   * @param portionSize The maximum number of time series entries in each object
   */
  public portion(portionSize: number): Vector<ThisValueArrayType>[] {
    /** An array that will contain all the time series path objects to be returned */
    const returnTimeSeriesVectors: Vector<ThisValueArrayType>[] = [];

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
  public concat(concatVector: Vector<ThisValueArrayType>): Vector<ThisValueArrayType> {
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
    const returnVector = new Vector<ThisValueArrayType>({ dataType: this.values, length: newLength });

    // Only use the portion of the original vector up to where the cut off is
    if (adjustedCutOffIndex > 0) {
      // This if statement is only there for performance reasons, it avoids copying the whole memory
      returnVector.timestamps.set(this.timestamps.slice(0, adjustedCutOffIndex));
    }
    returnVector.timestamps.set(concatVector.timestamps, adjustedCutOffIndex);

    switch (whatsMyType(this.values)) {
      case 'Uint8Array':
        (returnVector.values as Uint8Array).set((this.values as Uint8Array).slice(0, adjustedCutOffIndex));
        (returnVector.values as Uint8Array).set(concatVector.values as Uint8Array, adjustedCutOffIndex);
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
  public static multiConcat<ThisValueArrayType extends ValueArrayType>(concatVectors: Vector<ThisValueArrayType>[]): Vector<ThisValueArrayType> {
    if (concatVectors === undefined) {
      throw Error(`concatVectors must be defined`);
    }
    if (concatVectors.length === 0) {
      return new Vector<ThisValueArrayType>;
    }
    let returnVector = new Vector({ dataType: concatVectors[0].values, length: 0 });
    for (const concatVector of concatVectors) {
      returnVector = returnVector.concat(concatVector);
    }
    return returnVector;
  }

  /**
   * Replaces the section of the existing vector with the time period for the new vector
   * @param timeSeriesVector The new time series vector that will be used to replace the existing
   * @returns A new Vector
   */
  public replace(timeSeriesVector: Vector<ThisValueArrayType>): Vector<ThisValueArrayType> {
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
   * @param targetTimestamps The timestamps that we will resample to
   * @returns A new Vector
   */
  public resampleNone(targetTimestamps: TimestampArray): Vector<ThisValueArrayType> {
    const returnVector = new Vector<ThisValueArrayType>({ dataType: this.values, length: targetTimestamps.length });
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
      this._setResampleValue(
        found,
        objectIndex,
        targetIndex,
        returnVector.values as ThisValueArrayType,
        returnVector.statuses
      );

      targetIndex++;
    }

    return returnVector;
  }

  /**
   * Will resample the Vector using the Previous interpolation method.
   * @param targetTimestamps The timestamps that we will resample to
   * @returns A new Vector
   */
  public resamplePrevious(targetTimestamps: TimestampArray): Vector<ThisValueArrayType> {
    const returnVector = new Vector<ThisValueArrayType>({ dataType: this.values, length: targetTimestamps.length });
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
      this._setResampleValue(
        found,
        objectIndex,
        targetIndex,
        returnVector.values as ThisValueArrayType,
        returnVector.statuses
      );

      targetIndex++;
    }

    return returnVector;
  }

  /**
   * Will resample the Vector using the Next interpolation method.
   * @param targetTimestamps The timestamps that we will resample to
   * @returns A new Vector
   */
  public resampleNext(targetTimestamps: TimestampArray): Vector<ThisValueArrayType> {
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
      this._setResampleValue(
        found,
        objectIndex,
        targetIndex,
        returnVector.values as ThisValueArrayType,
        returnVector.statuses
      );
      targetIndex++;
    }

    return returnVector;
  }

  /**
   * Sets the resampled value depending on whether it has been found
   * @param found A flag indicating that it has been found
   * @param objectIndex The index of the current object (this)
   * @param targetIndex The index of the object that is being created
   * @param targetValues The array where the resulting values are put into
   * @param targetStatuses The array where the resulting statuses are put into
   */
  private _setResampleValue(
    found: boolean,
    objectIndex: number,
    targetIndex: number,
    targetValues: ThisValueArrayType,
    targetStatuses: Uint32Array
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

  /**
   * Will resample the Vector using the Linear interpolation method.
   * @param targetTimestamps The timestamps that we will resample to
   * @returns A new Vector
   */
  public resampleLinear(targetTimestamps: TimestampArray): Vector<ThisValueArrayType> {
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
              (Number(targetTimestamps[targetIndex] - this.timestamps[objectIndex]) /
              Number(this.timestamps[objectIndex + 1] - this.timestamps[objectIndex])));
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

  /*
    // Returns the floor.
    // Should probably be done with a forEach function. Could be good to implement the full iterable interface on vector
    public floor(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
    public ceil(right: timeSeriesObject | number): timeSeriesObject {
        return new timeSeriesObject;
    }
  */
}

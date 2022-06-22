import { forwardFindIndex } from './forward-find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
import { Values } from './values.js';

/**
 * Three arrays for timestamps, values, and statuses
 */
export class TimeSeriesVector {
  timestamps: number[] = [];
  values: unknown[] = [];
  statuses: Severity[] = [];

  public set(timestamps: number[], values: Values, statuses?: Severity[]) {
    this.timestamps = timestamps;
    this.values = values;
    this.statuses = statuses ?? new Array(timestamps.length).fill(Severity.Good);

    return this;
  }
  /**
   * Split the time series path into one or multiple objects, each object having no more than sliceSize time series entries
   * The last object will contain the remainder time series entries
   * @param sliceSize The maximum number of time series entries in each object
   */
  public split(sliceSize: number): TimeSeriesVector[] {
    /** An array that will contain all the time series path objects to be returned */
    const returnTimeSeriesPaths: TimeSeriesVector[] = [];

    /** The number of objects that will be created */
    const numberOfObjects = Math.ceil(this.timestamps.length / sliceSize);

    for (let i = 0; i < numberOfObjects; i++) {
      const newVector = new TimeSeriesVector();
      newVector.timestamps = this.timestamps.slice(i * sliceSize, (i + 1) * sliceSize);
      newVector.values = this.values.slice(i * sliceSize, (i + 1) * sliceSize);
      newVector.statuses = this.statuses.slice(i * sliceSize, (i + 1) * sliceSize);
      returnTimeSeriesPaths.push(newVector);
    }

    return returnTimeSeriesPaths;
  }

  /**
   * Append adds a first time series path to a second time series path.
   * If there is overlap between the two paths, then the appendedTimeSeriesPath will take precedence
   * @param appendedTimeSeriesPath The time series path that will be added
   * @returns A new time series path
   */
  public append(appendedTimeSeriesPath: TimeSeriesVector): TimeSeriesVector {
    const returnTimeSeriesVector = new TimeSeriesVector();

    const foundIndex = forwardFindIndex(
      this.timestamps,
      appendedTimeSeriesPath.timestamps[0],
      IndexMode.Exclusive
    );

    returnTimeSeriesVector.timestamps = this.timestamps
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.timestamps);

    returnTimeSeriesVector.values = this.values
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.values);

    returnTimeSeriesVector.statuses = this.statuses
      .slice(0, foundIndex === null ? 0 : foundIndex + 1)
      .concat(appendedTimeSeriesPath.statuses);

    return returnTimeSeriesVector;
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
   * Replaces (by inserting) a new time series vector into section of the original time series vector.
   * Overlapping time ranges in the original time series vector will be removed and replaced with the new points
   * @param timeSeriesVector The time series vector that shall be inserted into the original time series path
   * @returns A new time series vector
   */
  public replace(timeSeriesVector: TimeSeriesVector): TimeSeriesVector {
    const returnTimeSeriesPeriod = new TimeSeriesVector();

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
}

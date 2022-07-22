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
import { Vector, combine } from './vector.js';
import { BooleanArrayDataType, ValueArrayType, NumberArrayDataType } from './values.js';
import { whatsMyType } from './what-is-my-type.js';
import { ValueType } from './values.js';
import { TimestampArray } from './timestamp.js';

/**
 * A rich class representing time series data as a path
 */
export class TimeSeriesPath<ThisValueType extends ValueArrayType> {
  //  dataType: DataType;
  interpolationMethod: InterpolationMethod;
  vector: Vector<ThisValueType>;
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

  /**
   * Validates the integrity of the object
   * @returns true if the object is valid, false if it is not
   */
  public validate(): boolean {
    // Validate the vector if there is one, otherwise return false
    if (this.vector) {
      /** The validation of the vector alone */
      const arraySizeOK: boolean = this.vector.validate();

      // Now validate the vector with regards to interpolation methods and data types
      /** The interpolation method is OK */
      let interpolationMethodOK = false;
      if (this.interpolationMethod === undefined) {
        interpolationMethodOK = false;
      } else {
        switch (whatsMyType(this.vector.values)) {
          case 'Float64Array':
            // Float64Array can have any interpolation method
            interpolationMethodOK = true;
            break;
          case 'Uint8Array':
          case 'Array':
            if (this.interpolationMethod === InterpolationMethod.linear) {
              // Other arrays can not have interpolation method linear
              interpolationMethodOK = false;
            } else {
              interpolationMethodOK = true;
            }
            break;
          default:
            throw Error(`Invalid data type: ${whatsMyType(this.vector.values)}`);
        }
      }

      return arraySizeOK && interpolationMethodOK;
    } else {
      return false;
    }
  }

  /**
   * Creates a shallow copy of the TimeSeriesPath. This is faster, but the objects share properties.
   * @returns A new TimeSeriesPath
   */
  public clone(): TimeSeriesPath<ThisValueType> {
    const returnTimeSeriesPath = new TimeSeriesPath<ThisValueType>(this.interpolationMethod);
    Object.assign(returnTimeSeriesPath, { ...this });
    returnTimeSeriesPath.vector = this.vector;
    return returnTimeSeriesPath;
  }

  /**
   * Creates a deep copy of the TimeSeriesPath. This will ensure that all objects are recreated with new objects
   * @returns A new TimeSeriesPath
   */
  public deepClone(): TimeSeriesPath<ThisValueType> {
    const returnTimeSeriesPath = new TimeSeriesPath<ThisValueType>(this.interpolationMethod);
    Object.assign(returnTimeSeriesPath, structuredClone(this));
    returnTimeSeriesPath.vector = this.vector.deepClone();
    return returnTimeSeriesPath;
  }

  /**
   * Creates and sets a new vector based on the passed in elements
   * @param timestamps
   * @param values
   * @param statuses
   * @returns
   */
  public newVectorFromElements(
    timestamps: TimestampArray,
    values: ThisValueType,
    statuses?: Uint32Array
  ): TimeSeriesPath<ThisValueType> {
    this.vector = Vector.fromElements(timestamps, values, statuses);
    return this;
  }

  /**
   * Creates and sets a new vector based on the passed in array of time entries
   * @param timeEntries
   * @returns
   */
  public newVectorFromTimeEntries(timeEntries: TimeEntry<ValueType>[]): TimeSeriesPath<ThisValueType> {
    this.vector = Vector.fromTimeEntries(timeEntries) as Vector<ThisValueType>;
    return this;
  }

  /**
   * Creates and sets a new vector based on the passed in array of time entry arrays
   * @param timeEntryArrays
   * @returns
   */
  public newVectorFromTimeEntryArrays(timeEntryArrays: TimeEntryArray<ValueType>[]): TimeSeriesPath<ThisValueType> {
    this.vector = Vector.fromTimeEntryArrays(timeEntryArrays) as Vector<ThisValueType>;
    return this;
  }

  /**
   *
   * @returns The current Vector as an array of TimeEntries
   */
  public getTimeEntries(): TimeEntry<ValueType>[] {
    return this.vector.getTimeEntries();
  }

  /**
   * Resamples in place an mutilates the current TimeSeriesPath (this)
   * @param targetTimestamps The timestamps for resampling
   * @returns The current TimeSeriesPath
   */
  public mutableResample(targetTimestamps: TimestampArray): TimeSeriesPath<ThisValueType> {
    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        this.vector = this.vector.resampleNone(targetTimestamps);
        return this;
      }
      case InterpolationMethod.previous: {
        this.vector = this.vector.resamplePrevious(targetTimestamps);
        return;
        this;
      }
      case InterpolationMethod.next: {
        this.vector = this.vector.resampleNext(targetTimestamps);
        return this;
      }
      case InterpolationMethod.linear: {
        this.vector = this.vector.resampleLinear(targetTimestamps);
        return this;
      }
      default:
        throw Error(`Unknown interpolation method: ${this.interpolationMethod}`);
    }
  }

  /**
   * Resamples and returns a new TimeSeriesPath (does not mutilate)
   * @param targetTimestamps The timestamps for resampling
   * @returns A new TimeSeriesPath
   */
  public resample(targetTimestamps: TimestampArray): TimeSeriesPath<ThisValueType> {
    const returnTimeSeriesPeriod: TimeSeriesPath<ThisValueType> = this.deepClone();

    switch (this.interpolationMethod) {
      case InterpolationMethod.none: {
        returnTimeSeriesPeriod.vector = this.vector.resampleNone(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.previous: {
        returnTimeSeriesPeriod.vector = this.vector.resamplePrevious(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.next: {
        returnTimeSeriesPeriod.vector = this.vector.resampleNext(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      case InterpolationMethod.linear: {
        returnTimeSeriesPeriod.vector = this.vector.resampleLinear(targetTimestamps);
        return returnTimeSeriesPeriod;
      }
      default:
        throw Error(`Unknown interpolation method: ${this.interpolationMethod}`);
    }
  }

  /**
   * Performs a Scalar or TimeSeries arithmetic operation on the TimeSeriesPath
   * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
   * @param operand The operand that is used to operate on this
   * @returns
   */
  private arithmeticOperator(
    operator: string,
    operand: boolean | number | string | object | TimeSeriesPath<ValueArrayType>
  ): TimeSeriesPath<Float64Array> {
    let returnTimeSeriesPeriod: TimeSeriesPath<Float64Array>;
    switch (typeof operand) {
      case 'boolean':
      case 'number':
      case 'string': {
        returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, operand);
        break;
      }
      case 'object': {
        const argType = whatsMyType(operand);
        const vectorType = whatsMyType((operand as TimeSeriesPath<ValueArrayType>).vector?.values);
        if (operand === null) {
          returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, operand);
        } else if (argType === 'TimeSeriesPath' && vectorType === 'Float64Array') {
          returnTimeSeriesPeriod = this.arithmeticOperatorTS(operator, operand as TimeSeriesPath<Float64Array>);
        } else {
          throw Error(`Unexpected argument type ${argType} and vector type ${vectorType}`);
        }
        break;
      }
      default:
        throw Error(`Unexpected type of argument ${typeof operand}`);
    }
    return returnTimeSeriesPeriod;
  }

  /**
   * Performs a Scalar or TimeSeries comparison operation on the TimeSeriesPath
   * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
   * @param operand The operand that is used to operate on this
   * @returns
   */
  private comparisonOperator(
    operator: string,
    operand: boolean | number | string | object | TimeSeriesPath<ValueArrayType>
  ): TimeSeriesPath<Uint8Array> {
    let returnTimeSeriesPeriod: TimeSeriesPath<Uint8Array>;
    switch (typeof operand) {
      case 'boolean':
      case 'number':
      case 'string': {
        returnTimeSeriesPeriod = this.comparisonOperatorScalar(operator, operand);
        break;
      }
      case 'object': {
        if (operand === null) {
          returnTimeSeriesPeriod = this.comparisonOperatorScalar(operator, operand);
        } else if (operand instanceof TimeSeriesPath) {
          throw Error(`function comparisonOperatorTS not implemented`);
          // returnTimeSeriesPeriod = this.comparisonOperatorTS(operator, arg);
        } else {
          throw Error(`Unexpected arg ${operand}`);
        }
        break;
      }
      default:
        throw Error(`Unexpected type of argument ${typeof operand}`);
    }
    return returnTimeSeriesPeriod;
  }

  /**
   * Performs a Scalar arithmetic operation on the TimeSeriesPath
   * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
   * @param operand The operand that is used to operate on this
   * @returns
   */
  private arithmeticOperatorScalar(
    operator: string,
    operand: boolean | number | string | object
  ): TimeSeriesPath<Float64Array> {
    const thisTimeSeriesPeriod = new TimeSeriesPath<Float64Array>(this.interpolationMethod);
    thisTimeSeriesPeriod.vector = new Vector<Float64Array>({
      dataType: NumberArrayDataType,
      length: this.vector.timestamps.length,
    });
    thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);

    if (operand === null) {
      thisTimeSeriesPeriod.vector.setBad();
    } else {
      // Arithmetic operators
      switch (operator) {
        case '+': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) + (operand as number);
          }
          break;
        }
        case '-': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) - (operand as number);
          }
          break;
        }
        case '*': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) * (operand as number);
          }
          break;
        }
        case '/': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) / (operand as number);
          }
          break;
        }
        case '**': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) ** (operand as number);
          }
          break;
        }
        case '%': {
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] = (this.vector.values[i] as number) % (operand as number);
          }
          break;
        }
        default:
          throw Error(`Unexpected operator ${operator}`);
      }
    }

    return thisTimeSeriesPeriod;
  }

  /**
   * Performs a Scalar comparison operation on the TimeSeriesPath
   * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
   * @param operand The operand that is used to operate on this
   * @returns
   */
  private comparisonOperatorScalar(
    operator: string,
    operand: boolean | number | string | object
  ): TimeSeriesPath<Uint8Array> {
    let thisTimeSeriesPeriod: TimeSeriesPath<Uint8Array>;

    if (operand === null) {
      thisTimeSeriesPeriod = new TimeSeriesPath<Uint8Array>(InterpolationMethod.none);
      thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
      thisTimeSeriesPeriod.vector = thisTimeSeriesPeriod.vector.setBad();
    } else {
      // Comparison operator
      switch (operator) {
        case '<': {
          thisTimeSeriesPeriod.vector = new Vector<Uint8Array>({
            dataType: BooleanArrayDataType,
            length: thisTimeSeriesPeriod.vector.timestamps.length,
          }); // dataType = DataType.boolean;
          thisTimeSeriesPeriod.interpolationMethod = InterpolationMethod.previous;
          for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
            thisTimeSeriesPeriod.vector.values[i] =
              (thisTimeSeriesPeriod.vector.values[i] as number) < (operand as number) ? 1 : 0;
          }
          break;
        }
        default:
          throw Error(`Unexpected operator ${operator}`);
      }
    }

    return thisTimeSeriesPeriod;
  }

  /**
   * Performs a Time Series arithmetic operation on the TimeSeriesPath
   * @param operator The operator that shall be used (JavaScript does not allow operators to be passed as parameters)
   * @param operand The operand that is used to operate on this
   * @returns
   */
  private arithmeticOperatorTS(operator: string, operand: TimeSeriesPath<Float64Array>): TimeSeriesPath<Float64Array> {
    const returnTimeSeriesPath = new TimeSeriesPath<Float64Array>(this.interpolationMethod);

    // Create a unique array of all the timestamps
    const targetTimestamps: TimestampArray = combine(this.vector.timestamps, operand.vector.timestamps);
    // Arithmetic Operators only work on numbers
    const targetVector = new Vector<Float64Array>({ dataType: NumberArrayDataType, length: targetTimestamps.length });
    targetVector.timestamps = targetTimestamps;

    const thisTimeSeriesPeriod = this.resample(targetTimestamps);
    const argTimeSeriesPeriod = operand.resample(targetTimestamps);

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
      default:
        throw Error(`Unexpected operator ${operator}`);
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

  public negate(): TimeSeriesPath<ThisValueType> {
    const thisTimeSeriesPeriod = this.deepClone();
    let index = 0;

    for (index = 0; index < (thisTimeSeriesPeriod.vector.values as ThisValueType).length; index++) {
      thisTimeSeriesPeriod.vector.values[index] = -(thisTimeSeriesPeriod.vector.values[index] as number);
    }

    return thisTimeSeriesPeriod;
  }

  // TODO: Implement map, filter, reduce
  // Ideally this would be aware of interpolation so that it would use an iterated object of segments, or double segments

  private static aggregate<ThisValueType extends ValueArrayType>(
    method: string,
    timeSeriesPeriods: TimeSeriesPath<ThisValueType>[]
  ): TimeSeriesPath<ThisValueType> {
    if (timeSeriesPeriods.length === 0) {
      throw Error('cannot pass 0 length array to aggregate function');
    }
    let targetTimestamps: TimestampArray = new TimestampArray();
    const interimTimeSeriesPeriods: TimeSeriesPath<ThisValueType>[] = [];
    const returnTimeSeriesPeriod: TimeSeriesPath<ThisValueType> = new TimeSeriesPath<ThisValueType>(
      InterpolationMethod.linear
    );

    // Get all unique timestamps
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      targetTimestamps = combine(targetTimestamps, timeSeriesPeriod.vector.timestamps);
    }

    // Resample all the time Series Periods
    for (const timeSeriesPeriod of timeSeriesPeriods) {
      interimTimeSeriesPeriods.push(timeSeriesPeriod.resample(targetTimestamps));
    }

    const vector = new Vector({ dataType: timeSeriesPeriods[0].vector.values, length: targetTimestamps.length });
    vector.timestamps = targetTimestamps;

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
          let aggValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex] as number;
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue = (
              (interimTimeSeriesPeriod.vector.values[timeIndex] as number) < (aggValue as number)
                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                : aggValue
            ) as number;
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
          let aggValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex] as number;
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggValue = // If aggValue is undefined, then take the first value, else take the max value
              (
                (interimTimeSeriesPeriod.vector.values[timeIndex] as number) > (aggValue as number)
                  ? interimTimeSeriesPeriod.vector.values[timeIndex]
                  : aggValue
              ) as number;
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
          let aggMinValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex] as number;
          let aggMaxValue: number = interimTimeSeriesPeriods[0].vector.values[timeIndex] as number;
          let aggStatus = Severity.Good;
          for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
            aggMinValue = // If aggValue is undefined, then take the first value, else take the min value
              (
                (interimTimeSeriesPeriod.vector.values[timeIndex] as number) < (aggMinValue as number)
                  ? interimTimeSeriesPeriod.vector.values[timeIndex]
                  : aggMinValue
              ) as number;
            aggMaxValue = // If aggValue is undefined, then take the first value, else take the max value
              (
                (interimTimeSeriesPeriod.vector.values[timeIndex] as number) > (aggMaxValue as number)
                  ? interimTimeSeriesPeriod.vector.values[timeIndex]
                  : aggMaxValue
              ) as number;
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
    // Combines the existing timestamps and the new timestamps and returns a new object
    public upsample(interval: number | timeSeriesObject | number[] | number[], anchorTimestamp?: number | number): timeSeriesObject {
        return new timeSeriesObject;
    }

    */
}

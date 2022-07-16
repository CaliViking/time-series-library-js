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
import { Severity } from './severity.js';
import { BooleanDataType, NumberDataType, TimestampsClass, Vector } from './vector.js';
import { whatsMyType } from './what-is-my-type.js';
/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */
export class TimeSeriesPath {
    constructor(
    //    dataType: DataType,
    interpolationMethod, quantityKind, measurementUnit, measurementUnitMultiplier, measurementUnitOffset, name, description, expression) {
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
    validate() {
        // Array lengths
        if (this.vector) {
            const arraySizeOK = this.vector.validate();
            // interpolation methods and data types
            let interpolationMethodOK = false;
            if (this.interpolationMethod === undefined) {
                interpolationMethodOK = false;
            }
            else {
                switch (whatsMyType(this.vector.values)) {
                    case 'Float64Array':
                        interpolationMethodOK = true;
                        break;
                    case 'Uint32Array':
                    case 'Array':
                        if (this.interpolationMethod === InterpolationMethod.linear) {
                            interpolationMethodOK = false;
                        }
                        else {
                            interpolationMethodOK = true;
                        }
                        break;
                }
            }
            return arraySizeOK && interpolationMethodOK;
        }
        else {
            return false;
        }
    }
    clone() {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
        Object.assign(returnTimeSeriesPath, Object.assign({}, this));
        returnTimeSeriesPath.vector = this.vector;
        return returnTimeSeriesPath;
    }
    deepClone() {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
        Object.assign(returnTimeSeriesPath, structuredClone(this));
        returnTimeSeriesPath.vector = this.vector.deepClone();
        return returnTimeSeriesPath;
    }
    setTimeVector(timestamps, values, statuses) {
        this.vector = Vector.fromElements(timestamps, values, statuses);
        return this;
    }
    setTimeEntries(timeEntries) {
        this.vector = Vector.fromTimeEntries(timeEntries);
        return this;
    }
    setTimeEntriesArray(timeEntries) {
        this.vector = Vector.fromTimeEntryArrays(timeEntries);
        return this;
    }
    getTimeEntries() {
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
    mutableResample(targetTimestamps) {
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
    resample(targetTimestamps) {
        const returnTimeSeriesPeriod = this.deepClone();
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
    arithmeticOperator(operator, arg) {
        var _a;
        let returnTimeSeriesPeriod;
        const argType = whatsMyType(arg);
        const vectorType = whatsMyType((_a = arg.vector) === null || _a === void 0 ? void 0 : _a.values);
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
                }
                else if (argType === 'TimeSeriesPath' && vectorType === 'Float64Array') {
                    returnTimeSeriesPeriod = this.arithmeticOperatorTS(operator, arg);
                }
                else {
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
    comparisonOperator(operator, arg) {
        let returnTimeSeriesPeriod;
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
                }
                else if (arg instanceof TimeSeriesPath) {
                    throw Error(`function comparisonOperatorTS not implemented`);
                    // returnTimeSeriesPeriod = this.comparisonOperatorTS(operator, arg);
                }
                else {
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
    arithmeticOperatorScalar(operator, arg) {
        const thisTimeSeriesPeriod = new TimeSeriesPath(this.interpolationMethod);
        thisTimeSeriesPeriod.vector = new Vector({
            dataType: NumberDataType,
            length: this.vector.timestamps.length,
        });
        thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
        if (arg === null) {
            thisTimeSeriesPeriod.vector.setBad();
        }
        else {
            // Arithmetic operators
            switch (operator) {
                case '+': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] + arg;
                    }
                    break;
                }
                case '-': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] - arg;
                    }
                    break;
                }
                case '*': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] * arg;
                    }
                    break;
                }
                case '/': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] / arg;
                    }
                    break;
                }
                case '**': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = Math.pow(this.vector.values[i], arg);
                    }
                    break;
                }
                case '%': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] % arg;
                    }
                    break;
                }
            }
        }
        return thisTimeSeriesPeriod;
    }
    comparisonOperatorScalar(operator, arg) {
        let thisTimeSeriesPeriod;
        if (arg === null) {
            thisTimeSeriesPeriod = new TimeSeriesPath(InterpolationMethod.none);
            thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
            thisTimeSeriesPeriod.vector = thisTimeSeriesPeriod.vector.setBad();
        }
        else {
            // Comparison operator
            switch (operator) {
                case '<': {
                    thisTimeSeriesPeriod.vector = new Vector({
                        dataType: BooleanDataType,
                        length: thisTimeSeriesPeriod.vector.timestamps.length,
                    }); // dataType = DataType.boolean;
                    thisTimeSeriesPeriod.interpolationMethod = InterpolationMethod.previous;
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] =
                            thisTimeSeriesPeriod.vector.values[i] < arg ? 1 : 0;
                    }
                    break;
                }
            }
        }
        return thisTimeSeriesPeriod;
    }
    arithmeticOperatorTS(operator, arg) {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
        // Create a unique array of all the timestamps
        const targetTimestamps = this.vector.timestamps.combine(arg.vector.timestamps);
        // Arithmetic Operators only work on numbers
        const targetVector = new Vector({ dataType: NumberDataType, length: targetTimestamps.length });
        targetVector.timestamps = targetTimestamps;
        const thisTimeSeriesPeriod = this.resample(targetTimestamps);
        const argTimeSeriesPeriod = arg.resample(targetTimestamps);
        switch (operator) {
            case '+': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetVector.values[i] =
                        thisTimeSeriesPeriod.vector.values[i] + argTimeSeriesPeriod.vector.values[i];
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
                        thisTimeSeriesPeriod.vector.values[i] - argTimeSeriesPeriod.vector.values[i];
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
                        thisTimeSeriesPeriod.vector.values[i] * argTimeSeriesPeriod.vector.values[i];
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
                        thisTimeSeriesPeriod.vector.values[i] / argTimeSeriesPeriod.vector.values[i];
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
                        Math.pow(thisTimeSeriesPeriod.vector.values[i], argTimeSeriesPeriod.vector.values[i]);
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
                        thisTimeSeriesPeriod.vector.values[i] % argTimeSeriesPeriod.vector.values[i];
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
    add(arg) {
        return this.arithmeticOperator('+', arg);
    }
    subtract(arg) {
        return this.arithmeticOperator('-', arg);
    }
    multiply(arg) {
        return this.arithmeticOperator('*', arg);
    }
    divide(arg) {
        return this.arithmeticOperator('/', arg);
    }
    pow(arg) {
        return this.arithmeticOperator('**', arg);
    }
    remainder(arg) {
        return this.arithmeticOperator('%', arg);
    }
    lt(arg) {
        return this.comparisonOperator('<', arg);
    }
    negate() {
        const thisTimeSeriesPeriod = this.deepClone();
        let index = 0;
        for (index = 0; index < thisTimeSeriesPeriod.vector.values.length; index++) {
            thisTimeSeriesPeriod.vector.values[index] = -thisTimeSeriesPeriod.vector.values[index];
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
    static aggregate(method, timeSeriesPeriods) {
        if (timeSeriesPeriods.length === 0) {
            throw Error('cannot pass 0 length array to aggregate function');
        }
        let targetTimestamps = new TimestampsClass();
        const interimTimeSeriesPeriods = [];
        const returnTimeSeriesPeriod = new TimeSeriesPath(InterpolationMethod.linear);
        // Get all unique timestamps
        for (const timeSeriesPeriod of timeSeriesPeriods) {
            targetTimestamps = targetTimestamps.combine(timeSeriesPeriod.vector.timestamps);
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
                        aggValue += interimTimeSeriesPeriod.vector.values[timeIndex];
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
                        aggValue += interimTimeSeriesPeriod.vector.values[timeIndex];
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
                    let aggValue = interimTimeSeriesPeriods[0].vector.values[timeIndex];
                    let aggStatus = Severity.Good;
                    for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
                        aggValue = (interimTimeSeriesPeriod.vector.values[timeIndex] < aggValue
                            ? interimTimeSeriesPeriod.vector.values[timeIndex]
                            : aggValue);
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
                    let aggValue = interimTimeSeriesPeriods[0].vector.values[timeIndex];
                    let aggStatus = Severity.Good;
                    for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
                        aggValue = // If aggValue is undefined, then take the first value, else take the max value
                            (interimTimeSeriesPeriod.vector.values[timeIndex] > aggValue
                                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                                : aggValue);
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
                    let aggMinValue = interimTimeSeriesPeriods[0].vector.values[timeIndex];
                    let aggMaxValue = interimTimeSeriesPeriods[0].vector.values[timeIndex];
                    let aggStatus = Severity.Good;
                    for (const interimTimeSeriesPeriod of interimTimeSeriesPeriods) {
                        aggMinValue = // If aggValue is undefined, then take the first value, else take the min value
                            (interimTimeSeriesPeriod.vector.values[timeIndex] < aggMinValue
                                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                                : aggMinValue);
                        aggMaxValue = // If aggValue is undefined, then take the first value, else take the max value
                            (interimTimeSeriesPeriod.vector.values[timeIndex] > aggMaxValue
                                ? interimTimeSeriesPeriod.vector.values[timeIndex]
                                : aggMaxValue);
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
    static sum(timeSeriesPeriods) {
        return this.aggregate('sum', timeSeriesPeriods);
    }
    static avg(timeSeriesPeriods) {
        return this.aggregate('avg', timeSeriesPeriods);
    }
    static min(timeSeriesPeriods) {
        return this.aggregate('min', timeSeriesPeriods);
    }
    static max(timeSeriesPeriods) {
        return this.aggregate('max', timeSeriesPeriods);
    }
    static range(timeSeriesPeriods) {
        return this.aggregate('range', timeSeriesPeriods);
    }
}

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
import { Vector, combine } from './vector.js';
import { BooleanArrayDataType, NumberArrayDataType } from './values.js';
import { whatsMyType } from './what-is-my-type.js';
import { TimestampArray } from './timestamp.js';
/**
 * A rich class representing time series data as a path
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
    /**
     * Validates the integrity of the object
     * @returns true if the object is valid, false if it is not
     */
    validate() {
        // Validate the vector if there is one, otherwise return false
        if (this.vector) {
            /** The validation of the vector alone */
            const arraySizeOK = this.vector.validate();
            // Now validate the vector with regards to interpolation methods and data types
            /** The interpolation method is OK */
            let interpolationMethodOK = false;
            if (this.interpolationMethod === undefined) {
                interpolationMethodOK = false;
            }
            else {
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
                        }
                        else {
                            interpolationMethodOK = true;
                        }
                        break;
                    default:
                        throw Error(`Invalid data type: ${whatsMyType(this.vector.values)}`);
                }
            }
            return arraySizeOK && interpolationMethodOK;
        }
        else {
            return false;
        }
    }
    /**
     * Creates a shallow copy of the TimeSeriesPath. This is faster, but the objects share properties.
     * @returns A new TimeSeriesPath
     */
    clone() {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
        Object.assign(returnTimeSeriesPath, { ...this });
        returnTimeSeriesPath.vector = this.vector;
        return returnTimeSeriesPath;
    }
    /**
     * Creates a deep copy of the TimeSeriesPath. This will ensure that all objects are recreated with new objects
     * @returns A new TimeSeriesPath
     */
    deepClone() {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
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
    newVectorFromElements(timestamps, values, statuses) {
        this.vector = Vector.fromElements(timestamps, values, statuses);
        return this;
    }
    /**
     * Creates and sets a new vector based on the passed in array of time entries
     * @param timeEntries
     * @returns
     */
    newVectorFromTimeEntries(timeEntries) {
        this.vector = Vector.fromTimeEntries(timeEntries);
        return this;
    }
    /**
     * Creates and sets a new vector based on the passed in array of time entry arrays
     * @param timeEntryArrays
     * @returns
     */
    newVectorFromTimeEntryArrays(timeEntryArrays) {
        this.vector = Vector.fromTimeEntryArrays(timeEntryArrays);
        return this;
    }
    /**
     *
     * @returns The current Vector as an array of TimeEntries
     */
    getTimeEntries() {
        return this.vector.getTimeEntries();
    }
    /**
     * Resamples in place an mutilates the current TimeSeriesPath (this)
     * @param targetTimestamps The timestamps for resampling
     * @returns The current TimeSeriesPath
     */
    mutableResample(targetTimestamps) {
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
    resample(targetTimestamps) {
        const returnTimeSeriesPeriod = this.deepClone();
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
    arithmeticOperator(operator, operand) {
        let returnTimeSeriesPeriod;
        switch (typeof operand) {
            case 'boolean':
            case 'number':
            case 'string': {
                returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, operand);
                break;
            }
            case 'object': {
                const argType = whatsMyType(operand);
                const vectorType = whatsMyType(operand.vector?.values);
                if (operand === null) {
                    returnTimeSeriesPeriod = this.arithmeticOperatorScalar(operator, operand);
                }
                else if (argType === 'TimeSeriesPath' && vectorType === 'Float64Array') {
                    returnTimeSeriesPeriod = this.arithmeticOperatorTS(operator, operand);
                }
                else {
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
    comparisonOperator(operator, operand) {
        let returnTimeSeriesPeriod;
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
                }
                else if (operand instanceof TimeSeriesPath) {
                    throw Error(`function comparisonOperatorTS not implemented`);
                    // returnTimeSeriesPeriod = this.comparisonOperatorTS(operator, arg);
                }
                else {
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
    arithmeticOperatorScalar(operator, operand) {
        const thisTimeSeriesPeriod = new TimeSeriesPath(this.interpolationMethod);
        thisTimeSeriesPeriod.vector = new Vector({
            dataType: NumberArrayDataType,
            length: this.vector.timestamps.length,
        });
        thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
        if (operand === null) {
            thisTimeSeriesPeriod.vector.setBad();
        }
        else {
            // Arithmetic operators
            switch (operator) {
                case '+': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] + operand;
                    }
                    break;
                }
                case '-': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] - operand;
                    }
                    break;
                }
                case '*': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] * operand;
                    }
                    break;
                }
                case '/': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] / operand;
                    }
                    break;
                }
                case '**': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] ** operand;
                    }
                    break;
                }
                case '%': {
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] = this.vector.values[i] % operand;
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
    comparisonOperatorScalar(operator, operand) {
        let thisTimeSeriesPeriod;
        if (operand === null) {
            thisTimeSeriesPeriod = new TimeSeriesPath(InterpolationMethod.none);
            thisTimeSeriesPeriod.vector.timestamps.set(this.vector.timestamps);
            thisTimeSeriesPeriod.vector = thisTimeSeriesPeriod.vector.setBad();
        }
        else {
            // Comparison operator
            switch (operator) {
                case '<': {
                    thisTimeSeriesPeriod.vector = new Vector({
                        dataType: BooleanArrayDataType,
                        length: thisTimeSeriesPeriod.vector.timestamps.length,
                    }); // dataType = DataType.boolean;
                    thisTimeSeriesPeriod.interpolationMethod = InterpolationMethod.previous;
                    for (let i = 0; i < thisTimeSeriesPeriod.vector.timestamps.length; i++) {
                        thisTimeSeriesPeriod.vector.values[i] =
                            thisTimeSeriesPeriod.vector.values[i] < operand ? 1 : 0;
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
    arithmeticOperatorTS(operator, operand) {
        const returnTimeSeriesPath = new TimeSeriesPath(this.interpolationMethod);
        // Create a unique array of all the timestamps
        const targetTimestamps = combine(this.vector.timestamps, operand.vector.timestamps);
        // Arithmetic Operators only work on numbers
        const targetVector = new Vector({ dataType: NumberArrayDataType, length: targetTimestamps.length });
        targetVector.timestamps = targetTimestamps;
        const thisTimeSeriesPeriod = this.resample(targetTimestamps);
        const argTimeSeriesPeriod = operand.resample(targetTimestamps);
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
                        thisTimeSeriesPeriod.vector.values[i] ** argTimeSeriesPeriod.vector.values[i];
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
            default:
                throw Error(`Unexpected operator ${operator}`);
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
    static aggregate(method, timeSeriesPeriods) {
        if (timeSeriesPeriods.length === 0) {
            throw Error('cannot pass 0 length array to aggregate function');
        }
        let targetTimestamps = new TimestampArray();
        const interimTimeSeriesPeriods = [];
        const returnTimeSeriesPeriod = new TimeSeriesPath(InterpolationMethod.linear);
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

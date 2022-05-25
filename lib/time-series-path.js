"use strict";
/* *
 *
 *  (c) 2022 Niels E. Andersen
 *
 *  License: https://creativecommons.org/licenses/by-nc/4.0/legalcode
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeSeriesPath = void 0;
/*
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */
class TimeSeriesPath {
    constructor(dataType, interpolationMethod, startTimestamp, endTimestamp, quantityKind, measurementUnit, measurementUnitMultiplier, measurementUnitOffset, name, description, expression) {
        this.timestamps = [];
        this.values = [];
        this.statuses = [];
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
                this.values = Array();
                break;
            }
            case 'string': {
                this.values = Array();
                break;
            }
            case 'number': {
                this.values = Array();
                break;
            }
            case 'JSON': {
                this.values = Array();
                break;
            }
        }
        this.validate;
    }
    validate() {
        // Array lengths
        // interpolation methods and data types
        const arraySizeOK = this.timestamps.length === this.values.length &&
            this.timestamps.length === this.statuses.length;
        let interpolationMethodOK = false;
        if (this.interpolationMethod === undefined) {
            interpolationMethodOK = false;
        }
        else {
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
                    }
                    else {
                        interpolationMethodOK = true;
                    }
                    break;
                }
            }
        }
        return arraySizeOK && interpolationMethodOK;
    }
    clone() {
        const cloneTimeSeriesPeriod = new this.constructor();
        Object.assign(cloneTimeSeriesPeriod, this);
        return cloneTimeSeriesPeriod;
    }
    deepClone() {
        const cloneTimeSeriesPeriod = this.clone();
        cloneTimeSeriesPeriod.timestamps = Array.from(this.timestamps);
        cloneTimeSeriesPeriod.values = Array.from(this.values);
        cloneTimeSeriesPeriod.statuses = Array.from(this.statuses);
        return cloneTimeSeriesPeriod;
    }
    setTimeVector(timestamps, values, statuses) {
        this.timestamps = timestamps;
        this.values = values;
        this.statuses = statuses;
        return this;
    }
    setTimeEntries(timeEntries) {
        const timestamps = [];
        let values;
        const statuses = [];
        switch (this.dataType // TODO: Is this necessary?
        ) {
            case 'Date': {
                values = Array();
                break;
            }
            case 'string': {
                values = Array();
                break;
            }
            case 'number': {
                values = Array();
                break;
            }
            case 'JSON': {
                values = Array();
                break;
            }
            default: {
                throw `Unexpected dataType ${this.dataType}`;
            }
        }
        for (let i = 0; i < timeEntries.length; i++) {
            timestamps.push(timeEntries[i].t);
            values.push(timeEntries[i].v);
            statuses.push(timeEntries[i].s);
        }
        this.timestamps = timestamps;
        this.values = values;
        this.statuses = statuses;
        return this;
    }
    getTimeEntries() {
        const timeEntries = [];
        for (let i = 0; i < this.timestamps.length; i++) {
            timeEntries.push({ t: this.timestamps[i], v: this.values[i], s: this.statuses[i] });
        }
        return timeEntries;
    }
    setTimeSegments(timeSegments) {
        const timestamps = [];
        let values;
        const statuses = [];
        switch (this.dataType // TODO: Is this necessary?
        ) {
            case 'Date': {
                values = Array();
                break;
            }
            case 'string': {
                values = Array();
                break;
            }
            case 'number': {
                values = Array();
                break;
            }
            case 'JSON': {
                values = Array();
                break;
            }
            default: {
                throw `Unexpected dataType ${this.dataType}`;
            }
        }
        for (let i = 0; i < timeSegments.length; i++) {
            timestamps.push(timeSegments[i].t1);
            values.push(timeSegments[i].v1);
            statuses.push(timeSegments[i].s1);
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
    getTimeSegments() {
        const timeSegments = [];
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
    _resampleNone(targetTimestamps) {
        const returnTimeSeriesPeriod = this.clone();
        const targetValues = [];
        const targetStatuses = [];
        let indexObjectTs = 0;
        let indexTargetTs = 0;
        let found;
        while (indexTargetTs < targetTimestamps.length) {
            // while we need to find all the target timestamps
            found = false;
            while (indexObjectTs < this.timestamps.length && // while we are still in the array
                this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
            ) {
                if (this.timestamps[indexObjectTs] === targetTimestamps[indexTargetTs]) {
                    // The object timestamp is equal to the current timestamp
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) {
                    indexObjectTs++;
                }
                else {
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
    _resamplePrevious(targetTimestamps) {
        const returnTimeSeriesPeriod = this.clone();
        const targetValues = [];
        const targetStatuses = [];
        let indexObjectTs = 0;
        let indexTargetTs = 0;
        let found;
        while (indexTargetTs < targetTimestamps.length) {
            // while we need to find all the target timestamps
            found = false;
            while (indexObjectTs < this.timestamps.length && // while we are still in the array
                this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
            ) {
                if (this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
                ) {
                    // We have a match
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) {
                    indexObjectTs++;
                }
                else {
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
    _resampleNext(targetTimestamps) {
        const returnTimeSeriesPeriod = this.clone();
        const targetValues = [];
        const targetStatuses = [];
        let indexObjectTs = 0;
        let indexTargetTs = 0;
        let found = false;
        while (indexTargetTs < targetTimestamps.length) {
            // we need to find all the target timestamps
            while (indexObjectTs < this.timestamps.length && // we are still in the array
                !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // Don't even start looping if we are past the target timestamp
            ) {
                if (this.timestamps[indexObjectTs] >= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // The previous object timestamp is not after or equal to the target timestamp
                ) {
                    // We have a match
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs]) {
                    indexObjectTs++;
                }
                else {
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
    _setResampleValue(found, targetValues, indexObjectTs, targetStatuses) {
        if (found) {
            targetValues.push(this.values[indexObjectTs]);
            targetStatuses.push(this.statuses[indexObjectTs]);
        }
        else {
            // We did not find a match
            targetValues.push(null);
            targetStatuses.push(0xff);
        }
    }
    _resampleLinear(targetTimestamps) {
        const returnTimeSeriesPeriod = this.clone();
        const targetValues = [];
        const targetStatuses = [];
        let indexObjectTs = 0;
        let indexTargetTs = 0;
        let found;
        while (indexTargetTs < targetTimestamps.length) {
            // we need to find all the target timestamps
            found = false;
            while (indexObjectTs < this.timestamps.length && // we are still in the array
                this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs + 1] // The object timestamp is not past the target timestamp
            ) {
                if (this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
                ) {
                    // We have a match
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] >= targetTimestamps[indexTargetTs]) {
                    indexObjectTs++;
                }
                else {
                    break;
                }
            }
            // Now the next object timestamp is the one we need to use
            if (found) {
                if (this.timestamps[indexObjectTs + 1] === undefined) {
                    targetValues.push(this.values[indexObjectTs]);
                    targetStatuses.push(this.statuses[indexObjectTs]); // TODO: Uncertain
                }
                else {
                    targetValues.push(this.values[indexObjectTs] +
                        ((this.values[indexObjectTs + 1] -
                            this.values[indexObjectTs]) *
                            (targetTimestamps[indexTargetTs] - this.timestamps[indexObjectTs])) /
                            (this.timestamps[indexObjectTs + 1] - this.timestamps[indexObjectTs]));
                    targetStatuses.push(this.statuses[indexObjectTs] | this.statuses[indexObjectTs + 1]);
                }
            }
            else {
                targetValues.push(null);
                targetStatuses.push(0xff);
            }
            indexTargetTs++;
        }
        returnTimeSeriesPeriod.timestamps = targetTimestamps;
        returnTimeSeriesPeriod.values = targetValues;
        returnTimeSeriesPeriod.statuses = targetStatuses;
        return returnTimeSeriesPeriod;
    }
    mutableResample(targetTimestamps) {
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
    resample(targetTimestamps) {
        const returnTimeSeriesPeriod = this.deepClone();
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
    operator(operator, arg) {
        let returnTimeSeriesPeriod;
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
                }
                else if (arg instanceof TimeSeriesPath) {
                    returnTimeSeriesPeriod = this.operatorTS(operator, arg);
                }
                else {
                    throw `Unexpected arg ${arg}`;
                }
                break;
            }
            default: {
                throw `Unexpected operator ${operator}`;
            }
        }
        return returnTimeSeriesPeriod;
    }
    operatorScalar(operator, arg) {
        const thisTimeSeriesPeriod = this.deepClone();
        if (arg === null) {
            thisTimeSeriesPeriod.values.fill(null);
            thisTimeSeriesPeriod.statuses.fill(0xff);
        }
        else {
            switch (operator) {
                case '+': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] + arg;
                    }
                    break;
                }
                case '-': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] - arg;
                    }
                    break;
                }
                case '*': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] * arg;
                    }
                    break;
                }
                case '/': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] / arg;
                    }
                    break;
                }
                case '**': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] ** arg;
                    }
                    break;
                }
                case '%': {
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] % arg;
                    }
                    break;
                }
                case '<': {
                    thisTimeSeriesPeriod.dataType = 'boolean';
                    thisTimeSeriesPeriod.interpolationMethod = 'previous';
                    for (let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] =
                            thisTimeSeriesPeriod.values[i] < arg;
                    }
                    break;
                }
            }
        }
        return thisTimeSeriesPeriod;
    }
    operatorTS(operator, arg) {
        // Create a unique array of all the timestamps
        const targetTimestamps = [
            ...new Set(this.timestamps.concat(arg.timestamps).sort((a, b) => a - b)),
        ];
        const targetValues = [];
        const targetStatuses = [];
        const thisTimeSeriesPeriod = this.resample(targetTimestamps);
        const argTimeSeriesPeriod = arg.resample(targetTimestamps);
        switch (operator) {
            case '+': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] + argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '-': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] - argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '*': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] * argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '/': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] / argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '**': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] ** argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '%': {
                for (let i = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] % argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
        }
        thisTimeSeriesPeriod.values = targetValues;
        thisTimeSeriesPeriod.statuses = targetStatuses;
        return thisTimeSeriesPeriod;
    }
    add(arg) {
        return this.operator('+', arg);
    }
    subtract(arg) {
        return this.operator('-', arg);
    }
    multiply(arg) {
        return this.operator('*', arg);
    }
    divide(arg) {
        return this.operator('/', arg);
    }
    pow(arg) {
        return this.operator('**', arg);
    }
    remainder(arg) {
        return this.operator('%', arg);
    }
    lt(arg) {
        return this.operator('<', arg);
    }
    negate() {
        const thisTimeSeriesPeriod = this.deepClone();
        let index = 0;
        for (index = 0; index < thisTimeSeriesPeriod.values.length; index++) {
            thisTimeSeriesPeriod.values[index] = -thisTimeSeriesPeriod.values[index];
        }
        return thisTimeSeriesPeriod;
    }
    //   private static generateCyclicTimeSeriesData(
    //     startTimestamp: DOMHighResTimeStamp,
    //     endTimestamp: DOMHighResTimeStamp,
    //     sampleInterval: number,
    //     shape: 'sine' | 'square' | 'sawtooth' | 'triangle',
    //     waveLength: number,
    //     minValue?: number = 0,
    //     maxValue?: number = 1
    //   ): TimeSeriesPath {
    //     // Create an array with all the timestamps
    //     const numEntries: number = Math.floor((endTimestamp - startTimestamp) / sampleInterval);
    //     const targetTimestamps: DOMHighResTimeStamp[] = Array.from(Array(numEntries).keys()).map(
    //       (index) => index * sampleInterval + startTimestamp
    //     );
    //     let targetValues: number[] = Array(numEntries);
    //     const targetStatuses: number[] = Array(numEntries);
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
    static aggregate(method, timeSeriesPeriods) {
        let targetTimestamps = [];
        const targetValues = [];
        const targetStatuses = [];
        const interimTimeSeriesPeriods = [];
        const returnTimeSeriesPeriod = new TimeSeriesPath('number', 'linear');
        // Get all common timestamps
        for (let i = 0; i < timeSeriesPeriods.length; i++) {
            targetTimestamps = targetTimestamps.concat(timeSeriesPeriods[i].timestamps);
        }
        // Sort and remove the duplicates
        targetTimestamps = [...new Set(targetTimestamps.sort((a, b) => a - b))];
        // Resample
        for (let i = 0; i < timeSeriesPeriods.length; i++) {
            interimTimeSeriesPeriods.push(timeSeriesPeriods[i].resample(targetTimestamps));
        }
        switch (method) {
            case 'sum': {
                for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = 0, aggStatus = 0;
                    for (let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex];
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case 'avg': {
                for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = 0, aggStatus = 0, aggCount = 0;
                    for (let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex];
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                        aggCount += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] ? 1 : 0;
                    }
                    targetValues.push(aggValue / aggCount);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case 'min': {
                for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = interimTimeSeriesPeriods[0].values[timeIndex], aggStatus = 0;
                    for (let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue =
                            interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] <
                                aggValue
                                ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex]
                                : aggValue;
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case 'max': {
                for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = interimTimeSeriesPeriods[0].values[timeIndex], aggStatus = 0;
                    for (let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue = // If aggValue is undefined, then take the first value, else take the max value
                            interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] >
                                aggValue
                                ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex]
                                : aggValue;
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case 'range': {
                for (let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggMinValue = interimTimeSeriesPeriods[0].values[timeIndex], aggMaxValue = interimTimeSeriesPeriods[0].values[timeIndex], aggStatus = 0;
                    for (let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggMinValue = // If aggValue is undefined, then take the first value, else take the min value
                            interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] <
                                aggMinValue
                                ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex]
                                : aggMinValue;
                        aggMaxValue = // If aggValue is undefined, then take the first value, else take the max value
                            interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] >
                                aggMaxValue
                                ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex]
                                : aggMaxValue;
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggMaxValue - aggMinValue);
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
exports.TimeSeriesPath = TimeSeriesPath;
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

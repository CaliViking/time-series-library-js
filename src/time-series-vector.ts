import { InterpolationMethod } from "./interpolationmethod";
import { DataType } from "./datatype";
import { Values } from "./values";
import { TimeEntry } from "./time-entry";
import { TimeSegment } from "./time-segment";

export interface Samplable {
    /**
     * resampleable   
     * */
    mutableResample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries;
    // downsample(targetTimestamps: DOMHighResTimeStamp[]): this;
    // upsample(targetTimestamps: DOMHighResTimeStamp[]): this;
}

/**
 * Some implementation choices:
 * - I have deliberately chosen to use for loops instead of forEach and map/reduce. The reason is primarily performance
 * - I have chosen to use array.push() method to extend arrays. This is due to Google V8 performance. It may be a good idea to use pre-sized arrays instead.
 */

export class TimeSeries implements Samplable {
    dataType: DataType;
    interpolationMethod: InterpolationMethod;
    timestamps: DOMHighResTimeStamp[] = [];
    values: any[] = [];
    statuses: number[] =  [];
    startTimestamp?: DOMHighResTimeStamp;
    endTimestamp?: DOMHighResTimeStamp;
    quantityKind?: string;
    measurementUnit?: string;
    measurementUnitMultiplier?: number;
    measurementUnitOffset?: number;
    name?: string;
    description?: string;
    expression?: string;
    error?: Error;
    hint?: string

    /**
     * 
     * @param dataType 
     * @param interpolationMethod 
     * @param startTimestamp 
     * @param endTimestamp 
     * @param quantityKind 
     * @param measurementUnit 
     * @param measurementUnitMultiplier 
     * @param measurementUnitOffset 
     * @param name 
     * @param description 
     * @param expression 
     */
    public constructor(dataType: DataType, interpolationMethod: InterpolationMethod, startTimestamp?: DOMHighResTimeStamp, endTimestamp?: DOMHighResTimeStamp, 
        quantityKind?: string, measurementUnit?: string, measurementUnitMultiplier?: number, measurementUnitOffset?: number, 
        name?: string, description?: string, expression?: string) {
            this.dataType = dataType,
            this.interpolationMethod = interpolationMethod,
            this.startTimestamp = startTimestamp,
            this.endTimestamp = endTimestamp,
            this.quantityKind = quantityKind,
            this.measurementUnit = measurementUnit,
            this.measurementUnitMultiplier = measurementUnitMultiplier,
            this.measurementUnitOffset = measurementUnitOffset,
            this.name = name,
            this.description = description;

            switch(this.dataType) {
                case "Date": {
                    this.values = Array<DOMHighResTimeStamp>();
                    break;
                }
                case "string": {
                    this.values = Array<string>();
                    break;
                }
                case "number": {
                    this.values = Array<number>();
                    break;
                }
                case "JSON": {
                    this.values = Array<JSON>();
                    break;
                }
            }

            this.validate;
        };

    public validate(): boolean {
        // Array lengths
        // interpolation methods and data types
        let arraySizeOK: boolean = this.timestamps.length === this.values.length && this.timestamps.length === this.statuses.length;
        let interpolationMethodOK: boolean = false; 

        if (this.interpolationMethod === undefined) {
            interpolationMethodOK = false;
        } else {
            switch(this.dataType) {
                case 'number': 
                case 'Date' : {
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

    public clone(): TimeSeries {
        const cloneTimeSeriesPeriod = new (this.constructor as { new (): TimeSeries })();
        Object.assign(cloneTimeSeriesPeriod, this);

        return cloneTimeSeriesPeriod;
    }

    public deepClone(): TimeSeries {
        let cloneTimeSeriesPeriod: TimeSeries = this.clone();
        cloneTimeSeriesPeriod.timestamps = Array.from(this.timestamps);
        cloneTimeSeriesPeriod.values = Array.from(this.values);
        cloneTimeSeriesPeriod.statuses = Array.from(this.statuses);

        return cloneTimeSeriesPeriod;
    }

    public setTimeVector(timestamps: DOMHighResTimeStamp[], values: Values, statuses:number[]): TimeSeries {
        this.timestamps = timestamps;
        this.values = values;
        this.statuses = statuses;

        return this;
    }

    public setTimeEntries(timeEntries: TimeEntry[]): TimeSeries {
        let timestamps: DOMHighResTimeStamp[] = [];
        let values: any[];
        let statuses: number[] = [];

        switch(this.dataType) { // TODO: Is this necessary?
            case "Date": {
                values = Array<DOMHighResTimeStamp>();
                break;
            }
            case "string": {
                values = Array<string>();
                break;
            }
            case "number": {
                values = Array<number>();
                break;
            }
            case "JSON": {
                values = Array<JSON>();
                break;
            }
        }

        for(let i = 0; i < timeEntries.length; i++) {
            timestamps.push(timeEntries[i].t);
            values.push(timeEntries[i].v);
            statuses.push(timeEntries[i].s);
        }

        this.timestamps = timestamps;
        this.values = values;
        this.statuses = statuses;

        return this;
    }

    public getTimeEntries(): TimeEntry[] {
        let timeEntries: TimeEntry[] = [];

        for(let i = 0; i < this.timestamps.length; i++) {
            timeEntries.push({t: this.timestamps[i], v: this.values[i], s: this.statuses[i]})
        }

        return timeEntries;
    }

    public setTimeSegments(timeSegments: TimeSegment[]): TimeSeries {
        let timestamps: DOMHighResTimeStamp[] = [];
        let values: any[];
        let statuses: number[] = [];

        switch(this.dataType) { // TODO: Is this necessary?
            case "Date": {
                values = Array<DOMHighResTimeStamp>();
                break;
            }
            case "string": {
                values = Array<string>();
                break;
            }
            case "number": {
                values = Array<number>();
                break;
            }
            case "JSON": {
                values = Array<JSON>();
                break;
            }
        }

        for(let i = 0; i < timeSegments.length; i++) {
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

    public getTimeSegments(): TimeSegment[] {
        let timeSegments: TimeSegment[] = [];

        for(let i = 0; i + 1 < this.timestamps.length; i++) {
            timeSegments.push({t1: this.timestamps[i], t2: this.timestamps[i+1], 
                v1: this.values[i], v2: this.values[i+1], 
                s1: this.statuses[i], s2: this.statuses[i+1]
            })
        }

        return timeSegments;
    }

    private _resampleNone(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries {
        let returnTimeSeriesPeriod = this.clone();
        let targetValues: any[] = [];
        let targetStatuses: number[] =  [];
        let indexObjectTs: number = 0;
        let indexTargetTs: number = 0;
        let found: boolean; 

        while (indexTargetTs < targetTimestamps.length) {   // while we need to find all the target timestamps
            found = false;
            while (
                indexObjectTs < this.timestamps.length && // while we are still in the array
                this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
            ) { 
                if (this.timestamps[indexObjectTs] === targetTimestamps[indexTargetTs]) { // The object timestamp is equal to the current timestamp
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) 
                {
                    indexObjectTs++;
                } else {
                    break;
                }
            };

            // The current object timestamp is the one we need to use
            this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

            indexTargetTs++;
        }
        returnTimeSeriesPeriod.timestamps = targetTimestamps;
        returnTimeSeriesPeriod.values = targetValues;
        returnTimeSeriesPeriod.statuses = targetStatuses;

        return returnTimeSeriesPeriod;
    }

    private _resamplePrevious(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries {
        let returnTimeSeriesPeriod = this.clone();
        let targetValues: any[] = [];
        let targetStatuses: number[] =  [];
        let indexObjectTs: number = 0;
        let indexTargetTs: number = 0;
        let found: boolean; 
        
        while (indexTargetTs < targetTimestamps.length) {   // while we need to find all the target timestamps
            found = false;
            while (
                indexObjectTs < this.timestamps.length && // while we are still in the array
                this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs] // Don't even start looping if we are past the target timestamp
            ) 
            { 
                if ((this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs]) && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
                )
                // We have a match
                { 
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) 
                {
                    indexObjectTs++;
                } else {
                    break;
                }
            };

            // The current object timestamp is the one we need to use
            this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

            indexTargetTs++;
        };
        returnTimeSeriesPeriod.timestamps = targetTimestamps;
        returnTimeSeriesPeriod.values = targetValues;
        returnTimeSeriesPeriod.statuses = targetStatuses;

        return returnTimeSeriesPeriod;
    }

    private _resampleNext(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries {
        let returnTimeSeriesPeriod = this.clone();
        let targetValues: any[] = [];
        let targetStatuses: number[] =  [];
        let indexObjectTs: number = 0;
        let indexTargetTs: number = 0;
        let found: boolean; 
        
        while (indexTargetTs < targetTimestamps.length) {   // we need to find all the target timestamps
            while (
                indexObjectTs < this.timestamps.length && // we are still in the array
                !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // Don't even start looping if we are past the target timestamp
                ) 
            { 
                if ((this.timestamps[indexObjectTs] >= targetTimestamps[indexTargetTs]) && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs - 1] >= targetTimestamps[indexTargetTs]) // The previous object timestamp is not after or equal to the target timestamp
                )
                // We have a match
                { 
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs]) 
                {
                    indexObjectTs++;
                } else {
                    break;
                }
            };

            // The current object timestamp is the one we need to use
            this._setResampleValue(found, targetValues, indexObjectTs, targetStatuses);

            indexTargetTs++;
        };

        returnTimeSeriesPeriod.timestamps = targetTimestamps;
        returnTimeSeriesPeriod.values = targetValues;
        returnTimeSeriesPeriod.statuses = targetStatuses;

        return returnTimeSeriesPeriod;
    }

    private _setResampleValue(found: boolean, targetValues: any[], indexObjectTs: number, targetStatuses: number[]) {
        if (found) {
            targetValues.push(this.values[indexObjectTs]);
            targetStatuses.push(this.statuses[indexObjectTs]);
        } else { // We did not find a match
            targetValues.push(null);
            targetStatuses.push(0xFF);
        }
    }

    protected  _resampleLinear(targetTimestamps: number[]): TimeSeries {
        let returnTimeSeriesPeriod = this.clone();
        let targetValues: any[] = [];
        let targetStatuses: number[] =  [];
        let indexObjectTs: number = 0;
        let indexTargetTs: number = 0;
        let found: boolean; 
        
        while (indexTargetTs < targetTimestamps.length) {   // we need to find all the target timestamps
            found = false;
            while (
                indexObjectTs < this.timestamps.length // we are still in the array
                && (this.timestamps[indexObjectTs] < targetTimestamps[indexTargetTs + 1]) // The object timestamp is not past the target timestamp
                ) 
            { 
                if ((this.timestamps[indexObjectTs] <= targetTimestamps[indexTargetTs]) && // The object timestamp is not before or equal to the target timestamp
                    !(this.timestamps[indexObjectTs + 1] <= targetTimestamps[indexTargetTs]) // The next object timestamp is not before or equal to the target timestamp
                )
                // We have a match
                { 
                    found = true;
                    break;
                }
                if (indexObjectTs + 1 < this.timestamps.length && // Stay in the array
                    this.timestamps[indexObjectTs + 1] >= targetTimestamps[indexTargetTs]) 
                {
                    indexObjectTs++;
                } else {
                    break;
                }
            };

            // Now the next object timestamp is the one we need to use
            if (found) 
            {
                if (this.timestamps[indexObjectTs + 1] === undefined) {
                    targetValues.push(this.values[indexObjectTs]);
                    targetStatuses.push(this.statuses[indexObjectTs]); // TODO: Uncertain
                } else {
                    targetValues.push(this.values[indexObjectTs] 
                        + ((this.values[indexObjectTs + 1] - (this.values[indexObjectTs]))
                            * (targetTimestamps[indexTargetTs] - this.timestamps[indexObjectTs])
                            / (this.timestamps[indexObjectTs + 1] - this.timestamps[indexObjectTs])));
                    targetStatuses.push(this.statuses[indexObjectTs] | this.statuses[indexObjectTs + 1]);
                }
            } else {
                targetValues.push(null);
                targetStatuses.push(0xFF);
            };

            indexTargetTs++;
        };

        returnTimeSeriesPeriod.timestamps = targetTimestamps;
        returnTimeSeriesPeriod.values = targetValues;
        returnTimeSeriesPeriod.statuses = targetStatuses;

        return returnTimeSeriesPeriod;
    }
    
    public mutableResample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries {

        switch(this.interpolationMethod) {
            case 'none': {
                return this._resampleNone(targetTimestamps);
            }
            case 'previous': {
                return this._resamplePrevious(targetTimestamps);
            };
            case 'next': {
                return this._resampleNext(targetTimestamps);
            };
            case 'linear': {
                return this._resampleLinear(targetTimestamps);
            };

        }

    }

    public resample(targetTimestamps: DOMHighResTimeStamp[]): TimeSeries {
        let returnTimeSeriesPeriod: TimeSeries = this.deepClone();

        switch(this.interpolationMethod) {
            case 'none': {
                return returnTimeSeriesPeriod._resampleNone(targetTimestamps);
            }
            case 'previous': {
                return returnTimeSeriesPeriod._resamplePrevious(targetTimestamps);
            };
            case 'next': {
                return returnTimeSeriesPeriod._resampleNext(targetTimestamps);
            };
            case 'linear': {
                return returnTimeSeriesPeriod._resampleLinear(targetTimestamps);
            };

        }

    }

    private operator(operator: string, arg: any): TimeSeries {
        let returnTimeSeriesPeriod: TimeSeries;
        switch (typeof(arg)) {
            case "boolean" :
            case "number" :
            case "bigint" :
            case "string" : {
                returnTimeSeriesPeriod = this.operatorScalar(operator, arg);
                break;
            }
            case "object" : {
                if(arg === null) {
                    returnTimeSeriesPeriod = this.operatorScalar(operator, arg);
                } else if (arg instanceof TimeSeries) {
                    returnTimeSeriesPeriod = this.operatorTS(operator, arg);
                }
            }
        }
        return returnTimeSeriesPeriod;
    }

    private operatorScalar(operator:string, arg: any): TimeSeries {
        let thisTimeSeriesPeriod = this.deepClone();

        if (arg === null) {
            thisTimeSeriesPeriod.values.fill(null);
            thisTimeSeriesPeriod.statuses.fill(0xFF);
        } else {
            switch (operator) {
                case '+': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] += arg;
                    } 
                    break;
                }
                case '-': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] -= arg;
                    } 
                    break;
                }
                case '*': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] *= arg;
                    } 
                    break;
                }
                case '/': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] /= arg;
                    } 
                    break;
                }
                case '**': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] **= arg;
                    } 
                    break;
                }
                case '%': {
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] %= arg;
                    } 
                    break;
                }
                case '<': {
                    thisTimeSeriesPeriod.dataType = 'boolean';
                    thisTimeSeriesPeriod.interpolationMethod = 'previous';
                    for(let i = 0; i < thisTimeSeriesPeriod.values.length; i++) {
                        thisTimeSeriesPeriod.values[i] = thisTimeSeriesPeriod.values[i] < arg;
                    } 
                    break;
                }
            }
        }

        return thisTimeSeriesPeriod;
    }

    private operatorTS(operator:string, arg: TimeSeries): TimeSeries {
        // Create a unique array of all the timestamps
        let targetTimestamps: DOMHighResTimeStamp[] = [...new Set((this.timestamps.concat(arg.timestamps)).sort((a, b) => a - b))];
        let targetValues: any[] = [];
        let targetStatuses: number[] = [];
        let thisTimeSeriesPeriod = this.resample(targetTimestamps);
        let argTimeSeriesPeriod = arg.resample(targetTimestamps);

        switch (operator) {
            case '+': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] + argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '-': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] - argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '*': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] * argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '/': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] / argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '**': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
                    targetValues.push(thisTimeSeriesPeriod.values[i] ** argTimeSeriesPeriod.values[i]);
                    targetStatuses.push(thisTimeSeriesPeriod.statuses[i] | argTimeSeriesPeriod.statuses[i]);
                }
                break;
            }
            case '%': {
                for (let i: number = 0; i < targetTimestamps.length; i++) {
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

    public add(arg: any): TimeSeries {
        return this.operator('+', arg);
    }

    public subtract(arg: any): TimeSeries {
        return this.operator('-', arg);
    }

    public multiply(arg: any): TimeSeries {
        return this.operator('*', arg);
    }

    public divide(arg: any): TimeSeries {
        return this.operator('/', arg);
    }

    public pow(arg: any): TimeSeries {
        return this.operator('**', arg);
    }

    public remainder(arg: any): TimeSeries {
        return this.operator('%', arg);
    }

    public lt(arg: any): TimeSeries {
        return this.operator('<', arg);
    }
    public negate(): TimeSeries {
        let thisTimeSeriesPeriod = this.deepClone();
        let index: number = 0;

        for(index = 0; index < thisTimeSeriesPeriod.values.length; index++) {
            thisTimeSeriesPeriod.values[index] = - thisTimeSeriesPeriod.values[index];
        }

        return thisTimeSeriesPeriod;
    }

    private static aggregate(method: string, timeSeriesPeriods: TimeSeries[]): TimeSeries {
        let targetTimestamps: DOMHighResTimeStamp[] = [];
        let targetValues: any[] = [];
        let targetStatuses: number[] =  [];
        let interimTimeSeriesPeriods: TimeSeries[] = [];
        let returnTimeSeriesPeriod: TimeSeries = new TimeSeries('number', 'linear');

        // Get all common timestamps
        for(let i = 0; i < timeSeriesPeriods.length; i++) {
            targetTimestamps = targetTimestamps.concat(timeSeriesPeriods[i].timestamps);
        }
        
        // Sort and remove the duplicates
        targetTimestamps = [...new Set(targetTimestamps.sort((a, b) => a - b))];

        // Resample
        for(let i = 0; i < timeSeriesPeriods.length; i++) {
            interimTimeSeriesPeriods.push(timeSeriesPeriods[i].resample(targetTimestamps));
        }

        switch (method) {
            case "sum": {
                for(let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = 0, aggStatus = 0;
                    for(let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex];
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case "avg": {
                for(let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = 0, aggStatus = 0, aggCount = 0;
                    for(let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex];
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                        aggCount += interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] ? 1 : 0;
                    }
                    targetValues.push(aggValue / aggCount);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case "min": {
                for(let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = undefined, aggStatus = 0;
                    for(let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue = (interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] < aggValue) || (aggValue === undefined)  ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] : aggValue;
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case "max": {
                for(let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggValue = undefined, aggStatus = 0;
                    for(let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggValue = (interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] > aggValue) || (aggValue === undefined) ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] : aggValue;
                        aggStatus |= interimTimeSeriesPeriods[timeSeriesIndex].statuses[timeIndex];
                    }
                    targetValues.push(aggValue);
                    targetStatuses.push(aggStatus);
                }
                break;
            }
            case "range": {
                for(let timeIndex = 0; timeIndex < targetTimestamps.length; timeIndex++) {
                    let aggMinValue = undefined, aggMaxValue = undefined, aggStatus = 0;
                    for(let timeSeriesIndex = 0; timeSeriesIndex < interimTimeSeriesPeriods.length; timeSeriesIndex++) {
                        aggMinValue = (interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] < aggMinValue) || (aggMinValue === undefined) ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] : aggMinValue;
                        aggMaxValue = (interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] > aggMaxValue) || (aggMaxValue === undefined) ? interimTimeSeriesPeriods[timeSeriesIndex].values[timeIndex] : aggMaxValue;
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
    };

    static sum(timeSeriesPeriods: TimeSeries[]): TimeSeries {
        return this.aggregate("sum", timeSeriesPeriods);
    }

    static avg(timeSeriesPeriods: TimeSeries[]): TimeSeries {
        return this.aggregate("avg", timeSeriesPeriods);
    }

    static min(timeSeriesPeriods: TimeSeries[]): TimeSeries {
        return this.aggregate("min", timeSeriesPeriods);
    }

    static max(timeSeriesPeriods: TimeSeries[]): TimeSeries {
        return this.aggregate("max", timeSeriesPeriods);
    }

    static range(timeSeriesPeriods: TimeSeries[]): TimeSeries {
        return this.aggregate("range", timeSeriesPeriods);
    }

    /*
    public upsample(interval: number | timeSeriesObject | DOMHighResTimeStamp[] | Date[], anchorTimestamp?: DOMHighResTimeStamp | Date): timeSeriesObject {
        return new timeSeriesObject;
    }

    public downsample(interval: number | timeSeriesObject | DOMHighResTimeStamp[] | Date[], anchorTimestamp?: DOMHighResTimeStamp | Date): timeSeriesObject {
        return new timeSeriesObject;
    }

    public aggregate(interval: number | timeSeriesObject | DOMHighResTimeStamp[] | Date[], anchorTimestamp?: DOMHighResTimeStamp | Date): timeSeriesObject {
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


import { ValueType } from './values.js';
/**  t = timestamp, v = value, s = severity */
export declare type TimeEntry<ThisValueType extends ValueType> = {
    t: bigint;
    v: ThisValueType;
    s?: number;
};
/** Extends TimeEntry, id = sourceId  */
export declare type NamedTimeEntry<ThisValueType extends ValueType> = {
    id: string;
} & TimeEntry<ThisValueType>;
/** Array containing [timestamp, value, status code] */
export declare type TimeEntryArray<ThisValueType extends ValueType> = [bigint, ThisValueType, number];
/** Array containing [sourceId, timestamp, value, status code] */
export declare type NamedTimeEntryArray<ThisValueType extends ValueType> = [string, ...TimeEntryArray<ThisValueType>];
export declare enum ArrayPositions {
    TIMESTAMP = 0,
    VALUE = 1,
    STATUS_CODE = 2
}
export declare enum NamedArrayPositions {
    SOURCE_ID = 0,
    TIMESTAMP = 1,
    VALUE = 2,
    STATUS_CODE = 3
}

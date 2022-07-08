import { Severity } from './severity.js';
/**  t = timestamp, v = value, s = severity */
export declare type TimeEntry = {
    t: number;
    v: unknown;
    s?: Severity;
};
/** Extends TimeEntry, id = sourceId  */
export declare type NamedTimeEntry = {
    id: string;
} & TimeEntry;
/** Array containing [timestamp, value, status code] */
export declare type TimeEntryArray = [number, unknown, number];
/** Array containing [sourceId, timestamp, value, status code] */
export declare type NamedTimeEntryArray = [string, ...TimeEntryArray];

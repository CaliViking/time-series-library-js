import { Severity } from './severity.js';

/**  t = timestamp, v = value, s = severity */
export type TimeEntry = { t: number; v: unknown; s?: Severity };
/** Extends TimeEntry, id = sourceId  */
export type NamedTimeEntry = { id: string } & TimeEntry;
/** Array containing [timestamp, value, status code] */
export type TimeEntryArray = [number, unknown, number];
/** Array containing [sourceId, timestamp, value, status code] */
export type NamedTimeEntryArray = [string, ...TimeEntryArray];

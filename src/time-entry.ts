import { Severity } from './severity.js';

/**  t = timestamp, v = value, s = severity */
export type TimeEntry = { t: number; v: unknown; s?: Severity };
/** Extends TimeEntry, id = sourceId  */
export type NamedTimeEntry = { id: string } & TimeEntry;
/** Array containing [timestamp, value, status code] */
export type TimeEntryArray = [number, unknown, number];
/** Array containing [sourceId, timestamp, value, status code] */
export type NamedTimeEntryArray = [string, ...TimeEntryArray];

export enum ArrayPositions {
  TIMESTAMP = 0,
  VALUE = 1,
  STATUS_CODE = 2,
}

export enum NamedArrayPositions {
  SOURCE_ID = 0,
  TIMESTAMP = 1,
  VALUE = 2,
  STATUS_CODE = 3,
}

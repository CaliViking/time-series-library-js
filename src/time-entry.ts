import { ValueType } from './values.js';

/**  t = timestamp, v = value, s = severity */
export type TimeEntry<ThisValueType extends ValueType> = { t: number; v: ThisValueType; s?: number };
/** Extends TimeEntry, id = sourceId  */
export type NamedTimeEntry<ThisValueType extends ValueType> = { id: string } & TimeEntry<ThisValueType>;
/** Array containing [timestamp, value, status code] */
export type TimeEntryArray<ThisValueType extends ValueType> = [number, ThisValueType, number];
/** Array containing [sourceId, timestamp, value, status code] */
export type NamedTimeEntryArray<ThisValueType extends ValueType> = [string, ...TimeEntryArray<ThisValueType>];

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

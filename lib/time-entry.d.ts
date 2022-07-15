/**  t = timestamp, v = value, s = severity */
export declare type TimeEntry = {
    t: number;
    v: unknown;
    s?: number;
};
/** Extends TimeEntry, id = sourceId  */
export declare type NamedTimeEntry = {
    id: string;
} & TimeEntry;
/** Array containing [timestamp, value, status code] */
export declare type TimeEntryArray = [number, unknown, number];
/** Array containing [sourceId, timestamp, value, status code] */
export declare type NamedTimeEntryArray = [string, ...TimeEntryArray];
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

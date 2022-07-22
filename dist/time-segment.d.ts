import { Severity } from './severity.js';
import { timestamp } from './timestamp.js';
export declare type TimeSegment = {
    t1: timestamp;
    t2: timestamp;
    v1: unknown;
    v2: unknown;
    s1: Severity;
    s2: Severity;
};

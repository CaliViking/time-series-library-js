import { StatusType } from './status-type.js';
export declare type TimeSegment = {
    t1: DOMHighResTimeStamp;
    t2: DOMHighResTimeStamp;
    v1: unknown;
    v2: unknown;
    s1: StatusType;
    s2: StatusType;
};

import { Value } from "./values";

// t = timestamp, v = value, s status code
export type TimeSegment = {t1: DOMHighResTimeStamp, t2: DOMHighResTimeStamp, v1:Value, v2:Value, s1: number, s2: number};


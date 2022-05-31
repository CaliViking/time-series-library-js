import { StatusType } from './status-type.js';

// t = timestamp, v = value, s status code
export type TimeSegment = {
  t1: DOMHighResTimeStamp;
  t2: DOMHighResTimeStamp;
  v1: unknown;
  v2: unknown;
  s1: StatusType;
  s2: StatusType;
};

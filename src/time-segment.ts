import { StatusType } from './status-type.js';

// t = timestamp, v = value, s status code
export type TimeSegment = {
  t1: Date;
  t2: Date;
  v1: unknown;
  v2: unknown;
  s1: StatusType;
  s2: StatusType;
};

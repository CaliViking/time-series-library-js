import { Severity } from './severity.js';
import { timestamp } from './timestamp.js';

// t = timestamp, v = value, s status code
export type TimeSegment = {
  t1: timestamp;
  t2: timestamp;
  v1: unknown;
  v2: unknown;
  s1: Severity;
  s2: Severity;
};

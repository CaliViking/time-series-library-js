import { StatusType } from './status-type.js';

// t = timestamp, v = value, s status code
export type TimeEntry = { t: DOMHighResTimeStamp; v: unknown; s: StatusType };

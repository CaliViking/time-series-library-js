import { StatusType } from './status-type.js';

// t = timestamp, v = value, s status code
export type TimeEntry = { t: Date; v: unknown; s?: StatusType };

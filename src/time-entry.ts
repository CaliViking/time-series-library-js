import { Severity } from './severity.js';

// t = timestamp, v = value, s status code
export type TimeEntry = { t: number; v: unknown; s?: Severity };

import { IndexMode } from './index-mode.js';
import { timestamp, TimestampArray } from './timestamp.js';
/**
 * Returns an index value representing the found target
 * @param sortedArray The array that you are looking in
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export declare function forwardFindIndex(sortedArray: TimestampArray, target: timestamp, mode?: IndexMode): number | null;
/**
 * Returns an index value representing the found target
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export declare function reverseFindIndex(sortedArray: TimestampArray, target: timestamp, mode?: IndexMode): number;

import { IndexMode } from './index-mode.js';
/**
 * Returns an index value representing the found target
 * Developer note: We could possibly have used Array.findIndex(), but it does not seem to be a good idea on very large arrays such as time series data
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export declare function forwardFindIndex(sortedArray: number[], target: number, mode?: IndexMode): number;

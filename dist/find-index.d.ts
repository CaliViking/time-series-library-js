import { IndexMode } from './index-mode.js';
/**
 * Returns an index value representing the found target
 * @param sortedArray The array that you are looking in
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export declare function forwardFindIndex(sortedArray: BigInt64Array, target: bigint, mode?: IndexMode): number;
/**
 * Returns an index value representing the found target
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export declare function reverseFindIndex(sortedArray: BigInt64Array, target: bigint, mode?: IndexMode): number;

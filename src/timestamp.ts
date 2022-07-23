/** A class to provide flexibility in how Timestamps are handled and allow moving timestamps to a 64 bit BigInt
 * Makes the code more readable
 */
export class TimestampArray extends BigInt64Array {
  /** If someone asks the class what it is, then say this */
  static get [Symbol.species]() {
    return BigInt64Array;
  }
}

/** A simple primitive type representation of the timestamp */
export type timestamp = bigint; // bigint, number

/** Creates a new variable of the Timestamp type by converting it's input to that type */
export function Timestamp(value: string | number | bigint | boolean) {
  return BigInt(value); // BigInt, Number
}

/** The definition of time resolution. Be careful when you change this as stored data will have a different meaning */
export const timestampsPerSecond = 1000000000;

export class TimestampArray extends BigInt64Array {
  // BigInt64Array, Float64Array
  constructor(length?: number) {
    super(length);
  }
}
export type timestamp = bigint; // bigint, number

export function Timestamp(value: string | number | bigint | boolean) {
  return BigInt(value); // BigInt, Number
}

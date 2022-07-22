export class TimestampArray extends Float64Array {
  // BigInt64Array
  constructor(length?: number) {
    super(length);
  }
}
export type timestamp = number; // bigint

export function Timestamp(value: string | number | bigint | boolean) {
  return Number(value);
}

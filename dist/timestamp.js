export class TimestampArray extends BigInt64Array {
    // BigInt64Array, Float64Array
    constructor(length) {
        super(length);
    }
}
export function Timestamp(value) {
    return BigInt(value); // BigInt, Number
}

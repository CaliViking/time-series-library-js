export class TimestampArray extends Float64Array {
    // BigInt64Array
    constructor(length) {
        super(length);
    }
}
export function Timestamp(value) {
    return Number(value);
}

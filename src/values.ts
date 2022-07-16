export type ValuesType = number[] | string[] | boolean[] | object[];
export type ValueType = number | string | boolean | object;

/**
 * Float64Array is for numbers
 * UInt8Array is for boolean
 */
export type ValueArrayType = Float64Array | Uint8Array | string[] | object[];

export const NumberArrayDataType = new Float64Array();
export const BooleanArrayDataType = new Uint8Array();
export const StringArrayDataType: string[] = [];
export const ObjectArrayDataType: object[] = [];

export const NumberDataType = NaN;
export const BooleanDataType: boolean = null;
export const StringDataType = '';
export const ObjectDataType: object = {};

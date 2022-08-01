export declare type ValuesType = number[] | string[] | boolean[] | object[];
export declare type ValueType = number | string | boolean | object;
/**
 * Float64Array is for numbers
 * UInt8Array is for boolean
 */
export declare type ValueArrayType = Float64Array | Uint8Array | string[] | object[];
export declare const NumberArrayDataType: Float64Array;
export declare const BooleanArrayDataType: Uint8Array;
export declare const StringArrayDataType: string[];
export declare const ObjectArrayDataType: object[];
export declare const NumberDataType: number;
export declare const BooleanDataType: boolean;
export declare const StringDataType: string;
export declare const ObjectDataType: object;
/**
 * A helper function that returns a JavaScript data type of the type that is described in the string. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * @param typeName The string that represents tha type name. Array Types: 'Float64Array', 'Uint8Array', 'string[]', 'object[]'. Value Types: 'number', 'boolean', 'string', 'object'
 * @returns A variable of that type. The value in the variable is irrelevant, it's type is what we are looking for
 */
export declare function getDataTypeFromTypeName(typeName: string): string | number | boolean | object;

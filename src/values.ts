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

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const NumberDataType: number = 0;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const BooleanDataType: boolean = false;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const StringDataType: string = '';
export const ObjectDataType: object = {};

/**
 * A helper function that returns a JavaScript data type of the type that is described in the string. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * @param typeName The string that represents tha type name. Array Types: 'Float64Array', 'Uint8Array', 'string[]', 'object[]'. Value Types: 'number', 'boolean', 'string', 'object'
 * @returns A variable of that type. The value in the variable is irrelevant, it's type is what we are looking for
 */
export function getDataTypeFromTypeName(typeName: string): string | number | boolean | object {
  switch (typeName) {
    case 'Float64Array':
    case 'number':
      return NumberDataType;
    case 'Uint8Array':
    case 'boolean':
      return BooleanDataType;
    case 'string[]':
    case 'string':
      return StringDataType;
    case 'object[]':
    case 'object':
      return ObjectDataType;
    default:
      throw Error(`Unknown value array type: ${typeName}`);
  }
}

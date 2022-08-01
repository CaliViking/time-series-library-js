export const NumberArrayDataType = new Float64Array();
export const BooleanArrayDataType = new Uint8Array();
export const StringArrayDataType = [];
export const ObjectArrayDataType = [];
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const NumberDataType = 0;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const BooleanDataType = false;
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const StringDataType = '';
export const ObjectDataType = {};
/**
 * A helper function that returns a JavaScript data type of the type that is described in the string. See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
 * @param typeName The string that represents tha type name. Array Types: 'Float64Array', 'Uint8Array', 'string[]', 'object[]'. Value Types: 'number', 'boolean', 'string', 'object'
 * @returns A variable of that type. The value in the variable is irrelevant, it's type is what we are looking for
 */
export function getDataTypeFromTypeName(typeName) {
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

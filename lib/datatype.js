export var DataType;
(function (DataType) {
    DataType[DataType["string"] = 0] = "string";
    DataType[DataType["number"] = 1] = "number";
    DataType[DataType["boolean"] = 2] = "boolean";
    DataType[DataType["JSON"] = 3] = "JSON";
    DataType[DataType["Date"] = 4] = "Date";
})(DataType || (DataType = {}));

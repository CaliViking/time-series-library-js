export var StatusType;
(function (StatusType) {
    StatusType[StatusType["Good"] = 0] = "Good";
    StatusType[StatusType["Uncertain"] = 1] = "Uncertain";
    StatusType[StatusType["Bad"] = 2] = "Bad";
})(StatusType || (StatusType = {})); // It is important that the order is preserved as Good is less than Uncertain which is less than Bad. Maps to OPC UA Severity https://reference.opcfoundation.org/v104/Core/docs/Part4/7.34.1/

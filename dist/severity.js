export var Severity;
(function (Severity) {
    Severity[Severity["Good"] = 0] = "Good";
    Severity[Severity["Uncertain"] = 1] = "Uncertain";
    Severity[Severity["Bad"] = 2] = "Bad";
})(Severity || (Severity = {})); // It is important that the order is preserved as Good is less than Uncertain which is less than Bad. Maps to OPC UA Severity https://reference.opcfoundation.org/v104/Core/docs/Part4/7.34.1/

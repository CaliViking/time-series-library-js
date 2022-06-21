/**
 * The index mode is used when finding a point in time for time series data
 * - Exclusive means that points that are equal to the requested timestamp are not included
 * - Inclusive means that the first point that is equal the requested timestamp to is included
 * - DiscontinuityInclusive means that all points that are equal to the requested timestamp are included
 */
export var IndexMode;
(function (IndexMode) {
    /** Points that are equal to the requested timestamp are not included */
    IndexMode[IndexMode["Exclusive"] = 0] = "Exclusive";
    /** The first point that is equal the requested timestamp to is included */
    IndexMode[IndexMode["Inclusive"] = 1] = "Inclusive";
    /** All points that are equal to the requested timestamp are included */
    IndexMode[IndexMode["DiscontinuityInclusive"] = 2] = "DiscontinuityInclusive";
})(IndexMode || (IndexMode = {}));

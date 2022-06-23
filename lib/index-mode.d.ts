/**
 * The index mode is used when finding a point in time for time series data
 * - Exclusive means that points that are equal to the requested timestamp are not included
 * - Inclusive means that the first point that is equal the requested timestamp to is included
 * - DiscontinuityInclusive means that all points that are equal to the requested timestamp are included
 */
export declare enum IndexMode {
    /** Points that are equal to the requested timestamp are not included */
    Exclusive = 0,
    /** The first point that is equal the requested timestamp to is included */
    Inclusive = 1,
    /** All points that are equal to the requested timestamp are included */
    DiscontinuityInclusive = 2,
    /** If there is no exact match, then include the first point on the outside */
    ExcludeOverflow = 3
}

export var SliceMode;
(function (SliceMode) {
    /** Points that are equal to the requested timestamp are not included */
    SliceMode[SliceMode["IncludeOverflow"] = 0] = "IncludeOverflow";
    /** The first point that is equal the requested timestamp to is included */
    SliceMode[SliceMode["ExcludeOverflow"] = 1] = "ExcludeOverflow";
})(SliceMode || (SliceMode = {}));

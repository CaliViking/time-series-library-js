export enum SliceMode {
  /** Points that are equal to the requested timestamp are not included */
  IncludeOverflow,
  /** The first point that is equal the requested timestamp to is included */
  ExcludeOverflow,
}

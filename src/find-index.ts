import { IndexMode } from './index-mode.js';

enum CompareReturn {
  /** The value is before the target */
  ValueBeforeTarget,
  /** The value is at the target */
  ValueAtTarget,
  /** The value is after the target */
  ValueAfterTarget,
}

/**
 * An internal function to forwardFindIndex to determine if a value is before, at, or after target
 * @param value The value you are evaluating
 * @param target The value you are comparing with
 * @returns An CompareReturn enum that determines if the value is before, at, or after the target
 */
function compare(value: number, target: number): CompareReturn {
  // For performance reasons: Comparing inequalities first as they are more likely to happen than the equality
  if (value < target) {
    return CompareReturn.ValueBeforeTarget;
  } else if (value > target) {
    return CompareReturn.ValueAfterTarget;
  } else if (value === target) {
    return CompareReturn.ValueAtTarget;
  } else {
    throw Error(`Logical error in compare function: value = ${value}, target = ${target}`);
  }
}

/**
 * Returns an index value representing the found target
 * @param sortedArray The array that you are looking in
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export function forwardFindIndex(
  sortedArray: Float64Array,
  target: number,
  mode: IndexMode = IndexMode.Exclusive
): number {
  /** The minimum edge of the window where the function is looking for the value */
  let valueCursorMin = 0;
  /** The maximum edge of the window where the function is looking for the value */
  let valueCursorMax = sortedArray.length - 1;
  /** The cursor of the value currently being checked */
  let valueCursor = Math.floor(valueCursorMax / 2);
  /** Used to indicate both that a value was found, and what the value is */
  let foundValueCursor = NaN;
  /** Counter used to limit the number of times a loop is run. This is to ensure that the code does not run out of control */
  let count = 0;
  /** The maximum number of times the algorithm will run
   * The maximum value range in Javascript is from -2**53 to 2*53
   * this means that the range is 2**54, hence the max count is 54
   */
  const maxCount = 54;

  // If the originating object is empty, then just return null
  if (sortedArray.length === 0) {
    return null;
  }

  if (target < sortedArray[valueCursorMin]) {
    // There is nothing to do, just return
    if (mode === IndexMode.ExcludeOverflow || mode === IndexMode.IncludeOverflow) {
      return valueCursorMin;
    } else {
      return null;
    }
  }
  if (target > sortedArray[valueCursorMax]) {
    // There is nothing to do, just return
    if (mode === IndexMode.ExcludeOverflow || mode === IndexMode.IncludeOverflow) {
      return null;
    } else {
      return valueCursorMax;
    }
  }

  while (isNaN(foundValueCursor) && count < maxCount) {
    count += 1;
    switch (compare(sortedArray[valueCursor], target)) {
      case CompareReturn.ValueBeforeTarget:
        /** Check to see if the cursor is on the last entry, or if the next value is after the target */
        if (
          mode != IndexMode.ExcludeOverflow &&
          (valueCursor === valueCursorMax ||
            compare(sortedArray[valueCursor + 1], target) === CompareReturn.ValueAfterTarget)
        ) {
          // We are at the end of the array, or the next value is after the value
          foundValueCursor = valueCursor;
        } else {
          // Continue looking
          valueCursorMin = valueCursor;
          valueCursor = Math.ceil((valueCursorMin + valueCursorMax) / 2);
        }
        break;
      case CompareReturn.ValueAfterTarget:
        if (
          mode === IndexMode.ExcludeOverflow &&
          (valueCursor === valueCursorMin ||
            compare(sortedArray[valueCursor - 1], target) === CompareReturn.ValueBeforeTarget)
        ) {
          foundValueCursor = valueCursor;
        } else {
          valueCursorMax = valueCursor;
          valueCursor = Math.floor((valueCursorMin + valueCursorMax) / 2);
        }
        break;
      case CompareReturn.ValueAtTarget:
        switch (mode) {
          case IndexMode.Exclusive:
            // If value cursor is greater than the first array index (valueCursorMin), then return previous index, otherwise null
            foundValueCursor = valueCursor > valueCursorMin ? valueCursor - 1 : null;
            break;
          case IndexMode.IncludeOverflow:
          case IndexMode.ExcludeOverflow:
          case IndexMode.Inclusive:
            foundValueCursor = valueCursor;
            break;
          case IndexMode.DiscontinuityInclusive:
            // We have to potentially look for two consecutive ValueAtTarget if there is a discontinuity
            if (
              valueCursor === valueCursorMax ||
              compare(sortedArray[valueCursor + 1], target) != CompareReturn.ValueAtTarget
            ) {
              // We are at the end of the array, there is no possible next value to include
              // or the next value is not at the same value, so there is no discontinuity
              foundValueCursor = valueCursor;
            } else if (compare(sortedArray[valueCursor + 1], target) === CompareReturn.ValueAtTarget)
              // We are making the assumption that there are a maximum of two points with the same value
              // as this is the simple way to represent a discontinuity
              foundValueCursor = valueCursor + 1;
            break;
        }
        break;
    }
  }
  if (count === maxCount) {
    throw Error(`forwardFindIndex was unable to find value ${target} in ${maxCount} attempts`);
  }
  return foundValueCursor;
}

/**
 * Returns an index value representing the found target
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export function reverseFindIndex(
  sortedArray: Float64Array,
  target: number,
  mode: IndexMode = IndexMode.Exclusive
): number {
  /** The minimum edge of the window where the function is looking for the value */
  let valueCursorMin = 0;
  /** The maximum edge of the window where the function is looking for the value */
  let valueCursorMax = sortedArray.length - 1;
  /** The cursor of the value currently being checked */
  let valueCursor = Math.floor(valueCursorMax / 2);
  /** Used to indicate both that a value was found, and what the value is */
  let foundValueCursor = NaN;
  /** Counter used to limit the number of times a loop is run. This is to ensure that the code does not run out of control */
  let count = 0;
  /** The maximum number of times the algorithm will run
   * The maximum value range in Javascript is from -2**53 to 2*53
   * this means that the range is 2**54, hence the max count is 54
   */
  const maxCount = 54;

  // If the originating object is empty, then just return null
  if (sortedArray.length === 0) {
    return null;
  }

  if (target < sortedArray[valueCursorMin]) {
    // There is nothing to do, just return
    if (mode === IndexMode.ExcludeOverflow || mode === IndexMode.IncludeOverflow) {
      return null;
    } else {
      return valueCursorMin;
    }
  }
  if (target > sortedArray[valueCursorMax]) {
    // There is nothing to do, just return
    if (mode === IndexMode.ExcludeOverflow || mode === IndexMode.IncludeOverflow) {
      return valueCursorMax;
    } else {
      return null;
    }
  }

  while (isNaN(foundValueCursor) && count < maxCount) {
    count += 1;
    switch (compare(sortedArray[valueCursor], target)) {
      case CompareReturn.ValueBeforeTarget:
        if (
          mode === IndexMode.ExcludeOverflow &&
          (valueCursor === valueCursorMax ||
            compare(sortedArray[valueCursor + 1], target) === CompareReturn.ValueAfterTarget)
        ) {
          foundValueCursor = valueCursor;
        } else {
          valueCursorMin = valueCursor;
          valueCursor = Math.ceil((valueCursorMin + valueCursorMax) / 2);
        }
        break;
      case CompareReturn.ValueAfterTarget:
        /** Check to see if the cursor is on the last entry, or if the next value is after the target */
        if (
          mode != IndexMode.ExcludeOverflow &&
          (valueCursor === valueCursorMin ||
            compare(sortedArray[valueCursor - 1], target) === CompareReturn.ValueBeforeTarget)
        ) {
          // We are at the end of the array, or the previous value is before the target
          foundValueCursor = valueCursor;
        } else {
          // Continue looking
          valueCursorMax = valueCursor;
          valueCursor = Math.floor((valueCursorMin + valueCursorMax) / 2);
        }
        break;
      case CompareReturn.ValueAtTarget:
        switch (mode) {
          case IndexMode.Exclusive:
            // If value cursor is less than the last array index (valueCursorMax), then return next index, otherwise null
            foundValueCursor = valueCursor < valueCursorMax ? valueCursor + 1 : null;
            break;
          case IndexMode.IncludeOverflow:
          case IndexMode.ExcludeOverflow:
          case IndexMode.Inclusive:
            foundValueCursor = valueCursor;
            break;
          case IndexMode.DiscontinuityInclusive:
            // We have to potentially look for two consecutive ValueAtTarget if there is a discontinuity
            if (
              valueCursor === valueCursorMin ||
              compare(sortedArray[valueCursor - 1], target) != CompareReturn.ValueAtTarget
            ) {
              // We are at the end of the array, there is no possible next value to include
              // or the next value is not at the same value, so there is no discontinuity
              foundValueCursor = valueCursor;
            } else if (compare(sortedArray[valueCursor - 1], target) === CompareReturn.ValueAtTarget)
              // We are making the assumption that there are a maximum of two points with the same value
              // as this is the simple way to represent a discontinuity
              foundValueCursor = valueCursor - 1;
            break;
        }
        break;
    }
  }
  if (count === maxCount) {
    throw Error(`reverseFindIndex was unable to find value ${target} in ${maxCount} attempts`);
  }
  return foundValueCursor;
}

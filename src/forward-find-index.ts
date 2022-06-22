import { IndexMode } from './index-mode.js';

/**
 * Returns an index value representing the found target
 * Developer note: We could possibly have used Array.findIndex(), but it does not seem to be a good idea on very large arrays such as time series data
 * @param target The value that you are looking for
 * @param mode The type of search
 * @returns The found index number
 */
export function forwardFindIndex(
  sortedArray: number[],
  target: number,
  mode: IndexMode = IndexMode.Exclusive
): number {
  // { from: number; to: number; between: boolean }
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
    return null;
  }
  if (target > sortedArray[valueCursorMax]) {
    // There is nothing to do, just return
    return valueCursorMax;
  }

  while (isNaN(foundValueCursor) && count < maxCount) {
    count += 1;
    switch (compare(sortedArray[valueCursor], target)) {
      case CompareReturn.ValueBeforeTarget:
        /** Check to see if the cursor is on the last entry, or if the next value is after the target */
        if (
          valueCursor === sortedArray.length - 1 ||
          compare(sortedArray[valueCursor + 1], target) === CompareReturn.ValueAfterTarget
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
        valueCursorMax = valueCursor;
        valueCursor = Math.floor((valueCursorMin + valueCursorMax) / 2);
        break;
      case CompareReturn.ValueAtTarget:
        switch (mode) {
          case IndexMode.Exclusive:
            // If value cursor is greater than the first array index (0), then return previous index, otherwise null
            foundValueCursor = valueCursor > 0 ? valueCursor - 1 : null;
            break;
          case IndexMode.Inclusive:
            foundValueCursor = valueCursor;
            break;
          case IndexMode.DiscontinuityInclusive:
            // We have to potentially look for two consecutive ValueAtTarget if there is a discontinuity
            if (
              valueCursor === sortedArray.length - 1 ||
              compare(sortedArray[valueCursor + 1], target) != CompareReturn.ValueAtTarget
            ) {
              // We are at the end of the array, there is no possible next value to include
              // or the next value is not at the same value, so there is no discontinuity
              foundValueCursor = valueCursor;
            } else if (
              compare(sortedArray[valueCursor + 1], target) === CompareReturn.ValueAtTarget
            )
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

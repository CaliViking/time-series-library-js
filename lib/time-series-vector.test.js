import { beforeAll, describe, expect, test } from 'vitest';
import { forwardFindIndex, reverseFindIndex } from './find-index.js';
import { IndexMode } from './index-mode.js';
import { Severity } from './severity.js';
import { SliceMode } from './slice-mode.js';
import { TimeSeriesVector } from './time-series-vector.js';
describe('TimeSeriesVector', function () {
    describe('forwardFindIndex', function () {
        const testPeriod1 = new TimeSeriesVector();
        const arrayLength = 10000;
        beforeAll(function () {
            testPeriod1.timestamps = Array.from(Array(arrayLength)).map((_v, k) => k * 10);
            testPeriod1.values = Array.from(Array(arrayLength).keys());
            testPeriod1.statuses = Array.from({ length: arrayLength }, () => Severity.Good);
        });
        test(`Timestamp 0 Exclusive should find index null`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 0)).toBeNull;
        });
        test(`Timestamp 15 should find index 1`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 15)).toBe(1);
        });
        test(`Timestamp 20 Exclusive should find index 1`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 20)).toBe(1);
        });
        test(`Timestamp 20 Inclusive should find index 2`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 20, IndexMode.Inclusive)).toBe(2);
        });
        test(`Timestamp 49990 Inclusive should find index 4999`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 49990, IndexMode.Inclusive)).toBe(4999);
        });
        test(`Timestamp 99980 Exclusive should find index 9997`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 99980, IndexMode.Exclusive)).toBe(9997);
        });
        test(`Timestamp 99990 Exclusive should find index 9998`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 99990, IndexMode.Exclusive)).toBe(9998);
        });
        test(`Timestamp 99990 Inclusive should find index 9999`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 99990, IndexMode.Inclusive)).toBe(9999);
        });
        test(`Timestamp 100000 Exclusive should find index 9999`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 100000, IndexMode.Exclusive)).toBe(9999);
        });
        test(`Timestamp 100000 Inclusive should find index 9999`, function () {
            expect(forwardFindIndex(testPeriod1.timestamps, 100000, IndexMode.Inclusive)).toBe(9999);
        });
    });
    describe('reverseFindIndex', function () {
        const testPeriod1 = new TimeSeriesVector();
        const arrayLength = 10000;
        beforeAll(function () {
            testPeriod1.timestamps = Array.from(Array(arrayLength)).map((_v, k) => k * 10);
            testPeriod1.values = Array.from(Array(arrayLength).keys());
            testPeriod1.statuses = Array.from({ length: arrayLength }, () => Severity.Good);
        });
        test(`Timestamp 0 Inclusive should find index 0`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 0, IndexMode.Inclusive)).toBe(0);
        });
        test(`Timestamp 0 Exclusive should find index 1`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 0, IndexMode.Exclusive)).toBe(1);
        });
        test(`Timestamp 15 Exclusive should find index 2`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 15, IndexMode.Exclusive)).toBe(2);
        });
        test(`Timestamp 20 Exclusive should find index 2`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 20, IndexMode.Exclusive)).toBe(3);
        });
        test(`Timestamp 20 Inclusive should find index 2`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 20, IndexMode.Inclusive)).toBe(2);
        });
        test(`Timestamp 49990 Inclusive should find index 4999`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 49990, IndexMode.Inclusive)).toBe(4999);
        });
        test(`Timestamp 99980 Exclusive should find index 9999`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 99980, IndexMode.Exclusive)).toBe(9999);
        });
        test(`Timestamp 99990 Exclusive should find index null`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 99990, IndexMode.Exclusive)).toBeNull;
        });
        test(`Timestamp 99990 Inclusive should find index 9999`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 99990, IndexMode.Inclusive)).toBe(9999);
        });
        test(`Timestamp 100000 Exclusive should find index null`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 100000, IndexMode.Exclusive)).toBeNull;
        });
        test(`Timestamp 100000 Inclusive should find index null`, function () {
            expect(reverseFindIndex(testPeriod1.timestamps, 100000, IndexMode.Inclusive)).toBeNull;
        });
    });
    describe('append', function () {
        const testEmptyPeriod1 = new TimeSeriesVector();
        const testPeriod1 = new TimeSeriesVector();
        const testPeriod2 = new TimeSeriesVector();
        const testPeriod3 = new TimeSeriesVector();
        let resultPeriod0;
        let resultPeriod1 = new TimeSeriesVector();
        let resultPeriod2 = new TimeSeriesVector();
        let resultPeriod3 = new TimeSeriesVector();
        const arrayLength = 10000;
        beforeAll(function () {
            testPeriod1.set(Array.from(Array(arrayLength)).map((_v, k) => k * 10), Array.from(Array(arrayLength).keys()), Array.from({ length: arrayLength }, () => Severity.Good));
            // Create testPeriod2 so that it does not overlap testPeriod1
            testPeriod2.set(Array.from(Array(arrayLength)).map((_v, k) => arrayLength * 10 + k * 10), Array.from({ length: arrayLength }, () => 2), Array.from({ length: arrayLength }, () => Severity.Good));
            // Create testPeriod3 so that it does overlap testPeriod1
            testPeriod3.set(Array.from(Array(arrayLength)).map((_v, k) => Math.floor(arrayLength / 2) * 10 + k * 10), Array.from({ length: arrayLength }, () => 4), Array.from({ length: arrayLength }, () => Severity.Good));
            resultPeriod0 = testEmptyPeriod1.append(testPeriod1);
            resultPeriod1 = testPeriod1.append(testPeriod2);
            resultPeriod2 = testPeriod1.append(testPeriod3);
            resultPeriod3 = testPeriod3.append(testPeriod1);
        });
        test(`Appending testPeriod1 to testEmptyPeriod1 should return timestamp length of 10000`, function () {
            expect(resultPeriod0.timestamps.length).toBe(10000);
        });
        test(`Appending testPeriod1 to testEmptyPeriod1 should return a timestamp = 99990 in position 9999`, function () {
            expect(resultPeriod0.timestamps[9999]).toBe(99990);
        });
        test(`Appending testPeriod1 to testEmptyPeriod1 should return a value = 9999 in position 9999`, function () {
            expect(resultPeriod0.values[9999]).toBe(9999);
        });
        test(`Appending testPeriod2 to testPeriod1 should return timestamp length of 20000`, function () {
            expect(resultPeriod1.timestamps.length).toBe(20000);
        });
        test(`Appending testPeriod2 to testPeriod1 should return a timestamp = 100000 in position 10000`, function () {
            expect(resultPeriod1.timestamps[10000]).toBe(100000);
        });
        test(`Appending testPeriod2 to testPeriod1 should return a value = 9999 in position 9999`, function () {
            expect(resultPeriod1.values[9999]).toBe(9999);
        });
        test(`Appending testPeriod2 to testPeriod1 should return a value = 2 in position 10000`, function () {
            expect(resultPeriod1.values[10000]).toBe(2);
        });
        test(`Appending testPeriod3 to testPeriod1 should return timestamp length of 15000`, function () {
            expect(resultPeriod2.timestamps.length).toBe(15000);
        });
        test(`Appending testPeriod3 to testPeriod1 should return a timestamp = 100000 in position 10000`, function () {
            expect(resultPeriod2.timestamps[10000]).toBe(100000);
        });
        test(`Appending testPeriod3 to testPeriod1 should return a value = 4999 in position 4999`, function () {
            expect(resultPeriod2.values[4999]).toBe(4999);
        });
        test(`Appending testPeriod3 to testPeriod1 should return a value = 4 in position 5000`, function () {
            expect(resultPeriod2.values[5000]).toBe(4);
        });
        test(`Appending testPeriod1 to testPeriod3 should return timestamp length of 10000`, function () {
            expect(resultPeriod3.timestamps.length).toBe(10000);
        });
        test(`Appending testPeriod1 to testPeriod3 should return a timestamp = 99990 in position 9999`, function () {
            expect(resultPeriod3.timestamps[9999]).toBe(99990);
        });
        test(`Appending testPeriod1 to testPeriod3 should return a value = 4999 in position 4999`, function () {
            expect(resultPeriod3.values[4999]).toBe(4999);
        });
        test(`Appending testPeriod1 to testPeriod3 should return a value = 5000 in position 5000`, function () {
            expect(resultPeriod3.values[5000]).toBe(5000);
        });
    });
    describe('multiAppend', function () {
        const testPeriods = [];
        let resultPeriod;
        const arrayLength = 1000;
        beforeAll(function () {
            for (let i = 0; i < 5; i++) {
                const tempPeriod = {
                    timestamps: Array.from(Array(arrayLength)).map((_v, k) => (i * arrayLength + k) * 10),
                    values: Array.from(Array(arrayLength).keys()),
                    statuses: Array.from({ length: arrayLength }, () => Severity.Good),
                };
                testPeriods.push(tempPeriod);
            }
            resultPeriod = TimeSeriesVector.multiAppend(testPeriods);
        });
        test(`Appending 5 test periods together of length 1000 should return timestamp length of 5000`, function () {
            expect(resultPeriod.timestamps.length).toBe(5000);
        });
        test(`resultPeriod.timestamps[1000] should be the same as testPeriods[1].timestamps[0]`, function () {
            expect(resultPeriod.timestamps[1000]).toBe(testPeriods[1].timestamps[0]);
        });
        test(`resultPeriod.values[1000] should be the same as testPeriods[1].values[0]`, function () {
            expect(resultPeriod.values[1000]).toBe(testPeriods[1].values[0]);
        });
    });
    describe('replace', function () {
        const testEmptyPeriod1 = new TimeSeriesVector();
        const basePeriod1 = new TimeSeriesVector();
        const afterPeriod2 = new TimeSeriesVector();
        const lateOverlappingPeriod3 = new TimeSeriesVector();
        const insidePeriod4 = new TimeSeriesVector();
        const earlyOverlappingPeriod5 = new TimeSeriesVector();
        let resultEmptyPeriod0;
        let resultAfterPeriod1 = new TimeSeriesVector();
        let resultLateOverlappingPeriod2 = new TimeSeriesVector();
        let resultReverseLateOverlappingPeriod3 = new TimeSeriesVector();
        let resultInsidePeriod4 = new TimeSeriesVector();
        const arrayLength = 10000;
        beforeAll(function () {
            basePeriod1.set(Array.from(Array(arrayLength)).map((_v, k) => k * 10), Array.from(Array(arrayLength).keys()), Array.from({ length: arrayLength }, () => Severity.Good));
            // Create afterPeriod2 so that it does not overlap testPeriod1
            afterPeriod2.set(Array.from(Array(arrayLength)).map((_v, k) => arrayLength * 10 + k * 10), Array.from({ length: arrayLength }, () => 2), Array.from({ length: arrayLength }, () => Severity.Good));
            // Create lateOverlappingPeriod3 so that it does overlap and is later than testPeriod1
            lateOverlappingPeriod3.set(Array.from(Array(arrayLength)).map((_v, k) => Math.floor(arrayLength / 2) * 10 + k * 10), Array.from({ length: arrayLength }, () => 4), Array.from({ length: arrayLength }, () => Severity.Good));
            // Create insidePeriod4 so that it is inside testPeriod1
            insidePeriod4.set(Array.from(Array(Math.floor(arrayLength / 2))).map((_v, k) => Math.floor(arrayLength / 4) * 10 + k * 10), Array.from({ length: Math.floor(arrayLength / 2) }, () => 6), Array.from({ length: Math.floor(arrayLength / 2) }, () => Severity.Good));
            // Create earlyOverlappingPeriod5 so that it does overlap and is before testPeriod1
            earlyOverlappingPeriod5.set(Array.from(Array(arrayLength)).map((_v, k) => -Math.floor(arrayLength / 2) * 10 + k * 10), Array.from({ length: arrayLength }, () => 7), Array.from({ length: arrayLength }, () => Severity.Good));
            resultEmptyPeriod0 = testEmptyPeriod1.replace(basePeriod1);
            resultAfterPeriod1 = basePeriod1.replace(afterPeriod2);
            resultLateOverlappingPeriod2 = basePeriod1.replace(lateOverlappingPeriod3);
            resultReverseLateOverlappingPeriod3 = lateOverlappingPeriod3.replace(basePeriod1);
            resultInsidePeriod4 = basePeriod1.replace(insidePeriod4);
        });
        test(`Replacing basePeriod1 in testEmptyPeriod1 should return timestamp length of 10000`, function () {
            expect(resultEmptyPeriod0.timestamps.length).toBe(10000);
        });
        test(`Replacing basePeriod1 in testEmptyPeriod1 should return a timestamp = 99990 in position 9999`, function () {
            expect(resultEmptyPeriod0.timestamps[9999]).toBe(99990);
        });
        test(`Replacing basePeriod1 in testEmptyPeriod1 should return a value = 9999 in position 9999`, function () {
            expect(resultEmptyPeriod0.values[9999]).toBe(9999);
        });
        test(`Replacing afterPeriod2 in basePeriod1 should return timestamp length of 20000`, function () {
            expect(resultAfterPeriod1.timestamps.length).toBe(20000);
        });
        test(`Replacing afterPeriod2 in basePeriod1 should return a timestamp = 100000 in position 10000`, function () {
            expect(resultAfterPeriod1.timestamps[10000]).toBe(100000);
        });
        test(`Replacing afterPeriod2 in basePeriod1 should return a value = 9999 in position 9999`, function () {
            expect(resultAfterPeriod1.values[9999]).toBe(9999);
        });
        test(`Replacing afterPeriod2 in basePeriod1 should return a value = 2 in position 10000`, function () {
            expect(resultAfterPeriod1.values[10000]).toBe(2);
        });
        test(`Replacing lateOverlappingPeriod3 in basePeriod1 should return timestamp length of 15000`, function () {
            expect(resultLateOverlappingPeriod2.timestamps.length).toBe(15000);
        });
        test(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a timestamp = 100000 in position 10000`, function () {
            expect(resultLateOverlappingPeriod2.timestamps[10000]).toBe(100000);
        });
        test(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a value = 4999 in position 4999`, function () {
            expect(resultLateOverlappingPeriod2.values[4999]).toBe(4999);
        });
        test(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a value = 4 in position 5000`, function () {
            expect(resultLateOverlappingPeriod2.values[5000]).toBe(4);
        });
        test(`Replacing basePeriod1 in lateOverlappingPeriod3 should return timestamp length of 15000`, function () {
            expect(resultReverseLateOverlappingPeriod3.timestamps.length).toBe(15000);
        });
        test(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a timestamp = 99990 in position 9999`, function () {
            expect(resultReverseLateOverlappingPeriod3.timestamps[9999]).toBe(99990);
        });
        test(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 4999 in position 4999`, function () {
            expect(resultReverseLateOverlappingPeriod3.values[4999]).toBe(4999);
        });
        test(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 9999 in position 9999`, function () {
            expect(resultReverseLateOverlappingPeriod3.values[9999]).toBe(9999);
        });
        test(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 4 in position 10000`, function () {
            expect(resultReverseLateOverlappingPeriod3.values[10000]).toBe(4);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return timestamp length of 10000`, function () {
            expect(resultInsidePeriod4.timestamps.length).toBe(10000);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a timestamp = 49990 in position 4999`, function () {
            expect(resultInsidePeriod4.timestamps[4999]).toBe(49990);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a value = 2499 in position 2499`, function () {
            expect(resultInsidePeriod4.values[2499]).toBe(2499);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 2500`, function () {
            expect(resultInsidePeriod4.values[2500]).toBe(6);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 4999`, function () {
            expect(resultInsidePeriod4.values[4999]).toBe(6);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 7499`, function () {
            expect(resultInsidePeriod4.values[7499]).toBe(6);
        });
        test(`Replacing insidePeriod4 in basePeriod1 should return a value = 7500 in position 7500`, function () {
            expect(resultInsidePeriod4.values[7500]).toBe(7500);
        });
    });
    describe('split', function () {
        const testPeriod1 = new TimeSeriesVector();
        let resultPeriods500;
        let resultPeriods1000;
        const arrayLength = 9500;
        beforeAll(function () {
            testPeriod1.set(Array.from(Array(arrayLength)).map((_v, k) => k * 10), Array.from(Array(arrayLength).keys()), Array.from({ length: arrayLength }, () => Severity.Good));
            resultPeriods500 = testPeriod1.split(500);
            resultPeriods1000 = testPeriod1.split(1000);
        });
        test(`resultPeriods500 should contain 19 TimeSeriesPaths`, function () {
            expect(resultPeriods500.length).toBe(19);
        });
        test(`The value of resultPeriods500[0].values[0] should be the same as testPeriod1.values[0]`, function () {
            expect(resultPeriods500[0].values[0]).toBe(testPeriod1.values[0]);
        });
        test(`The value of resultPeriods500[2].values[0] should be the same as testPeriod1.values[1000]`, function () {
            expect(resultPeriods500[2].values[0]).toBe(testPeriod1.values[1000]);
        });
        test(`The value of resultPeriods500[18].values[499] should be the same as testPeriod1.values[9499]`, function () {
            expect(resultPeriods500[18].values[499]).toBe(testPeriod1.values[9499]);
        });
        test(`resultPeriods1000 should contain 10 TimeSeriesPaths`, function () {
            expect(resultPeriods1000.length).toBe(10);
        });
        test(`The value of resultPeriods1000[0].values[0] should be the same as testPeriod1.values[0]`, function () {
            expect(resultPeriods1000[0].values[0]).toBe(testPeriod1.values[0]);
        });
        test(`The value of resultPeriods1000[2].values[0] should be the same as testPeriod1.values[2000]`, function () {
            expect(resultPeriods1000[2].values[0]).toBe(testPeriod1.values[2000]);
        });
        test(`The value of resultPeriods1000[9].values[499] should be the same as testPeriod1.values[9499]`, function () {
            expect(resultPeriods1000[9].values[499]).toBe(testPeriod1.values[9499]);
        });
    });
    describe('slice', function () {
        const testPeriod1 = new TimeSeriesVector();
        let resultIncludeOverflowOnTarget;
        let resultIncludeOverflowOffTarget;
        let resultExcludeOverflowOnTarget;
        let resultExcludeOverflowOffTarget;
        let resultIncludeOverflowOutside;
        let resultExcludeOverflowOutside;
        const arrayLength = 10000;
        beforeAll(function () {
            testPeriod1.set(Array.from(Array(arrayLength)).map((_v, k) => k * 10), Array.from(Array(arrayLength).keys()), Array.from({ length: arrayLength }, () => Severity.Good));
            resultIncludeOverflowOnTarget = testPeriod1.slice(1000, 99000, SliceMode.IncludeOverflow);
            resultExcludeOverflowOnTarget = testPeriod1.slice(1000, 99000, SliceMode.ExcludeOverflow);
            resultIncludeOverflowOffTarget = testPeriod1.slice(995, 99005, SliceMode.IncludeOverflow);
            resultExcludeOverflowOffTarget = testPeriod1.slice(995, 99005, SliceMode.ExcludeOverflow);
            resultIncludeOverflowOutside = testPeriod1.slice(-10, 100010, SliceMode.IncludeOverflow);
            resultExcludeOverflowOutside = testPeriod1.slice(-10, 100010, SliceMode.ExcludeOverflow);
        });
        test(`resultIncludeOverflowOnTarget should have timestamp.length = 9801`, function () {
            expect(resultIncludeOverflowOnTarget.timestamps.length).toBe(9801);
        });
        test(`resultIncludeOverflowOnTarget.timestamps[0] should = 1000`, function () {
            expect(resultIncludeOverflowOnTarget.timestamps[0]).toBe(1000);
        });
        test(`resultIncludeOverflowOnTarget.timestamps[9800] should = 99000`, function () {
            expect(resultIncludeOverflowOnTarget.timestamps[9800]).toBe(99000);
        });
        test(`resultExcludeOverflowOnTarget should have timestamp.length = 9801`, function () {
            expect(resultExcludeOverflowOnTarget.timestamps.length).toBe(9801);
        });
        test(`resultExcludeOverflowOnTarget.timestamps[0] should = 1000`, function () {
            expect(resultExcludeOverflowOnTarget.timestamps[0]).toBe(1000);
        });
        test(`resultExcludeOverflowOnTarget.timestamps[9800] should = 99000`, function () {
            expect(resultExcludeOverflowOnTarget.timestamps[9800]).toBe(99000);
        });
        test(`resultIncludeOverflowOffTarget should have timestamp.length = 9803`, function () {
            expect(resultIncludeOverflowOffTarget.timestamps.length).toBe(9803);
        });
        test(`resultIncludeOverflowOffTarget.timestamps[0] should = 990`, function () {
            expect(resultIncludeOverflowOffTarget.timestamps[0]).toBe(990);
        });
        test(`resultIncludeOverflowOffTarget.timestamps[9802] should = 99010`, function () {
            expect(resultIncludeOverflowOffTarget.timestamps[9802]).toBe(99010);
        });
        test(`resultExcludeOverflowOffTarget should have timestamp.length = 9801`, function () {
            expect(resultExcludeOverflowOffTarget.timestamps.length).toBe(9801);
        });
        test(`resultExcludeOverflowOffTarget.timestamps[0] should = 1000`, function () {
            expect(resultExcludeOverflowOffTarget.timestamps[0]).toBe(1000);
        });
        test(`resultExcludeOverflowOffTarget.timestamps[9800] should = 99000`, function () {
            expect(resultExcludeOverflowOffTarget.timestamps[9800]).toBe(99000);
        });
        test(`resultIncludeOverflowOutside should have timestamp.length = 10000`, function () {
            expect(resultIncludeOverflowOutside.timestamps.length).toBe(10000);
        });
        test(`resultIncludeOverflowOutside.timestamps[0] should = 0`, function () {
            expect(resultIncludeOverflowOutside.timestamps[0]).toBe(0);
        });
        test(`resultIncludeOverflowOutside.timestamps[9999] should = 99990`, function () {
            expect(resultIncludeOverflowOutside.timestamps[9999]).toBe(99990);
        });
        test(`resultExcludeOverflowOutside should have timestamp.length = 10000`, function () {
            expect(resultExcludeOverflowOutside.timestamps.length).toBe(10000);
        });
        test(`resultExcludeOverflowOutside.timestamps[0] should = 0`, function () {
            expect(resultExcludeOverflowOutside.timestamps[0]).toBe(0);
        });
        test(`resultExcludeOverflowOutside.timestamps[9999] should = 99990`, function () {
            expect(resultExcludeOverflowOutside.timestamps[9999]).toBe(99990);
        });
    });
});

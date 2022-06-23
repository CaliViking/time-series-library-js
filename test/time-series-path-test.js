import { equal, deepEqual, notDeepEqual, ok } from 'assert';
import { IndexMode } from '../lib/index-mode.js';
import { SliceMode } from '../lib/slice-mode.js';
import {
  TimeSeriesPath,
  TimeSeriesVector,
  Severity,
  InterpolationMethod,
  DataType,
  forwardFindIndex,
  reverseFindIndex,
} from '../lib/index.js';

describe('time-series-path', function () {
  describe('Severity', function () {
    describe('order test', function () {
      it('Good should be less than Uncertain', function () {
        equal(Severity.Good < Severity.Uncertain, true);
      });
      it('Uncertain should be less than Bad', function () {
        equal(Severity.Uncertain < Severity.Bad, true);
      });
      it('Good should be less than Bad', function () {
        equal(Severity.Good < Severity.Bad, true);
      });
    });
  });
  describe('TimeSeriesPath', function () {
    describe('construct', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      it('should return number for dataType', function () {
        equal(testPeriod.dataType, DataType.number);
      });
      it('should return linear for interpolationMethod', function () {
        equal(testPeriod.interpolationMethod, InterpolationMethod.linear);
      });
    });
    describe('validate()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      it('should return true for validate()', function () {
        equal(testPeriod.validate(), true);
      });
    });
    describe('clone()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      it('should clone', function () {
        deepEqual(testPeriod.clone(), testPeriod);
      });
    });
    describe('not clone()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let testPeriod2 = testPeriod.clone();
      before(function () {
        testPeriod2.dataType = 'string';
      });
      it('is not a clone', function () {
        notDeepEqual(testPeriod2, testPeriod);
      });
    });
    describe('deepClone()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      it('should deepClone', function () {
        deepEqual(testPeriod.deepClone(), testPeriod);
      });
    });
    describe('SetTimeEntries()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let timeEntries = [
        { t: new Date('2022-01-01 00:00:00.000+00').getTime(), v: 100, s: Severity.Good },
        { t: new Date('2022-01-01 00:00:01.000+00').getTime(), v: 101, s: Severity.Uncertain },
      ];
      before(function () {
        testPeriod.setTimeEntries(timeEntries);
      });
      it(`should have 2 time entries after running SetTimeEntries()`, function () {
        equal(testPeriod.timestamps.length, 2);
      });
      it('should pass validate after running SetTimeEntries()', function () {
        equal(testPeriod.validate(), true);
      });
      it('Status should be Severity.Uncertain after running SetTimeEntries()', function () {
        equal(testPeriod.statuses[1], Severity.Uncertain);
      });
    });
    describe('SetTimeEntries() without statuses', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let timeEntries = [
        { t: new Date('2022-01-01 00:00:00.000+00').getTime(), v: 100 },
        { t: new Date('2022-01-01 00:00:01.000+00').getTime(), v: 101 },
      ];
      before(function () {
        testPeriod.setTimeEntries(timeEntries);
      });
      it(`should have 2 time entries after running SetTimeEntries() without statuses`, function () {
        equal(testPeriod.statuses.length, 2);
      });
      it('should pass validate after running SetTimeEntries() without statuses', function () {
        equal(testPeriod.validate(), true);
      });
      it('Status should be Severity.Good after running SetTimeEntries() without statuses', function () {
        equal(testPeriod.statuses[1], Severity.Good);
      });
    });
    describe('setTimeVector()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 100000;
      before(function () {
        testPeriod.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
      });
      it(`should have ${arrayLength} time entries after running setTimeVector`, function () {
        equal(testPeriod.timestamps.length, arrayLength);
      });
      it('should pass validate after running setTimeVector()', function () {
        equal(testPeriod.validate(), true);
      });
    });
    describe('setTimeVector() with no statuses', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 100000;
      before(function () {
        testPeriod.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys())
        );
      });
      it(`should have ${arrayLength} time entries after running setTimeVector() with no statuses`, function () {
        equal(testPeriod.timestamps.length, arrayLength);
      });
      it('should pass validate after running setTimeVector() with no statuses', function () {
        equal(testPeriod.validate(), true);
      });
    });
    describe('getTimeEntries()', function () {
      let testPeriod = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 100000;
      let testLocation = 1000;
      let timeEntries;
      testPeriod.setTimeVector(
        Array.from(Array(arrayLength).keys()),
        Array.from(Array(arrayLength).keys()),
        Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
      );
      timeEntries = testPeriod.getTimeEntries();
      it(`should have ${arrayLength} time entries after running getTimeEntries()`, function () {
        equal(timeEntries.length, arrayLength);
      });
      it(`should have timestamp 0 in timeEntry 0`, function () {
        equal(timeEntries[0].t, 0);
      });
      it(`should have timestamp ${testLocation} in timeEntry ${testLocation}`, function () {
        equal(timeEntries[testLocation].t, testLocation);
      });
      it(`should have value 0 in timeEntry 0`, function () {
        equal(timeEntries[0].t, 0);
      });
      it(`should have value ${testLocation} in timeEntry ${testLocation}`, function () {
        equal(timeEntries[testLocation].v, testLocation);
      });
      it(`should have status 0 in timeEntry 0`, function () {
        equal(timeEntries[0].t, 0);
      });
      it(`should have status 0 in timeEntry ${testLocation}`, function () {
        equal(timeEntries[testLocation].s, 0);
      });
    });
    describe('resample() linear', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 10000;
      let testPeriod2, testPeriod3;

      const originalTimestamps = Array.from(Array(arrayLength).keys()).map((v) => v * 4);
      const originalValues = Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Array.from(Array(arrayLength * 4).keys());
      // Resample to 4 times the original frequency
      const expectedResampleValues = Array.from(Array(arrayLength * 4).keys()).map(
        (v) => (v <= (arrayLength - 1) * 4 ? v * 0.25 : null) // The last values are outside the original array, therefore they are NULL
      );

      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
      );

      testPeriod2 = testPeriod1.resample(resampleTimestamps);

      it(`should have expected members after resampling`, function () {
        equal(JSON.stringify(testPeriod2.values), JSON.stringify(expectedResampleValues)); // Test member equality, not array object equality
      });

      it(`should be immutable to resample`, function () {
        equal(JSON.stringify(testPeriod1.values), JSON.stringify(originalValues));
      });
    });
    describe('resample() previous', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.previous);
      let arrayLength = 5;
      let testPeriod2, testPeriod3;

      const originalTimestamps = Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1);
      const originalValues = Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v); // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= arrayLength * 4
          ? Math.floor((v - 1) / 4.0) // Need to subtract 1 to match the original time-value pairs.
          : v > arrayLength * 4
          ? arrayLength - 1
          : null
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
      );

      testPeriod2 = testPeriod1.resample(resampleTimestamps);

      it(`should have expected members after resampling`, function () {
        equal(JSON.stringify(testPeriod2.values), JSON.stringify(expectedResampleValues));
      });

      it(`should be immutable to resample`, function () {
        equal(JSON.stringify(testPeriod1.values), JSON.stringify(originalValues));
      });
    });
    describe('resample() next', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.next);
      let arrayLength = 5;
      let testPeriod2, testPeriod3;

      const originalTimestamps = Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1);
      const originalValues = Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v); // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= (arrayLength - 1) * 4 + 1
          ? Math.ceil((v - 1) / 4.0) // Need to subtract 1 to match the original time-value pairs.
          : v < 1
          ? 0
          : null
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
      );

      testPeriod2 = testPeriod1.resample(resampleTimestamps);

      it(`should have expected members after resampling`, function () {
        equal(JSON.stringify(testPeriod2.values), JSON.stringify(expectedResampleValues));
      });

      it(`should be immutable to resample`, function () {
        equal(JSON.stringify(testPeriod1.values), JSON.stringify(originalValues));
      });
    });
    describe('resample() none', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.none);
      let arrayLength = 5;
      let testPeriod2;

      const originalTimestamps = Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1);
      const originalValues = Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v); // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= (arrayLength - 1) * 4 + 1 ? ((v - 1) % 4 === 0 ? (v - 1) / 4 : null) : null
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
      );

      testPeriod2 = testPeriod1.resample(resampleTimestamps);

      it(`should have expected members after resampling`, function () {
        equal(JSON.stringify(testPeriod2.values), JSON.stringify(expectedResampleValues));
      });

      it(`should be immutable to resample`, function () {
        equal(JSON.stringify(testPeriod1.values), JSON.stringify(originalValues));
      });
    });
    describe('add()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.add(testPeriod2);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when TSP add`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${testLocation} in location ${testLocation} when TSP add`, function () {
          equal(testPeriod3.values[testLocation], testLocation);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when TSP add`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${testLocation + 1} in location ${
          testLocation + 1
        } when TSP add`, function () {
          equal(testPeriod3.values[testLocation + 1], testLocation + 1);
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.add(testScalarValue);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${
          testLocation / 2 + testScalarValue
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 + testScalarValue);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.values[testLocation + 1], (testLocation + 1) / 2 + testScalarValue);
        });
      });

      describe('Scalar string', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 'my_string';

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.add(testScalarValue);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${
          testLocation / 2 + testScalarValue
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 + testScalarValue);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.values[testLocation + 1], (testLocation + 1) / 2 + testScalarValue);
        });
      });

      describe('Scalar boolean', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = true;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.add(testScalarValue);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${
          testLocation / 2 + testScalarValue
        } in location ${testLocation} when scalar add`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 + testScalarValue);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.values[testLocation + 1], (testLocation + 1) / 2 + testScalarValue);
        });
      });
    });
    describe('subtract()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.subtract(testPeriod2);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when TSP subtract`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${0} in location ${testLocation} when TSP subtract`, function () {
          equal(testPeriod3.values[testLocation], 0);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when TSP subtract`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${0} in location ${testLocation + 1} when TSP subtract`, function () {
          equal(testPeriod3.values[testLocation + 1], 0);
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.subtract(testScalarValue);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when scalar subtract`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${
          testLocation / 2 - testScalarValue
        } in location ${testLocation} when scalar subtract`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 - testScalarValue);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar subtract`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${(testLocation + 1) / 2 - testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          equal(testPeriod3.values[testLocation + 1], (testLocation + 1) / 2 - testScalarValue);
        });
      });

      describe('Scalar string', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 'my_string';

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.subtract(testScalarValue);
        });

        it(`should have timestamp ${
          testLocation / 2
        } in location ${testLocation} when scalar subtract`, function () {
          equal(testPeriod3.timestamps[testLocation], testLocation / 2);
        });
        it(`should have value ${
          testLocation / 2 - testScalarValue
        } in location ${testLocation} when scalar subtract`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 - testScalarValue);
        });
        it(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar subtract`, function () {
          equal(testPeriod3.timestamps[testLocation + 1], (testLocation + 1) / 2);
        });
        it(`should have value ${(testLocation + 1) / 2 - testScalarValue} in location ${
          testLocation + 1
        } when scalar subtract`, function () {
          equal(testPeriod3.values[testLocation + 1], (testLocation + 1) / 2 - testScalarValue);
        });
      });
    });
    describe('multiply()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.multiply(testPeriod2);
        });

        it(`should have value ${
          ((testLocation / 2) * testLocation) / 2
        } in location ${testLocation} when TSP multiply`, function () {
          equal(testPeriod3.values[testLocation], ((testLocation / 2) * testLocation) / 2);
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.multiply(testScalarValue);
        });

        it(`should have value ${
          (testLocation / 2) * testScalarValue
        } in location ${testLocation} when scalar multiply`, function () {
          equal(testPeriod3.values[testLocation], (testLocation / 2) * testScalarValue);
        });
      });
    });
    describe('divide()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.divide(testPeriod2);
        });

        it(`should have value ${1} in location ${testLocation} when TSP divide`, function () {
          equal(testPeriod3.values[testLocation], 1);
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.divide(testScalarValue);
        });

        it(`should have value ${
          testLocation / 2 / testScalarValue
        } in location ${testLocation} when scalar divide`, function () {
          equal(testPeriod3.values[testLocation], testLocation / 2 / testScalarValue);
        });
      });
    });
    describe('pow()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.pow(testPeriod2);
        });

        it(`should have value ${
          (testLocation / 2) ** (testLocation / 2)
        } in location ${testLocation} when TSP pow`, function () {
          equal(testPeriod3.values[testLocation], (testLocation / 2) ** (testLocation / 2));
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.pow(testScalarValue);
        });

        it(`should have value ${
          (testLocation / 2) ** testScalarValue
        } in location ${testLocation} when scalar pow`, function () {
          equal(testPeriod3.values[testLocation], (testLocation / 2) ** testScalarValue);
        });
      });
    });
    describe('remainder()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod1.remainder(testPeriod2);
        });

        it(`should have value ${
          (testLocation / 2) % (testLocation / 2)
        } in location ${testLocation} when TSP remainder`, function () {
          equal(testPeriod3.values[testLocation], (testLocation / 2) % (testLocation / 2));
        });
      });

      describe('Scalar number', function () {
        let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;
        let testScalarValue = 3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)
          );
          testPeriod3 = testPeriod2.remainder(testScalarValue);
        });

        it(`should have value ${
          (testLocation / 2) % testScalarValue
        } in location ${testLocation} when scalar remainder`, function () {
          equal(testPeriod3.values[testLocation], (testLocation / 2) % testScalarValue);
        });
      });
    });
    describe('negate()', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 10000;
      let testLocation = 100;
      let testPeriod2;

      before(function () {
        testPeriod1.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        testPeriod2 = testPeriod1.negate(testPeriod1);
      });

      it(`should have value ${-testLocation} in location ${testLocation} when negate`, function () {
        equal(testPeriod2.values[testLocation], -testLocation);
      });
    });
    describe('aggregation', function () {
      let testPeriod1 = new TimeSeriesPath(DataType.number, InterpolationMethod.linear);
      let arrayLength = 10000;
      let testLocation = 100;
      let testPeriod2, testPeriod3;
      let testPeriods;

      before(function () {
        testPeriod1.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        testPeriod2 = testPeriod1.subtract(2);
        testPeriod3 = testPeriod1.add(2);
        testPeriods = [testPeriod1, testPeriod2, testPeriod3];
      });

      it(`should have sum value ${testLocation * 3} in location ${testLocation}`, function () {
        equal(TimeSeriesPath.sum(testPeriods).values[testLocation], testLocation * 3);
      });
      it(`should have avg value ${testLocation} in location ${testLocation}`, function () {
        equal(TimeSeriesPath.avg(testPeriods).values[testLocation], testLocation);
      });
      it(`should have min value ${testLocation - 2} in location ${testLocation}`, function () {
        equal(TimeSeriesPath.min(testPeriods).values[testLocation], testLocation - 2);
      });
      it(`should have max value ${testLocation + 2} in location ${testLocation}`, function () {
        equal(TimeSeriesPath.max(testPeriods).values[testLocation], testLocation + 2);
      });
      it(`should have range value ${4} in location ${testLocation}`, function () {
        equal(TimeSeriesPath.range(testPeriods).values[testLocation], 4);
      });
    });
  });
  describe('TimeSeriesVector', function () {
    describe('forwardFindIndex', function () {
      let testPeriod1 = new TimeSeriesVector();
      let arrayLength = 10000;

      before(function () {
        testPeriod1.timestamps = Array.from(Array(arrayLength)).map((_v, k) => k * 10);
        testPeriod1.values = Array.from(Array(arrayLength).keys());
        testPeriod1.statuses = Array.from({ length: arrayLength }, (_v, _k) => Severity.Good);
      });

      it(`Timestamp 0 Exclusive should find index null`, function () {
        ok(forwardFindIndex(testPeriod1.timestamps, 0) === null);
      });
      it(`Timestamp 15 should find index 1`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 15), 1);
      });
      it(`Timestamp 20 Exclusive should find index 1`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 20), 1);
      });
      it(`Timestamp 20 Inclusive should find index 2`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 20, IndexMode.Inclusive), 2);
      });
      it(`Timestamp 49990 Inclusive should find index 4999`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 49990, IndexMode.Inclusive), 4999);
      });
      it(`Timestamp 99980 Exclusive should find index 9997`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 99980, IndexMode.Exclusive), 9997);
      });
      it(`Timestamp 99990 Exclusive should find index 9998`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 99990, IndexMode.Exclusive), 9998);
      });
      it(`Timestamp 99990 Inclusive should find index 9999`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 99990, IndexMode.Inclusive), 9999);
      });
      it(`Timestamp 100000 Exclusive should find index 9999`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 100000, IndexMode.Exclusive), 9999);
      });
      it(`Timestamp 100000 Inclusive should find index 9999`, function () {
        equal(forwardFindIndex(testPeriod1.timestamps, 100000, IndexMode.Inclusive), 9999);
      });
    });
    describe('reverseFindIndex', function () {
      let testPeriod1 = new TimeSeriesVector();
      let arrayLength = 10000;

      before(function () {
        testPeriod1.timestamps = Array.from(Array(arrayLength)).map((_v, k) => k * 10);
        testPeriod1.values = Array.from(Array(arrayLength).keys());
        testPeriod1.statuses = Array.from({ length: arrayLength }, (_v, _k) => Severity.Good);
      });

      it(`Timestamp 0 Inclusive should find index 0`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 0, IndexMode.Inclusive), 0);
      });
      it(`Timestamp 0 Exclusive should find index 1`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 0, IndexMode.Exclusive), 1);
      });
      it(`Timestamp 15 Exclusive should find index 2`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 15, IndexMode.Exclusive), 2);
      });
      it(`Timestamp 20 Exclusive should find index 2`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 20, IndexMode.Exclusive), 3);
      });
      it(`Timestamp 20 Inclusive should find index 2`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 20, IndexMode.Inclusive), 2);
      });
      it(`Timestamp 49990 Inclusive should find index 4999`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 49990, IndexMode.Inclusive), 4999);
      });
      it(`Timestamp 99980 Exclusive should find index 9999`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 99980, IndexMode.Exclusive), 9999);
      });
      it(`Timestamp 99990 Exclusive should find index null`, function () {
        ok(reverseFindIndex(testPeriod1.timestamps, 99990, IndexMode.Exclusive) === null);
      });
      it(`Timestamp 99990 Inclusive should find index 9999`, function () {
        equal(reverseFindIndex(testPeriod1.timestamps, 99990, IndexMode.Inclusive), 9999);
      });
      it(`Timestamp 100000 Exclusive should find index null`, function () {
        ok(reverseFindIndex(testPeriod1.timestamps, 100000, IndexMode.Exclusive) === null);
      });
      it(`Timestamp 100000 Inclusive should find index null`, function () {
        ok(reverseFindIndex(testPeriod1.timestamps, 100000, IndexMode.Inclusive) === null);
      });
    });
    describe('append', function () {
      let testEmptyPeriod1 = new TimeSeriesVector();
      let testPeriod1 = new TimeSeriesVector();
      let testPeriod2 = new TimeSeriesVector();
      let testPeriod3 = new TimeSeriesVector();
      let resultPeriod0;
      let resultPeriod1 = new TimeSeriesVector();
      let resultPeriod2 = new TimeSeriesVector();
      let resultPeriod3 = new TimeSeriesVector();
      let arrayLength = 10000;

      before(function () {
        testPeriod1.set(
          Array.from(Array(arrayLength)).map((_v, k) => k * 10),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        // Create testPeriod2 so that it does not overlap testPeriod1
        testPeriod2.set(
          Array.from(Array(arrayLength)).map((_v, k) => arrayLength * 10 + k * 10),
          Array.from({ length: arrayLength }, (_v, _k) => 2),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        // Create testPeriod3 so that it does overlap testPeriod1
        testPeriod3.set(
          Array.from(Array(arrayLength)).map((_v, k) => Math.floor(arrayLength / 2) * 10 + k * 10),
          Array.from({ length: arrayLength }, (_v, _k) => 4),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );

        resultPeriod0 = testEmptyPeriod1.append(testPeriod1);
        resultPeriod1 = testPeriod1.append(testPeriod2);
        resultPeriod2 = testPeriod1.append(testPeriod3);
        resultPeriod3 = testPeriod3.append(testPeriod1);
      });

      it(`Appending testPeriod1 to testEmptyPeriod1 should return timestamp length of 10000`, function () {
        equal(resultPeriod0.timestamps.length, 10000);
      });
      it(`Appending testPeriod1 to testEmptyPeriod1 should return a timestamp = 99990 in position 9999`, function () {
        equal(resultPeriod0.timestamps[9999], 99990);
      });
      it(`Appending testPeriod1 to testEmptyPeriod1 should return a value = 9999 in position 9999`, function () {
        equal(resultPeriod0.values[9999], 9999);
      });

      it(`Appending testPeriod2 to testPeriod1 should return timestamp length of 20000`, function () {
        equal(resultPeriod1.timestamps.length, 20000);
      });
      it(`Appending testPeriod2 to testPeriod1 should return a timestamp = 100000 in position 10000`, function () {
        equal(resultPeriod1.timestamps[10000], 100000);
      });
      it(`Appending testPeriod2 to testPeriod1 should return a value = 9999 in position 9999`, function () {
        equal(resultPeriod1.values[9999], 9999);
      });
      it(`Appending testPeriod2 to testPeriod1 should return a value = 2 in position 10000`, function () {
        equal(resultPeriod1.values[10000], 2);
      });

      it(`Appending testPeriod3 to testPeriod1 should return timestamp length of 15000`, function () {
        equal(resultPeriod2.timestamps.length, 15000);
      });
      it(`Appending testPeriod3 to testPeriod1 should return a timestamp = 100000 in position 10000`, function () {
        equal(resultPeriod2.timestamps[10000], 100000);
      });
      it(`Appending testPeriod3 to testPeriod1 should return a value = 4999 in position 4999`, function () {
        equal(resultPeriod2.values[4999], 4999);
      });
      it(`Appending testPeriod3 to testPeriod1 should return a value = 4 in position 5000`, function () {
        equal(resultPeriod2.values[5000], 4);
      });

      it(`Appending testPeriod1 to testPeriod3 should return timestamp length of 10000`, function () {
        equal(resultPeriod3.timestamps.length, 10000);
      });
      it(`Appending testPeriod1 to testPeriod3 should return a timestamp = 99990 in position 9999`, function () {
        equal(resultPeriod3.timestamps[9999], 99990);
      });
      it(`Appending testPeriod1 to testPeriod3 should return a value = 4999 in position 4999`, function () {
        equal(resultPeriod3.values[4999], 4999);
      });
      it(`Appending testPeriod1 to testPeriod3 should return a value = 5000 in position 5000`, function () {
        equal(resultPeriod3.values[5000], 5000);
      });
    });
    describe('multiAppend', function () {
      let testPeriods = [];
      let resultPeriod;
      let arrayLength = 1000;

      before(function () {
        for (let i = 0; i < 5; i++) {
          const tempPeriod = {
            timestamps: Array.from(Array(arrayLength)).map((_v, k) => (i * arrayLength + k) * 10),
            values: Array.from(Array(arrayLength).keys()),
            statuses: Array.from({ length: arrayLength }, (_v, _k) => Severity.Good),
          };
          testPeriods.push(tempPeriod);
        }
        resultPeriod = TimeSeriesVector.multiAppend(testPeriods);
      });

      it(`Appending 5 test periods together of length 1000 should return timestamp length of 5000`, function () {
        equal(resultPeriod.timestamps.length, 5000);
      });
      it(`resultPeriod.timestamps[1000] should be the same as testPeriods[1].timestamps[0]`, function () {
        equal(resultPeriod.timestamps[1000], testPeriods[1].timestamps[0]);
      });
      it(`resultPeriod.values[1000] should be the same as testPeriods[1].values[0]`, function () {
        equal(resultPeriod.values[1000], testPeriods[1].values[0]);
      });
    });
    describe('replace', function () {
      let testEmptyPeriod1 = new TimeSeriesVector();
      let basePeriod1 = new TimeSeriesVector();
      let afterPeriod2 = new TimeSeriesVector();
      let lateOverlappingPeriod3 = new TimeSeriesVector();
      let insidePeriod4 = new TimeSeriesVector();
      let earlyOverlappingPeriod5 = new TimeSeriesVector();
      let resultEmptyPeriod0;
      let resultAfterPeriod1 = new TimeSeriesVector();
      let resultLateOverlappingPeriod2 = new TimeSeriesPath(
        DataType.number,
        InterpolationMethod.linear
      );
      let resultReverseLateOverlappingPeriod3 = new TimeSeriesPath(
        DataType.number,
        InterpolationMethod.linear
      );
      let resultInsidePeriod4 = new TimeSeriesVector();
      let resultEarlyOverlappingPeriod5 = new TimeSeriesPath(
        DataType.number,
        InterpolationMethod.linear
      );
      let arrayLength = 10000;

      before(function () {
        basePeriod1.set(
          Array.from(Array(arrayLength)).map((_v, k) => k * 10),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        // Create afterPeriod2 so that it does not overlap testPeriod1
        afterPeriod2.set(
          Array.from(Array(arrayLength)).map((_v, k) => arrayLength * 10 + k * 10),
          Array.from({ length: arrayLength }, (_v, _k) => 2),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        // Create lateOverlappingPeriod3 so that it does overlap and is later than testPeriod1
        lateOverlappingPeriod3.set(
          Array.from(Array(arrayLength)).map((_v, k) => Math.floor(arrayLength / 2) * 10 + k * 10),
          Array.from({ length: arrayLength }, (_v, _k) => 4),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        // Create insidePeriod4 so that it is inside testPeriod1
        insidePeriod4.set(
          Array.from(Array(Math.floor(arrayLength / 2))).map(
            (_v, k) => Math.floor(arrayLength / 4) * 10 + k * 10
          ),
          Array.from({ length: Math.floor(arrayLength / 2) }, (_v, _k) => 6),
          Array.from({ length: Math.floor(arrayLength / 2) }, (_v, _k) => Severity.Good)
        );
        // Create earlyOverlappingPeriod5 so that it does overlap and is before testPeriod1
        earlyOverlappingPeriod5.set(
          Array.from(Array(arrayLength)).map((_v, k) => -Math.floor(arrayLength / 2) * 10 + k * 10),
          Array.from({ length: arrayLength }, (_v, _k) => 7),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );

        resultEmptyPeriod0 = testEmptyPeriod1.replace(basePeriod1);
        resultAfterPeriod1 = basePeriod1.replace(afterPeriod2);
        resultLateOverlappingPeriod2 = basePeriod1.replace(lateOverlappingPeriod3);
        resultReverseLateOverlappingPeriod3 = lateOverlappingPeriod3.replace(basePeriod1);
        resultInsidePeriod4 = basePeriod1.replace(insidePeriod4);
        resultEarlyOverlappingPeriod5 = basePeriod1.replace(earlyOverlappingPeriod5);
      });

      it(`Replacing basePeriod1 in testEmptyPeriod1 should return timestamp length of 10000`, function () {
        equal(resultEmptyPeriod0.timestamps.length, 10000);
      });
      it(`Replacing basePeriod1 in testEmptyPeriod1 should return a timestamp = 99990 in position 9999`, function () {
        equal(resultEmptyPeriod0.timestamps[9999], 99990);
      });
      it(`Replacing basePeriod1 in testEmptyPeriod1 should return a value = 9999 in position 9999`, function () {
        equal(resultEmptyPeriod0.values[9999], 9999);
      });

      it(`Replacing afterPeriod2 in basePeriod1 should return timestamp length of 20000`, function () {
        equal(resultAfterPeriod1.timestamps.length, 20000);
      });
      it(`Replacing afterPeriod2 in basePeriod1 should return a timestamp = 100000 in position 10000`, function () {
        equal(resultAfterPeriod1.timestamps[10000], 100000);
      });
      it(`Replacing afterPeriod2 in basePeriod1 should return a value = 9999 in position 9999`, function () {
        equal(resultAfterPeriod1.values[9999], 9999);
      });
      it(`Replacing afterPeriod2 in basePeriod1 should return a value = 2 in position 10000`, function () {
        equal(resultAfterPeriod1.values[10000], 2);
      });

      it(`Replacing lateOverlappingPeriod3 in basePeriod1 should return timestamp length of 15000`, function () {
        equal(resultLateOverlappingPeriod2.timestamps.length, 15000);
      });
      it(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a timestamp = 100000 in position 10000`, function () {
        equal(resultLateOverlappingPeriod2.timestamps[10000], 100000);
      });
      it(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a value = 4999 in position 4999`, function () {
        equal(resultLateOverlappingPeriod2.values[4999], 4999);
      });
      it(`Replacing lateOverlappingPeriod3 in basePeriod1 should return a value = 4 in position 5000`, function () {
        equal(resultLateOverlappingPeriod2.values[5000], 4);
      });

      it(`Replacing basePeriod1 in lateOverlappingPeriod3 should return timestamp length of 15000`, function () {
        equal(resultReverseLateOverlappingPeriod3.timestamps.length, 15000);
      });
      it(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a timestamp = 99990 in position 9999`, function () {
        equal(resultReverseLateOverlappingPeriod3.timestamps[9999], 99990);
      });
      it(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 4999 in position 4999`, function () {
        equal(resultReverseLateOverlappingPeriod3.values[4999], 4999);
      });
      it(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 9999 in position 9999`, function () {
        equal(resultReverseLateOverlappingPeriod3.values[9999], 9999);
      });
      it(`Replacing basePeriod1 in lateOverlappingPeriod3 should return a value = 4 in position 10000`, function () {
        equal(resultReverseLateOverlappingPeriod3.values[10000], 4);
      });

      it(`Replacing insidePeriod4 in basePeriod1 should return timestamp length of 10000`, function () {
        equal(resultInsidePeriod4.timestamps.length, 10000);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a timestamp = 49990 in position 4999`, function () {
        equal(resultInsidePeriod4.timestamps[4999], 49990);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a value = 2499 in position 2499`, function () {
        equal(resultInsidePeriod4.values[2499], 2499);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 2500`, function () {
        equal(resultInsidePeriod4.values[2500], 6);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 4999`, function () {
        equal(resultInsidePeriod4.values[4999], 6);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a value = 6 in position 7499`, function () {
        equal(resultInsidePeriod4.values[7499], 6);
      });
      it(`Replacing insidePeriod4 in basePeriod1 should return a value = 7500 in position 7500`, function () {
        equal(resultInsidePeriod4.values[7500], 7500);
      });
    });
    describe('split', function () {
      let testPeriod1 = new TimeSeriesVector();
      let resultPeriods500;
      let resultPeriods1000;
      let arrayLength = 9500;

      before(function () {
        testPeriod1.set(
          Array.from(Array(arrayLength)).map((_v, k) => k * 10),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        resultPeriods500 = testPeriod1.split(500);
        resultPeriods1000 = testPeriod1.split(1000);
      });

      it(`resultPeriods500 should contain 19 TimeSeriesPaths`, function () {
        equal(resultPeriods500.length, 19);
      });
      it(`The value of resultPeriods500[0].values[0] should be the same as testPeriod1.values[0]`, function () {
        equal(resultPeriods500[0].values[0], testPeriod1.values[0]);
      });
      it(`The value of resultPeriods500[2].values[0] should be the same as testPeriod1.values[1000]`, function () {
        equal(resultPeriods500[2].values[0], testPeriod1.values[1000]);
      });
      it(`The value of resultPeriods500[18].values[499] should be the same as testPeriod1.values[9499]`, function () {
        equal(resultPeriods500[18].values[499], testPeriod1.values[9499]);
      });

      it(`resultPeriods1000 should contain 10 TimeSeriesPaths`, function () {
        equal(resultPeriods1000.length, 10);
      });
      it(`The value of resultPeriods1000[0].values[0] should be the same as testPeriod1.values[0]`, function () {
        equal(resultPeriods1000[0].values[0], testPeriod1.values[0]);
      });
      it(`The value of resultPeriods1000[2].values[0] should be the same as testPeriod1.values[2000]`, function () {
        equal(resultPeriods1000[2].values[0], testPeriod1.values[2000]);
      });
      it(`The value of resultPeriods1000[9].values[499] should be the same as testPeriod1.values[9499]`, function () {
        equal(resultPeriods1000[9].values[499], testPeriod1.values[9499]);
      });
    });
    describe('slice', function () {
      let testPeriod1 = new TimeSeriesVector();
      let resultIncludeOverflowOnTarget;
      let resultIncludeOverflowOffTarget;
      let resultExcludeOverflowOnTarget;
      let resultExcludeOverflowOffTarget;
      let resultIncludeOverflowOutside;
      let resultExcludeOverflowOutside;
      let arrayLength = 10000;

      before(function () {
        testPeriod1.set(
          Array.from(Array(arrayLength)).map((_v, k) => k * 10),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => Severity.Good)
        );
        resultIncludeOverflowOnTarget = testPeriod1.slice(1000, 99000, SliceMode.IncludeOverflow);
        resultExcludeOverflowOnTarget = testPeriod1.slice(1000, 99000, SliceMode.ExcludeOverflow);
        resultIncludeOverflowOffTarget = testPeriod1.slice(995, 99005, SliceMode.IncludeOverflow);
        resultExcludeOverflowOffTarget = testPeriod1.slice(995, 99005, SliceMode.ExcludeOverflow);
        resultIncludeOverflowOutside = testPeriod1.slice(-10, 100010, SliceMode.IncludeOverflow);
        resultExcludeOverflowOutside = testPeriod1.slice(-10, 100010, SliceMode.ExcludeOverflow);
      });

      it(`resultIncludeOverflowOnTarget should have timestamp.length = 9801`, function () {
        equal(resultIncludeOverflowOnTarget.timestamps.length, 9801);
      });
      it(`resultIncludeOverflowOnTarget.timestamps[0] should = 1000`, function () {
        equal(resultIncludeOverflowOnTarget.timestamps[0], 1000);
      });
      it(`resultIncludeOverflowOnTarget.timestamps[9800] should = 99000`, function () {
        equal(resultIncludeOverflowOnTarget.timestamps[9800], 99000);
      });

      it(`resultExcludeOverflowOnTarget should have timestamp.length = 9801`, function () {
        equal(resultExcludeOverflowOnTarget.timestamps.length, 9801);
      });
      it(`resultExcludeOverflowOnTarget.timestamps[0] should = 1000`, function () {
        equal(resultExcludeOverflowOnTarget.timestamps[0], 1000);
      });
      it(`resultExcludeOverflowOnTarget.timestamps[9800] should = 99000`, function () {
        equal(resultExcludeOverflowOnTarget.timestamps[9800], 99000);
      });

      it(`resultIncludeOverflowOffTarget should have timestamp.length = 9803`, function () {
        equal(resultIncludeOverflowOffTarget.timestamps.length, 9803);
      });
      it(`resultIncludeOverflowOffTarget.timestamps[0] should = 990`, function () {
        equal(resultIncludeOverflowOffTarget.timestamps[0], 990);
      });
      it(`resultIncludeOverflowOffTarget.timestamps[9802] should = 99010`, function () {
        equal(resultIncludeOverflowOffTarget.timestamps[9802], 99010);
      });

      it(`resultExcludeOverflowOffTarget should have timestamp.length = 9801`, function () {
        equal(resultExcludeOverflowOffTarget.timestamps.length, 9801);
      });
      it(`resultExcludeOverflowOffTarget.timestamps[0] should = 1000`, function () {
        equal(resultExcludeOverflowOffTarget.timestamps[0], 1000);
      });
      it(`resultExcludeOverflowOffTarget.timestamps[9800] should = 99000`, function () {
        equal(resultExcludeOverflowOffTarget.timestamps[9800], 99000);
      });

      it(`resultIncludeOverflowOutside should have timestamp.length = 10000`, function () {
        equal(resultIncludeOverflowOutside.timestamps.length, 10000);
      });
      it(`resultIncludeOverflowOutside.timestamps[0] should = 0`, function () {
        equal(resultIncludeOverflowOutside.timestamps[0], 0);
      });
      it(`resultIncludeOverflowOutside.timestamps[9999] should = 99990`, function () {
        equal(resultIncludeOverflowOutside.timestamps[9999], 99990);
      });

      it(`resultExcludeOverflowOutside should have timestamp.length = 10000`, function () {
        equal(resultExcludeOverflowOutside.timestamps.length, 10000);
      });
      it(`resultExcludeOverflowOutside.timestamps[0] should = 0`, function () {
        equal(resultExcludeOverflowOutside.timestamps[0], 0);
      });
      it(`resultExcludeOverflowOutside.timestamps[9999] should = 99990`, function () {
        equal(resultExcludeOverflowOutside.timestamps[9999], 99990);
      });
    });
  });
});

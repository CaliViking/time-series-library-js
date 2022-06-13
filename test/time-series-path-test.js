import { equal, deepEqual, notDeepEqual } from 'assert';
import { TimeSeriesPath, Severity, InterpolationMethod, DataType } from '../lib/index.js';

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
});

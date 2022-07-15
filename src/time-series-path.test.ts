import { beforeAll, describe, expect, test } from 'vitest';
import { InterpolationMethod } from './interpolation-method.js';
import { Severity } from './severity.js';
import { TimeSeriesPath } from './time-series-path.js';
import { FloatDataType, StatusesClass, TimestampsClass, ValueArrayType, Vector } from './vector.js';
import { whatsMyType } from './what-is-my-type.js';

describe('time-series-path', function () {
  describe('Severity', function () {
    describe('order test', function () {
      test('Good should be less than Uncertain', function () {
        expect(Severity.Good < Severity.Uncertain).toBe(true);
      });
      test('Uncertain should be less than Bad', function () {
        expect(Severity.Uncertain < Severity.Bad).toBe(true);
      });
      test('Good should be less than Bad', function () {
        expect(Severity.Good < Severity.Bad).toBe(true);
      });
    });
  });
  describe('TimeSeriesPath', function () {
    describe('construct', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      testPeriod.vector = new Vector({ dataType: FloatDataType, length: 0 });
      test('should return number for dataType', function () {
        expect(whatsMyType(testPeriod.vector.values)).toBe('Float64Array');
      });
      test('should return linear for interpolationMethod', function () {
        expect(testPeriod.interpolationMethod).toBe(InterpolationMethod.linear);
      });
    });
    describe('validate()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      testPeriod.vector = new Vector({ dataType: FloatDataType, length: 0 });
      test('should return true for validate()', function () {
        expect(testPeriod.validate()).toBe(true);
      });
    });
    describe('clone()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      testPeriod.vector = new Vector({ dataType: FloatDataType, length: 0 });
      test('should clone', function () {
        expect(testPeriod.clone()).toEqual(testPeriod);
      });
    });
    describe('not clone()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      testPeriod.vector = new Vector({ dataType: FloatDataType, length: 0 });
      const testPeriod2 = testPeriod.clone();
      testPeriod2.vector = new Vector({ dataType: FloatDataType, length: 0 });
      beforeAll(function () {
        testPeriod2.name = 'Fred';
      });
      test('is not a clone', function () {
        expect(testPeriod2).not.toEqual(testPeriod);
      });
    });
    describe('deepClone()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      testPeriod.vector = new Vector({ dataType: FloatDataType, length: 0 });
      test('should deepClone', function () {
        expect(testPeriod.deepClone()).toEqual(testPeriod);
      });
    });
    describe('SetTimeEntries()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const timeEntries = [
        { t: new Date('2022-01-01 00:00:00.000+00').getTime(), v: 100, s: Severity.Good },
        { t: new Date('2022-01-01 00:00:01.000+00').getTime(), v: 101, s: Severity.Uncertain },
      ];
      beforeAll(function () {
        testPeriod.setTimeEntries(timeEntries);
      });
      test(`should have 2 time entries after running SetTimeEntries()`, function () {
        expect(testPeriod.vector.timestamps.length).toBe(2);
      });
      test('should pass validate after running SetTimeEntries()', function () {
        expect(testPeriod.validate()).toBe(true);
      });
      test('Status should be Severity.Uncertain after running SetTimeEntries()', function () {
        expect(testPeriod.vector.statuses[1]).toBe(Severity.Uncertain);
      });
    });
    describe('SetTimeEntries() without statuses', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const timeEntries = [
        { t: new Date('2022-01-01 00:00:00.000+00').getTime(), v: 100 },
        { t: new Date('2022-01-01 00:00:01.000+00').getTime(), v: 101 },
      ];
      beforeAll(function () {
        testPeriod.setTimeEntries(timeEntries);
      });
      test(`should have 2 time entries after running SetTimeEntries() without statuses`, function () {
        expect(testPeriod.vector.statuses.length).toBe(2);
      });
      test('should pass validate after running SetTimeEntries() without statuses', function () {
        expect(testPeriod.validate()).toBe(true);
      });
      test('Status should be Severity.Good after running SetTimeEntries() without statuses', function () {
        expect(testPeriod.vector.statuses[1]).toBe(Severity.Good);
      });
    });
    describe('setTimeVector()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const arrayLength = 100000;
      beforeAll(function () {
        testPeriod.setTimeVector(
          Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
          Float64Array.from(Array(arrayLength).keys()),
          Uint32Array.from({ length: arrayLength }, () => Severity.Good) as StatusesClass
        );
      });
      test(`should have ${arrayLength} time entries after running setTimeVector`, function () {
        expect(testPeriod.vector.timestamps.length).toBe(arrayLength);
      });
      test('should pass validate after running setTimeVector()', function () {
        expect(testPeriod.validate()).toBe(true);
      });
    });
    describe('setTimeVector() with no statuses', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const arrayLength = 100000;
      beforeAll(function () {
        testPeriod.setTimeVector(
          Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
          Float64Array.from(Array(arrayLength).keys())
        );
      });
      test(`should have ${arrayLength} time entries after running setTimeVector() with no statuses`, function () {
        expect(testPeriod.vector.timestamps.length).toBe(arrayLength);
      });
      test('should pass validate after running setTimeVector() with no statuses', function () {
        expect(testPeriod.validate()).toBe(true);
      });
    });
    describe('getTimeEntries()', function () {
      const testPeriod = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const arrayLength = 100000;
      const testLocation = 1000;
      testPeriod.setTimeVector(
        Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
        Float64Array.from(Array(arrayLength).keys()),
        Uint32Array.from({ length: arrayLength }, () => Severity.Good) as StatusesClass
      );
      const timeEntries = testPeriod.getTimeEntries();
      test(`should have ${arrayLength} time entries after running getTimeEntries()`, function () {
        expect(timeEntries.length).toBe(arrayLength);
      });
      test(`should have timestamp 0 in timeEntry 0`, function () {
        expect(timeEntries[0].t).toBe(0);
      });
      test(`should have timestamp ${testLocation} in timeEntry ${testLocation}`, function () {
        expect(timeEntries[testLocation].t).toBe(testLocation);
      });
      test(`should have value 0 in timeEntry 0`, function () {
        expect(timeEntries[0].t).toBe(0);
      });
      test(`should have value ${testLocation} in timeEntry ${testLocation}`, function () {
        expect(timeEntries[testLocation].v).toBe(testLocation);
      });
      test(`should have status 0 in timeEntry 0`, function () {
        expect(timeEntries[0].t).toBe(0);
      });
      test(`should have status 0 in timeEntry ${testLocation}`, function () {
        expect(timeEntries[testLocation].s).toBe(0);
      });
    });
    describe('resample() linear', function () {
      let expectedResampleValues: Float64Array;
      const arrayLength = 5;
      let testPeriod1: TimeSeriesPath<Float64Array>;
      let testPeriod2: TimeSeriesPath<Float64Array>;
      const originalValues = Float64Array.from(Array(arrayLength).keys());
      const originalTimestamps = Float64Array.from(Array(arrayLength).keys()).map((v) => v * 4) as TimestampsClass;
      const resampleTimestamps = Float64Array.from(Array(arrayLength * 4).keys()) as TimestampsClass;
      beforeAll(function () {
        testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        // Resample to 4 times the original frequency
        expectedResampleValues = Float64Array.from(Array(arrayLength * 4).keys()).map(
          (v) => (v <= (arrayLength - 1) * 4 ? v * 0.25 : NaN) // The last values are outside the original array, therefore they are NaN
        );

        testPeriod1.setTimeVector(
          originalTimestamps,
          originalValues,
          Uint32Array.from({ length: arrayLength }, () => Severity.Good)
        );
        testPeriod2 = testPeriod1.resample(resampleTimestamps);
      });

      test(`should have expected members after resampling`, function () {
        expect(JSON.stringify(testPeriod2.vector.values)).toBe(JSON.stringify(expectedResampleValues)); // Test member equality, not array object equality
      });

      test(`should be immutable to resample`, function () {
        expect(JSON.stringify(testPeriod1.vector.values)).toBe(JSON.stringify(originalValues));
      });
    });
    describe('resample() previous', function () {
      const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.previous);
      const arrayLength = 5;
      const originalTimestamps = Float64Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1) as TimestampsClass;
      const originalValues = Float64Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v) as TimestampsClass; // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= arrayLength * 4
          ? Math.floor((v - 1) / 4.0) // Need to subtract 1 to match the original time-value pairs.
          : v > arrayLength * 4
          ? arrayLength - 1
          : NaN
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Uint32Array.from({ length: arrayLength }, () => Severity.Good)
      );
      const testPeriod2 = testPeriod1.resample(resampleTimestamps);

      test(`should have expected members after resampling`, function () {
        expect(JSON.stringify(testPeriod2.vector.values)).toBe(JSON.stringify(expectedResampleValues));
      });

      test(`should be immutable to resample`, function () {
        expect(JSON.stringify(testPeriod1.vector.values)).toBe(JSON.stringify(originalValues));
      });
    });
    describe('resample() next', function () {
      const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.next);
      const arrayLength = 5;
      const originalTimestamps = Float64Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1) as TimestampsClass;
      const originalValues = Float64Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v) as TimestampsClass; // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= (arrayLength - 1) * 4 + 1
          ? Math.ceil((v - 1) / 4.0) // Need to subtract 1 to match the original time-value pairs.
          : v < 1
          ? 0
          : NaN
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Uint32Array.from({ length: arrayLength }, () => Severity.Good)
      );
      const testPeriod2 = testPeriod1.resample(resampleTimestamps);

      testPeriod2;

      test(`should have expected members after resampling`, function () {
        expect(JSON.stringify(testPeriod2.vector.values)).toBe(JSON.stringify(expectedResampleValues));
      });

      test(`should be immutable to resample`, function () {
        expect(JSON.stringify(testPeriod1.vector.values)).toBe(JSON.stringify(originalValues));
      });
    });
    describe('resample() none', function () {
      const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.none);
      const arrayLength = 5;
      const originalTimestamps = Float64Array.from(Array(arrayLength).keys()).map((v) => v * 4 + 1) as TimestampsClass;
      const originalValues = Float64Array.from(Array(arrayLength).keys());
      const resampleTimestamps = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) => v) as TimestampsClass; // Make sure the timestamps are outside the original array
      // Resample to 4 times the original frequency
      const expectedResampleValues = Float64Array.from(Array(arrayLength * 4 + 2).keys()).map((v) =>
        v >= 1 && v <= (arrayLength - 1) * 4 + 1 ? ((v - 1) % 4 === 0 ? (v - 1) / 4 : NaN) : NaN
      );
      testPeriod1.setTimeVector(
        originalTimestamps,
        originalValues,
        Uint32Array.from({ length: arrayLength }, () => Severity.Good)
      );
      const testPeriod2 = testPeriod1.resample(resampleTimestamps);

      test(`should have expected members after resampling`, function () {
        expect(JSON.stringify(testPeriod2.vector.values)).toBe(JSON.stringify(expectedResampleValues));
      });

      test(`should be immutable to resample`, function () {
        expect(JSON.stringify(testPeriod1.vector.values)).toBe(JSON.stringify(originalValues));
      });
    });
    describe('add()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<Float64Array>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.add(testPeriod2);
        });

        test(`should have timestamp ${testLocation / 2} in location ${testLocation} when TSP add`, function () {
          expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
        });
        test(`should have value ${testLocation} in location ${testLocation} when TSP add`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(testLocation);
        });
        test(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when TSP add`, function () {
          expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
        });
        test(`should have value ${testLocation + 1} in location ${testLocation + 1} when TSP add`, function () {
          expect(testPeriod3.vector.values[testLocation + 1]).toBe(testLocation + 1);
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 5;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.add(testScalarValue);
        });

        test(`should have timestamp ${testLocation / 2} in location ${testLocation} when scalar add`, function () {
          expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
        });
        test(`should have value ${
          testLocation / 2 + testScalarValue
        } in location ${testLocation} when scalar add`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(testLocation / 2 + testScalarValue);
        });
        test(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar add`, function () {
          expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
        });
        test(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          expect(testPeriod3.vector.values[testLocation + 1]).toBe((testLocation + 1) / 2 + testScalarValue);
        });
      });

      // describe('Scalar string', function () {
      //   const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      //   const arrayLength = 10000;
      //   const testLocation = 1000;
      //   let testPeriod2: TimeSeriesPath<ValueArrayType>;
      //   let testPeriod3: TimeSeriesPath<ValueArrayType>;
      //   const testScalarValue = 'my_string';

      //   beforeAll(function () {
      //     testPeriod1.setTimeVector(
      //       Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
      //       Float64Array.from(Array(arrayLength).keys()),
      //       Uint32Array.from({ length: arrayLength }, () => Severity.Good)
      //     );
      //     testPeriod2 = testPeriod1.resample(Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass);
      //     testPeriod3 = testPeriod2.add(testScalarValue);
      //   });

      //   test(`should have timestamp ${testLocation / 2} in location ${testLocation} when scalar add`, function () {
      //     expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
      //   });
      //   test(`should have value ${
      //     testLocation / 2 + testScalarValue
      //   } in location ${testLocation} when scalar add`, function () {
      //     expect(testPeriod3.vector.values[testLocation]).toBe(testLocation / 2 + testScalarValue);
      //   });
      //   test(`should have timestamp ${(testLocation + 1) / 2} in location ${
      //     testLocation + 1
      //   } when scalar add`, function () {
      //     expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
      //   });
      //   test(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
      //     testLocation + 1
      //   } when scalar add`, function () {
      //     expect(testPeriod3.vector.values[testLocation + 1]).toBe((testLocation + 1) / 2 + testScalarValue);
      //   });
      // });

      // describe('Scalar boolean', function () {
      //   const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      //   const arrayLength = 10000;
      //   const testLocation = 1000;
      //   let testPeriod2: TimeSeriesPath<ValueArrayType>;
      //   let testPeriod3: TimeSeriesPath<ValueArrayType>;
      //   const testScalarValue = true;

      //   beforeAll(function () {
      //     testPeriod1.setTimeVector(
      //       Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
      //       Float64Array.from(Array(arrayLength).keys()),
      //       Uint32Array.from({ length: arrayLength }, () => Severity.Good)
      //     );
      //     testPeriod2 = testPeriod1.resample(Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass);
      //     testPeriod3 = testPeriod2.add(testScalarValue);
      //   });

      //   test(`should have timestamp ${testLocation / 2} in location ${testLocation} when scalar add`, function () {
      //     expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
      //   });
      //   test(`should have value ${
      //     testLocation / 2 + testScalarValue
      //   } in location ${testLocation} when scalar add`, function () {
      //     expect(testPeriod3.vector.values[testLocation]).toBe(testLocation / 2 + testScalarValue);
      //   });
      //   test(`should have timestamp ${(testLocation + 1) / 2} in location ${
      //     testLocation + 1
      //   } when scalar add`, function () {
      //     expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
      //   });
      //   test(`should have value ${(testLocation + 1) / 2 + testScalarValue} in location ${
      //     testLocation + 1
      //   } when scalar add`, function () {
      //     expect(testPeriod3.vector.values[testLocation + 1]).toBe((testLocation + 1) / 2 + testScalarValue);
      //   });
      // });
    });
    describe('subtract()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.subtract(testPeriod2);
        });

        test(`should have timestamp ${testLocation / 2} in location ${testLocation} when TSP subtract`, function () {
          expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
        });
        test(`should have value ${0} in location ${testLocation} when TSP subtract`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(0);
        });
        test(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when TSP subtract`, function () {
          expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
        });
        test(`should have value ${0} in location ${testLocation + 1} when TSP subtract`, function () {
          expect(testPeriod3.vector.values[testLocation + 1]).toBe(0);
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 5;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.subtract(testScalarValue);
        });

        test(`should have timestamp ${testLocation / 2} in location ${testLocation} when scalar subtract`, function () {
          expect(testPeriod3.vector.timestamps[testLocation]).toBe(testLocation / 2);
        });
        test(`should have value ${
          testLocation / 2 - testScalarValue
        } in location ${testLocation} when scalar subtract`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(testLocation / 2 - testScalarValue);
        });
        test(`should have timestamp ${(testLocation + 1) / 2} in location ${
          testLocation + 1
        } when scalar subtract`, function () {
          expect(testPeriod3.vector.timestamps[testLocation + 1]).toBe((testLocation + 1) / 2);
        });
        test(`should have value ${(testLocation + 1) / 2 - testScalarValue} in location ${
          testLocation + 1
        } when scalar add`, function () {
          expect(testPeriod3.vector.values[testLocation + 1]).toBe((testLocation + 1) / 2 - testScalarValue);
        });
      });
    });
    describe('multiply()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.multiply(testPeriod2);
        });

        test(`should have value ${
          ((testLocation / 2) * testLocation) / 2
        } in location ${testLocation} when TSP multiply`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(((testLocation / 2) * testLocation) / 2);
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 5;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.multiply(testScalarValue);
        });

        test(`should have value ${
          (testLocation / 2) * testScalarValue
        } in location ${testLocation} when scalar multiply`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe((testLocation / 2) * testScalarValue);
        });
      });
    });
    describe('divide()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.divide(testPeriod2);
        });

        test(`should have value ${1} in location ${testLocation} when TSP divide`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(1);
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 1000;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 5;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.divide(testScalarValue);
        });

        test(`should have value ${
          testLocation / 2 / testScalarValue
        } in location ${testLocation} when scalar divide`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe(testLocation / 2 / testScalarValue);
        });
      });
    });
    describe('pow()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 100;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.pow(testPeriod2);
        });

        test(`should have value ${
          (testLocation / 2) ** (testLocation / 2)
        } in location ${testLocation} when TSP pow`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe((testLocation / 2) ** (testLocation / 2));
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 100;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 5;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.pow(testScalarValue);
        });

        test(`should have value ${
          (testLocation / 2) ** testScalarValue
        } in location ${testLocation} when scalar pow`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe((testLocation / 2) ** testScalarValue);
        });
      });
    });
    describe('remainder()', function () {
      describe('TSP', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 100;
        let testPeriod2: TimeSeriesPath<Float64Array>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod1.remainder(testPeriod2);
        });

        test(`should have value ${
          (testLocation / 2) % (testLocation / 2)
        } in location ${testLocation} when TSP remainder`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe((testLocation / 2) % (testLocation / 2));
        });
      });

      describe('Scalar number', function () {
        const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
        const arrayLength = 10000;
        const testLocation = 100;
        let testPeriod2: TimeSeriesPath<ValueArrayType>;
        let testPeriod3: TimeSeriesPath<ValueArrayType>;
        const testScalarValue = 3;

        beforeAll(function () {
          testPeriod1.setTimeVector(
            Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
            Float64Array.from(Array(arrayLength).keys()),
            Uint32Array.from({ length: arrayLength }, () => Severity.Good)
          );
          testPeriod2 = testPeriod1.resample(
            Float64Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2) as TimestampsClass
          );
          testPeriod3 = testPeriod2.remainder(testScalarValue);
        });

        test(`should have value ${
          (testLocation / 2) % testScalarValue
        } in location ${testLocation} when scalar remainder`, function () {
          expect(testPeriod3.vector.values[testLocation]).toBe((testLocation / 2) % testScalarValue);
        });
      });
    });
    describe('negate()', function () {
      const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const arrayLength = 10000;
      const testLocation = 100;
      let testPeriod2: TimeSeriesPath<ValueArrayType>;

      beforeAll(function () {
        testPeriod1.setTimeVector(
          Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
          Float64Array.from(Array(arrayLength).keys()),
          Uint32Array.from({ length: arrayLength }, () => Severity.Good)
        );
        testPeriod2 = testPeriod1.negate();
      });

      test(`should have value ${-testLocation} in location ${testLocation} when negate`, function () {
        expect(testPeriod2.vector.values[testLocation]).toBe(-testLocation);
      });
    });
    describe('aggregation', function () {
      const testPeriod1 = new TimeSeriesPath<Float64Array>(InterpolationMethod.linear);
      const arrayLength = 10000;
      const testLocation = 100;
      let testPeriod2: TimeSeriesPath<Float64Array>;
      let testPeriod3: TimeSeriesPath<Float64Array>;
      let testPeriods: TimeSeriesPath<Float64Array>[];

      beforeAll(function () {
        testPeriod1.setTimeVector(
          Float64Array.from(Array(arrayLength).keys()) as TimestampsClass,
          Float64Array.from(Array(arrayLength).keys()),
          Uint32Array.from({ length: arrayLength }, () => Severity.Good)
        );
        testPeriod2 = testPeriod1.subtract(2);
        testPeriod3 = testPeriod1.add(2);
        testPeriods = [testPeriod1, testPeriod2, testPeriod3];
      });

      test(`should have sum value ${testLocation * 3} in location ${testLocation}`, function () {
        expect(TimeSeriesPath.sum(testPeriods).vector.values[testLocation]).toBe(testLocation * 3);
      });
      test(`should have avg value ${testLocation} in location ${testLocation}`, function () {
        expect(TimeSeriesPath.avg(testPeriods).vector.values[testLocation]).toBe(testLocation);
      });
      test(`should have min value ${testLocation - 2} in location ${testLocation}`, function () {
        expect(TimeSeriesPath.min(testPeriods).vector.values[testLocation]).toBe(testLocation - 2);
      });
      test(`should have max value ${testLocation + 2} in location ${testLocation}`, function () {
        expect(TimeSeriesPath.max(testPeriods).vector.values[testLocation]).toBe(testLocation + 2);
      });
      test(`should have range value ${4} in location ${testLocation}`, function () {
        expect(TimeSeriesPath.range(testPeriods).vector.values[testLocation]).toBe(4);
      });
    });
  });
});

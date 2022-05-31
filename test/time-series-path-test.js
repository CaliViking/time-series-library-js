import { equal, deepEqual, notDeepEqual } from 'assert';
import { TimeSeriesPath } from '../lib/index.js';

describe('time-series-path', function () {
  describe('TimeSeriesPath("number", "linear")', function () {
    describe('construct', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      it('should return number for dataType', function () {
        equal(testPeriod.dataType, 'number');
      });
      it('should return linear for interpolationMethod', function () {
        equal(testPeriod.interpolationMethod, 'linear');
      });
    });
    describe('validate()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      it('should return true for validate()', function () {
        equal(testPeriod.validate(), true);
      });
    });
    describe('clone()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      it('should clone', function () {
        deepEqual(testPeriod.clone(), testPeriod);
      });
    });
    describe('not clone()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      let testPeriod2 = testPeriod.clone();
      before(function () {
        testPeriod2.dataType = 'string';
      });
      it('is not a clone', function () {
        notDeepEqual(testPeriod2, testPeriod);
      });
    });
    describe('deepClone()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      it('should deepClone', function () {
        deepEqual(testPeriod.deepClone(), testPeriod);
      });
    });
    describe('setTimeVector()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      let arrayLength = 100000;
      before(function () {
        testPeriod.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => 0)
        );
      });
      it(`should have ${arrayLength} time entries after running setTimeVector`, function () {
        equal(testPeriod.timestamps.length, arrayLength);
      });
      it('should pass validate after running setTimeVector()', function () {
        equal(testPeriod.validate(), true);
      });
    });
    describe('getTimeEntries()', function () {
      let testPeriod = new TimeSeriesPath('number', 'linear');
      let arrayLength = 100000;
      let testLocation = 1000;
      let timeEntries;
      testPeriod.setTimeVector(
        Array.from(Array(arrayLength).keys()),
        Array.from(Array(arrayLength).keys()),
        Array.from({ length: arrayLength }, (_v, _k) => 0)
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
    describe('resample()', function () {
      let testPeriod1 = new TimeSeriesPath('number', 'linear');
      let arrayLength = 10000;
      let testPeriod2, testPeriod3;

      testPeriod1.setTimeVector(
        Array.from(Array(arrayLength).keys()),
        Array.from(Array(arrayLength).keys()),
        Array.from({ length: arrayLength }, (_v, _k) => 0)
      );
      testPeriod2 = testPeriod1.resample(Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2));

      it(`should have ${arrayLength * 2} time entries after running resample()`, function () {
        equal(testPeriod2.values.length, arrayLength * 2);
      });

      it(`should be immutable to resample`, function () {
        equal(testPeriod1.values.length, arrayLength);
      });
    });
    describe('add()', function () {
      describe('TSP', function () {
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 'my_string';

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = true;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 'my_string';

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 1000;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;
        let testScalarValue = 5;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
        let testPeriod1 = new TimeSeriesPath('number', 'linear');
        let arrayLength = 10000;
        let testLocation = 100;
        let testPeriod2, testPeriod3;
        let testScalarValue = 3;

        before(function () {
          testPeriod1.setTimeVector(
            Array.from(Array(arrayLength).keys()),
            Array.from(Array(arrayLength).keys()),
            Array.from({ length: arrayLength }, (_v, _k) => 0)
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
      let testPeriod1 = new TimeSeriesPath('number', 'linear');
      let arrayLength = 10000;
      let testLocation = 100;
      let testPeriod2;

      before(function () {
        testPeriod1.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => 0)
        );
        testPeriod2 = testPeriod1.negate(testPeriod1);
      });

      it(`should have value ${-testLocation} in location ${testLocation} when negate`, function () {
        equal(testPeriod2.values[testLocation], -testLocation);
      });
    });
    describe('aggregation', function () {
      let testPeriod1 = new TimeSeriesPath('number', 'linear');
      let arrayLength = 10000;
      let testLocation = 100;
      let testPeriod2, testPeriod3;
      let testPeriods;

      before(function () {
        testPeriod1.setTimeVector(
          Array.from(Array(arrayLength).keys()),
          Array.from(Array(arrayLength).keys()),
          Array.from({ length: arrayLength }, (_v, _k) => 0)
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

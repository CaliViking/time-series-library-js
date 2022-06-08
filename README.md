# Time Series Library

## Just wan't to try it?

Compile:

```bash
$ tsc
```

Run tests:

```bash
$ npm test
```

See how to use the code? Take a look in the [unit test file](./test/time-series-path-test.js) (even though it is quite abstract)

If you like it: Call me.

If you hate it: Call me.

## Why do we need a time series library?

Believe it or not, a lot of software is struggling with processing time series data correctly. The lack of good libraries results in every software application trying to implement its own version of time series processing.

The complexity with time series data can be seen from multiple perspective:

<!-- prettier-ignore -->
- A lot of people tend to think about calculations as happening with scalar values. It may be obvious that Power = Voltage * Current (P = U * I), but how do you calculate that if the voltage and current are measured independently?
- Time series data is about the data that is between the points, not the points themselves. It must be possible to express how to interpret the data between the points.
- The data is a series of data, which means that the sequence matter. It must be possible to find transitions and rates of change.
- Some simple (or not so simple) calculus is often required. Do you know that the content of a tank is the "starting content + accumulated inflows - accumulated outflows" over a period of time?
- When doing time series analysis, users often have to look at the data from the frequency domain (fourier transforms and spectral analysis) or the value domain (histograms). Sometimes we want to do correlation analysis between multiple points.
- More advanced use cases involve signal processing.
- A lot of real-life analytics, artificial intelligence, and machine learning fail because real-life measurements often are time series measurements. Time series data is often auto-correlated where the current temperature depend on previous temperature.

The problem is that this is not easy to do this.

The objective of the time series library is to make time series analysis easy.

## What are the use cases

The solution aim to solve the following use cases:

- Building blocks for applications processing and displaying time series data
- Ad-hoc and stored analysis similar to what data scientists use in Jupyter Notebooks
- Advanced number crunching and signal processing
- Process Engineer finding patterns
- Edge device doing near real-time control

## Why is the library written in TypeScript/JavaScript?

This was not a light decision. It has long been obvious to me that it must be possible to process time series data close to where the data is. Since time series data is often stored in historians and databases, this meant that the processing naturally needed to happen inside or close to the databases.

Time series data is not just in the databases; it is everywhere. Time series data can be found in close-to-real-time buffers near the sensors, in aggregation of extracted data from multiple sources, and not at least in the analytics notebooks that data scientists use. There was a need for a language that could be run everywhere. TypeScript/JavaScript was selected because:

- It can run in any web browser on any operating system on any device, meaning that it can be used for building web applications, and to run ad-hoc analysis in notebooks. It can easily be combined with meaningful graphics that can be casually used on anything from a desktop PC to a mobile phone.
- It can be run in web servers - node.js has become widely used. This means that it can do server side processing, including real-time, crawling, map/reduce, and batch processing.
- It can be run serverless - specially suited for massive scaling of non-time-critical data processing.
- It can be run inside "my" favorite database PostgreSQL using the JavaScript language extensions. It is also naturally used with MongoDB for people who prefer aggregated document databases.
- It can be run in distributed edge devices (including Raspberry PI) and easily managed and deployed using Git.
- There is a lot of existing libraries available, no need to re-invent the wheel.
- And, it is actually quite fast, specifically when compared to other analytics languages such as Python and database languages such as PL/pgSQL.
- A lot of eager developers (young and old) know how to use the language, provide the base for a strong community.

There is no other language that can achieve all this. One exception may be WebAssembly (Wasm) which is faster and can be compiled from almost anything, but this ecosystem still needs to mature.

## What is in the current release

The following is included:

- TimeSeriesPath class: Representing data as a series of connected points.
- InterpolationMethod type:
  - none: There is no data between the points
  - previous: The previous point represents the data between the points
  - next: The next point represents the data between the points
  - linear: The data between the points is represented by a straight line
- Methods:
  - validate: Checks that the time series data is valid.
  - clone and deepClone: Ensuring that we can have immutable objects.
  - setTimeVector: Write time series data to the object as a stream of timestamps, values and statuses
  - setTimeEntries and getTimeEntries: Read and write a table like array of time entries, each entry representing an object with timestamp, value, and status.
  - resample: Take the current time series data and resample it to fit a set of timestamps. It understands InterpolationMethod.
  - mutableResample: Run the resample operation directly on the instance of the object so that new instances will not be created, saving memory and garbage collection work.
  - Arithmetic operations for time series paths and scalar values:
    - add: +
    - subtract: -
    - multiply: \*
    - divide: /
    - power: \*\*
    - remainder: %
    - unary negate: -
  - Multi-time-series stream aggregators. Doing operations for every point in time on collections of time series data:
    - sum: creates a new time series object that represents the sum of all the incoming objects
    - avg: the average of all the incoming objects
    - min: the min of the streams
    - max: the max of the streams
    - range: the max - min of the streams

There is also some experimental work on TimeSeriesSegments, this is likely to change.

## How do you use it?

The library is built on the following approaches:

- It is built on object oriented principles
- It is borrowing from functional programming in that the default behavior is immutable. This allows chaining.

Here is an example of how to use the library:

```js
let testPeriod1 = new TimeSeriesPath('number', InterpolationMethod.linear),
  testPeriod2 = new TimeSeriesPath('number', InterpolationMethod.linear),
  testPeriod3 = new TimeSeriesPath('number', InterpolationMethod.linear); // Create some time series objects
testPeriod1.setTimeVector(
  Array.from(Array(arrayLength).keys()),
  Array.from(Array(arrayLength).keys()),
  Array.from({ length: arrayLength }, (_v, _k) => 0)
); // Set the time series data (typically from externally, this is just a sample)
testPeriod2 = testPeriod1.resample(Array.from({ length: arrayLength * 2 }, (_v, k) => k / 2)); // Perform a resample to a given array of timestamps
testPeriod3 = testPeriod1.add(testPeriod2); // Add testPeriod1 and testPeriod2. Store the result in testPeriod3
```

The approach allows chaining for people who count the number of lines of code

```js
resultPeriod = testPeriod1.setTimeVector(...).resample(...).add(testPeriod2).divide(testPeriod3.subtract(testPeriod2));
```

## The "roadmap"

More time series objects:

- TimeSeriesAggregation: A representation of an aggregation of time series data. A collection of time periods, each time period includes aggregated sum, average, min, max, weight (the amount of valid data), and possibly standard deviation.
- TimeSeriesSegment: A representation of individual segments between points (t1, t2, v1, v2, s1, s2). This is used to represent discontinuous data
- TimeSeriesHistogram: The bucketing of time series data
- TimeSeriesFrequency: The output of a fast fourier transform - temporal frequency
- TimeSeriesSpectrogram: Similar to TimeSeriesAggregation, but every time period is a representation of the frequencies in that time period. May be implemented with TimeSeriesAggregation.
- A time series data set that is really easy to display without the data loss and moire effects

More methods:

- Comparison operators
- Rate of change
- Accumulation
- Pass in your custom function: Allowing any custom method to be built
- Data Reduction:
  - Remove duplicates
  - Swinging door
- Filters (low pass, high pass, most likely Butterworth)
- FastFourierTransform
- Time series search: Define a pattern, allow a crawler to find every occurrence of that pattern and mark the time periods when the pattern appears.
  - Enabling auto-correlation
  - Will likely enable detection of a period, such as a batch.
- Matrix based time shifting (my name is Mr. Andersen :-) )
- Differential Equations: I envision functions that can operate on the derivatives of every point or segment.

Sample User Experience:

- Application examples that shows how to display the time series data. Most likely using Vue and D3.
  - line chart, histogram, scatter plot, frequency plot
- Working with Jupyter Notebooks
- Combining with Node-RED

What problems are you looking to solve?

- Let me know, or even better "write the code"
-

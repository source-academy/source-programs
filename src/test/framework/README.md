# source-test
A minimal test framework for [Source](https://sicp.comp.nus.edu.sg/source/) programs 

## Example
An example test program:
```js
/* the function to be tested */
function twice(x) {
  return x * 2;
}

/* the test function */
function test_twice_twice() {
  const result = twice(twice(2));
  
  assert_equal(8, result);
}

run(
  list(test_twice_twice),
  () => "before all tests",
  () => "before each test",
  () => "after all tests"
);
```
Which prints the following:
```
"---------"
Running test 1/1: "test_twice_twice"
"test_twice_twice PASSED"
"---------"
"---------"
"SUMMARY"
"---------"
Tests passed: 1
Tests failed: 0
Assertions passed: 1
Assertions failed: 0
Time taken: "29 ms"
```

## Usage
Use the [Source Academy playground](https://sourceacademy.nus.edu.sg/playground) to run programs
### Running Tests
#### Providing Tests
`run` takes a list of functions as its first argument, each of which serves as a test to be run. <br />
 They will be called one after another, in the order they are passed. 
#### Early Abort
Set the `EARLY_ABORT` variable to `true` in order to have the program throw an error at the first failed assertion. <br />
Otherwise, if set to `false`,  the tests will continue running.
#### Running a function before all tests
Provide a function as the **second** argument to `run` in order to have it run just once, before all tests begin.
#### Running a function before each test
Provide a function as the **third** argument to `run` in order to have it run just before each test runs.
#### Running a function after all tests
Provide a function as the **fourth** argument to `run` in order to have it run after all tests finish.

### Assertions
A test is considered as failed if any one assertion fails.
```js
 /* Checks if the given condition evaluates to true. If not, message is printed */ 
assert(condition, message);
```
```js
/* Checks if the expected and result values are equal */
assert_equal(expected, result); 
```

### Statistics
#### Each Test
The result of each test is printed after it has run, whether it `PASSED` or `FAILED`. <br />
eg. `"test_twice_twice PASSED"`
#### Summary
The following statistics are printed after all tests have run: <br />
(or upon the first failed assertion if `EARLY_ABORT` is set to `true`)
* the number of tests passed
* the number of tests failed
* the number of assertions passed
* the number of assertions failed
* the total time elapsed, in Milliseconds if less than `1000`. Otherwise, it is shown in Seconds.

## Acknowledgements

The function `variable_declaration_name` is taken from the Metacircular evaluator in [SICP JS](https://sicp.comp.nus.edu.sg/) chapter 4.1 
<br />
<br />
Inspired by the [minunit](https://github.com/siu/minunit) framework for C

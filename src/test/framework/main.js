const EARLY_ABORT = false;
const TEST_PASS = 0;
const TEST_FAIL = 1;
const SEPARATOR = "---------";

// counters
let num_run = 0;
let num_pass = 0;
let num_assert_pass = 0;
let num_assert_fail = 0;
let start_time = 0;
let elapsed_time = 0;

let current_test_status = TEST_PASS;

/**
 * Checks if the given condition evaluates to true 
 * @param condition
 * @param message to be printed if the condition evaluates to false
*/
function assert(condition, message) {
	const res = !condition
		? EARLY_ABORT
			? report_error(message)
			: message
		: null;

	if (res !== null) {
		num_assert_fail = num_assert_fail + 1;
		current_test_status = TEST_FAIL;
		display(res);
	} else {
		num_assert_pass = num_assert_pass + 1;
	}
}

/**
 * Reports test statistics before throwing an error
 * @param message to be displayed when throwing the error
*/
function report_error(message) {
	num_assert_fail = num_assert_fail + 1;
	elapsed_time = time_since(start_time);
	report();
	error(message);
}

/** 
 * Checks if the expected and result values are equal
 * @param expected
 * @param result
*/
function assert_equal(expected, result) {
	const error_message = "assert_equal failed: " + stringify(result) + " (result) not equal to " + stringify(expected) + " (expected)";
	assert(equal(expected, result), error_message);
}

function variable_declaration_name(stmt) {
   return head(tail(head(tail(stmt))));
}

/**
 * Coordinates the running of tests
 * @param tests a list of functions, each of which represent a test
 * @param before a function to run just once, before the start of all tests
 * @param before_each a function to run before every test
 * @param after a function to run after every test has finished
*/
function run(tests, before, before_each, after) {
	if (!is_list(tests)) {
		error("first argument to run must be a list of functions");
	} else {
		start_time = runtime();
		if (is_function(before)) {
			before();
		} else {
		}

		_run_tests(tests,  before_each);

		if (is_function(after)) {
			after();
		} else {
		}

		elapsed_time = time_since(start_time);
		report();
	}
}

/**
 * Runs tests, one after the other
 * @param tests a list of functions, each of which represent a test
 * @param before_each a function to run before every test
*/
function _run_tests(tests, before_each) {
	const num_tests = length(tests);
	for (let i = 0; i < num_tests; i = i + 1) {
		if (is_function(before_each)) {
			before_each();
		} else {
		}

		const test = list_ref(tests, i);
		const test_name = variable_declaration_name(parse(test));

		display(SEPARATOR);
		_run_test(test, i+1, test_name, num_tests);
		_test_result(test_name);
		display(SEPARATOR);
	}
}

/**
 * Runs a single test
 * @param test a function representing the test to run
 * @param test_number the number of the test, amongst all tests to run
 * @param test_name the name of the function representing the test
 * @param num_tests the total number of tests to run
*/
function _run_test(test, test_number, test_name, num_tests) {
	if (!is_function(test)) {
			error("a test must be a function");
	} else {
		display(test_name, "Running test " + stringify(test_number) + "/" + stringify(num_tests) + ":");
		num_run = num_run + 1;
		test();
	}
}

/**
 * Handles the result of running a single test
 * @param test_name the name of the function representing the test
*/
function _test_result(test_name) {
	if (current_test_status === TEST_PASS) {
		display(test_name + " PASSED");
		num_pass = num_pass + 1;
	}  else {
		display(test_name + " FAILED");
	}

	current_test_status = TEST_PASS; // reset test status
}

/**
 * Displays test statistics
*/
function report() {
	display(SEPARATOR);
	display("SUMMARY");
	display(SEPARATOR);
	display(num_pass, "Tests passed:");
	display(num_run - num_pass, "Tests failed:");
	display(num_assert_pass, "Assertions passed:");
	display(num_assert_fail, "Assertions failed:");

	const time_taken = elapsed_time >= 1000 ? stringify(ms_to_s(elapsed_time)) + " s" : stringify(elapsed_time) + " ms";
	display(time_taken, "Time taken:");

}

/**
 * @param time (in Milliseconds)
 * @return the time elapsed (in Milliseconds) since the given time
*/
function time_since(time) {
	return runtime() - time;
}

/**
 * @param time (in Milliseconds)
 * @return the given time in Seconds
*/
function ms_to_s(time) {
	return time / math_pow(10, 3);
}

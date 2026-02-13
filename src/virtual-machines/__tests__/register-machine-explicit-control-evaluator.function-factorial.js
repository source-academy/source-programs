set_program_to_run(
  "function factorial(n) { return n === 1 ? 1 : n * factorial(n - 1);} factorial(4);"
);

start(m);

get_register_contents(m, "val");

// 24

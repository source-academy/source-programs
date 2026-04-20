set_program_to_run("function add(a, b) {return a + b;} add(1, 3);");

start(m);

get_register_contents(m, "val");

// 4

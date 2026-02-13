set_program_to_run("function foo() {return 1;}");

start(m);

get_register_contents(m, "val");

// 'ok'

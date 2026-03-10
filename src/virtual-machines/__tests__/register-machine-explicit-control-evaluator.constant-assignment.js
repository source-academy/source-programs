set_program_to_run("const foo = 1; foo;");

start(m);

get_register_contents(m, "val");

// 1

set_program_to_run("(! (1 === 1)) ? 1 : 2;");

start(m);

get_register_contents(m, "val");

// 2

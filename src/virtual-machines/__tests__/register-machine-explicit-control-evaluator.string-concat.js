set_program_to_run("'hello' + ' ' + 'world';");

start(m);

get_register_contents(m, "val");

// 'hello world'

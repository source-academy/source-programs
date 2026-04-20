set_program_to_run("function foo() {return 1;} 2 + 2; foo(); 2 - 3;");

start(m);

get_register_contents(m, "val");

// -1

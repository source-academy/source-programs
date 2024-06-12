const evaluator_machine = make_evaluator_machine(10000);
const code = "6 * 6;";
const P = parse(code);
evaluator_machine("install_parsetree")(P);
start(evaluator_machine);
get_register_contents(evaluator_machine, "val");
// [ 'number', 36 ]

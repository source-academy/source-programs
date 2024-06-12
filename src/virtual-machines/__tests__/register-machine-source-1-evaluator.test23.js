const evaluator_machine = make_evaluator_machine(10000);
const code = "a();";
const P = parse(code);
evaluator_machine("install_parsetree")(P);
start(evaluator_machine);
// Error: Unbound name: "a"

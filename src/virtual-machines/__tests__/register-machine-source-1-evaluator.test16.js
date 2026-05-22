const evaluator_machine = make_evaluator_machine(10000);
const code = "         \
function factorial(n) {         \
    return n === 1 ? 1          \
        : n * factorial(n - 1); \
}                               \
factorial(4);                   ";
const P = parse(code);
evaluator_machine("install_parsetree")(P);
start(evaluator_machine);
get_register_contents(evaluator_machine, "val");
// [ 'number', 24 ]

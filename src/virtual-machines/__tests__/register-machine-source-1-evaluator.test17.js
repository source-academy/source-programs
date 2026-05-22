const evaluator_machine = make_evaluator_machine(10000);
const code = "         \
const about_pi = 3;             \
function square(x) {            \
    return x * x;               \
}                               \
4 * about_pi * square(6371);    ";
const P = parse(code);
evaluator_machine("install_parsetree")(P);
start(evaluator_machine);
get_register_contents(evaluator_machine, "val");
// [ 'number', 487075692 ]

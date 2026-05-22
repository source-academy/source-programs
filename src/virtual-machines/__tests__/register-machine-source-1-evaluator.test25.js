const evaluator_machine = make_evaluator_machine(160);
const code = "\
function x(a) {         \
  const b = 2*a;        \
  function y() {        \
      return b + 1;     \
  }                     \
  return y;             \
}                       \
x(2)();x(2)();x(2)();x(2)();";
const P = parse(code);
evaluator_machine("install_parsetree")(P);
start(evaluator_machine);
get_register_contents(evaluator_machine, "val");
// [ 'number', 5 ]

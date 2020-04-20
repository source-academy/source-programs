parse_and_compile_and_run(10, 5, 3,
" \
function x(a) {         \
  const b = 2*a;        \
  function y() {        \
      return b + 1;     \
  }                     \
  return y;             \
}                       \
x(2)();                 ");
// 'result: heap node of type = number, value = 5'
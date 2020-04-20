parse_and_compile_and_run(3, 20, 3,
  "             \
const a = 2;                        \
const b = 7;                        \
function f(x, y) {                  \
    const c = 100;                  \
    const d = 500;                  \
    return x - y * a + b - c + d;   \
}                                   \
f(30, 10);                          "
  ); // exactly 200 needed
// 'result: heap node of type = number, value = 417'

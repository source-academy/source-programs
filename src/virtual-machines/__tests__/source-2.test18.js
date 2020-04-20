parse_and_compile_and_run(" \
function f(x) {         \
    x + 1;              \
}                       \
f(3);                   ");
// 'result: heap node of type = undefined, value = undefined'
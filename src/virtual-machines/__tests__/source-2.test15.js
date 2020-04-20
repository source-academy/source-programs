parse_and_compile_and_run("           \
function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 3);                     ");
// 'result: heap node of type = number, value = 4913'
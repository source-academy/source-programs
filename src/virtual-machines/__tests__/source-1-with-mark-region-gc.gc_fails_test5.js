parse_and_compile_and_run(9, 8, 2,
"           \
function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 1);                     ");
// Line 915: Error: "reached oom"

parse_and_compile_and_run(24, 10, 1,
"         \
function factorial(n) {         \
    return n === 1 ? 1          \
        : n * factorial(n - 1); \
}                               \
factorial(4);                   ");
// Line 915: Error: "reached oom"

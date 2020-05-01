parse_and_compile_and_run(10, 5, 2,
"function f(x) {         \
    x + 1;              \
}                       \
f(3);                   ");
// Line 915: Error: "reached oom"

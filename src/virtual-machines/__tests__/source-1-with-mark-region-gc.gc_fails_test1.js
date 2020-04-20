parse_and_compile_and_run(3, 10, 2,
"function f(x) {             \
    return x + 1;           \
}                           \
f(2);                       ");
// Line 915: Error: "reached oom"

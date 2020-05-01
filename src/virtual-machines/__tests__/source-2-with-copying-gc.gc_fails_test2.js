// garbage collected test

parse_and_compile_and_run(1000,
"\
function factorial(n) {\
    return n === 1 ? 1\
        : n * factorial(n - 1);\
}\
factorial(4);");
// Error: memory exhausted despite garbage collection undefined

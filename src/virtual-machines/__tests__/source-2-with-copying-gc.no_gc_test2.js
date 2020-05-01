// garbage collected test

parse_and_compile_and_run(3500,
"\
function factorial(n) {\
    return n === 1 ? 1\
        : n * factorial(n - 1);\
}\
factorial(4);");
// 'result: heap node of type = number, value = 24; GC count: 0'

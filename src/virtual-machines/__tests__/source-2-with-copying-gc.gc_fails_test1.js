// memory exhaustion test

parse_and_compile_and_run(1000,
"\
const z = 100000000000;\
function foo(x) {\
    return x + z;\
}\
foo(200000);\
list(1,2,3,4);\
");
// Line 2073: Error: memory exhausted despite garbage collection 995

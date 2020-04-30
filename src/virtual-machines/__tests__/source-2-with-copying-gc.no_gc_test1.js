// garbage collected test

parse_and_compile_and_run(3000,
"\
const z = 100000000000;\
function foo(x) {\
    return x + z;\
}\
foo(200000);\
list(1,2,3,4);\
");
// 'result: heap node of type = pair, value = [1,[2,[3,[4,null]]]]; GC count: 0'

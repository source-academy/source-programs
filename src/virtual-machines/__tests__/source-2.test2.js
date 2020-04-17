parse_and_compile_and_run("const z = 3;\
function foo(x) {\
    return x + z;\
}\
foo(2);\
pair(1, 2);");
// 'result: heap node of type = pair, value = [1,2]'
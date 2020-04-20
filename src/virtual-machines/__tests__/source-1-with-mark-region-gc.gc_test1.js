parse_and_compile_and_run(3, 10, 3,
"function f(x) {             \
    return x + 1;           \
}                           \
f(2);                       "
  );
// 'result: heap node of type = number, value = 3'

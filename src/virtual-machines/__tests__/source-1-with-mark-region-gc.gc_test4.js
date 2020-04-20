parse_and_compile_and_run(10, 5, 3, 
  "         \
const about_pi = 3;             \
function square(x) {            \
    return x * x;               \
}                               \
4 * about_pi * square(6371);    ");
// result: heap node of type = number, value = 487075692 undefined
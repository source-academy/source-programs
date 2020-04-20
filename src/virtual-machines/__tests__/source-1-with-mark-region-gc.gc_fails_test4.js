parse_and_compile_and_run(10, 4, 3, 
  "         \
const about_pi = 3;             \
function square(x) {            \
    return x * x;               \
}                               \
4 * about_pi * square(6371);    ");
// Line 915: Error: "reached oom"

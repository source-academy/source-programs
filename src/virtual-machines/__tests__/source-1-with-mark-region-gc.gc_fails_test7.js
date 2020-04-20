parse_and_compile_and_run(7, 8, 9,
"                         \
function abs(x) {                               \
    return x >= 0 ? x : 0 - x;                  \
}                                               \
function square(x) {                            \
    return x * x;                               \
}                                               \
function average(x,y) {                         \
    return (x + y) / 2;                         \
}                                               \
function sqrt(x) {                              \
    function good_enough(guess, x) {            \
        return abs(square(guess) - x) < 0.001;  \
    }                                           \
    function improve(guess, x) {                \
        return average(guess, x / guess);       \
    }                                           \
    function sqrt_iter(guess, x) {              \
        return good_enough(guess, x)            \
                   ? guess                      \
                   : sqrt_iter(improve(         \
                                guess, x), x);  \
    }                                           \
    return sqrt_iter(1.0, x);                   \
}                                               \
                                                \
sqrt(5);                                        ");
// Line 915: Error: "reached oom"
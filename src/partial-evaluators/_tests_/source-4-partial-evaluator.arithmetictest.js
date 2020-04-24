let to_partialize = partial_evaluation(parse("\
function test(x, y, z, w) { \
    return (3 + x) * (y + w) - 2 * w * x - x * y;\
}\
"), list(), list());

let partialized = partial_evaluation(parse("\
function test(x, y, z, w) { \
    return 3 * y + 3 * w - x * w;\
}"), list(), list());

equal(exa1, exa2);
\\true


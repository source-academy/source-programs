let to_partialize = partial_evaluation(parse("\
function test(x, y, z, w) { \
    if (((x * (1 / 4) === x - (3 / 4) * x) ? y : x) <= y) {\
        if (x * 2 < x + x) {\
            return false;\
        } else {\
            return (x / a) / (1 / ((3 + b * ((w - w / 2 === w / 2) ? 2 * x - x : y) - ((true) ? 2 : 1) === x * b + 1) ? a : 3));\
        }\
    } else {\
        return (2 * x / 5) - (x / 5);\
    }\
}\
"), list("a"), list(5));


let partialized = partial_evaluation(parse("\
function test(x, y, z, w) { \
    return x;\
}\
"), list(), list());

equal(to_partialize, partialized);
\\true


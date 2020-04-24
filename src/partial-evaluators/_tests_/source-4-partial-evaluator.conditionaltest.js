let to_partialize = partial_evaluation(parse("\
function test(x, y, z, w) { \
    let t = x; \
    if (a + 1 === t) { \
        return 2 * (2 * t + y) + 2 * a; \
    } else { \
        return 3 * (t +  2 * y) + a; \
    } \
}\
"), list("a"), list(3));


let partialized = partial_evaluation(parse("\
function test(x, y, z, w) { \
    let t = x; \
    if (4 === t) { \
        return 4 * t + 2 * y + 6; \
    } else { \
        return 3 * t + 6 * y + 3; \
    } \
}\
"), list(), list());

equal(to_partialize, partialized);
\\true


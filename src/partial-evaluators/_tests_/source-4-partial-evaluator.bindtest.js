let to_partialize = partial_evaluation(parse("\
function test(x, y, z, w) { \
    return a; \
} \
"), list("a"), list(1));

let partialized = partial_evaluation(parse("\
function test(x, y, z, w) { \
return 1;\
}"), list(), list());

equal(to_partialize, partialized);
\\true
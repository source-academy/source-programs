parse_and_compile_and_run("                                                       \
function permutations(lst) {                                                  \
    const f = e => map(x => pair(e, x), permutations(remove(e, lst)));    \
    return is_null(lst)                                                   \
        ? pair(null, null)                                              \
        : accumulate((x,y) => append(f(x), y), null, lst);               \
}                                                                             \
permutations(enum_list(0, 3)); ");
// 'result: heap node of type = pair, value = [[0,[1,[2,[3,null]]]],[[0,[1,[3,[2,null]]]],[[0,[2,[1,[3,null]]]],[[0,[2,[3,[1,null]]]],[[0,[3,[1,[2,null]]]],[[0,[3,[2,[1,null]]]],[[1,[0,[2,[3,null]]]],[[1,[0,[3,[2,null]]]],[[1,[2,[0,[3,null]]]],[[1,[2,[3,[0,null]]]],[[1,[3,[0,[2,null]]]],[[1,[3,[2,[0,null]]]],[[2,[0,[1,[3,null]]]],[[2,[0,[3,[1,null]]]],[[2,[1,[0,[3,null]]]],[[2,[1,[3,[0,null]]]],[[2,[3,[0,[1,null]]]],[[2,[3,[1,[0,null]]]],[[3,[0,[1,[2,null]]]],[[3,[0,[2,[1,null]]]],[[3,[1,[0,[2,null]]]],[[3,[1,[2,[0,null]]]],[[3,[2,[0,[1,null]]]],[[3,[2,[1,[0,null]]]],null]]]]]]]]]]]]]]]]]]]]]]]]'

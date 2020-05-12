parse_and_compile_and_run(40, 30, 5, "                        \
function remove_duplicates(lst) {                                             \
    return is_null(lst)                                                \
        ? null                                                          \
        : accumulate((x, y) => pair(x, remove_all(x, y)), lst, lst);        \
}                                                                             \
remove_duplicates(list(1, 2, 1, 3, 4, 2, 1, 5)); ");
// 'result: heap node of type = pair, value = [1,[2,[3,[4,[5,null]]]]]'

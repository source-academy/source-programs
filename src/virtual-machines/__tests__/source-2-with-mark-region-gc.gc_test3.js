parse_and_compile_and_run(20, 20, 10, "                                                       \
function subset(lst) {                                           \
    return is_null(lst)                             \
        ? pair(null, null) \
        : append(map(l => pair(head(lst), l), subset(tail(lst))), \
                 subset(tail(lst))); \
}                                                                \
subset(enum_list(0, 2)); ");
// 'result: heap node of type = pair, value = [[0,[1,[2,null]]],[[0,[1,null]],[[0,[2,null]],[[0,null],[[1,[2,null]],[[1,null],[[2,null],[null,null]]]]]]]]'

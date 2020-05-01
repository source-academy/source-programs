parse_and_eval("function try_me(a, b) {\
    return a === 0 ? 1 : b; \
    }\
    try_me(0, head(null));");
// 1

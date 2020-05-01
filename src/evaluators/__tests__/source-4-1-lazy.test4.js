parse_and_eval("const a = non_existing;\
                const non_existing = 11;\
                a;");

// 11
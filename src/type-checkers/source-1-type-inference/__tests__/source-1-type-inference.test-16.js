function test_16() {
    const program =
        "function f(x) {return x + 1;}" + "f(true);                     ";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 15);
}
test_16();

// Line 1227: Error: "type error: no rules matched"

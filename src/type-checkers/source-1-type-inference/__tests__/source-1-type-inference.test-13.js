function test_13() {
    const program = '"hello" + 1;';
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}
test_13();

// Line 1227: Error: "type error: no rules matched"

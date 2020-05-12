function test_15() {
    const program = '"hello" ? 1 : 2;';
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}
test_15();

// Line 1305: Error: "type error: rule 5 broken"

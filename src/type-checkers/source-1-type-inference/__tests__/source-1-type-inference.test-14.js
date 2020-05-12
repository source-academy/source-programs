function test_14() {
    const program = "true + 1;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}
test_14();

// Line 1305: Error: "type error: rule 5 broken"

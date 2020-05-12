function test_9() {
    const program = "const x = 1; x;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 7);
}
test_9();

// "1: T1"
// "2: number"
// "3: undefined"
// "4: number"
// "5: number"
// "6: number"
// "7: number"
// undefined

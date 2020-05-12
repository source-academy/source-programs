function test_1() {
    const program = "1;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 2);
}
test_1();
// "1: number"
// "2: number"
// undefined

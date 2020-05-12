function test_4() {
    const program = "1 + 1;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}
test_4();
// "1: (number * number) > number"
// "2: number"
// "3: number"
// "4: number"
// "5: number"
// undefined

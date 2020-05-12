function test_7() {
    const program = "! (1 === 1);";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 7);
}
test_7();
// "1: (bool) > bool"
// "2: (number * number) > bool"
// "3: number"
// "4: number"
// "5: bool"
// "6: bool"
// "7: bool"
// undefined

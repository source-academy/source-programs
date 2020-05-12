function test_8() {
    const program = "(! (1 === 1)) ? 1 : 2;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 10);
}
test_8();

// "1: (bool) > bool"
// "2: (number * number) > bool"
// "3: number"
// "4: number"
// "5: bool"
// "6: bool"
// "7: number"
// "8: number"
// "9: number"
// "10: number"
// undefined

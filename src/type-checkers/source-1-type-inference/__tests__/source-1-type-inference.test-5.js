function test_5() {
    const program = "1 + 3 * 4;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 8);
}

test_5();
// "1: (number * number) > number"
// "2: number"
// "3: (number * number) > number"
// "4: number"
// "5: number"
// "6: number"
// "7: number"
// "8: number"
// undefined

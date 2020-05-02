function test_3() {
    const program = "true ? 1 : 2;";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}

test_3();

// "1: bool"
// "2: number"
// "3: number"
// "4: number"
// "5: number"
// undefined

function test_2() {
    const program = "(()=>1)();";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 5);
}

test_2();
// "1: number"
// "2: number"
// "3: (null) > number"
// "4: number"
// "5: number"
// undefined

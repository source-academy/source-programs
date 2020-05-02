function test_12() {
    const program =
        "const about_pi = 3;             " +
        "function square(x) {            " +
        "    return x * x;               " +
        "}                               " +
        "4 * about_pi * square(6371);    ";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 24);
}
test_12();

// "1: T1"
// "2: number"
// "3: undefined"
// "4: T4"
// "5: number"
// "6: (number * number) > number"
// "7: number"
// "8: number"
// "9: number"
// "10: number"
// "11: (number) > number"
// "12: undefined"
// "13: (number * number) > number"
// "14: (number * number) > number"
// "15: number"
// "16: number"
// "17: number"
// "18: (number) > number"
// "19: number"
// "20: number"
// "21: number"
// "22: number"
// "23: number"
// "24: number"
// undefined

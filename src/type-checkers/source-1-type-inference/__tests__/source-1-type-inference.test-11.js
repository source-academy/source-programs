function test_11() {
    const program =
        "function factorial(n) {         " +
        "    return n === 1 ? 1          " +
        "        : n * factorial(n - 1); " +
        "}                               " +
        "factorial(4);                   ";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 26);
}
test_11();

// "1: T1"
// "2: number"
// "3: (number * number) > bool"
// "4: number"
// "5: number"
// "6: bool"
// "7: number"
// "8: (number * number) > number"
// "9: number"
// "10: (number) > number"
// "11: (number * number) > number"
// "12: number"
// "13: number"
// "14: number"
// "15: number"
// "16: number"
// "17: number"
// "18: number"
// "19: (number) > number"
// "20: undefined"
// "21: (number) > number"
// "22: number"
// "23: number"
// "24: number"
// "25: number"
// "26: number"
// undefined

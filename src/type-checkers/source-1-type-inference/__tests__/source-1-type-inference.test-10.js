function test_10() {
    const program =
        "function f(x, y) { return x; }  " + "f;                              ";
    const solved_form = infer_program(program);
    iterate_sigma(solved_form, 11);
}
test_10();

// "1: T1"
// "2: T2"
// "3: T3"
// "4: T2"
// "5: T2"
// "6: (T2 * T3) > T2"
// "7: undefined"
// "8: (T12 * T13) > T12"
// "9: (T12 * T13) > T12"
// "10: (T12 * T13) > T12"
// "11: (T12 * T13) > T12"
// undefined

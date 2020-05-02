function cond_stmt_test_1() {
    const prg =
        "function x(a) {if (a === 1) {return 'hello';} else {return 'world';}} \
        x(2); ";
    const sfs = infer_program(prg);
    iterate_sigma(sfs, 22);
}

cond_stmt_test_1();

// "1: T1"
// "2: number"
// "3: (number * number) > bool"
// "4: number"
// "5: number"
// "6: bool"
// "7: string"
// "8: string"
// "9: string"
// "10: string"
// "11: string"
// "12: string"
// "13: string"
// "14: (number) > string"
// "15: undefined"
// "16: (number) > string"
// "17: number"
// "18: string"
// "19: string"
// "20: string"
// "21: string"
// "22: number"
// undefined

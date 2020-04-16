/*
P = parse_and_compile("false ? 11 : 22;");
display(P);
run();
*/

/*
P = parse_and_compile("! (true || false);");
print_program(P);
run();
*/

/*
 P = parse_and_compile("1 + 1 === 2;");
 print_program(P);
 run();
*/

/*
P = parse_and_compile("1 + 2 * 3 * 4 - 5;");
run();
*/

/*
P = parse_and_compile("1 + 1 / 0;");
run();
*/

/*
P = parse_and_compile("1000 + 2000 / 3000;");
print_program(P);
run();
*/

/*
P = parse_and_compile("1; 2; 3;");
print_program(P);
run();
*/

/*
P = parse_and_compile("const x = 1; x + 2;");
print_program(P);
run();
*/

/*
P = parse_and_compile("undefined;");
print_program(P);
run();
*/

/*
P = parse_and_compile("     \
function f(x) {             \
    return x + 1;           \
}                           \
f(2);                       ");
print_program(P);
run();
*/

/*
P = parse_and_compile("             \
const a = 2;                        \
const b = 7;                        \
function f(x, y) {                  \
    const c = 100;                  \
    const d = 500;                  \
    return x - y * a + b - c + d;   \
}                                   \
f(30, 10);                          ");
print_program(P);
run();
*/

/*
P = parse_and_compile("         \
function factorial(n) {         \
    return n === 1 ? 1          \
        : n * factorial(n - 1); \
}                               \
factorial(4);                   ");
//print_program(P);
run();
*/

/*
P = parse_and_compile("         \
const about_pi = 3;             \
function square(x) {            \
    return x * x;               \
}                               \
4 * about_pi * square(6371);    ");
//print_program(P);
run();
*/

/*
P = parse_and_compile("           \
function power(x, y) {            \
    return y === 0                \
        ? 1                       \
        : x * power(x, y - 1);    \
}                                 \
power(17, 3);                     ");
//print_program(P);
run();
*/

/*
P = parse_and_compile("                                     \
function recurse(x, y, operation, initvalue) {              \
    return y === 0                                          \
        ? initvalue                                         \
        : operation(x, recurse(x, y - 1,                    \
                    operation, initvalue));                 \
}                                                           \
                                                            \
function f(x, z) { return x * z; }                          \
recurse(2, 3, f, 1);                                        \
                                                            \
function g(x, z) { return x + z; }                          \
recurse(2, 3, g, 0);                                        \
                                                            \
function h(x, z) { return x / z; }                          \
recurse(2, 3, h, 128);                                      ");
//print_program(P);
run();
*/


// P = parse_and_compile("                         \
// function abs(x) {                               \
//     return x >= 0 ? x : 0 - x;                  \
// }                                               \
// function square(x) {                            \
//     return x * x;                               \
// }                                               \
// function average(x,y) {                         \
//     return (x + y) / 2;                         \
// }                                               \
// function sqrt(x) {                              \
//     function good_enough(guess, x) {            \
//         return abs(square(guess) - x) < 0.001;  \
//     }                                           \
//     function improve(guess, x) {                \
//         return average(guess, x / guess);       \
//     }                                           \
//     function sqrt_iter(guess, x) {              \
//         return good_enough(guess, x)            \
//                    ? guess                      \
//                    : sqrt_iter(improve(         \
//                                 guess, x), x);  \
//     }                                           \
//     return sqrt_iter(1.0, x);                   \
// }                                               \
//                                                 \
// sqrt(5);                                        ");
// //print_program(P);
// run();


/*
P = parse_and_compile(" \
function f(x) {         \
    x + 1;              \
}                       \
f(3);                   ");
run();
*/

// P = parse_and_compile("                        \
// function remove_duplicates(lst) {                                             \
//     if(is_empty_list(lst)) {                                                  \
//         return null;                                                          \
//     } else {                                                                  \
//         return accumulate((x, y) => pair(x, remove_all(y)), lst, lst);        \
//     }                                                                         \
// }                                                                             \
// remove_duplicates(pair(2, enum_list(0, 3))); ");
// //print_program(P);
// run();

// P = parse_and_compile("                                                       \
// function permutations(lst) {                                                  \
//     if(is_empty_list(lst)) {                                                  \
//         return pair(null, null);                                              \
//     } else {                                                                  \
//         const f = e => map(x => pair(e, x), permutations(remove(e, lst)));    \
//         return accumulate((x,y) => append(f(x), y), null, lst);               \
//     }                                                                         \
// }                                                                             \
// permutations(enum_list(0, 3)); ");
// //print_program(P);
// run();

// P = parse_and_compile("                                                       \
// function subset(lst) {                                                        \
//     if(is_empty_list(lst)) {                                                  \
//         return pair(null, null);                                              \
//     } else {                                                                  \
//         const first = head(lst);                                              \
//         const rest = subset(tail(lst));                                       \
//         const with_first = map(l => pair(first, l), rest);                    \
//         return append(with_first, rest);                                      \
//     }                                                                         \
// }                                                                             \
// subset(enum_list(0, 3)); ");
// //print_program(P);
// run();
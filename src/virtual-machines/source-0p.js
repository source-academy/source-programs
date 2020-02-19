/*

Virtual machine for language Source §0+ 
(Source §0 with division, plus conditionals)

using virtual machine SVML0, Lecture Week 5 of CS4215

Instructions: press "Run" to evaluate an example expression
              (scroll down to see the example)
             
The language Source §0+ is defined as follows:

prgm    ::= expr ;

expr    ::= number
         |  true | false
         |  expr ? expr : expr
         |  expr && expr
         |  expr || expr
         |  expr binop expr
         |  unop expr
binop   ::= + | - | * | / | < | >
unop    ::= !              
*/

// SYNTAX OF SOURCE §0+

// Functions from SICP JS Section 4.1.2
// with slight modifications

function is_tagged_list(expr, the_tag) {
    return is_pair(expr) && head(expr) === the_tag;
}
     
// applications
function is_application(expr) {
    return is_tagged_list(expr, "application");
}

function operator(expr) {
    return head(tail(head(tail(expr))));
}
function operands(expr) {
    return head(tail(tail(expr)));
}
function no_operands(ops) {
    return is_null(ops);
}
function first_operand(ops) {
    return head(ops);
}
function rest_operands(ops) {
    return tail(ops);
}

// boolean operations
function is_boolean_operation(expr) {
    return is_tagged_list(expr, "boolean_operation");
}

// conditional expressions
function is_conditional_expression(expr) {
    return is_tagged_list(expr,
                "conditional_expression");
}
function cond_expr_pred(expr) {
    return list_ref(expr, 1);
}
function cond_expr_cons(expr) {
    return list_ref(expr, 2);
}
function cond_expr_alt(expr) {
    return list_ref(expr, 3);
}
function make_conditional_expression(expr1, expr2, expr3) {
    return list("conditional_expression",
                expr1, expr2, expr3);
}

function to_string(expr) {
    return (is_number(expr) || is_boolean(expr))
            ? stringify(expr)
            : length(operands(expr)) === 1
            ? "(" + operator(expr) +
                    to_string(list_ref(operands(expr), 0)) + ")"
            : "(" + to_string(list_ref(operands(expr), 0)) +
                    operator(expr) +  
                    to_string(list_ref(operands(expr), 1)) + ")";
}

// OP-CODES

// op-codes of machine instructions, used by compiler
// and machine

const LDCN    =  0;
const LDCB    =  1;
const PLUS    =  2;
const MINUS   =  3;
const TIMES   =  4;
const EQUAL   =  5;
const LESS    =  6;
const GREATER =  7;
const NOT     =  8;
const DONE    =  9;
const DIV     = 10;
const JOF     = 11;
const GOTO    = 12;

// COMPILER FROM SOURCE TO SVML

// parse given string and compile it to machine code
// return the machine code in an array

function parse_and_compile(string) {
    const machine_code = [];
    // compile: see relation ->> in CS4215 notes 3.5.2
    function compile(expr, next) {
        if (is_number(expr)) {
            machine_code[next] = LDCN;
            machine_code[next + 1] = expr;
            return next + 2;
        } else if (is_boolean(expr)) {
            machine_code[next] = LDCB;
            machine_code[next + 1] = expr;    
            return next + 2;
        } else if (is_boolean_operation(expr)) {
            if (operator(expr) === "&&") {
                return compile(make_conditional_expression(
                                   first_operand(
                                       operands(expr)),
                                   first_operand(
                                       rest_operands(
                                           operands(expr))),
                                   false), next);
            } else {
                return compile(make_conditional_expression(
                                   first_operand(
                                       operands(expr)),
                                   true,
                                   first_operand(
                                       rest_operands(
                                           operands(expr)))),
                               next);
            }
        } else if (is_conditional_expression(expr)) {
            const next_2 = compile(cond_expr_pred(expr), next);
            machine_code[next_2] = JOF;
            const next_3 = compile(cond_expr_cons(expr), next_2 + 2);
            machine_code[next_2 + 1] = next_3 + 2;
            machine_code[next_3] = GOTO;
            const next_4 = compile(cond_expr_alt(expr), next_3 + 2);
            machine_code[next_3 + 1] = next_4;
            return next_4;
        } else if (is_application(expr)) {
            const op = operator(expr);
            const ops = operands(expr);
            const operand_1 = first_operand(ops);
            if (op === "!") {
                const next_next = compile(operand_1, next);
                machine_code[next_next] = NOT;
                return next_next + 1;
            } else {
                const operand_2 = first_operand(rest_operands(ops));
                const op_code = op === "+" ? PLUS
                              : op === "-" ? MINUS
                              : op === "*" ? TIMES
                              : op === "===" ? EQUAL
                              : op === "<" ? LESS
                              : op === ">" ? GREATER
                              : op === "/" ? DIV
                              : error(op, "unknown operator:");
                const next_next = compile(operand_1, next);
                const next_next_next = compile(operand_2, next_next);
                machine_code[next_next_next] = op_code;
                return next_next_next + 1;
            }
        } else {
            error(expr, "unknown expression:");
        }
    }
    const next = compile(parse(string), 0);
    machine_code[next] = DONE;
    return machine_code;
}

// VIRTUAL MACHINE

// "registers" are the global variables of our machine.
// These contain primitive values (numbers or boolean
// values) or arrays of primitive values

// P is an array that contains an SVML machine program:
// the op-codes of instructions and their arguments
let P = [];
// PC is program counter: index of the next instruction
let PC = 0;
// OS is array representing the operand stack of the machine
let OS = [];
// operand stack is initially empty, so we start out with -1
let TOP = -1;
// temporary value, used by the machine instructions
let TMP = 0;  

// PUSH and POP are convenient subroutines that operate on
// the operand stack OS, its OS_TOP address and OS_TMP.
// PUSH expects its argument in OS_TMP.
function PUSH() {
    TOP = TOP + 1;
    OS[TOP] = TMP;
}
// POP puts the top-most value into OS_TMP.
function POP() {
    TMP = OS[TOP];
    TOP = TOP - 1;
}

// some registers for intermediate results
let A = 0;
let B = 0;
let C = 0;

// SVMLa implementation

// We implement our machine with an array M that
// contains subroutines. Each subroutine implements
// a machine instruction, using a nullary function.
// The machine can then index into M using the op-codes
// of the machine instructions. To be implementable on
// common hardware, the subroutines have the
// following structure:
// * they have no parameters
// * they do not return any results
// * they do not have local variables
// * they do not call other functions except the
//   subroutines PUSH and POP
// * each line is very simple, for example an array access
// Ideally, each line can be implemented directly with a
// machine instruction of a real computer. In that case,
// the subroutines could become machine language macros,
// and the compiler could generate real machine code.

const M = [];

M[LDCN] = () =>    { TMP = P[PC + 1];
                     PUSH();
                     PC = PC + 2;
                   };

M[LDCB] = () =>    { TMP = P[PC + 1];
                     PUSH();
                     PC = PC + 2;
                   };

M[PLUS] = () =>    { POP();
                     A = TMP;
                     POP();
                     TMP = TMP + A;
                     PUSH();
                     PC = PC + 1;
                   };

M[MINUS] = () =>   { POP();
                     A = TMP;
                     POP();
                     TMP = TMP - A;
                     PUSH();
                     PC = PC + 1;
                   };

M[TIMES] = () =>   { POP();
                     A = TMP;
                     POP();
                     TMP = TMP * A;
                     PUSH();
                     PC = PC + 1;
                   };
     
M[EQUAL] = () =>   { POP();
                     A = TMP;
                     POP();
                     TMP = TMP === A;
                     PUSH();
                     PC = PC + 1;
                   };
         
M[LESS] = () =>    { POP();
                     A = TMP;
                     POP();
                     TMP = TMP < A;
                     PUSH();
                     PC = PC + 1;
                   };
     
M[GREATER] = () => { POP();
                     A = TMP;
                     POP();
                     TMP = TMP > A;
                     PUSH();
                     PC = PC + 1;
                   };

M[NOT] = () =>     { POP();
                     TMP = ! TMP;
                     PUSH();
                     PC = PC + 1;
                   };
               
// register that says if machine is running                  
let RUNNING = true;
const NORMAL = 0;
const ERROR = 1;
let STATE = NORMAL;

M[DONE] = () =>    { RUNNING = false;
                   };

M[DIV] = () =>     { POP();
                     A = TMP;
                     POP();
                     TMP = TMP / A;
                     PUSH();
                     PC = PC + 1;
                     A = A === 0;
                     if (A) { STATE = ERROR; } else {}
                     if (A) { RUNNING = false; } else {}
                   };
                   
M[JOF] = () =>     { POP();
                     if (!TMP) { PC = P[PC + 1]; } else {}
                     if (TMP) { PC = PC + 2; } else {}
                   };

M[GOTO] = () =>    { PC = P[PC + 1];
                   };

function run() {
    while (RUNNING) {
        M[P[PC]]();
    }
    if (STATE === ERROR) {
        error(OS[TOP], "execution aborted:");
    } else {
        display(OS[TOP], "result:");
    }
}

// EXAMPLES

/*
// simple hand-coded example, computing 21 - 4
P =
[ LDCN, 21,
  LDCN, 4,
  MINUS,
  DONE
];
run();
*/

/*
// simple hand-coded example, computing 3 * (17 + 4)
P =
[ LDCN, 3,
  LDCN, 17,
  LDCN, 4,
  PLUS,
  TIMES,
  DONE
];
run();
*/

// compiler and VM test cases

/*
 P = parse_and_compile("true ? 11 : 22;");
 display(P);
run();
*/

/*
P = parse_and_compile("false ? 11 : 22;");
display(P);
run();
*/

/*
P = parse_and_compile("! (true || false);");
display(P);
run();
*/

/*
 P = parse_and_compile("1 + 1 === 2;");
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


P = parse_and_compile("false ? 3 / 0 : 42;");
run();

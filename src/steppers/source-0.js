/*
Evaluator for language Source §0 
following dynamic semantics, Lecture Week 2 of CS4215

Instructions: Copy this file into the Source Academy frontend:
              https://source-academy.github.io/playground
	      You can use the google drive feature to save your 
	      work. When done, copy the file back to the
	      repository and push your changes.

              To run your program, press "Run" and observe
	      the result on the right.

The language Source §0 is defined as follows:

prgm    ::= expr ;

expr    ::= number
         |  true | false
         |  expr binop expr
         |  unop expr
binop   ::= + | - | * | / | % | < | > 
         | === |  && | ||
unop    ::= !
*/

// Functions from SICP JS Section 4.1.2

function is_tagged_list(expr, the_tag) {
    return is_pair(expr) && head(expr) === the_tag;
}

function make_literal(value) {
    return list("literal", value);
}

function is_literal(expr) {
    return is_tagged_list(expr, "literal");
}

function literal_value(expr) {
    return head(tail(expr));
}

function is_operator_combination(expr) {
   return is_unary_operator_combination(expr) ||
          is_binary_operator_combination(expr);
}

function is_unary_operator_combination(expr) {
   return is_tagged_list(expr, "unary_operator_combination");
}

// logical composition (&&, ||) is treated as binary operator combination
function is_binary_operator_combination(expr) {
   return is_tagged_list(expr, "binary_operator_combination") ||
          is_tagged_list(expr, "logical_composition");
}

function operator(expr) {
   return head(tail(expr));
}

function first_operand(expr) {
   return head(tail(tail(expr)));
}

function second_operand(expr) {
   return head(tail(tail(tail(expr))));
}

function make_unary_operator_combination(operator, operand) {
   return list("unary_operator_combination", operator, operand);
}

function make_binary_operator_combination(operator, operand1, operand2) {
   return list("binary_operator_combination", operator, operand1, operand2);
}

// two new functions, not in 4.1.2

function is_boolean_literal(expr) {
    return is_tagged_list(expr, "literal") && 
           is_boolean(literal_value(expr));
}

function is_number_literal(expr) {
    return is_tagged_list(expr, "literal") && 
           is_number(literal_value(expr));
}

// see exercise 4.2

function unparse(expr) {
    return is_literal(expr) 
            ? stringify(literal_value(expr))
            : is_unary_operator_combination(expr)
            ? "(" + operator(expr) + 
                    unparse(first_operand(expr)) + ")"
            : "(" + unparse(first_operand(expr)) + 
                    operator(expr) +  
                    unparse(second_operand(expr)) + ")";
}

// contractible: see contract relation in Section 3.2.2

function contractible(expr) {
    if (is_literal(expr)) {
        return false;
    } else {
        const op = operator(expr);
        return is_unary_operator_combination(expr)
               ? is_boolean_literal(first_operand(expr))
               : op === "&&" || op === "||"
               ? is_boolean_literal(first_operand(expr)) &&
                 is_boolean_literal(second_operand(expr))
               : is_number_literal(first_operand(expr)) &&
                 is_number_literal(second_operand(expr)) &&
                 ! (op === "/" && literal_value(second_operand(expr)) === 0);
    }
}

// contract will only be applied to contractible exprs

function contract(expr) {
    const op = operator(expr);
    const operand_1 = literal_value(first_operand(expr));
    if (operator(expr) === "!") {
        return make_literal(! operand_1);
    } else {
        const operand_2 = literal_value(second_operand(expr));
        const value = op === "&&" ? operand_1 && operand_2
             : op === "||" ? operand_1 || operand_2
             : op === "+" ? operand_1 + operand_2
             : op === "-" ? operand_1 - operand_2
             : op === "*" ? operand_1 * operand_2
             : op === "/" ? math_floor(operand_1 / operand_2)
             : op === "===" ? operand_1 === operand_2
             : op === "<" ? operand_1 < operand_2
             : /* op === ">" ? */ operand_1 > operand_2;
        return make_literal(value);
    }
}

// one_step_possible follows one-step evaluation in Section 3.2.3
// one step is possible if the expression itself is contractible
// or if it is an operator combination and one step is possible
// in one of its operands
 
function one_step_possible(expr) {
    return contractible(expr) ||
           (is_unary_operator_combination(expr) &&
            one_step_possible(first_operand(expr))) ||
           (is_binary_operator_combination(expr) &&
            (one_step_possible(first_operand(expr)) ||
             one_step_possible(second_operand(expr))));
}

// one_step will only be applied when one_step_possible

function one_step(expr) {
    const op = operator(expr);
    return contractible(expr)
           ? contract(expr)
           : is_unary_operator_combination(expr)
           ? make_unary_operator_combination("!",
                 one_step(first_operand(expr)))
           : one_step_possible(first_operand(expr))
           ? make_binary_operator_combination(op, 
                 one_step(first_operand(expr)),
                 second_operand(expr))
           : make_binary_operator_combination(op,
                 first_operand(expr),
                 one_step(second_operand(expr)));
}

function evaluate(expr) {
    return one_step_possible(expr)
        ? evaluate(one_step(expr))
        : expr;
}

function parse_and_evaluate(string) {
    return unparse(evaluate(parse(string)));
}

// parse_and_evaluate("! (1 === 1 && 2 > 3);");
// parse_and_evaluate("1 + 2 / 0;");
// parse_and_evaluate("1 + 2 / 1;");
parse_and_evaluate("false || true;");

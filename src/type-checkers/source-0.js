/*
Type system for language Source §0 
following static semantics, Lecture Week 2 of CS4215

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
// with slight modifications

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

// two new functions, not in 4.1.2

function is_boolean_literal(expr) {
    return is_tagged_list(expr, "literal") && 
           is_boolean(literal_value(expr));
}

function is_number_literal(expr) {
    return is_tagged_list(expr, "literal") && 
           is_number(literal_value(expr));
}

// type: returns int, bool or none of given
// well-formed expression expr
// "well-formed" means expressions as returned
// by parse: allowed operators, correct number
// of operands, based operator

// following Section 3.3.1

function type(expr) {
    if (is_number_literal(expr)) {
        return "int";
    } else if (is_boolean_literal(expr)) {
        return "bool";
    } else {
        // expr is operator combination
        const op = operator(expr);
        const operand_1 = first_operand(expr);
        if (is_unary_operator_combination(expr)) {
            return type(operand_1) === "bool" ? "bool" : "none";
        } else {
            // expr is binary operator combination
            const operand_2 = second_operand(expr);
            return op === "&&" 
                ? (type(operand_1) === "bool" && type(operand_2) === "bool")
                  ? "bool" : "none"
                : op === "||" 
                ? (type(operand_1) === "bool" && type(operand_2) === "bool")
                  ? "bool" : "none"
                : op === "+" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "int" : "none"
                : op === "-" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "int" : "none"
                : op === "*" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "int" : "none"
                : op === "/" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "int" : "none"
                : op === "===" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "bool" : "none"                  
                : op === "<" 
                ? (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "bool" : "none"                  
                : // op === ">" ?
                  (type(operand_1) === "int" && type(operand_2) === "int")
                  ? "bool" : "none";                  
        }
    }
}

function parse_and_type(string) {
    return type(parse(string));
}

// parse_and_type("! (1 === 1 && 2 > 3);");
// parse_and_type("1 + 2 / 0;");
// parse_and_type("3 / 4;");
parse_and_type("true || (2 === 3);");

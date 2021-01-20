/*
Evaluator for language Source §0 without division
following denotational semantics, Lecture Week 2 of CS4215

Instructions: Copy this file into the Source Academy frontend:
              https://source-academy.github.io/playground
	      You can use the google drive feature to save your 
	      work. When done, copy the file back to the
	      repository and push your changes.

              To run your program, press "Run" and observe
	      the result on the right.

The language Source §0 without division is defined as follows:

pgrm    ::= expr ;

expr    ::= number
         |  true | false
         |  expr binop expr
         |  unop expr
binop   ::= + | - | * | < | > 
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

// function evaluate from SICP JS 4.1.1 (much simplified)

function evaluate(expr) {
   return is_literal(expr)
          ? literal_value(expr)
        : is_unary_operator_combination(expr)
        ? apply(lookup_primitive_function(operator(expr)),
                list_of_values(list(first_operand(expr))))
        : is_binary_operator_combination(expr)
        ? apply(lookup_primitive_function(operator(expr)),
                list_of_values(list(first_operand(expr),
                                    second_operand(expr))))
        : error(expr, "Unknown statement type in evaluate: ");
}

// table of primitive functions
const primitive_functions = list(
       list("+",             (x, y) => x + y  ),
       list("-",             (x, y) => x - y  ),
       list("*",             (x, y) => x * y  ),
       list("===",           (x, y) => x === y),
       list("<",             (x, y) => x <   y),
       list(">",             (x, y) => x >   y),
       list("&&",            (x, y) => x &&  y),
       list("||",            (x, y) => x ||  y),
       list("!",              x     =>   !   x)
       );

function lookup_primitive_function(name) {
    function lookup(name, ps) {
        return is_null(ps)
            ? error(name, "cannot find function with name:", name)
            : name === head(head(ps))
              ? head(tail(head(ps)))
              : lookup(name, tail(ps));
    }
    return lookup(name, primitive_functions);
}

// function apply from SICP JS 4.1.1 (much simplified)

function apply(fun, args) {
    return apply_in_underlying_javascript(fun, args);
} 
      
// function list_of_values from SICP JS 4.1.1 (simplified)      
function list_of_values(exps) {
    return map(evaluate, exps);
}

function parse_and_evaluate(string) {
    return evaluate(parse(string));
}

parse_and_evaluate("! (1 === 1 && 2 > 3);");

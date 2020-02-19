/*
Evaluator for Source §0++ (calculator language with booleans, 
                           conditionals, blocks and expression 
                           sequences)

This is an evaluator for a language that can carry
out simple arithmetic calculations, boolean operations and 
provides for sequences of expressions.

The covered Source §1 sublanguage is:

statement  ::= expression ; 
            |  statement statement
            |  block
block      ::= { statement }
expression ::= expression binop expression
            |  unop expression
            |  number
            |  true | false
binop      ::= + | - | * | / | % | < | > | <= | >= | === | !==
            |  && | ||
unop       ::= !

The usual operator precedences apply, and parentheses
can be used freely.

Note that the evaluator is a bit more complex
than necessary, to be consistent with the more
powerful evaluators that will follow.
*/

/* CONSTANTS: NUMBERS, TRUE, FALSE */

// constants (numbers, booleans)
// are considered "self_evaluating". This means, they
// represent themselves in the syntax tree

function is_self_evaluating(stmt) {
    return is_number(stmt) ||
           is_boolean(stmt);
}

// all other statements and expressions are
// tagged lists. Their tag tells us what
// kind of statement/expression they are

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* NAMES */

// In this evaluator, the operators are referred
// to as "names" in expressions.

// Names are tagged with "name".
// In this evaluator, a typical name
// is
// list("name", "+")

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

/* OPERATOR APPLICATION */

// The core of our evaluator is formed by the
// implementation of operator applications.
// Applications are tagged with "application"
// and have "operator" and "operands"

function is_application(stmt) {
    return is_tagged_list(stmt, "application");
}
function operator(stmt) {
   return head(tail(stmt));
}
function operands(stmt) {
   return head(tail(tail(stmt)));
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


/* PRIMITIVE FUNCTIONS */

// our primitive operators are represented
// by primimitive function values, which
// are lists tagged with "primitive"  
function is_primitive_function(fun) {
   return is_tagged_list(fun, "primitive");
}
function primitive_implementation(fun) {
   return head(tail(fun));
}
function make_primitive_function(impl) {
    return list("primitive", impl);
}

/* APPLY */

// apply_in_underlying_javascript allows us
// to make use of JavaScript's primitive functions
// in order to access operators such as addition
function apply_primitive_function(fun, argument_list) {
    return apply_in_underlying_javascript(
                primitive_implementation(fun),
                argument_list);     
}

// all functions in this language are primitive
// functions: built-in functions as given in the
// global environment
function apply(fun, args) {
    if (is_primitive_function(fun)) {
        return apply_primitive_function(fun,args);
    } else {
        error("Unknown function type in apply: ",fun);
    }
}
    
// list_of_values evaluates a given
// list of expressions
function list_of_values(exps) {
    if (no_operands(exps)) {
        return null;
    } else {
        return pair(evaluate(first_operand(exps)),
                    list_of_values(rest_operands(exps)));
    }
}
    
/* LAZY BOOLEAN OPERATOR APPLICATION */

// thankfully our parser distinguishes the applications
// of lazy boolean operators using the special tag
// "boolean_operation"
function is_boolean_operation(stmt) {
    return is_tagged_list(stmt, "boolean_operation");
}

// evaluation of laziness avoids evaluation of
// the right-hand side, if the evaluation of the
// left-hand side already determines the result
function eval_boolean_operation(stmt) {
    if (operator(stmt) === "&&") {  
        if (is_true(evaluate(first_operand(
                                operands(stmt))))) {
            return evaluate(
                      first_operand(
                         rest_operands(operands(stmt))));
        } else {
            return false;
        } 
    } else {
        if (is_true(evaluate(first_operand(
                                operands(stmt))))) {
            return true;
        } else {
            return evaluate(
                      first_operand(
                         rest_operands(operands(stmt))));
        }        
    }
}

/* SEQUENCES */

// sequences of statements are just represented
// by lists of statements by the parser. Thus
// there is no need for tagged objects here.
function is_sequence(stmt) {
   return is_tagged_list(stmt, "sequence");
}
function sequence_statements(stmt) {   
   return head(tail(stmt));
}
function is_empty_sequence(stmts) {
   return is_null(stmts);
}
function is_last_statement(stmts) {
   return is_null(tail(stmts));
}
function first_statement(stmts) {
   return head(stmts);
}
function rest_statements(stmts) {
   return tail(stmts);
}

// to evaluate a sequence, we need to evaluate
// its statements one after the other, and return
// the value of the last statement. 
function eval_sequence(stmts) {
    if (is_last_statement(stmts)) {
        return evaluate(first_statement(stmts));
    } else {
        const first_stmt_value = 
            evaluate(first_statement(stmts));
        return eval_sequence(
                   rest_statements(stmts));
    }
}

/* CONDITIONAL EXPRESSIONS */

// conditional expressions are tagged
// with "conditional_expression"
function is_conditional_expression(stmt) {
   return is_tagged_list(stmt, 
                "conditional_expression");
}
function cond_expr_pred(stmt) {
   return list_ref(stmt, 1);
}
function cond_expr_cons(stmt) {
   return list_ref(stmt, 2);
}
function cond_expr_alt(stmt) {
   return list_ref(stmt, 3);
}
function is_true(x) {
    return x === true;
}
function is_false(x) {
    return ! is_true(x);
}
    
// the meta-circular evaluation of conditional expressions
// evaluates the predicate and then the appropriate
// branch, depending on whether the predicate 
// evaluates to true or not

function eval_conditional_expression(stmt) {
    return is_true(evaluate(cond_expr_pred(stmt)))
           ? evaluate(cond_expr_cons(stmt))
           : evaluate(cond_expr_alt(stmt));
}

/* BLOCKS */

// blocks are tagged with "block"
function is_block(stmt) {
    return is_tagged_list(stmt, "block");
}
function block_body(stmt) {
    return head(tail(stmt));
}

// the meta-circular evaluation of blocks simply
// evaluates the body of the block
function eval_block(stmt) {
    return evaluate(block_body(stmt));
}

/* ENVIRONMENT */

// we store our primitive functions in a data structure called 
// environment, which is a list of frames.
// 
// In this evaluator, there is only one frame, the global frame, 
// and only one environment, the global environment.
//
// A frame is a pair consisting of a list of names and a list
// of corresponding values.

const primitive_functions = 
  list(pair("+",   (x, y) => x +   y),
       pair("-",   (x, y) => x -   y),
       pair("*",   (x, y) => x *   y),
       pair("/",   (x, y) => x /   y),
       pair("%",   (x, y) => x %   y),
       pair("===", (x, y) => x === y),
       pair("!==", (x, y) => x !== y),
       pair("<",   (x, y) => x <   y),
       pair("<=",  (x, y) => x <=  y),
       pair(">",   (x, y) => x >   y),
       pair(">=",  (x, y) => x >=  y),
       pair("!",    x     =>   !   x)
      );

const the_empty_environment = null;

// We store our primitive functions as objects tagged as "primitive".
// The actual functions are in property "implementation".
// We store the primitive functions in a global environment that 
// consists of one single frame: the global frame, which is 
// initially empty.
function setup_environment() {
    const primitive_function_names =
        map(f => head(f), primitive_functions);
    const primitive_function_values =
        map(f => make_primitive_function(tail(f)),
            primitive_functions);
    return extend_environment(
               primitive_function_names, 
               primitive_function_values, 
               the_empty_environment);
}

function make_frame(names, values) {
    return pair(names, values);
}

function extend_environment(names, vals, base_env) {
    return pair(make_frame(names, vals), base_env);
}

const the_global_environment = setup_environment();

// with such a simple global environment,
// looking up a name is very easy...
function lookup_name_value(name) {
    const frame = head(the_global_environment);
    function scan(names, vals) {
        return is_null(names)
            ? error(name, "name not found: ")
            : name === head(names)
              ? head(vals)
              : scan(tail(names), tail(vals));
    }
    return scan(head(frame), tail(frame));
}

/* EVALUATE */

// The workhorse of our evaluator is the evaluate function.
// It dispatches on the kind of statement at hand, and
// invokes the appropriate implementations of their
// evaluation process, as described above.

function evaluate(stmt) {
   return is_self_evaluating(stmt)
          ?  stmt
        : is_name(stmt)
          ? lookup_name_value(name_of_name(stmt))
        : is_conditional_expression(stmt)
          ? eval_conditional_expression(stmt)
        : is_sequence(stmt)
          ? eval_sequence(sequence_statements(stmt))
        : is_block(stmt)
          ? eval_block(stmt)
        : is_application(stmt)
          ? apply(evaluate(operator(stmt)),
                  list_of_values(operands(stmt)))
        : error(stmt, "Unknown statement type in evaluate: ");
}

// the parse function returns a a parse tree which
// we pass to evaluate
function parse_and_evaluate(str) {
    return evaluate(parse(str));
}

/*

// example for boolean self-evaluating value
is_self_evaluating(head(parse("true;")); // true
evaluate(head(parse("true;")));

// example for conditional expression
const my_cond = head(parse("true ? 3 : 4;"));
stringify(my_cond);
eval_conditional_expression(my_cond);

// example for sequence
const my_seq = parse("1 + 2; 3 + 4; 5 + 6;");
stringify(my_seq);
eval_sequence(my_seq);

// evaluation examples:
parse_and_evaluate("1;");
parse_and_evaluate("1 + 1;");
parse_and_evaluate("1 + 3 * 4;");
parse_and_evaluate("(1 + 3) * 4;");
parse_and_evaluate("1.4 / 2.3 + 70.4 * 18.3;");
parse_and_evaluate("true;");
parse_and_evaluate("! (1 === 1);");
*/

parse_and_evaluate("(! (1 === 1)) ? 0 : 4;");

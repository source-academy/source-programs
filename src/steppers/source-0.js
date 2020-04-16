/*
Evaluator for language Source §0 

following dynamic semantics, Lecture Week 2 of CS4215

Instructions: press "Run" to evaluate an example expression
              (scroll down to see the example)

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
	      
function is_application(expr) {
   return is_tagged_list(expr, "application") ||
          is_tagged_list(expr, "boolean_operation");
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
function make_application(op, ops) {
    return list("application", 
                list("name", op),
                ops);
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

// contractible: see contract relation in Section 3.2.2

function contractible(expr) {
    if (is_application(expr)) {
        const op = operator(expr);
        const ops = operands(expr);
        if (op === "!") {
            return length(ops) === 1 &&
                   is_boolean(list_ref(ops, 0));
        } else {
            if (length(ops) === 2) {
                const operand_1 = list_ref(ops, 0);
                const operand_2 = list_ref(ops, 1);
                return ( (op === "&&" || op === "||") &&
                         is_boolean(operand_1) && is_boolean(operand_2))
                       ||
                       (is_number(operand_1) && is_number(operand_2) &&
                        ! (op === "/" && operand_2 === 0));
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

// contract will only be applied to contractible exprs

function contract(expr) {
    const op = operator(expr);
    const ops = operands(expr);
    const operand_1 = list_ref(ops, 0);
    if (op === "!") {
        return ! operand_1;      
    } else {
        const operand_2 = list_ref(ops, 1);
        return op === "&&" ? operand_1 && operand_2
             : op === "||" ? operand_1 || operand_2
             : op === "+" ? operand_1 + operand_2
             : op === "-" ? operand_1 - operand_2
             : op === "*" ? operand_1 * operand_2
             : op === "/" ? math_floor(operand_1 / operand_2)
             : op === "===" ? operand_1 === operand_2
             : op === "<" ? operand_1 < operand_2
             : /* op === ">" ? */ operand_1 > operand_2;
    }
}

// one_step_possible follows one-step evaluation in Section 3.2.3
// subexpressions is reducible, or if
 
function one_step_possible(expr) {
    if (contractible(expr)) {
        return true;
    } else if (is_application(expr)) {
        const ops = operands(expr);
        return (length(operands(expr)) === 1 && 
                one_step_possible(list_ref(ops, 0)))
               ||
               (length(operands(expr)) === 2 && 
                (one_step_possible(list_ref(ops, 0)) ||
                 one_step_possible(list_ref(ops, 1))));
    } else {
        return false;
    }
}

// one_step will only be applied when one_step_possible

function one_step(expr) {
    if (contractible(expr)) {
        return contract(expr);
    } else { // expr is application
        const op = operator(expr);
        const ops = operands(expr);     
        if (length(operands(expr)) === 1) {
            // one_step possible on 1st operand
            return make_application(op, 
                                    list(one_step(list_ref(ops, 0))));
        } else {
            // there are two operands and 
            // at least one of them allows one step
            const op = operator(expr);
            const ops = operands(expr);     
            return one_step_possible(list_ref(ops, 0))
                ? make_application(op, 
                                   list(one_step(list_ref(ops, 0)),
                                        list_ref(ops, 1)))
                : make_application(op,
                                   list(list_ref(ops, 0),
                                        one_step(list_ref(ops, 1))));
        }
    }
}

function evaluate(expr) {
    return one_step_possible(expr)
        ? evaluate(one_step(expr))
        : expr;
}

function parse_and_evaluate(string) {
    return evaluate(parse(string));
}


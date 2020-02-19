/*
Type system for language Source §0 

following static semantics, Lecture Week 2 of CS4215

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

// type: returns int, bool or none of given
// well-formed expression expr
// "well-formed" means expressions as returned
// by parse: allowed operators, correct number
// of operands, based operator

// following Section 3.3.1

function type(expr) {
    if (is_number(expr)) {
        return "int";
    } else if (is_boolean(expr)) {
        return "bool";
    } else {
        // expr is application
        const op = operator(expr);
        const ops = operands(expr);
        const operand_1 = list_ref(ops, 0);
        if (length(ops) === 1) {
            return type(operand_1) === "bool" ? "bool" : "none";
        } else {
            // there are two operands
            const operand_2 = list_ref(ops, 1);
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
parse_and_type("1 + (2 === 3);");

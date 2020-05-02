// syntax_tree_nodes.js: syntax tree nodes (typed and untyped)

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* CONSTANT DECLARATIONS */

// constant declarations are tagged with "constant_declaration"
// and have "name" and "value" properties

function is_constant_declaration(stmt) {
    return is_tagged_list(stmt, "constant_declaration");
}
/**
 * Returns the name of name of the constant declaration. NOT returning
 * the second element of the tagged list.
 * @param {} stmt
 */

function constant_declaration_name(stmt) {
    return head(tail(head(tail(stmt))));
}
function constant_declaration_value(stmt) {
    return head(tail(tail(stmt)));
}

// find the names that are declared (at top-level) in
// the given statement

function local_names(stmt) {
    if (is_sequence(stmt)) {
        const stmts = sequence_statements(stmt);
        return is_empty_sequence(stmts)
            ? null
            : append(
                  local_names(first_statement(stmts)),
                  local_names(make_sequence(rest_statements(stmts)))
              );
    } else {
        return is_constant_declaration(stmt)
            ? list(constant_declaration_name(stmt))
            : null;
    }
}

// conditional expressions are tagged
// with "conditional_expression"

function is_conditional_expression(stmt) {
    return is_tagged_list(stmt, "conditional_expression");
}
function is_conditional_statement(stmt) {
    return is_tagged_list(stmt, "conditional_statement");
}
function cond_pred(stmt) {
    return list_ref(stmt, 1);
}
function cond_cons(stmt) {
    return list_ref(stmt, 2);
}
function cond_alt(stmt) {
    return list_ref(stmt, 3);
}
function cond_type(stmt) {
    return list_ref(stmt, 4);
}

// sequences of statements are just represented
// by tagged lists of statements by the parser.

function is_sequence(stmt) {
    return is_tagged_list(stmt, "sequence");
}
function make_sequence(stmts) {
    return list("sequence", stmts);
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
function is_function_definition(stmt) {
    return is_tagged_list(stmt, "function_definition");
}

/**
 * Gets the names of the parameters, e.g. [a,b,c]
 */
function function_definition_parameters_names(stmt) {
    return map((x) => name_of_name(x), head(tail(stmt)));
}

/**
 * Gets the list of parameters, i.e. a list of "names"-tagged list, e.g. [["name", "a"], ["name", "b"]]
 */
function function_definition_parameters(stmt) {
    return head(tail(stmt));
}
function function_definition_body(stmt) {
    return head(tail(tail(stmt)));
}

function function_definition_type(stmt) {
    return list_ref(stmt, 3);
}

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

function type_of_name(stmt) {
    return list_ref(stmt, 2);
}

// added tagged list for primitive types
function is_primitive_node(stmt) {
    return is_tagged_list(stmt, "prim_node");
}

function make_number_node(value) {
    return list(
        "prim_node",
        number_type,
        value,
        make_new_A_type(fresh_A_var())
    );
}

function make_boolean_node(value) {
    return list("prim_node", bool_type, value, make_new_T_type(fresh_T_var()));
}

function make_undefined_node() {
    return list(
        "prim_node",
        undefined_type,
        undefined,
        make_new_T_type(fresh_T_var())
    );
}

function make_string_node(value) {
    return list(
        "prim_node",
        string_type,
        value,
        make_new_A_type(fresh_A_var())
    );
}

function type_var_of_primitive_node(stmt) {
    return list_ref(stmt, 3);
}

function value_of_primitive_node(stmt) {
    return list_ref(stmt, 2);
}
function type_of_primitive_node(stmt) {
    return list_ref(stmt, 1);
}
/* FUNCTION APPLICATION */

function is_application(stmt) {
    return is_tagged_list(stmt, "application");
}
function operator(stmt) {
    return head(tail(stmt));
}
function operands(stmt) {
    return head(tail(tail(stmt)));
}

function type_of_application_result(stmt) {
    return list_ref(stmt, 3);
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

/* RETURN STATEMENTS */

// functions return the value that results from
// evaluating return statements

function is_return_statement(stmt) {
    return is_tagged_list(stmt, "return_statement");
}
function return_statement_expression(stmt) {
    return head(tail(stmt));
}

// blocks are tagged with "block"
function is_block(stmt) {
    return is_tagged_list(stmt, "block");
}

function block_body(stmt) {
    return head(tail(stmt));
}

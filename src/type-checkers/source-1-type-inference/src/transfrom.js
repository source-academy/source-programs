// transform.js: top-level transformation

function transform(stmt) {
    return is_primitive_node(stmt) || is_name(stmt)
        ? stmt
        : is_constant_declaration(stmt)
        ? transform_constant_declaration(stmt)
        : is_conditional_expression(stmt)
        ? transform_conditional_expression(stmt)
        : is_conditional_statement(stmt)
        ? transform_conditional_statement(stmt)
        : is_sequence(stmt)
        ? transform_sequence(stmt)
        : is_application(stmt)
        ? transform_application(stmt)
        : is_function_definition(stmt)
        ? transform_function_definition(stmt)
        : is_block(stmt)
        ? transform_block(stmt)
        : is_return_statement(stmt)
        ? transform_return_statement(stmt)
        : error(stmt, "Unknown statement type in transform: ");
}

function transform_block(stmt) {
    const body = block_body(stmt);
    return list("block", transform(body), list_ref(stmt, 2));
}

function transform_return_statement(stmt) {
    return list(
        "return_statement",
        transform(return_statement_expression(stmt)),
        list_ref(stmt, 2)
    );
}

function transform_function_definition(stmt) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);
    return list(
        "function_definition",
        map((name) => transform(name), parameters),
        transform(body),
        list_ref(stmt, 3)
    );
}

function transform_application(stmt) {
    return list(
        "application",
        transform(operator(stmt)),
        map((opd) => transform(opd), operands(stmt)),
        list_ref(stmt, 3)
    );
}

function transform_conditional_expression(stmt) {
    return list(
        "conditional_expression",
        transform(cond_pred(stmt)),
        transform(cond_cons(stmt)),
        transform(cond_alt(stmt)),
        list_ref(stmt, 4)
    );
}

function transform_conditional_statement(stmt) {
    return list(
        "conditional_statement",
        transform(cond_pred(stmt)),
        transform(cond_cons(stmt)),
        transform(cond_alt(stmt)),
        list_ref(stmt, 4)
    );
}
function transform_sequence(stmt) {
    const number_of_statements = length(sequence_statements(stmt));
    const transformed_exprs = map(
        (stmt) => transform(stmt),
        sequence_statements(stmt)
    );

    // add return to the last statement
    list_map_at(transformed_exprs, number_of_statements - 1, (s) =>
        list("return_statement", s, make_new_T_type(fresh_T_var()))
    );

    return list(
        "sequence",
        transformed_exprs,
        list_ref(stmt, 2) // the type of the entire sequence
    );
}

function transform_constant_declaration(stmt) {
    return list(
        "constant_declaration",
        transform(list_ref(stmt, 1)),
        transform(list_ref(stmt, 2)),
        list_ref(stmt, 3)
    );
}

function transform_top_level(stmt) {
    return list("block", transform(stmt), make_new_T_type(fresh_T_var()));
}

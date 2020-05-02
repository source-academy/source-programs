// annotate.js: untyped syntax tree annotation

function annotate(stmt) {
    return is_number(stmt) // prim
        ? make_number_node(stmt)
        : is_boolean(stmt) // prim
        ? make_boolean_node(stmt)
        : is_undefined(stmt) // prim
        ? make_undefined_node()
        : is_string(stmt) // prim
        ? make_string_node(stmt)
        : is_name(stmt)
        ? annotate_name(stmt)
        : is_constant_declaration(stmt)
        ? annotate_constant_declaration(stmt)
        : is_conditional_expression(stmt)
        ? annotate_conditional_expression(stmt)
        : is_conditional_statement(stmt)
        ? annotate_conditional_statement(stmt)
        : is_sequence(stmt)
        ? annotate_sequence(stmt)
        : is_application(stmt)
        ? annotate_application(stmt)
        : is_function_definition(stmt)
        ? annotate_function_definition(stmt)
        : is_block(stmt)
        ? annotate_block(stmt)
        : is_return_statement(stmt)
        ? annotate_return_statement(stmt)
        : error(stmt, "Unknown statement type in annotate: ");
}

function annotate_name(stmt) {
    return list_add(stmt, 2, make_new_T_type(fresh_T_var()));
}

function annotate_block(stmt) {
    const body = block_body(stmt);
    return list("block", annotate(body), make_new_T_type(fresh_T_var()));
}

function annotate_return_statement(stmt) {
    return list(
        "return_statement",
        annotate(return_statement_expression(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_function_definition(stmt) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);

    return list(
        "function_definition",
        map(annotate, parameters),
        annotate(body),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_application(stmt) {
    let annotated_operator = annotate(operator(stmt));

    // HACK: explicitly handling minus operator
    // TODO: retain minus sign line number and loc
    if (
        name_of_name(annotated_operator) === "-" &&
        length(operands(stmt)) === 1
    ) {
        annotated_operator = annotate(list("name", "-1"));
    } else {
    }

    return list(
        "application",
        annotated_operator,
        map(annotate, operands(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_conditional_expression(stmt) {
    return list(
        "conditional_expression",
        annotate(cond_pred(stmt)),
        annotate(cond_cons(stmt)),
        annotate(cond_alt(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_conditional_statement(stmt) {
    return list(
        "conditional_statement",
        annotate(cond_pred(stmt)),
        annotate(cond_cons(stmt)),
        annotate(cond_alt(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_sequence(stmt) {
    return list(
        "sequence",
        map(annotate, sequence_statements(stmt)),
        make_new_T_type(fresh_T_var())
    );
}

function annotate_constant_declaration(stmt) {
    return list(
        "constant_declaration",
        annotate(list_ref(stmt, 1)),
        annotate(list_ref(stmt, 2)),
        make_new_T_type(fresh_T_var())
    );
}

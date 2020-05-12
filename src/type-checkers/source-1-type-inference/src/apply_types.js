// apply_types.js

function apply(stmt, sfs) {
    return is_primitive_node(stmt)
        ? stmt
        : is_name(stmt)
        ? apply_name(stmt, sfs)
        : is_constant_declaration(stmt)
        ? apply_constant_declaration(stmt, sfs)
        : is_conditional_expression(stmt)
        ? apply_conditional_expression(stmt, sfs)
        : is_conditional_statement(stmt)
        ? apply_conditional_statement(stmt, sfs)
        : is_sequence(stmt)
        ? apply_sequence(stmt, sfs)
        : is_application(stmt)
        ? apply_application(stmt, sfs)
        : is_function_definition(stmt)
        ? apply_function_definition(stmt, sfs)
        : is_block(stmt)
        ? apply_block(stmt, sfs)
        : is_return_statement(stmt)
        ? apply_return_statement(stmt, sfs)
        : error(stmt, "Unknown statement type in apply: ");
}

function apply_name(stmt, sfs) {
    const t = type_of_name(stmt);
    if (is_type_var(t)) {
        return list_set(stmt, 2, sigma(t, sfs));
    } else {
        return stmt;
    }
}

function apply_block(stmt, sfs) {
    return list(
        "block",
        apply(block_body(stmt), sfs),
        sigma(list_ref(stmt, 2), sfs)
    );
}

function apply_return_statement(stmt, sfs) {
    return list(
        "return_statement",
        apply(return_statement_expression(stmt), sfs),
        sigma(list_ref(stmt, 2), sfs)
    );
}

function apply_function_definition(stmt, sfs) {
    const parameters = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);
    return list(
        "function_definition",
        map((name) => apply(name, sfs), parameters),
        apply(body, sfs),
        sigma(list_ref(stmt, 3), sfs)
    );
}

function apply_application(stmt, sfs) {
    return list(
        "application",
        apply(operator(stmt), sfs),
        map((opd) => apply(opd, sfs), operands(stmt)),
        sigma(list_ref(stmt, 3), sfs)
    );
}

function apply_conditional_expression(stmt, sfs) {
    return list(
        "conditional_expression",
        apply(cond_pred(stmt), sfs),
        apply(cond_cons(stmt), sfs),
        apply(cond_alt(stmt), sfs),
        sigma(list_ref(stmt, 4), sfs)
    );
}

function apply_conditional_statement(stmt, sfs) {
    return list(
        "conditional_statement",
        apply(cond_pred(stmt), sfs),
        apply(cond_cons(stmt), sfs),
        apply(cond_alt(stmt), sfs),
        sigma(list_ref(stmt, 4), sfs)
    );
}

function apply_sequence(stmt, sfs) {
    const applied_exprs = map(
        (stmt) => apply(stmt, sfs),
        sequence_statements(stmt)
    );

    return list(
        "sequence",
        applied_exprs,
        sigma(list_ref(stmt, 2), sfs) // the type of the entire sequence
    );
}

function apply_constant_declaration(stmt, sfs) {
    return list(
        "constant_declaration",
        apply(list_ref(stmt, 1), sfs),
        apply(list_ref(stmt, 2), sfs),
        sigma(list_ref(stmt, 3), sfs)
    );
}

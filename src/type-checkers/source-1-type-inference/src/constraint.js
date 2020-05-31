// constraint.js: constraint generation

function get_type_var(stmt) {
    return is_primitive_node(stmt) // prim
        ? type_var_of_primitive_node(stmt)
        : is_name(stmt)
        ? type_of_name(stmt)
        : is_conditional_expression(stmt) || is_conditional_statement(stmt)
        ? cond_type(stmt)
        : list_ref(stmt, length(stmt) - 1);
}

/**
 * Traverses the syntax tree, generates constraints from
 * the program and collects them in a solved form.
 * Returns the set of constrains in solved form.
 * @param {} stmt
 * @param {*} solved_form_set
 */
function collect(stmt, sfs, env) {
    return is_name(stmt)
        ? collect_name(stmt, sfs, env)
        : is_primitive_node(stmt) // prim
        ? collect_primitive(stmt, sfs)
        : is_conditional_expression(stmt)
        ? collect_conditional_expression(stmt, sfs, env)
        : is_application(stmt)
        ? collect_application(stmt, sfs, env)
        : is_function_definition(stmt)
        ? collect_function_definition(stmt, sfs, env)
        : is_sequence(stmt)
        ? collect_sequence(stmt, sfs, env)
        : is_return_statement(stmt)
        ? collect_return_statement(stmt, sfs, env)
        : is_conditional_statement(stmt)
        ? collect_conditional_statement(stmt, sfs, env)
        : is_block(stmt)
        ? collect_block(stmt, sfs, env)
        : error(stmt, "Unknown statement type in collect: ");
}

function collect_primitive(stmt, solved_form_set) {
    // primitive nodes: type var = their base types (primitive types)
    return solve(
        pair(type_var_of_primitive_node(stmt), type_of_primitive_node(stmt)),
        solved_form_set
    );
}

function collect_conditional_expression(stmt, solved_form_set, env) {
    const pred = cond_pred(stmt);
    const cons = cond_cons(stmt);
    const alt = cond_alt(stmt);

    // t0 = bool
    const s10 = solve(pair(get_type_var(pred), bool_type), solved_form_set);

    // t = t1
    const s11 = solve(pair(cond_type(stmt), get_type_var(cons)), s10);

    // t1 = t2
    const s12 = solve(pair(get_type_var(cons), get_type_var(alt)), s11);

    const s1 = collect(pred, s12, env);
    const s2 = collect(cons, s1, env);
    const s3 = collect(alt, s2, env);
    return s3;
}

function collect_application(stmt, sfs, env) {
    const opd = operands(stmt);
    const opr = operator(stmt);
    const result_type = type_of_application_result(stmt);

    const opd_types = map(get_type_var, opd);
    const intended_opr_type = make_function_type(opd_types, result_type);

    // collect operands 1 by 1
    const s0 = accumulate((op, solved) => collect(op, solved, env), sfs, opd);

    // t0 = (t1..tn) -> t
    const s10 = solve(pair(get_type_var(opr), intended_opr_type), s0);
    const s1 = collect(opr, s10, env);
    return s1;
}

function collect_block(stmt, sfs, env) {
    /** A sequence */
    const body = block_body(stmt);
    let stmt_list = null;
    if (is_sequence(body)) {
        /** List of statements */
        stmt_list = sequence_statements(body);
    } else {
        // only 1 statement
        stmt_list = list(body);
    }

    function unpack_if_return(stmt) {
        if (is_return_statement(stmt)) {
            return return_statement_expression(stmt);
        } else {
            return stmt;
        }
    }

    // extract a list of const declr
    const const_declarations_with_ret = filter(
        (s) => is_constant_declaration(unpack_if_return(s)),
        stmt_list
    );

    const const_declarations = map(
        (s) => unpack_if_return(s),
        const_declarations_with_ret
    );

    const names = map(
        (s) => constant_declaration_name(unpack_if_return(s)),
        const_declarations
    );
    const names_types = map(
        (s) => get_type_var(constant_declaration_value(unpack_if_return(s))),
        const_declarations
    );
    // gamma prime
    const Gp = extend_environment(names, names_types, env);
    const sig_10 = solve(pair(get_type_var(body), get_type_var(stmt)), sfs);
    const sig_1 = accumulate(
        (dec, solved) => solve(pair(get_type_var(dec), undefined_type), solved),
        sig_10,
        const_declarations
    );
    const sig_np1 = accumulate(
        (dec, solved) => collect(constant_declaration_value(dec), solved, Gp),
        sig_1,
        const_declarations
    );
    const poly_types = map(
        (t) => make_forall_type(sigma(t, sig_np1)),
        names_types
    );
    const Gpp = extend_environment(names, poly_types, Gp);

    // repackage sequence
    const rest_stmts = filter(
        (s) => !is_constant_declaration(unpack_if_return(s)),
        stmt_list
    );
    const filtered_seq = list("sequence", rest_stmts, get_type_var(body));

    return is_null(rest_stmts) ? sig_np1 : collect(filtered_seq, sig_np1, Gpp);
}

function collect_sequence(stmt, sfs, env) {
    const stmts = sequence_statements(stmt);
    const last_stmt = list_ref(stmts, length(stmts) - 1);

    // t3 = t2
    const s20 = solve(pair(get_type_var(stmt), get_type_var(last_stmt)), sfs);
    const res = accumulate((s, solved) => collect(s, solved, env), s20, stmts);
    return res;
}

function collect_return_statement(stmt, sfs, env) {
    const ret_exp = return_statement_expression(stmt);
    const s10 = solve(pair(get_type_var(stmt), get_type_var(ret_exp)), sfs);
    return collect(ret_exp, s10, env);
}

function collect_conditional_statement(stmt, sfs, env) {
    const cond_stmt_cons = list(
        pair(get_type_var(cond_pred(stmt)), bool_type),
        pair(get_type_var(stmt), get_type_var(cond_cons(stmt))),
        pair(get_type_var(cond_cons(stmt)), get_type_var(cond_alt(stmt)))
    );
    const s10 = accumulate(solve, sfs, cond_stmt_cons);
    const s1 = collect(cond_pred(stmt), s10, env);
    const s2 = collect(cond_cons(stmt), s1, env);
    const s3 = collect(cond_alt(stmt), s2, env);
    return s3;
}

function collect_function_definition(stmt, sfs, env) {
    const params = function_definition_parameters(stmt);
    const body = function_definition_body(stmt);

    const param_names = function_definition_parameters_names(stmt);
    const param_types = map(get_type_var, params);

    const func_env = extend_environment(param_names, param_types, env);

    const fn_type = make_function_type(param_types, get_type_var(body));

    const s0 = solve(pair(get_type_var(stmt), fn_type), sfs);
    return collect(body, s0, func_env);
}

function collect_name(stmt, sfs, env) {
    const ta = lookup_type(name_of_name(stmt), env);
    if (is_forall(ta)) {
        return solve(pair(get_type_var(stmt), replace_with_fresh(ta)), sfs);
    } else {
        return solve(pair(get_type_var(stmt), ta), sfs);
    }
}

function replace_with_fresh(forall_type) {
    let lut = null;
    function replace(fa_type) {
        if (is_function_type(fa_type)) {
            return make_function_type(
                map(replace, param_types_of_fn_type(fa_type)),
                replace(return_type_of_fn_type(fa_type))
            );
        } else if (is_base_type(fa_type)) {
            return fa_type;
        } else if (is_type_var(fa_type) || is_meta_type(fa_type)) {
            const res = set_find_key_type(lut, fa_type);
            if (is_null(res)) {
                const fresh_type =
                    head(tail(fa_type)) === "T"
                        ? make_new_T_type(fresh_T_var())
                        : make_new_A_type(fresh_A_var());
                lut = set_insert_cons(lut, pair(fa_type, fresh_type));
                return fresh_type;
            } else {
                return tail(res);
            }
        } else {
            error("fatal: unknown type in replace_with_fresh");
        }
    }
    return replace(list_ref(forall_type, 1));
}

// solve.js: constraint solving and unification

function sigma(t, sfs) {
    if (is_base_type(t)) {
        return t;
    } else if (is_function_type(t)) {
        const params = param_types_of_fn_type(t);
        const res = return_type_of_fn_type(t);
        const sig_params = map((param) => sigma(param, sfs), params);
        const sig_res = sigma(res, sfs);
        return make_function_type(sig_params, sig_res);
    } else {
        const find_res = set_find_key_type(sfs, t);
        if (is_null(find_res)) {
            return t;
        } else {
            return sigma(tail(find_res), sfs);
        }
    }
}

/**
 * Includes a constraint to $\Sigma$, the set of constraints in
 * solved form. Throw error when encounters one.
 * Returns a set.
 * @param {Pair} cons
 * @param {*} solved_form_set
 */
function solve(cons, solved_form_set) {
    const rules_list = list(
        rule_1,
        rule_2,
        rule_3,
        rule_4,
        rule_5,
        rule_6,
        rule_7,
        rule_8
    );

    function solve_rules(r_list) {
        if (is_null(r_list)) {
            error("type error: no rules matched");
        } else {
        }

        // rule_*(cons, sfs) -> (bool, sfs)
        const result = head(r_list)(cons, solved_form_set);
        // (true, sfs) : if matched, and return the sfs
        // (false, _) : not matched, go to the next rule
        return head(result) ? tail(result) : solve_rules(tail(r_list));
    }

    return solve_rules(rules_list);
}

// all function has the signature: rule_*(cons, sfs) -> (bool, sfs)
function rule_1(cons, sfs) {
    return equal_type(head(cons), tail(cons)) &&
        head(head(cons)) === "primitive"
        ? pair(true, sfs) // do nothing
        : pair(false, null);
}

function rule_2(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    return head(t) !== "type_variable" && head(ta) === "type_variable"
        ? pair(true, solve(pair(ta, t), sfs))
        : pair(false, null);
}

function rule_3(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    return is_type_var(t) && equal_type(sig_ta, t)
        ? pair(true, sfs)
        : pair(false, null);
}

function rule_4(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    if (is_type_var(t) && is_function_type(sig_ta)) {
        // continue
    } else {
        return pair(false, null);
    }

    // check if t is contained in Σ(t′)
    if (
        equal_type(return_type_of_fn_type(sig_ta), t) ||
        !is_null(
            filter(
                (param) => equal_type(param, t),
                param_types_of_fn_type(sig_ta)
            )
        )
    ) {
        error("type error: rule 4 broken");
    } else {
        return pair(false, null);
    }
}

function rule_5(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    const sig_ta = sigma(ta, sfs);

    const is_t_Ai = is_type_var(t) && head(tail(t)) === "A";

    const is_sig_ta_addable =
        equal_type(sig_ta, number_type) || equal_type(sig_ta, string_type);

    if (is_t_Ai && !is_type_var(sig_ta) && !is_sig_ta_addable) {
        error("type error: rule 5 broken");
    } else {
        return pair(false, null);
    }
}

function rule_6(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);

    const t_eq_taa = set_find_key(sfs, t);
    if (is_type_var(t) && !is_null(t_eq_taa)) {
        return pair(true, solve(pair(ta, tail(t_eq_taa)), sfs));
    } else {
        return pair(false, null);
    }
}

function rule_7(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    let sig_ta = sigma(ta, sfs);

    if (is_type_var(t) && is_null(set_find_key(sfs, t))) {
        // addable conversion
        const sig_t = sigma(t, sfs);
        if (
            is_type_var(sig_t) &&
            head(tail(sig_t)) === "A" &&
            is_type_var(sig_ta) &&
            head(tail(sig_ta)) === "T"
        ) {
            sig_ta = change_type_var_to_addable(sig_ta);
        } else {
        }

        return pair(true, set_insert(sfs, pair(t, sig_ta)));
    } else {
        return pair(false, null);
    }
}

function rule_8(cons, sfs) {
    const t = head(cons);
    const ta = tail(cons);
    if (is_function_type(t) && is_function_type(ta)) {
        const t_params = param_types_of_fn_type(t);
        const ta_params = param_types_of_fn_type(ta);
        if (length(t_params) !== length(ta_params)) {
            return pair(false, null);
        } else {
            // creating n constraints
            const fn_cons = pair(
                pair(return_type_of_fn_type(t), return_type_of_fn_type(ta)),
                zip_list(t_params, ta_params)
            );
            return pair(true, accumulate(solve, sfs, fn_cons));
        }
    } else {
        return pair(false, null);
    }
}

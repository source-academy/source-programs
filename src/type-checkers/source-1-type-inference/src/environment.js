// environments.js: type environment definition and functions

// type frames are pairs with a list of names as head
// an a list of pairs as tail (types).

function make_frame(names, types) {
    return pair(names, types);
}
function frame_names(frame) {
    return head(frame);
}
function frame_types(frame) {
    return tail(frame);
}

// The first frame in a type environment is the
// "innermost" frame. The tail operation takes
// you to the "enclosing" type environment

function first_frame(env) {
    return head(env);
}
function enclosing_environment(env) {
    return tail(env);
}
function enclose_by(frame, env) {
    return pair(frame, env);
}
function is_empty_environment(env) {
    return is_null(env);
}

// type lookup proceeds from the innermost
// frame and continues to look in enclosing
// environments until the name is found

function lookup_type(name, env) {
    function env_loop(env) {
        function scan(names, types) {
            return is_null(names)
                ? env_loop(enclosing_environment(env))
                : name === head(names)
                ? head(types)
                : scan(tail(names), tail(types));
        }
        if (is_empty_environment(env)) {
            error(name, "Unbound name: ");
        } else {
            const frame = first_frame(env);
            const type = scan(frame_names(frame), frame_types(frame));
            return type;
        }
    }
    return env_loop(env);
}

// set_type is used for type declarations to
// set the type of a given name in the first
// (innermost) frame of the given environment

function set_type(name, type, env) {
    function scan(names, types) {
        return is_null(names)
            ? error("internal error: name not found")
            : name === head(names)
            ? set_head(types, type)
            : scan(tail(names), tail(types));
    }
    const frame = first_frame(env);
    return scan(frame_names(frame), frame_types(frame));
}

// the type checking of a compound function will
// lead to the type checking of its body with respect
// to of a new type environment, in which every parameter
// (names) refers to the declared types of the function

function extend_environment(names, types, base_env) {
    if (length(names) === length(types)) {
        return enclose_by(make_frame(names, types), base_env);
    } else if (length(names) < length(types)) {
        error(
            "Too many arguments supplied: " +
                stringify(names) +
                ", " +
                stringify(types)
        );
    } else {
        error(
            "Too few arguments supplied: " +
                stringify(names) +
                ", " +
                stringify(types)
        );
    }
}

const the_empty_environment = null;

const mono_prim_ops = () =>
    list(
        list("-", list(number_type, number_type), number_type),
        list("*", list(number_type, number_type), number_type),
        list("/", list(number_type, number_type), number_type),
        list("%", list(number_type, number_type), number_type),
        list("!", list(bool_type), bool_type),
        list("!", list(bool_type), bool_type),
        list("-1", list(number_type), number_type) // handled explicitly in annotate_application
    );

const poly_prim_ops = () =>
    list(
        list("&&", list(bool_type, T_type), T_type),
        list("||", list(bool_type, T_type), T_type),
        list("+", list(A_type, A_type), A_type),
        list("===", list(A_type, A_type), bool_type),
        list("!==", list(A_type, A_type), bool_type),
        list(">", list(A_type, A_type), bool_type),
        list("<", list(A_type, A_type), bool_type),
        list(">=", list(A_type, A_type), bool_type),
        list("<=", list(A_type, A_type), bool_type)
    );

const build_in_poly_func = () =>
    list(
        list("display", list(T_type), undefined_type),
        list("error", list(T_type), undefined_type),
        list("is_boolean", list(T_type), bool_type),
        list("is_boolean", list(T_type), bool_type),
        list("is_function", list(T_type), bool_type),
        list("is_number", list(T_type), bool_type),
        list("is_string", list(T_type), bool_type),
        list("is_undefined", list(T_type), bool_type),
        list("stringify", list(T_type), string_type),
        list("math_hypot", list(T_type), undefined_type)
    );

const built_in_mono_func = () =>
    list(
        list("math_abs", list(number_type), number_type),
        list("math_acos", list(number_type), number_type),
        list("math_acosh", list(number_type), number_type),
        list("math_asin", list(number_type), number_type),
        list("math_asinh", list(number_type), number_type),
        list("math_atan", list(number_type), number_type),
        list("math_atan2", list(number_type, number_type), number_type),
        list("math_atanh", list(number_type), number_type),
        list("math_cbrt", list(number_type), number_type),
        list("math_ceil", list(number_type), number_type),
        list("math_clz32", list(number_type), number_type),
        list("math_cos", list(number_type), number_type),
        list("math_cosh", list(number_type), number_type),
        list("math_exp", list(number_type), number_type),
        list("math_expm1", list(number_type), number_type),
        list("math_floor", list(number_type), number_type),
        list("math_fround", list(number_type), number_type),
        list("math_imul", list(number_type, number_type), number_type),
        list("math_log", list(number_type), number_type),
        list("math_log1p", list(number_type), number_type),
        list("math_log2", list(number_type), number_type),
        list("math_log10", list(number_type), number_type),
        list("math_pow", list(number_type, number_type), number_type),
        list("math_random", list(null_type), number_type),
        list("math_round", list(number_type), number_type),
        list("math_sign", list(number_type), number_type),
        list("math_sin", list(number_type), number_type),
        list("math_sinh", list(number_type), number_type),
        list("math_sqrt", list(number_type), number_type),
        list("math_tan", list(number_type), number_type),
        list("math_tanh", list(number_type), number_type),
        list("math_trunc", list(number_type), number_type),
        list("parse_int", list(string_type, number_type), number_type),
        list("prompt", list(string_type), string_type),
        list("runtime", list(null_type), number_type)
    );

const built_in_const = () =>
    list(
        pair("Infinity", number_type),
        pair("math_LN2", number_type),
        pair("math_LN10", number_type),
        pair("math_LOG2E", number_type),
        pair("math_LOG10E", number_type),
        pair("math_SQRT1_2", number_type),
        pair("NaN", number_type),
        pair("undefined", undefined_type)
    );

function setup_environment() {
    const mono_func = append(mono_prim_ops(), built_in_mono_func());
    const mono_func_names = map((l) => head(l), mono_func);
    const mono_func_values = map(
        (l) => make_function_type(head(tail(l)), head(tail(tail(l)))),
        mono_func
    );

    const poly_func = append(poly_prim_ops(), build_in_poly_func());
    const poly_func_names = map((l) => head(l), poly_func);
    const poly_func_values = map(
        (l) =>
            make_forall_type(
                make_function_type(head(tail(l)), head(tail(tail(l))))
            ),
        poly_func
    );

    const built_in_const_names = map((l) => head(l), built_in_const());
    const built_in_const_values = map((l) => tail(l), built_in_const());

    return extend_environment(
        append(mono_func_names, append(poly_func_names, built_in_const_names)),
        append(
            mono_func_values,
            append(poly_func_values, built_in_const_values)
        ),
        the_empty_environment
    );
}

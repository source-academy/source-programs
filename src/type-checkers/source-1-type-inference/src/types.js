// types.js: types definition, type variables, and typed syntax tree nodes

/* Type Variables */

function init_fresh_type_var_counter() {
    let val = 0;
    function get_fresh_type_var() {
        val = val + 1;
        return val;
    }
    return get_fresh_type_var;
}

/** Gets a new type variable number upon function call. State-ful. */
const global_type_var_getter = init_fresh_type_var_counter();
let fresh_T_var = global_type_var_getter;
let fresh_A_var = global_type_var_getter;

function make_new_T_type(num) {
    return list("type_variable", "T", num);
}

function make_new_A_type(num) {
    return list("type_variable", "A", num);
}

/* meta types */
const T_type = list("meta", "T");
const A_type = list("meta", "A");

/* Primitive Types */
const bool_type = list("primitive", "bool");
const number_type = list("primitive", "number");
const undefined_type = list("primitive", "undefined");
const string_type = list("primitive", "string");
const null_type = list("primitive", "null");

/* function type */
function make_function_type(param_types, return_type) {
    return list("function", param_types, return_type);
}

function make_forall_type(body) {
    return list("for_all", body);
}

function for_all_body(t) {
    return head(tail(t));
}

function param_types_of_fn_type(fn_type) {
    return list_ref(fn_type, 1);
}

function return_type_of_fn_type(fn_type) {
    return list_ref(fn_type, 2);
}

function is_forall(t) {
    return head(t) === "for_all";
}

function is_type_var(t) {
    return head(t) === "type_variable";
}

function is_base_type(t) {
    return head(t) === "primitive";
}

function is_function_type(t) {
    return head(t) === "function";
}

function is_meta_type(t) {
    return head(t) === "meta";
}

function equal_type(t1, t2) {
    return is_null(t1) || is_null(t2)
        ? false
        : head(t1) !== head(t2)
        ? false
        : is_type_var(t1)
        ? list_ref(t1, 2) === list_ref(t2, 2) // type var are equated by the number
        : equal(t1, t2);
}

// used when a T type is encountered and it's actual type is addable
function change_type_var_to_addable(type_var) {
    if (!is_type_var(type_var)) {
        error("is not a type var", type_var);
    } else {
        return make_new_A_type(head(tail(tail(type_var))));
    }
}

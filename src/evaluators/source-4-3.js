function is_true(x) {
    return x === true;
}

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}

function name_of_name(stmt) {
    return head(tail(stmt));
}

function is_self_evaluating(stmt) {
    return is_number(stmt) ||
        is_string(stmt) ||
        is_boolean(stmt);
}

function is_constant_declaration(stmt) {
    return is_tagged_list(stmt, "constant_declaration");
}

function constant_declaration_name(stmt) {
    return head(tail(head(tail(stmt))));
}

function constant_declaration_value(stmt) {
    return head(tail(tail(stmt)));
}

function is_variable_declaration(stmt) {
    return is_tagged_list(stmt, "variable_declaration");
}

function variable_declaration_name(stmt) {
    return head(tail(head(tail(stmt))));
}

function variable_declaration_value(stmt) {
    return head(tail(tail(stmt)));
}

function is_assignment(stmt) {
    return is_tagged_list(stmt, "assignment");
}

function assignment_name(stmt) {
    return head(tail(head(tail(stmt))));
}

function assignment_value(stmt) {
    return head(tail(tail(stmt)));
}

function is_conditional_expression(stmt) {
    return is_tagged_list(stmt,
        "conditional_expression");
}

function cond_expr_pred(stmt) {
    return list_ref(stmt, 1);
}

function cond_expr_cons(stmt) {
    return list_ref(stmt, 2);
}

function cond_expr_alt(stmt) {
    return list_ref(stmt, 3);
}

function is_function_definition(stmt) {
    return is_tagged_list(stmt, "function_definition");
}

function function_definition_parameters(stmt) {
    return head(tail(stmt));
}

function function_definition_body(stmt) {
    return head(tail(tail(stmt)));
}

function is_return_statement(stmt) {
    return is_tagged_list(stmt, "return_statement");
}

function return_statement_expression(stmt) {
    return head(tail(stmt));
}

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

// ??
function sequence_actions(stmts) {
    return head(tail(stmts));
}

function local_names(stmt) {
    if (is_sequence(stmt)) {
        const stmts = sequence_statements(stmt);
        return is_empty_sequence(stmts) ?
            null :
            insert_all(
                local_names(first_statement(stmts)),
                local_names(make_sequence(
                    rest_statements(stmts))));
    } else {
        return is_constant_declaration(stmt) ?
            list(constant_declaration_name(stmt)) :
            is_variable_declaration(stmt) ?
                list(variable_declaration_name(stmt)) :
                null;
    }
}

function insert_all(xs, ys) {
    return is_null(xs) ?
        ys :
        is_null(member(head(xs), ys)) ?
            pair(head(xs), insert_all(tail(xs), ys)) :
            error(head(xs), "multiple declarations of: ");
}

function is_block(stmt) {
    return is_tagged_list(stmt, "block");
}

function make_block(stmt) {
    return list("block", stmt);
}

function block_body(stmt) {
    return head(tail(stmt));
}

function is_application(stmt) {
    return is_tagged_list(stmt, "application");
}

function operator(stmt) {
    return head(tail(stmt));
}

function operands(stmt) {
    return head(tail(tail(stmt)));
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

function make_primitive_function(impl) {
    return list("primitive", impl);
}

// ??
function make_function(impl) {
    return list("function_defination", impl);
}

function make_compound_function(parameters, body, locals, env) {
    return list("compound_function",
        parameters, body, locals, env);
}

function is_compound_function(f) {
    return is_tagged_list(f, "compound_function");
}


function function_parameters(f) {
    return list_ref(f, 1);
}

function function_body(f) {
    return list_ref(f, 2);
}

function function_locals(f) {
    return list_ref(f, 3);
}

function function_environment(f) {
    return list_ref(f, 4);
}

function is_primitive_function(fun) {
    return is_tagged_list(fun, "primitive");
}

function primitive_implementation(fun) {
    return list_ref(fun, 1);
}

function apply_primitive_function(fun, argument_list) {
    return apply_in_underlying_javascript(
        primitive_implementation(fun),
        argument_list);
}



function is_require(stmt) {
    const result = is_tagged_list(stmt, "application") &&
        is_name(operator(stmt)) &&
        name_of_name(operator(stmt)) === "require";
    return result;
}

function require_pred(stmt) {
    return first_operand(operands(stmt));
}

function analyze_require(stmt) {
    return (env, succeed, fail) => {
        const vfunc = analyze(require_pred(stmt));
        return vfunc(env, (v, fail2) => {
            if (v) {
                return succeed("some ordinary value", fail2);
            } else {
                fail2();
            }
        }, fail);
    };
}

function is_distinct(stmt) {
    return is_tagged_list(stmt, "application") &&
        is_name(operator(stmt)) &&
        name_of_name(operator(stmt)) === "distinct";
}

function distinct_list(stmt) {
    return first_operand(operands(stmt));
}

function analyze_distinct(stmt) {
    return (env, succeed, fail) => {
        const vfunc = analyze(distinct_list(stmt));

        function distinct(items) {
            return is_null(items) ?
                true :
                is_null(tail(items)) ?
                    true :
                    is_null(member(head(items), tail(items))) ?
                        distinct(tail(items)) :
                        false;
        }
        return vfunc(env, (v, fail2) => {
            if (distinct(v)) {
                return succeed(true, fail2);
            } else {
                fail2();
            }
        }, fail);
    };
}

function analyze(stmt) {
    return is_amb(stmt) ?
    analyze_amb(stmt) :
    is_require(stmt) ?
    analyze_require(stmt) :
    is_distinct(stmt) ?
    analyze_distinct(stmt) :
    is_self_evaluating(stmt) ?
    analyze_self_evaluating(stmt) :
    is_name(stmt) ?
    analyze_name(stmt) :
    is_constant_declaration(stmt) ?
    analyze_constant_declaration(stmt) :
    is_variable_declaration(stmt) ?
    analyze_variable_declaration(stmt) :
    is_assignment(stmt) ?
    analyze_assignment(stmt) :
    is_conditional_expression(stmt) ?
    analyze_conditional_expression(stmt) :
    is_function_definition(stmt) ?
    analyze_function_definition(stmt) :
    is_sequence(stmt) ?
    analyze_sequence(sequence_actions(stmt)) :
    is_block(stmt) ?
    analyze_block(stmt) :
    is_return_statement(stmt) ?
    analyze_return_statement(stmt) :
    is_application(stmt) ?
    analyze_application(stmt) :
    error(stmt, "Unknown statement type in analyze");
}

/* ENVIRONMENTS */

const no_value_yet = () => null;

// frames are pairs with a list of names as head
// an a list of pairs as tail (values). Each value
// pair has the proper value as head and a flag
// as tail, which indicates whether assignment
// is allowed for the corresponding name

function make_frame(names, values) {
    return pair(names, values);
}

function frame_names(frame) {
    return head(frame);
}

function frame_values(frame) {
    return tail(frame);
}

// The first frame in an environment is the
// "innermost" frame. The tail operation
// takes you to the "enclosing" environment

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

// set_name_value is used for let and const to give
// the initial value to the name in the first
// (innermost) frame of the given environment

function set_name_value(name, val, env) {
    function scan(names, vals) {
        return is_null(names) ?
            error("internal error: name not found") :
            name === head(names) ?
                set_head(head(vals), val) :
                scan(tail(names), tail(vals));
    }
    const frame = first_frame(env);
    return scan(frame_names(frame),
        frame_values(frame));
}

// name lookup proceeds from the innermost
// frame and continues to look in enclosing
// environments until the name is found

function lookup_name_value(name, env) {
    function env_loop(env) {
        function scan(names, vals) {
            return is_null(names) ?
                env_loop(
                    enclosing_environment(env)) :
                name === head(names) ?
                    head(head(vals)) :
                    scan(tail(names), tail(vals));
        }
        if (is_empty_environment(env)) {
            error(name, "Unbound name: ");
        } else {
            const frame = first_frame(env);
            const value = scan(frame_names(frame),
                frame_values(frame));
            if (value === no_value_yet) {
                error(name, "Name used before declaration: ");
            } else {
                return value;
            }
        }
    }
    return env_loop(env);
}

// to assign a name to a new value in a specified environment,
// we scan for the name, just as in lookup_name_value, and
// change the corresponding value when we find it,
// provided it is tagged as mutable

function assign_name_value(name, val, env) {
    function env_loop(env) {
        function scan(names, vals) {
            return is_null(names) ?
                env_loop(
                    enclosing_environment(env)) :
                name === head(names) ?
                    (tail(head(vals)) ?
                        set_head(head(vals), val) :
                        error("no assignment " +
                            "to constants allowed")) :
                    scan(tail(names), tail(vals));
        }
        if (is_empty_environment(env)) {
            error(name, "Unbound name in assignment: ");
        } else {
            const frame = first_frame(env);
            return scan(frame_names(frame),
                frame_values(frame));
        }
    }
    return env_loop(env);
}

// applying a compound function to parameters will
// lead to the creation of a new environment, with
// respect to which the body of the function needs
// to be evaluated
// (also used for blocks)

function extend_environment(names, vals, base_env) {
    if (length(names) === length(vals)) {
        return enclose_by(
            make_frame(names,
                map(x => pair(x, true), vals)),
            base_env);
    } else if (length(names) < length(vals)) {
        error("Too many arguments supplied: " +
            stringify(names) + ", " +
            stringify(vals));
    } else {
        error("Too few arguments supplied: " +
            stringify(names) + ", " +
            stringify(vals));
    }
}
/* THE GLOBAL ENVIRONMENT */

const the_empty_environment = null;

// the global environment has bindings for all
// primitive functions, including the operators

const primitive_functions = list(
    list("display", display),
    list("error", error),
    list("list", list),
    list("math_abs", math_abs),
    list("+", (x, y) => x + y),
    list("-", (x, y) => x - y),
    list("*", (x, y) => x * y),
    list("/", (x, y) => x / y),
    list("%", (x, y) => x % y),
    list("===", (x, y) => x === y),
    list("!==", (x, y) => x !== y),
    list("<", (x, y) => x < y),
    list("<=", (x, y) => x <= y),
    list(">", (x, y) => x > y),
    list(">=", (x, y) => x >= y),
    list("!", x => !x)
);

// the global environment also has bindings for all
// primitive non-function values, such as undefined and
// math_PI

const primitive_constants = list(
    list("undefined", undefined),
    list("math_PI", math_PI)
);

// setup_environment makes an environment that has
// one single frame, and adds a binding of all names
// listed as primitive_functions and primitive_values.
// The values of primitive functions are "primitive"
// objects, see line 281 how such functions are applied

function setup_environment() {
    const primitive_function_names =
        map(f => head(f), primitive_functions);
    const primitive_function_values =
        map(f => make_primitive_function(head(tail(f))),
            primitive_functions);
    const primitive_constant_names =
        map(f => head(f), primitive_constants);
    const primitive_constant_values =
        map(f => head(tail(f)),
            primitive_constants);
    return extend_environment(
        append(primitive_function_names,
            primitive_constant_names),
        append(primitive_function_values,
            primitive_constant_values),
        the_empty_environment);
}

const the_global_environment = setup_environment();

// below are amb related
function is_amb(stmt) {
    return is_tagged_list(stmt, "application") &&
        is_name(operator(stmt)) &&
        name_of_name(operator(stmt)) === "amb";
}

function amb_choices(stmt) {
    return operands(stmt);
}

function ambeval(exp, env, succeed, fail) {
    return analyze(exp)(env, succeed, fail);
}

function analyze_self_evaluating(stmt) {
    return (env, succeed, fail) => succeed(stmt, fail);
}

function analyze_name(stmt) {
    return (env, succeed, fail) =>
        succeed(lookup_name_value(name_of_name(stmt), env),
            fail);
}

function analyze_function_definition(stmt) {
    const vars =
        function_definition_parameters(stmt);
    const bfun =
        analyze(function_definition_body(stmt));
    const locals = local_names(function_definition_body(stmt));
    return (env, succeed, fail) =>
        succeed(make_compound_function(vars, bfun, locals, env),
            fail);
}

function analyze_conditional_expression(stmt) {
    const pfun = analyze(cond_expr_pred(stmt));
    const cfun = analyze(cond_expr_cons(stmt));
    const afun = analyze(cond_expr_alt(stmt));
    return (env, succeed, fail) =>
        pfun(env,
            // success continuation for evaluating the predicate
            // to obtain pred_value
            (pred_value, fail2) =>
                is_true(pred_value) ?
                    cfun(env, succeed, fail2) :
                    afun(env, succeed, fail2),
            fail);
}

function analyze_sequence(stmts) {
    function sequentially(a, b) {
        return (env, succeed, fail) =>
            a(env,
                (a_value, fail2) => b(env, succeed, fail2),
                fail);
    }

    function loop(first_fun, rest_funs) {
        return is_null(rest_funs) ?
            first_fun :
            loop(sequentially(first_fun,
                head(rest_funs)),
                tail(rest_funs));
    }
    const funs = map(analyze, stmts);
    return is_null(funs) ?
        env => undefined :
        loop(head(funs), tail(funs));
}

// ??
function analyze_block(stmts) {
    const body = block_body(stmts);
    const locals = local_names(body);
    const temp_values = map(x => no_value_yet,
        locals);
    return (env, succeed, fail) => analyze(body)(extend_environment(locals, temp_values, env), succeed, fail);
}

// ??
function analyze_return_statement(stmts) {
    const vfunc = analyze(return_statement_expression(stmts));
    return (env, succeed, fail) => vfunc(env, succeed, fail);
}

// ??
function declare_variable(name, val, env) {
    set_name_value(name, val, env);
}

// ??
function declare_constant(name, val, env) {
    set_name_value(name, val, env);
}

function analyze_variable_declaration(stmt) {
    const name = variable_declaration_name(stmt);
    const vfun = analyze(variable_declaration_value(stmt));
    return (env, succeed, fail) =>
        vfun(env,
            (val, fail2) => {
                declare_variable(name, val, env);
                succeed("ok", fail2);
            },
            fail);
}

function analyze_constant_declaration(stmt) {
    const name =
        constant_declaration_name(stmt);
    const vfun =
        analyze(constant_declaration_value(stmt));
    return (env, succeed, fail) =>
        vfun(env,
            (val, fail2) => {
                declare_constant(name, val, env);
                succeed("ok", fail2);
            },
            fail);
}

function analyze_assignment(stmt) {
    const variable = assignment_name(stmt);
    const vfun = analyze(assignment_value(stmt));
    return (env, succeed, fail) =>
        vfun(env,
            (val, fail2) => { // *1*
                const old_value = lookup_name_value(variable, env);
                set_name_value(variable, val, env);
                succeed("ok",
                    () => { // *2*
                        set_name_value(variable, old_value, env);
                        fail2();
                    });
            },
            fail);
}

function analyze_application(stmt) {
    const ffun = analyze(operator(stmt));
    const afuns = map(analyze, operands(stmt));
    return (env, succeed, fail) =>
        ffun(env,
            (fun, fail2) =>
                get_args(afuns,
                    env,
                    (args, fail3) =>
                        execute_application(fun,
                            args, succeed, fail3),
                    fail2),
            fail);
}

function get_args(afuns, env, succeed, fail) {
    return is_null(afuns) ?
        succeed(null, fail) :
        head(afuns)(env,
            // success continuation for this afun
            (arg, fail2) =>
                get_args(tail(afuns),
                    env,
                    // success continuation for
                    // recursive call to get_args
                    (args, fail3) =>
                        succeed(pair(arg, args),
                            fail3),
                    fail2),
            fail);
}

function execute_application(fun, args, succeed, fail) {
    if (is_primitive_function(fun)) {
        succeed(apply_primitive_function(fun, args), fail);
    } else if (is_compound_function(fun)) {
        const body = function_body(fun);
        const locals = function_locals(fun);
        const names = insert_all(map(name_of_name, function_parameters(fun)), locals);
        const temp_values = map(x => no_value_yet, locals);
        const values = append(args, temp_values);

        function_body(fun)(
            extend_environment(
                names,
                values,
                function_environment(fun)),
            succeed,
            fail);
    } else {
        error(fun, "unknown function type in " +
            "execute_application");
    }
}

function analyze_amb(exp) {
    const cfuns = map(analyze, amb_choices(exp));
    return (env, succeed, fail) => {
        function try_next(choices) {
            return is_null(choices) ?
                fail() :
                head(choices)(env,
                    succeed,
                    () =>
                        try_next(tail(choices)));
        }
        return try_next(cfuns);
    };
}

const input_prompt = "// Amb-Eval input:";
const output_prompt = "// Amb-Eval value:";

function announce_output(s) {
    display(s);
}

function driver_loop() {
    function internal_loop(try_again) {
        const input = prompt(input_prompt);
        if (input === "try-again") {
            try_again();
        } else {
            display("// Starting a new problem ");
            ambeval(input,
                the_global_environment,
                // ambeval success
                (val, next_alternative) => {
                    announce_output(output_prompt);
                    user_print(val);
                    return internal_loop(next_alternative);
                },
                // ambeval failure
                () => {
                    announce_output(
                        "// There are no more values of");
                    user_print(input);
                    return driver_loop();
                });
        }
    }
    return internal_loop(
        () => {
            display("// There is no current problem");
            return driver_loop();
        });
}

function user_print(object) {
    return is_compound_function(object) ?
        "function" +
        stringify(function_parameters(object)) +
        stringify(function_body(object)) +
        "<environment>" :
        object;
}

let try_again = null;

function parse_and_run(str) {
    const exprs = make_block(parse(str));
    ambeval(exprs,
        the_global_environment,
        // ambeval success
        (val, next_alternative) => {
            announce_output(output_prompt);
            display(user_print(val));
            try_again = next_alternative;
        },
        // ambeval failure
        () => {
            announce_output(
                "// There are no more values of");
            display(user_print(str));
        });
}

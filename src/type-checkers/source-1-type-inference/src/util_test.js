// util_test.js: useful functions for tests
function print_type(type) {
    function print_args(ts) {
        return is_null(ts)
            ? "null"
            : length(ts) === 1
            ? print_type(head(ts))
            : print_type(head(ts)) + " * " + print_args(tail(ts));
    }

    return is_base_type(type)
        ? head(tail(type))
        : is_function_type(type)
        ? "(" +
          print_args(param_types_of_fn_type(type)) +
          ") > " +
          print_type(return_type_of_fn_type(type))
        : is_type_var(type)
        ? head(tail(type)) + stringify(head(tail(tail(type))))
        : error("Unknown type: " + stringify(type));
}

function check_type_var(number, sfs) {
    return sigma(make_new_T_type(number), sfs);
}

function enumerate_sigma(sfs, n) {
    const m = build_list(n, (x) => x + 1);
    for_each(
        (num) =>
            display(
                stringify(num) + ": " + print_type(check_type_var(num, sfs))
            ),
        m
    );
}

// for backward compatibility
const iterate_sigma = enumerate_sigma;

/**
 * Testing complex function 2.
 * GCD Function adapted from SICP Source D example.
 */

function get_compiled() {
    // Enter code to be compiled here:
	const user_input = "							\
	function abs(x) {                               \
	    return x >= 0 ? x : 0 - x;                  \
	}                                               \
	function square(x) {                            \
	    return x * x;                               \
	}                                               \
	function average(x,y) {                         \
	    return (x + y) / 2;                         \
	}                                               \
	function sqrt(x) {                              \
	    function good_enough(guess, x) {            \
	        return abs(square(guess) - x) < 0.001;  \
	    }                                           \
	    function improve(guess, x) {                \
	        return average(guess, x / guess);       \
	    }                                           \
	    function sqrt_iter(guess, x) {              \
	        return good_enough(guess, x)            \
	                   ? guess                      \
	                   : sqrt_iter(improve(         \
	                                guess, x), x);  \
	    }                                           \
	    return sqrt_iter(1.0, x);                   \
	}                                               \
	                                                \
	sqrt(5);    									\
	";
	
    const compiled_code = parse_and_compile(user_input);
    // pretty_print_instructions(compiled_code);
    return compiled_code;
}      

function source_machine() {
    const ops = list(
        list("make_top_environment",make_top_environment_procedure),
        list("extend_environment",extend_environment_procedure),
        list("extend_environment_block",extend_environment_block_procedure),
        list("define_constant",define_constant_procedure),
        list("lookup_variable_value",lookup_variable_value_procedure),
        list("list",list_procedure),
        list("cons",cons_procedure),
        list("is_false",is_false_procedure),
        list("make_compiled_procedure",make_compiled_procedure_procedure),
        list("compiled_procedure_env",compiled_procedure_env_procedure),
        list("compiled_procedure_entry",compiled_procedure_entry_procedure),
        list("is_primitive_procedure",is_primitive_procedure_procedure),
        list("compiled_procedure_entry",compiled_procedure_entry_procedure),
        list("compiled_procedure_entry",compiled_procedure_entry_procedure),
        list("apply_primitive_procedure",apply_primitive_procedure_procedure)
    );
    const  x = statements(get_compiled());
    const machine = make_machine(all_regs(),ops,x);
    machine("stack")("initialize");
    set_register_contents(machine, "env",make_default_top_environment_procedure(list()));

	return machine;
}  

const ad = source_machine();
start(ad);
// display(start(ad));
// display(get_register_contents(ad, "val"));
get_register_contents(ad, "val");
// 2.2360688956433634

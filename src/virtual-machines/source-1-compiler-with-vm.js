// Compiler + VM

function assoc(key, records) {
	return is_null(records)
		? undefined
		: equal(key, head(head(records)))
		? head(records)
		: assoc(key, tail(records));
}

function get_contents(register) {
	return register("get");
}

function set_contents(register, value) {
	return register("set")(value);
}

function op(name) {
	return list("op", name);
}

function reg(name) {
	return list("reg", name);
}

function label(name) {
	return list("label", name);
}

function constant(value) {
	return list("constant", value);
}

function branch(label) {
	return list("branch", label);
}

// @param: Source refers to the raw expression itself.
function assign(register_name, source) {
    return list("assign", register_name, source);
}

function perform(source){
	return list("perform", source);
}
function go_to(label) {
	return list("go_to", label);
}

function test(source) {
    return list("test", source);
}

function save(name) {
	return list("save", name);
}

function restore(name) {
	return list("restore", name);
}

function all_regs(){
    return list('val', 'proc', 'argl', 'continue', 'env' );
}

function binary_function(f) { // f is binary
	return arg_list => 
		length(arg_list) === 2
		? apply_in_underlying_javascript(
				f, arg_list)
		: error(arg_list, 
				"Incorrect number of arguments passed to binary function ");
}

function unary_function(f) { // f is binary
	return arg_list => 
		length(arg_list) === 1
		? apply_in_underlying_javascript(
				f, arg_list)
		: error(arg_list, 
				"Incorrect number of arguments passed to unary function ");
}

//environment implemented as pairs. Head is the parent environment, tail is a list of children
function make_top_environment_procedure(arglist) {
    if (length(arglist) === 0){
        return pair(null, list());
    } else {
        error("Incorrect number of arguments for make_top_environment procedure");
    }
    
}

function make_default_top_environment_procedure(arglist) {
    if (length(arglist) === 0){
        return pair(null, list(
            pair("+","+"),
            pair("-","-"),
            pair("*","*"),
            pair("/","/"),
            pair("%","%"),
            pair("===","==="),
            pair("!==","!=="),
            pair(">",">"),
            pair("<","<"),
            pair(">=",">="),
            pair("<=","<="),
            pair("&&","&&"),
            pair("||","||"),
            pair("math_abs","math_abs"),
            pair("math_sin","math_sin")
        ));
    } else {
        error("Incorrect number of arguments for make_top_environment procedure");
    }
    
}

function extend_environment_procedure(arglist) {

    function bind_one_formal_to_environment(name,value,bindings) {
        return append(bindings,list(pair(name,value)));
    }

    function bind_all_formals(formals_names, formals_values, bindings) {
        if (is_null(formals_names) || is_null(formals_values) ) {
            return bindings;
        } 
        else {
            const name = head(formals_names);
            const value = head(formals_values);
            const new_bindings = bind_one_formal_to_environment(name,value,bindings);
            return bind_all_formals(tail(formals_names),tail(formals_values), new_bindings);
        }
    }

    if (length(arglist) === 3) {
        const formals = list_ref(arglist, 0);
        const param_values = list_ref(arglist, 1);
        const parent_env = list_ref(arglist, 2);
        return pair(parent_env, bind_all_formals(formals,param_values, list()));
    } else {
        error("Incorrect number of arguments for extend_environment procedure");
    }
}

function extend_environment_block_procedure(arglist){
    if (length(arglist) === 1){
        const parent_env = list_ref(arglist, 0);
        return pair(parent_env, list());
    } else {
        error("Incorrect number of arguments for extend_environment_block procedure");
    }
}

function define_constant_procedure(arglist) {
    if (length(arglist) === 3) {
        const name = list_ref(arglist, 0);
        const value = list_ref(arglist, 1);
        const env = list_ref(arglist, 2);

        const children = tail(env);
        set_tail(env,append(children,list(pair(name,value))));
    } else {
        error("Incorrect number of arguments for define_constant procedure");
    }
}

function lookup_variable_value_procedure(arglist) {

    function findChild(target, children_list) {
        return is_null(children_list)
         ? null
         : target === head(head(children_list))
         ? tail(head(children_list))
         : findChild(target, tail(children_list));
    }

    function lookup_variable_value(env,name) {
        const child = findChild(name, tail(env));
        if (is_null(child) && is_null(head(env))) {
            error(name,"cannot find name: ");
            return false;
        }
        else if (is_null(child)) {
            return lookup_variable_value(head(env),name);
        }
        else {
            return child;
        }
    }
    if (length(arglist) === 2){
        const env = list_ref(arglist, 0);
        const name = list_ref(arglist, 1);
        return lookup_variable_value(env,name);
        
    } else {
        error("Incorrect number of arguments for lookup_variable_value procedure");
    }
}

function list_procedure(arglist) {
    if (length(arglist) === 1) {
        const intial = list_ref(arglist, 0);
        return pair(intial,null);
    } else {
        error("Incorrect number of arguments for list procedure");
    }
}

function cons_procedure(arglist) {
    if (length(arglist) === 2) {
        const to_be_inserted = list_ref(arglist, 0);
        const previous_list = list_ref(arglist, 1);
        return pair(to_be_inserted,previous_list);
    } else {
        error("Incorrect number of arguments for cons procedure");
    }
}

function is_false_procedure(arglist) {
    if (length(arglist) === 1) {
        const to_be_tested = list_ref(arglist, 0);
        return to_be_tested === false;
    } else {
        error("Incorrect number of arguments for is_false procedure");
    }
}

function make_compiled_procedure_procedure(arglist) {
    if (length(arglist) === 2) {
        const label = list_ref(arglist, 0);
        const env = list_ref(arglist, 1);
        return pair(label,env);
    } else {
        error("Incorrect number of arguments for make_compiled_procedure procedure");
    }
}

function compiled_procedure_env_procedure(arglist) {
    if (length(arglist) === 1) {
        const closure = list_ref(arglist, 0);
        return tail(closure);
    } else {
        error("Incorrect number of arguments for make_compiled_procedure procedure");
    }
}

function compiled_procedure_entry_procedure(arglist) {
    if (length(arglist) === 1) {
        const closure = list_ref(arglist, 0);
        return head(closure);
    } else {
        error("Incorrect number of arguments for compiled_procedure_entry procedure");
    }
}

function is_primitive_procedure_procedure(arglist) {
    if (length(arglist) === 1) {
        const closure = list_ref(arglist, 0);
        return is_string(closure);
    } else {
        error("Incorrect number of arguments for is_primitive_procedure procedure");
    }
}

function apply_primitive_procedure_procedure(arglist) {
    if (length(arglist) === 2) {
        const symbol = list_ref(arglist, 0);
        const args = list_ref(arglist, 1);
        if (length(args) === 2 ){
            return symbol === "+"
            ? apply_in_underlying_javascript((a,b) => a+b, args)
            : symbol === "-"
            ? apply_in_underlying_javascript((a,b) => a-b, args)
            : symbol === "*"
            ? apply_in_underlying_javascript((a,b) => a*b, args)
            : symbol === "/"
            ? apply_in_underlying_javascript((a,b) => a/b, args)
            : symbol === "%"
            ? apply_in_underlying_javascript((a,b) => a%b, args)
            : symbol === "==="
            ? apply_in_underlying_javascript((a,b) => a===b, args)
            : symbol === "!=="
            ? apply_in_underlying_javascript((a,b) => a!==b, args)
            : symbol === ">"
            ? apply_in_underlying_javascript((a,b) => a>b, args)
            : symbol === "<"
            ? apply_in_underlying_javascript((a,b) => a<b, args)
            : symbol === ">="
            ? apply_in_underlying_javascript((a,b) => a>=b, args)
            : symbol === "<="
            ? apply_in_underlying_javascript((a,b) => a<=b, args)
            : symbol === "&&"
            ? apply_in_underlying_javascript((a,b) => a&&b, args)
            : symbol === "||"
            ? apply_in_underlying_javascript((a,b) => a||b, args)
            : error(symbol,"unkown symbol:");
        } else {
            return symbol === "-"
            ? apply_in_underlying_javascript(a => -a, args)
            : symbol === "!"
            ? apply_in_underlying_javascript(a => !a, args)
            : symbol === "math_abs"
            ? apply_in_underlying_javascript((a) => math_abs(a), args)
            : symbol === "math_sin"
            ? apply_in_underlying_javascript((a) => math_sin(a), args)
            : error(symbol,"unkown symbol:");
        }
    } else {
        error("Incorrect number of arguments for is_primitive_procedure procedure");
    }
}

function make_machine(register_names, ops, controller_text) {
	const machine = make_new_machine();

	map(reg_name => machine("allocate_register")(reg_name), register_names);
	machine("install_operations")(ops);
	machine("install_instruction_sequence")(assemble(controller_text, machine));

	return machine;
}

function make_register(name) {
	let contents = "*unassigned*";

	function dispatch(message) {
		if (message === "get") {
			return contents;

		} else {
			if (message === "set") {
				return value => { contents = value; };

			} else {
				error(message, "Unknown request: REGISTER");
			}
		}
	}

	return dispatch;
}

function make_stack() {
	let stack = null;

	function push(x) { 
		stack = pair(x, stack); 
		return "done";
	}

	function pop() {
		if (is_null(stack)) {
			error("Empty stack: POP");

		} else {
			const top = head(stack);
			stack = tail(stack);
			return top;
		}
	}

	function initialize() {
		stack = null;
		return "done";
	}

	function dispatch(message) {
		return message === "push"
			? push
			: message === "pop"
			? pop()
			: message === "initialize"
			? initialize()
			: error("Unknown request: STACK", message);
	}

	return dispatch;
}

function pop(stack) {
	return stack("pop");
}

function push(stack, value) {
	return stack("push")(value);
}

function make_new_machine() {
	const pc = make_register("pc");
	const flag = make_register("flag");
	const stack = make_stack();
	let the_instruction_sequence = null;
	let the_ops = list(list("initialize_stack", () => stack("initialize")));
	let register_table = list(list("pc", pc), list("flag", flag));

	function allocate_register(name) {
		if (assoc(name, register_table) === undefined) {
			register_table = pair(list(name, make_register(name)), register_table);

		} else {
			error(name, "Multiply defined register: ");
		}

		return "register_allocated";
	}

	function lookup_register(name) {
		const val = assoc(name, register_table);

		return val === undefined
			? error(name, "Unknown register:")
			: head(tail(val));
	}

	function execute() {
        const insts = get_contents(pc);
        // display(insts);

		if (is_null(insts)) {
			return "done";

		} else {
			const proc = instruction_execution_proc(head(insts)); 
			proc(); 
			return execute();
		}
	}

	function dispatch(message) {
		return message === "start"
			? () => { set_contents(pc, the_instruction_sequence); return execute(); }
		: message === "install_instruction_sequence"
			? seq => { the_instruction_sequence = seq; }
		: message === "allocate_register"
			? allocate_register
			: message === "get_register"
			? lookup_register
			: message === "install_operations"
			? ops => { the_ops = append(the_ops, ops); }
		: message === "stack"
			? stack
			: message === "operations"
			? the_ops
			: error(message, "Unknown request: MACHINE");
	}

	return dispatch;
}

function start(machine) {
	return machine("start")();
}

function get_register_contents(machine, register_name) {
	return get_contents(get_register(machine, register_name));
}

function set_register_contents(machine, register_name, value) {
	set_contents(get_register(machine, register_name), value);
	return "done";
}

function get_register(machine, reg_name) {
	return machine("get_register")(reg_name);
}

function assemble(controller_text, machine) {
	function receive(insts, labels) {
		update_insts(insts, labels, machine);
		return insts;
	}

	return extract_labels(controller_text, receive);
}

function extract_labels(text, receive) {
	function helper(insts, labels) { /// FIXME: rename to something useful
		const next_inst = head(text);

		return is_string(next_inst)
			? receive(insts, pair(make_label_entry(next_inst, insts), labels))
			: receive(pair(make_instruction(next_inst), insts), labels);
	}

	return text === undefined || is_null(text)
		? receive(null, null)
		: extract_labels(tail(text), helper);
}

function update_insts(insts, labels, machine) {
	const pc = get_register(machine, "pc");
	const flag = get_register(machine, "flag");
	const stack = machine("stack");
	const ops = machine("operations");

	const set_iep = set_instruction_execution_proc;
	const make_ep = make_execution_procedure;
	return map(i => set_iep(i,
				make_ep(instruction_text(i),
					labels,
					machine,
					pc,
					flag,
					stack,
					ops)),
			insts);
}

function make_instruction(text) {
	return pair(text, null);
}

function instruction_text(inst) {
	return head(inst);
}

function instruction_execution_proc(inst) {
	return tail(inst);
}

function set_instruction_execution_proc(inst, proc) {
	set_tail(inst, proc); 
}

function make_label_entry(label_name, insts) {
	return pair(label_name, insts);
}

function lookup_label(labels, label_name) {
	const val = assoc(label_name, labels);

	return val === undefined
		? error(label_name, "Undefined label: ASSEMBLE")
		: tail(val);
}

function make_execution_procedure(inst, labels, machine, pc, flag, stack, ops) {
	const x = head(inst);

	return x === "assign"
		? make_assign(inst, machine, labels, ops, pc)
		: x === "test"
		? make_test(inst, machine, labels, ops, flag, pc)
		: x === "branch"
		? make_branch(inst, machine, labels, flag, pc)
		: x === "go_to"
		? make_goto(inst, machine, labels, pc)
		: x === "save"
		? make_save(inst, machine, stack, pc)
		: x === "restore"
		? make_restore(inst, machine, stack, pc)
		: x === "perform"
		? make_perform(inst, machine, labels, ops, pc)
		: error(inst, "Unknown instruction type: ASSEMBLE");
}

function make_assign(inst, machine, labels, operations, pc) {
	const target = get_register(machine, assign_reg_name(inst));
	const value_exp = assign_value_exp(inst);
	const value_proc = is_operation_exp(value_exp)
		? make_operation_exp(value_exp, machine, labels, operations)
		: make_primitive_exp(head(value_exp), machine, labels);

	function perform_make_assign() {
		set_contents(target, value_proc());
		advance_pc(pc); 
	}

	return perform_make_assign;
}

function assign_reg_name(assign_instruction) {
	return head(tail(assign_instruction));
}

function assign_value_exp(assign_instruction) { 
	return head(tail(tail(assign_instruction)));
}

function advance_pc(pc) {
	set_contents(pc, tail(get_contents(pc))); 
}

function make_test(inst, machine, labels, operations, flag, pc) {
	const condition = test_condition(inst);

	if (is_operation_exp(condition)) {
		const condition_proc = make_operation_exp(condition, machine, labels, operations);

		function perform_make_test() {
			set_contents(flag, condition_proc());
			advance_pc(pc); 
		}

		return perform_make_test; 
	} else {
		error(inst, "Bad TEST instruction: ASSEMBLE");
	}
}

function test_condition(test_instruction) {
	return head(tail(test_instruction));
}

function make_branch(inst, machine, labels, flag, pc) {
	const dest = branch_dest(inst);

	if (is_label_exp(dest)) {
		const insts = lookup_label(labels, label_exp_label(dest));

		function perform_make_branch() {
			if (get_contents(flag)) {
				set_contents(pc, insts);

			} else {
				advance_pc(pc);
			}
		}

		return perform_make_branch;

	} else {
		error(inst, "Bad BRANCH instruction: ASSEMBLE");
	}
}

function branch_dest(branch_instruction) {
	return head(tail(branch_instruction));
}

function make_goto(inst, machine, labels, pc) {
	const dest = goto_dest(inst);

	if (is_label_exp(dest)) {
		const insts = lookup_label(labels, label_exp_label(dest));
		return () => set_contents(pc, insts);

	} else if (is_register_exp(dest)) {
		const reg = get_register(machine, register_exp_reg(dest));
		return () => set_contents(pc, get_contents(reg));

	} else {
		error(inst, "Bad GOTO instruction: ASSEMBLE");
	}
}

function goto_dest(goto_instruction) {
	return head(tail(goto_instruction));
}

function make_save(inst, machine, stack, pc) {
	const reg = get_register(machine, stack_inst_reg_name(inst));

	function perform_make_save() {
		push(stack, get_contents(reg));
		advance_pc(pc);
	}

	return perform_make_save;
}

function make_restore(inst, machine, stack, pc) {
	const reg = get_register(machine, stack_inst_reg_name(inst));

	function perform_make_restore() {
		set_contents(reg, pop(stack));
		advance_pc(pc); 
	}

	return perform_make_restore;
}

function stack_inst_reg_name(stack_instruction) {
	return head(tail(stack_instruction));
}

function make_perform(inst, machine, labels, operations, pc) {
	const action = perform_action(inst);

	if (is_operation_exp(action)) {
		const action_proc = make_operation_exp(action, machine, labels, operations);
		return () => { action_proc(); advance_pc(pc); };

	} else {
		error(inst, "Bad PERFORM instruction: ASSEMBLE");
	}
}

function perform_action(inst) {
	return head(tail(inst)); 
}

function make_primitive_exp(exp, machine, labels) {
	if (is_constant_exp(exp)) {
		const c = constant_exp_value(exp);
		return () => c;

	} else if (is_label_exp(exp)) {
		const insts = lookup_label(labels, label_exp_label(exp));
		return () => insts;

	} else if (is_register_exp(exp)) {
		const r = get_register(machine, register_exp_reg(exp));
		return () => get_contents(r); 

	} else {
		error(exp, "Unknown expression type: ASSEMBLE");
	}
}

function is_register_exp(exp) {
	return is_tagged_list(exp, "reg");
}

function register_exp_reg(exp) {
	return head(tail(exp));
}

function is_constant_exp(exp) {
	return is_tagged_list(exp, "constant");
}

function constant_exp_value(exp) {
	return head(tail(exp));
}

function is_label_exp(exp) {
	return is_tagged_list(exp, "label");
}

function label_exp_label(exp) {
	return head(tail(exp));
}

function make_operation_exp(exp, machine, labels, operations) {
	const op = lookup_prim(operation_exp_op(exp), operations);
	const aprocs = map(e => make_primitive_exp(e, machine, labels), operation_exp_operands(exp));

	function perform_make_operation_exp() {
		return op(map(p => p(), aprocs));
	}

	return perform_make_operation_exp;
}

function is_operation_exp(exp) {
	return is_pair(exp) && is_tagged_list(head(exp), "op");
}

function operation_exp_op(operation_exp) {
	return head(tail(head(operation_exp)));
}

function operation_exp_operands(operation_exp) {
	return tail(operation_exp);
}

function lookup_prim(symbol, operations) {
	const val = assoc(symbol, operations);

	return val === undefined
		? error(symbol, "Unknown operation: ASSEMBLE")
		: head(tail(val));
}

// ***********************************************************
// ******************** SOURCE 1 COMPILER ********************
// ***********************************************************

// SYNTAX OF SOURCE §1 

// Functions from SICP JS Section 4.1.2
// with slight modifications

function is_tagged_list(expr, the_tag) {
	return is_pair(expr) && head(expr) === the_tag;
}

// names are tagged with "name".

function is_name(stmt) {
	return is_tagged_list(stmt, "name");
}

function is_variable(stmt) {
	return is_tagged_list(stmt, "name");
}

function name_of_name(stmt) {
	return head(tail(stmt));
}

function is_self_evaluating(stmt) {
	return is_number(stmt) || is_boolean(stmt) || is_undefined(stmt);
}

function is_undefined_expression(stmt) {     
	return is_name(stmt) && name_of_name(stmt) === "undefined";
}

// constant declarations are tagged with "constant_declaration"
// and have "name" and "value" properties

function is_constant_declaration(stmt) {
	return is_tagged_list(stmt, "constant_declaration");
}
function constant_declaration_name(stmt) {
	return head(tail(head(tail(stmt))));
}
function constant_declaration_value(stmt) {
	return head(tail(tail(stmt)));
}

// variable declarations are tagged with "variable_declaration"
// and have "name" and "value" properties

function is_variable_declaration(stmt) {
	return is_tagged_list(stmt, "variable_declaration");
}
function variable_declaration_name(stmt) {
	return head(tail(head(tail(stmt))));
}
function variable_declaration_value(stmt) {
	return head(tail(tail(stmt)));
}

// applications are tagged with "application"
// and have "operator" and "operands"

function is_application(expr) {
	return is_tagged_list(expr, "application");
}
// we distinguish primitive applications by their
// operator name

function is_primitive_application(expr) {
	return is_tagged_list(expr, "application") &&
		! is_null(member(primitive_operator_name(expr), 
					list("!", "+", "-", "*", "/", "===", 
						"!==", "<", ">", "<=", ">=")));
}
function primitive_operator_name(expr) {
	return head(tail(head(tail(expr))));
}
function operator(expr) {
	return head(tail(expr));
}
function operands(expr) {
	return head(tail(tail(expr)));
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

// boolean operations are tagged
// with "boolean_operation"

function is_boolean_operation(expr) {
	return is_tagged_list(expr, "boolean_operation");
}
function boolean_operator_name(expr) {
	return head(tail(head(tail(expr))));
}

// conditional expressions are tagged
// with "conditional_expression"

function is_conditional_expression(expr) {
	return is_tagged_list(expr, "conditional_expression")  || is_tagged_list(expr, "conditional_statement") ;
}
function cond_expr_pred(expr) {
	return list_ref(expr, 1);
}
function cond_expr_cons(expr) {
	return list_ref(expr, 2);
}
function cond_expr_alt(expr) {
	return list_ref(expr, 3);
}
function make_conditional_expression(expr1, expr2, expr3) {
	return list("conditional_expression",
			expr1, expr2, expr3);
}

function to_string(expr) {
	return (is_number(expr) || is_boolean(expr))
		? stringify(expr)
		: length(operands(expr)) === 1
		? "(" + operator(expr) + 
		to_string(list_ref(operands(expr), 0)) + ")"
		: "(" + to_string(list_ref(operands(expr), 0)) + 
		operator(expr) +  
		to_string(list_ref(operands(expr), 1)) + ")";
}

// function definitions are tagged with "function_definition"
// have a list of "parameters" and a "body" statement

function is_function_definition(stmt) {
	return is_tagged_list(stmt, "function_definition");
}
function function_definition_parameters(stmt) {
	return head(tail(stmt));
}
function function_definition_body(stmt) {
	return head(tail(tail(stmt)));
}
//blocks
function is_block(stmt) {
	return is_tagged_list(stmt, "block");
}
function block_body(stmt) {   
	return head(tail(stmt));
}

// sequences of statements are just represented
// by tagged lists of statements by the parser.

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

// functions return the value that results from
// evaluating their expression

function is_return_statement(stmt) {
	return is_tagged_list(stmt, "return_statement");
}
function return_statement_expression(stmt) {
	return head(tail(stmt));
}


// assignments
// evaluating their expression

function is_assignment(stmt) {
	return is_tagged_list(stmt, "assignment");
}

function assignment_variable(stmt) {
	return name_of_name(head(tail(stmt)));
}
function assignment_expression(stmt) {
	return head(tail(tail(stmt)));
}

// ++++++++++++++++++++++++++++++++++++

// An instruction sequence as a list of its three parts.
// list(assign(target, op("lookup_variable_value"), constant(exp), reg('env')))));
function make_instruction_sequence(needs, modifies, statements) {
	return list(needs, modifies, statements);
}

function empty_instruction_sequence() {
	return make_instruction_sequence(list(), list(), list());
}

function label_sequence(label) {
	return make_instruction_sequence(list(), list(), list(label));
}

function compile_linkage(linkage) {
    return linkage === "return"
        ? make_instruction_sequence(list('continue'), list(), list(go_to(reg('continue'))))
        : linkage === "next"
        ? empty_instruction_sequence()
        : make_instruction_sequence(list(), list(), list(go_to(label(linkage)))); // <- go_to(linkage)
}

function end_with_linkage(linkage, instruction_sequence) {
    return preserving(list('continue'), instruction_sequence, compile_linkage(linkage));
}

// ++++++++++++++++++++++++++++++++++++
// Combining instruction sequences
// ++++++++++++++++++++++++++++++++++++


//some helper functions//
function is_symbol(s) {
	return is_string(s);
}

//list_union 
function list_union(l1,l2){
	return is_null(l1)
		? l2
		: is_null(member(head(l1),l2))
		? pair(head(l1), list_union(tail(l1),l2))
		: list_union(tail(l1),l2);
}

//gives a list of elements present in l1 but not present in l2
function list_difference(l1,l2){
	return is_null(l1)
		? l1
		: is_null(member(head(l1),l2))
		? pair(head(l1),list_difference(tail(l1),l2))
		: list_difference(tail(l1),l2);
}

//s --> is an instruction sequence
function registers_needed(s) {
	return is_symbol(s)? null: head(s);
}

//s --> is an instruction sequence
function registers_modified(s) {
	return is_symbol(s)? null: head(tail(s));
}

//s --> is an instruction sequence
function statements(s) {
	return is_symbol(s)? null: head(tail(tail(s)));
}

//checks if sequence s needs register r to be initialised
function needs_register(s,r){
	return !is_null(member(r,registers_needed(s)));
}

//checks if sequence s modifies register r
function modifies_register(s,r){
	return !is_null(member(r,registers_modified(s)));
}

function append_instruction_sequence(list_of_sequences){

	function append_2_sequences(s1, s2){
		const regs_required = list_union(registers_needed(s1),
				list_difference(registers_needed(s2),registers_modified(s1)));
		const regs_modified = list_union(registers_modified(s1),registers_modified(s2));
		const appended_statements = append(statements(s1), statements(s2));
		return make_instruction_sequence(
				regs_required,
				regs_modified,
				appended_statements
				);
	}

	function append_seq_list(seqs){
		return is_null(seqs)
			? empty_instruction_sequence()
			: append_2_sequences(
					head(seqs),
					append_seq_list(tail(seqs)));
	}

	return append_seq_list(list_of_sequences);
}

function preserving(regs, s1, s2) {
	if (is_null(regs)){
		return append_instruction_sequence(list(s1,s2));
	}
	else {
		const  first_reg = head(regs);
		if (needs_register(s2, first_reg)  &&  modifies_register(s1, first_reg)) {
			const augmented_s1 = make_instruction_sequence(
					list_union(
						list(first_reg),
						registers_needed(s1)
						),
					list_difference(
						registers_modified(s1),
						list(first_reg)
						),
					append(
						list(save(first_reg)),
						append(
							statements(s1),
							list(restore(first_reg))
							)
						)
					);
			return preserving(tail(regs),augmented_s1,s2);
		}
		else {
			return preserving(tail(regs), s1, s2);
		}
	}
}

function tack_on_instruction_sequence(seq, body_seq){
	return make_instruction_sequence(
			registers_needed(seq),
			registers_modified(seq),
			append(statements(seq), statements(body_seq))
			);
}

function parallel_instruction_sequences(s1,s2){
	return make_instruction_sequence(
			list_union(
				registers_needed(s1),
				registers_needed(s2)
				),
			list_union(
				registers_modified(s1),
				registers_modified(s2)
				),
			append(
				statements(s1),
				statements(s2)
				)
			);
}


const machine_code = [];

// insert_pointer keeps track of the next free place
// in machine_code
let INSERT_POINTER = 0;

function parse_and_compile(string) {

    //label generation
    let label_counter = 0;
    
    function new_label_number() {
        label_counter = label_counter+1;
        return label_counter;
    }

    function make_label(name) {
        return name + stringify(new_label_number());
    }



    
    // Removed the additional target for end_with_linkage param
    function compile_self_evaluating(exp, target, linkage) {
        return end_with_linkage(
            linkage,
            make_instruction_sequence(
                list(),
                list(target),
                list(assign(target, list(constant(exp))))));
    }
    
    // Compiling strings // IGNORED FOR NOW
    function compile_quoted(exp, target, linkage) {
        return end_with_linkage(
            linkage,
            make_instruction_sequence(
                list(),
                list(target),
                list(assign(target, list(constant(stringify(exp)))))));
    }
    
    // Compiling variables
    function compile_variable(exp, target, linkage) {
        const operation = list(op("lookup_variable_value"), reg('env'), constant(name_of_name(exp)));
        return end_with_linkage(
            linkage,
            make_instruction_sequence(
                list('env'),
                list(target),
                list(assign(target, operation))));
    }


    function compile_assignment( exp, target, linkage ){
        const variable = assignment_variable(exp);
        const get_value_code =  compile(assignment_expression(exp), 'val','next');

        const assignment_operation = perform( list(op("set_variable_value"), constant(variable), reg('val'), reg('env')) );
        const return_value = assign(target, list(constant("ok"))); //just put ok in the target register to signify sucess
        
        return end_with_linkage(
            linkage,
            preserving(
                list('env'),
                get_value_code,
                make_instruction_sequence(
                    list('env','val'),
                    list(target),
                    list(assignment_operation , return_value)
                )
            )
        );

    }


    function compile_constant_definition( exp, target, linkage ){
        const variable = constant_declaration_name(exp);
        const get_value_code =  compile(constant_declaration_value(exp), 'val','next');

        const assignment_operation = perform( list(op("define_constant"), constant(variable), reg('val'), reg('env')) );
        const return_value = assign(target, list(constant("ok"))); //just put ok in the target register to signify sucess
        
        return end_with_linkage(
            linkage,
            preserving(
                list('env'),
                get_value_code,
                make_instruction_sequence(
                    list('env','val'),
                    list(target),
                    list(assignment_operation , return_value)
                )
            )
        );
    }

    function compile_variable_definition( exp, target, linkage ){
        const variable = variable_declaration_name(exp);
        const get_value_code =  compile(variable_declaration_value(exp), 'val','next');

        const assignment_operation = perform( list(op("define_variable"), constant(variable), reg('val'), reg('env')) );
        const return_value = assign(target, list(constant("ok"))); //just put ok in the target register to signify sucess
        
        return end_with_linkage(
            linkage,
            preserving(
                list('env'),
                get_value_code,
                make_instruction_sequence(
                    list('env','val'),
                    list(target),
                    list(assignment_operation , return_value)
                )
            )
        );
    }

    function compile_if(exp, target, linkage){
        let t_branch = make_label("true_branch");
        let f_branch = make_label("false_branch");
        let after_if = make_label("after_if");
        let consequent_linkage = linkage === 'next' ? after_if : linkage;

        let p_code = compile(cond_expr_pred(exp), 'val','next');
        let c_code = compile(cond_expr_cons(exp), target, consequent_linkage);
        let a_code = compile(cond_expr_alt(exp), target, linkage);
        

        const after_predicate_check = make_instruction_sequence(list('val'), list(), list( 
            test( list(op("is_false"), reg('val'))),
            branch(label(f_branch))
            ));

        const CandABranches =  parallel_instruction_sequences( append_instruction_sequence(list(label_sequence(t_branch), c_code)), append_instruction_sequence(list(label_sequence(f_branch), a_code)) );

        const afterPredicateComplete = append_instruction_sequence(
            list(
                after_predicate_check,
                CandABranches,
                label_sequence(after_if)
            )
        );

        return preserving(
            list('env', 'continue'),
            p_code,
            afterPredicateComplete
        );

    }




    function compile_function_expression(exp, target, linkage) {
        let proc_entry = make_label("entry");
        let after_fexp = make_label("after_lambda");
        let lambda_linkage  = linkage === "next" ?  after_fexp : linkage;

        const function_definitiion = end_with_linkage(
            lambda_linkage,
            make_instruction_sequence(
                list('env'),
                list(target),
                list(assign(target, list(op("make_compiled_procedure"), label(proc_entry), reg('env'))))
            )
        );
        const function_body = compile_lambda_body( exp , proc_entry);
        return append_instruction_sequence(
            list(
                tack_on_instruction_sequence(function_definitiion,function_body),
                label_sequence(after_fexp)
            )
        );
    }

    function compile_lambda_body(exp, proc_entry){
        let formals = function_definition_parameters(exp);
        formals = map(x => name_of_name(x), formals);
        const setup = make_instruction_sequence(
            list('env', 'proc', 'argl'),
            list('env'),
            list(
                proc_entry,
                assign('env', list( op("compiled_procedure_env"), reg('proc') )),
                assign('env', list( op("extend_environment"), constant(formals) ,reg('argl'), reg('env')))
            )
        );
        const compiled_function_body = compile(function_definition_body(exp), 'val', 'return');
        return append_instruction_sequence(list(setup, compiled_function_body));
    }

    function compile_sequences(seq, target, linkage) {
        return is_last_statement (seq)
            ? compile(first_statement(seq),target, linkage)
            : preserving(
                list('env', 'continue'),
                compile(first_statement(seq), target, 'next'),
                compile_sequences(rest_statements(seq),target, linkage)
            );
    }
    function compile_application(exp,target,linkage){
        const proc_code = compile(operator(exp),'proc',"next");
        const operand_codes = map(operand=> compile(operand, 'val',"next"),operands(exp));

        const procedure_call_code = compile_procedure_call(target, linkage);
        const arglist_code = construct_arglist(operand_codes);
        return preserving(
            list('env','continue'),
            proc_code,
            preserving(
                list('proc','continue'),
                arglist_code,
                procedure_call_code
            )
        );
    }

    function construct_arglist(operand_codes_unreversed){
        const operand_codes = reverse(operand_codes_unreversed);
        if (is_null(operand_codes)){
            return make_instruction_sequence(
                null,
                list('argl'),
                list(assign('argl', list(constant("null"))))
            );
        } else {
            const code_to_get_last_arg = append_instruction_sequence(
                list(
                    head(operand_codes),
                    make_instruction_sequence(
                        list('val'),
                        list('argl'),
                        list(assign('argl',list(
                            op("list"),
                            reg('val')
                        )))
                    )
                )
            );
            return is_null(tail(operand_codes))
                ? code_to_get_last_arg
                : preserving(
                    list('env'),
                    code_to_get_last_arg,
                    code_to_get_rest_args(tail(operand_codes))
                );
        }
    }

    function code_to_get_rest_args(operand_codes) {
        const code_for_next_arg = preserving(
            list('argl'),
            head(operand_codes),
            make_instruction_sequence(
                list('val','argl'),
                list('argl'),
                list(assign('argl', list(op("cons"), reg('val'), reg('argl'))))
            )
        );
        return is_null(tail(operand_codes))
                ? code_for_next_arg
                : preserving(
                    list('env'),
                    code_for_next_arg,
                    code_to_get_rest_args(tail(operand_codes))
                );
    }
    function compile_block(exp,target,linkage){
        const env_ext = make_instruction_sequence(
            list("env"),
            list("env"),
            list(assign('env',list(op('extend_environment_block'),reg('env'))))
        );
        const compiled_block_body =compile(block_body(exp),target,linkage);
        return append_instruction_sequence(
            list(
                env_ext,
                compiled_block_body
            )
        );
    }
    function compile_procedure_call(target,linkage){
        const primitive_branch = make_label("primitive-branch");
        const compiled_branch = make_label("compiled_branch");
        const after_call = make_label("after_call");

        const compiled_linkage = linkage === "next" ? after_call :linkage;

        const primitive_Test_and_Jump = make_instruction_sequence(
            list('proc'),
            list(),
            list(
                test(list(op("is_primitive_procedure"), reg('proc'))),
                branch(label(primitive_branch))
            )
        );

        const compiled_proc_branch = append_instruction_sequence(
            list(
                label_sequence(compiled_branch),
                compile_proc_appl(target, compiled_linkage)
            )
        );

        const compiled_primitive_branch = append_instruction_sequence(
            list(
                label_sequence(primitive_branch),
                end_with_linkage(
                    linkage,
                    append_instruction_sequence(
                        list(
                            make_instruction_sequence(
                                list('proc','argl'),
                                list(target),
                                list(
                                    assign(
                                        target,
                                        list(
                                            op("apply_primitive_procedure"),
                                            reg('proc'),
                                            reg('argl')
                                        )
                                    )
                                )
                            ),
                            label_sequence(after_call)
                        )
                    )
                )
            )
        );
        
        return append_instruction_sequence(
            list(
                primitive_Test_and_Jump,
                parallel_instruction_sequences(
                    compiled_proc_branch,
                    compiled_primitive_branch
                )
            )
        );
    }

    function compile_proc_appl(target,linkage){
        if (target ===  'val' && linkage !== "return") {
            return make_instruction_sequence(
                list('proc'),
                all_regs(),
                list(
                    assign('continue', list(label(linkage))),
                    assign('val', list(op("compiled_procedure_entry"),reg('proc'))),
                    go_to(reg('val'))
                )
            );
        } else if (target !== 'val' && linkage !== "return") {
            const proc_return = make_label("proc_return");
            return make_instruction_sequence(
                list('proc'),
                all_regs(),
                list(
                    assign('continue', list(label(proc_return))),
                    assign('val', list(op("compiled_procedure_entry"),reg('proc'))),
                    go_to(reg('val')),
                    proc_return,
                    assign(target, list(reg('val'))),
                    go_to(label(linkage))
                )
            );
        } else if (target === 'val' && linkage === "return" ) {
            return make_instruction_sequence(
                list('proc','continue'),
                all_regs(),
                list(
                    assign('val', list(op("compiled_procedure_entry"), reg('proc'))),
                    go_to(reg('val'))
                )
            );
        } else if (target !== 'val' && linkage === "return" ){
            error(target, "return linkage, target not val - - COMPILE");
        } else {
            error("unknown error - - COMPILE");
        }
    }
    // compile: see relation ->> in CS4215 notes 3.5.2
    function compile(exp, target, linkage) {
        return is_self_evaluating(exp)
            ? compile_self_evaluating(exp, target, linkage)
            : is_variable(exp)
            ? compile_variable(exp, target, linkage)
            : is_assignment(exp)
            ? compile_assignment(exp, target, linkage)
            : is_variable_declaration(exp)
            ? compile_variable_definition(exp, target, linkage)
            : is_constant_declaration(exp)
            ? compile_constant_definition(exp, target, linkage)
            : is_conditional_expression(exp) 
            ? compile_if(exp, target, linkage)
            : is_function_definition(exp)
            ? compile_function_expression(exp, target, linkage)
            : is_return_statement(exp)
            ? compile(return_statement_expression(exp), target, linkage)
            : is_sequence(exp)
            ? compile_sequences(sequence_statements(exp), target, linkage)
            : is_application(exp)
            ? compile_application(exp, target, linkage)
            : is_block(exp)
            ? compile_block(exp, target, linkage)
            : is_boolean_operation(exp)
            ? compile_application(exp, target, linkage)
            : error(exp, "Unknown expression type - - COMPILE");
    }
    
    
    
    // Linkage cannot be 1. Must be "return" or "next".
    return compile(parse(string), 'val', "next");
    //machine_code[next] = DONE; // Once you break out of the recursive function.
    //return machine_code;
}



// ++++++++++++++++++++++++++++++++++++
// DISPLAY
// ++++++++++++++++++++++++++++++++++++
function single_statement_to_string(s,counter){
    function print_assign(inst){
        const target = head(tail(inst));
        const source = head(tail(tail(inst)));
        if ( is_operation_exp(source)){
            return "assign('" + target + "', " + print_op(source) + ")";
        } else {
            return "assign('" + target + "', " + print_pair(head(source)) + ")";
        }
    }
    function print_perform(inst){
        const source = head(tail(inst));
        return "perform(" + print_op(source) +")" ;
    }
    function print_test(inst){
        const source = head(tail(inst));
        return "test(" + print_op(source) +")" ;
    }
    function print_branch(inst){
        const target = head(tail(inst));
        return "branch("+ print_pair(target) + ")";
    }
    function print_goto(inst){
        const target = head(tail(inst));
        return "go_to("+ print_pair(target) + ")";
    }
    function print_save(inst){
        const source = head(tail(inst));
        return "save('"+ source + "')";
    }
    function print_restore(inst){
        const target = head(tail(inst));
        return "restore('"+ target + "')";
    }
    

    function print_op(op_list){
        const op = operation_exp_op(op_list);
        const operands = operation_exp_operands(op_list);
        let val = "list(op('" + op + "')";
        map(x => {val = val+ ", " + print_pair(x);}, operands);
        val = val + ")";
        return val;
    }
    function print_list_of_names(l){
        const first_name = head(l);
        if (is_null(tail(l))){
            return " [ "+first_name+" ]";
        } else {
            let val = " [" + first_name;
            map(x => {val = val + ", " + x;}, tail(l));
            val = val + "]";
            return val;
        }
    }
    function print_pair(p){
        return is_register_exp(p)
            ? print_reg(p)
            : is_constant_exp(p)
            ? print_const(p)
            : is_label_exp(p)
            ? print_label(p)
            : print_error(p);
    }
    function print_reg(reg){
        return "reg('" + register_exp_reg(reg) + "')";
    }
    function print_const(c){
        if (is_tagged_list(constant_exp_value(c),"name")){
            return "constant(name: " + name_of_name(constant_exp_value(c)) + ")";
        }
        else if (is_null(constant_exp_value(c))){
            return "constant(null)";
        }
        else if(is_list(constant_exp_value(c))){
            return "constant(" + print_list_of_names(constant_exp_value(c)) + ")";
        }
        else if (is_string(constant_exp_value(c))){
            return "constant('" + constant_exp_value(c) + "')";
        } else {
            return "constant(" + stringify(constant_exp_value(c)) + ")";
        }

    }
    function print_label(l){
            return "label('" + label_exp_label(l) + "')";
    }
    function print_error(p){
        display(p);
        return "ERROR";
    }
    if (is_string(s)) {
        //display("LABEL: "  + s);
        return "LABEL: "  + s;
    } else {
        const statement_type  = head(s);
        const val = statement_type === "assign"
            ? print_assign(s)
            :  statement_type === "perform"
            ? print_perform(s)
            :  statement_type === "test"
            ? print_test(s)
            :  statement_type === "branch"
            ? print_branch(s)
            :  statement_type === "go_to"
            ? print_goto(s)
            :  statement_type === "save"
            ? print_save(s)
            :  statement_type === "restore"
            ? print_restore(s)
            : print_error(s);
        //display(stringify(counter) + "   : "  + val);
        return pair(stringify(counter) + "   : "  + val,counter+1);
    }
}

function print_instructions_string(instruction_sequence,counter){
    if (is_null(instruction_sequence)){
        //display("===END===");
        return "===END===";
    } else {
        // const increment = single_statement_to_string(head(instruction_sequence),counter);
        // return print_instructions_string(tail(instruction_sequence),counter+increment);
        const printed_statement = single_statement_to_string(head(instruction_sequence),counter);
        return is_pair(printed_statement)
            ? head(printed_statement) + "\n" + print_instructions_string(tail(instruction_sequence),tail(printed_statement))
            : printed_statement + "\n" + print_instructions_string(tail(instruction_sequence),counter);
    }
}
function print_list_regs(l){
    if (is_null(l)) {
        let val = "[ " + "\'NIL\'" + " ]";
        return val;
    } else {
    
        const first_name = head(l);
        if (is_null(tail(l))){
            return "[ '"+first_name+"' ]";
        } else {
            let val = "[" + first_name;
            map(x => {val = val + ", '" + x+ "'";}, tail(l));
            val = val + "]";
            return val;
        }
    }
}

function pretty_print_instructions(instruction_sequence){
    display("==Registers Needed==============");
    display(print_list_regs(registers_needed(instruction_sequence)));
    display("==Registers modified============");
    display(print_list_regs(registers_modified(instruction_sequence)));
    display("==instruction statments=========");

    const a = print_instructions_string(statements(instruction_sequence),0);
    display("",a);
    //display(head(statements(instruction_sequence)));
    //return printstatements(statements(instruction_sequence));

}

// Only modify user_input in get_compiled()

/*
function get_compiled() {
    // Enter code to be compiled here:
    const user_input = "123;";
    
    const compiled_code = parse_and_compile(user_input);
    pretty_print_instructions(compiled_code);
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
display(start(ad));
display(get_register_contents(ad, "val"));
*/

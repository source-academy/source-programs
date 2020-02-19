function assoc(key, records) {
    return is_null(records)
           ? undefined
           : equal(key, head(head(records)))
             ? head(records)
             : assoc(key, tail(records));
}

function is_tagged_list(exp, tag) {
    return is_pair(exp)
        ? equal(head(exp), tag)
        : false;
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

function assign(register_name, source) {
    const a = append(list("assign", register_name), source);
    return a;
}

function go_to(label) {
    return list("go_to", label);
}

function test(op, lhs, rhs) {
    return list("test", op, lhs, rhs);
}

function binary_function(f) { // f is binary
    return arg_list => 
        length(arg_list) === 2
        ? apply_in_underlying_javascript(
             f, arg_list)
        : error(arg_list, 
             "Incorrect number of arguments passed to binary function ");
}

function gcd_machine() {
    return make_machine(list("a", "b", "t"),
                        list(list("rem", binary_function((a, b) => a % b)),
                             list("=", binary_function((a, b) => a === b))),
                        list("test-b",
                             test(op("="), reg("b"), constant(0)),
                             branch(label("gcd-done")),
                             assign("t", list(op("rem"), reg("a"), reg("b"))),
                             assign("a", list(reg("b"))),
                             assign("b", list(reg("t"))),
                             go_to(label("test-b")),
                             "gcd-done"));
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
    return tail(tail(assign_instruction));
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
    return tail(test_instruction);
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
    return tail(inst); 
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

const m = gcd_machine();

display(set_register_contents(m, "a", 206));
display(set_register_contents(m, "b", 40));
display(start(m));
display(get_register_contents(m, "a"));

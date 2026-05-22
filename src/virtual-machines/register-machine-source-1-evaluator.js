// TYPED POINTERS

const NUMBER_TYPE = "number";
const BOOL_TYPE = "bool";
const STRING_TYPE = "string";
const PTR_TYPE = "ptr";
const PROG_TYPE = "prog";
const NULL_TYPE = "null";
const UNDEFINED_TYPE = "undefined";
const NO_VALUE_YET_TYPE = "no_value_yet";
const BROKEN_HEART_TYPE = "broken_heart";

function make_ptr_ptr(idx) {
    return pair(PTR_TYPE, idx);
}

function make_null_ptr() {
    return pair(NULL_TYPE, null);
}

function make_no_value_yet_ptr() {
    return pair(NO_VALUE_YET_TYPE, null);
}

function make_prog_ptr(idx) {
    return pair(PROG_TYPE, idx);
}

function make_broken_heart_ptr(idx) {
    return pair(BROKEN_HEART_TYPE, idx);
}

function get_elem_type(elem) {
    return is_number(elem) ? NUMBER_TYPE :
        is_boolean(elem) ? BOOL_TYPE :
        is_string(elem) ? STRING_TYPE :
        is_null(elem) ? NULL_TYPE :
        is_undefined(elem) ? UNDEFINED_TYPE :
        error(elem, "Invalid typed elem");
}

function wrap_ptr(elem) {
    return pair(get_elem_type(elem), elem);
}

function unwrap_ptr(ptr) {
    return tail(ptr);
}

function is_ptr(ptr) {
    return is_pair(ptr) &&
        !is_pair(head(ptr)) &&
        !is_pair(tail(ptr)) &&
        (head(ptr) === NUMBER_TYPE ||
        head(ptr) === BOOL_TYPE ||
        head(ptr) === STRING_TYPE ||
        head(ptr) === PTR_TYPE ||
        head(ptr) === NULL_TYPE ||
        head(ptr) === UNDEFINED_TYPE ||
        head(ptr) === PROG_TYPE ||
        head(ptr) === NO_VALUE_YET_TYPE ||
        head(ptr) === BROKEN_HEART_TYPE);
}

function is_number_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === NUMBER_TYPE;
}

function is_bool_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === BOOL_TYPE;
}

function is_string_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === STRING_TYPE;
}

function is_ptr_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === PTR_TYPE;
}

function is_null_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === NULL_TYPE;
}

function is_undefined_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === UNDEFINED_TYPE;
}

function is_prog_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === PROG_TYPE;
}

function is_no_value_yet_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === NO_VALUE_YET_TYPE;
}

function is_broken_heart_ptr(ptr) {
    return is_ptr(ptr) && head(ptr) === BROKEN_HEART_TYPE;
}

// Primitive functions and constants

const primitive_function_names_arities = list(
       pair("display", 1),
       pair("error", 1),
       pair("+", 2),
       pair("-", 2),
       pair("*", 2),
       pair("/", 2),
       pair("%", 2),
       pair("===", 2),
       pair("!==", 2),
       pair("<", 2),
       pair("<=", 2),
       pair(">", 2),
       pair(">=", 2),
       pair("!", 1),
       pair("||", 2),
       pair("&&", 2)
);

const primitive_constants = list(
       list("undefined", undefined),
       list("math_PI"  , math_PI)
      );
       
function make_primitive_function(impl) {
    return list("primitive", impl);
}

function setup_environment() {
    const primitive_function_names =
        map(head, primitive_function_names_arities);
    const primitive_function_values =
        map(name => pair(make_primitive_function(name), false),
            primitive_function_names);
    const primitive_constant_names =
        map(head, primitive_constants);
    const primitive_constant_values =
        map(f => pair(head(tail(f)), false),
            primitive_constants);
    return pair(pair(
               append(primitive_function_names, 
                      primitive_constant_names),
               append(primitive_function_values, 
                      primitive_constant_values)),
               null);
}

// CONTROLLER WRITING ABSTRACTIONS

const CONTROLLER_SEQ_HEADER = "controller_seq";

function make_controller_seq(seq) {
  return pair(CONTROLLER_SEQ_HEADER, seq);
}

function is_controller_seq(seq) {
    return is_pair(seq) && head(seq) === CONTROLLER_SEQ_HEADER;
}

const controller_seq_seq = tail;

function make_is_tagged_list_seq(exp, tag_text, label_text) {
    const before_label = "before_test_" + tag_text + "_to_" + label_text;
    const seq = list(
        assign("a", exp),
        assign("b", constant(tag_text)),
        save("continue"),
        assign("continue", label(before_label)),
        go_to(label("is_tagged_list")),
        before_label,
        restore("continue"),
        test(list(op("==="), reg("res"), constant(true))),
        branch(label(label_text))
    );
    return make_controller_seq(seq);
}

function flatten_controller_seqs(controller_list) {
    if (is_null(controller_list)) {
        return null;
    } else {
        const seq = head(controller_list);
        return is_controller_seq(seq)
            ? append(controller_seq_seq(seq), flatten_controller_seqs(tail(controller_list)))
            : pair(seq, flatten_controller_seqs(tail(controller_list)));
    }
}

// HELPERS
function is_equal(a, b) {
    return (is_pair(a) && is_pair(b) &&
            is_equal(head(a), head(b)) && is_equal(tail(a), tail(b)))
           || 
           a === b;
}
        
function assoc(key, records) {
    return is_null(records)
           ? undefined
           : is_equal(key, head(head(records)))
             ? head(records)
             : assoc(key, tail(records));
}

function is_tagged_list(exp, tag) {
    return is_pair(exp) && head(exp) === tag;
}

function flatten_list_to_vectors(the_heads, the_tails, lst, make_ptr_fn, starting_index) {
    let free = starting_index;
    function helper(lst) {
        if (!is_pair(lst)) {
            return wrap_ptr(lst);
        } else {
            const index = free;
            free = free + 1;
            const elem = head(lst);
            the_heads[index] = helper(elem);
            the_tails[index] = helper(tail(lst));
            return make_ptr_fn(index);
        }
    }
    helper(lst);
    return free;
}

function is_sequence(stmt) {
    return is_tagged_list(stmt, "sequence");
}
function make_sequence(stmts) {
    return list("sequence", stmts);
}

function vectors_to_list(the_heads, the_tails, ptr, seen) {
    const index = unwrap_ptr(ptr);
    if (!is_ptr_ptr(ptr) || !is_null(member(index, seen))) {
        return ptr;
    } else {
        const new_seen = pair(index, seen);
        return pair(
            vectors_to_list(the_heads, the_tails, the_heads[index], new_seen),
            vectors_to_list(the_heads, the_tails, the_tails[index], new_seen));
    }
}

// MACHINE
function get_contents(register) {
    return register("get");
}

function set_contents(register, value) {
    return register("set")(value);
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
            : message === "stack"
            ? stack
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

function make_new_machine() {
    const SIZE = make_register("SIZE");
    const pc = make_register("pc");
    const flag = make_register("flag");
    const stack = make_stack();
    const stack_reassign_proc = make_register("stack_reassign_proc ");
    const free = make_register("free");
    const root = make_register("root");
    const root_populate_proc = make_register("root_populate_proc");
    const root_restore_proc = make_register("root_restore_proc");
    const gc_registers = list(
        list("free", free),
        list("scan", make_register("scan")),
        list("old", make_register("old")),
        list("new", make_register("new")),
        list("relocate_continue", make_register("relocate_continue")),
        list("temp", make_register("temp")),
        list("oldhr", make_register("oldhr"))
    );
    const exp = make_register("exp");
    const env = make_register("env");
    const evaluator_registers = list(
        list("exp", exp),
        list("env", env),
        list("val", make_register("val")),
        list("continue", make_register("continue")),
        list("proc", make_register("proc")),
        list("argl", make_register("argl")),
        list("unev", make_register("unev")),
        list("fun", make_register("fun"))
    );
    const aux_registers = list(
        list("res", make_register("val")),
        list("err", make_register("err")),
        list("a", make_register("a")),
        list("b", make_register("b")),
        list("c", make_register("c")),
        list("d", make_register("d")),
        list("e", make_register("e")),
        list("f", make_register("f"))
    );
    const the_heads = make_register("the_heads");
    const the_tails = make_register("the_tails");
    set_contents(the_heads, make_vector());
    set_contents(the_tails, make_vector());
    const new_heads = make_register("new_heads");
    const new_tails = make_register("new_tails");
    set_contents(new_heads, make_vector());
    set_contents(new_tails, make_vector());
    const prog_heads = make_register("prog_heads");
    const prog_tails = make_register("prog_tails");
    let the_instruction_sequence = null;
    let the_ops = list(list("initialize_stack", () => stack("initialize")));
    the_ops = append(the_ops, vector_ops);
    let register_table = list(list("SIZE", SIZE), list("pc", pc), list("flag", flag),
                              list("root", root), list("root_populate_proc", root_populate_proc),
                              list("root_restore_proc", root_restore_proc), list("stack_reassign_proc", stack_reassign_proc),
                              list("the_heads", the_heads), list("the_tails", the_tails),
                              list("new_heads", new_heads), list("new_tails", new_tails),
                              list("prog_heads", prog_heads), list("prog_tails", prog_tails));
    register_table = append(register_table, gc_registers);
    register_table = append(register_table, evaluator_registers);
    register_table = append(register_table, aux_registers);

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
                ? () => { const root_registers = append(aux_registers, evaluator_registers);
                          set_contents(pc, the_instruction_sequence);
                          set_contents(free,
                            make_ptr_ptr(flatten_list_to_vectors(the_heads("get"), the_tails("get"),
                                setup_environment(), make_ptr_ptr, length(root_registers))));
                          set_contents(env, make_ptr_ptr(length(root_registers)));
                          function root_populate_proc_fn() {
                              const root_ptr = free("get");
                              root("set")(root_ptr);
                              let register_list = root_registers;
                              while (!is_null(register_list)) {
                                  const content = head(tail(head(register_list)))("get");
                                  const index = unwrap_ptr(free("get"));
                                  the_heads("get")[index] = content === "*unassigned*"
                                        ? make_null_ptr() : content;
                                  free("set")(make_ptr_ptr(index + 1));
                                  the_tails("get")[index] = free("get");
                                  register_list = tail(register_list);
                              }
                              the_tails("get")[unwrap_ptr(free("get")) - 1] = make_null_ptr();
                          }
                          function root_restore_proc_fn() {
                              let root_ptr = root("get");
                              let register_list = root_registers;
                              while (!is_null(register_list)) {
                                  const index = unwrap_ptr(root_ptr);
                                  const value = the_heads("get")[index];
                                  head(tail(head(register_list)))("set")(value);
                                  root_ptr = the_tails("get")[index];
                                  register_list = tail(register_list);
                              }
                          }
                          function stack_reassign_proc_fn() {
                              let local_stack = stack("stack");
                              while (!is_null(local_stack)) {
                                  const value = head(local_stack);
                                  if (is_ptr_ptr(value)) {
                                      const index = unwrap_ptr(value);
                                      const new_ptr = the_tails("get")[index];
                                      set_head(local_stack, new_ptr);
                                  } else {}
                                  local_stack = tail(local_stack);
                              }
                          }
                          set_contents(root_populate_proc, root_populate_proc_fn);
                          set_contents(root_restore_proc, root_restore_proc_fn);
                          set_contents(stack_reassign_proc, stack_reassign_proc_fn);
                          return execute();                          }
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
            : message === "install_parsetree"
                ? tree => {
                    if (!is_list(tree)) {
                        set_contents(exp, wrap_ptr(tree));
                    } else {
                        tree = !is_sequence(tree) ? make_sequence(list(tree)) : tree;
                        const heads = make_vector();
                        const tails = make_vector();
                        flatten_list_to_vectors(heads, tails, tree, make_prog_ptr, 0);
                        prog_heads("set")(heads);
                        prog_tails("set")(tails);
                        set_contents(exp, make_prog_ptr(0));
                    }
                }
            : error(message, "Unknown request: MACHINE");
    }
    return dispatch;
}

function make_machine(register_names, ops, controller_text) {
    const machine = make_new_machine();

    map(reg_name => machine("allocate_register")(reg_name), register_names);
    machine("install_operations")(ops);
    machine("install_instruction_sequence")(assemble(controller_text, machine));

    return machine;
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

// ASSEMBLER

function assemble(controller_text, machine) {
    function receive(insts, labels) {
        update_insts(insts, labels, machine);
        return insts;
    }
    
    return extract_labels(controller_text, receive);
}

function extract_labels(text, receive) {
    function helper(insts, labels) { 
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
    const make_ep = make_execution_function;
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

function make_execution_function(inst, labels, machine, pc, flag, stack, ops) {
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
    const value_fun = is_operation_exp(value_exp)
          ? make_operation_exp(value_exp, machine, labels, operations)
          : make_primitive_exp(value_exp, machine, labels);

    function perform_make_assign() {
        set_contents(target, value_fun());
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

function assign(reg_name, value_exp) {
    return list("assign", reg_name, value_exp);
}

function advance_pc(pc) {
    set_contents(pc, tail(get_contents(pc))); 
    
}

function make_test(inst, machine, labels, operations, flag, pc) {
    const condition = test_condition(inst);

    if (is_operation_exp(condition)) {
        const condition_fun = make_operation_exp(condition, machine, labels, operations);

        function perform_make_test() {
            set_contents(flag, unwrap_ptr(condition_fun()));
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

function test(condition) {
    return list("test", condition);
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

function branch(dest) {
    return list("branch", dest);
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

function go_to(dest) {
    return list("go_to", dest);
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

function save(register_name) {
    return list("save", register_name);
}

function restore(register_name) {
    return list("restore", register_name);
}

function make_perform(inst, machine, labels, operations, pc) {
    const action = perform_action(inst);

    if (is_operation_exp(action)) {
        const action_fun = make_operation_exp(action, machine, labels, operations);
        return () => { action_fun(); advance_pc(pc); };

    } else {
        error(inst, "Bad PERFORM instruction: ASSEMBLE");
    }
}

function perform_action(inst) {
    return head(tail(inst)); 
}

function perform(op) {
    return list("perform", op);
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

function reg(name) {
    return list("reg", name);
}

function is_constant_exp(exp) {
    return is_tagged_list(exp, "constant");
}

function constant_exp_value(exp) {
    return head(tail(exp));
}

function constant(value) {
    return list("constant", wrap_ptr(value));
}

function is_label_exp(exp) {
    return is_tagged_list(exp, "label");
}

function label_exp_label(exp) {
    return head(tail(exp));
}

function label(string) {
    return list("label", string);
}

function make_operation_exp(exp, machine, labels, operations) {
    const op = lookup_prim(operation_exp_op(exp), operations);
    const aprocs = map(e => make_primitive_exp(e, machine, labels),
                       operation_exp_operands(exp));

    function perform_make_operation_exp() {
        return op(map(p => p(), aprocs));
    }
    
    return perform_make_operation_exp;
}

function is_operation_exp(exp) {
    return is_tagged_list(head(exp), "op");
}

function operation_exp_op(operation_exp) {
    return head(tail(head(operation_exp)));
}

function operation_exp_operands(operation_exp) {
    return tail(operation_exp);
}

function op(name) {
    return list("op", name);
}

function lookup_prim(symbol, operations) {
    const val = assoc(symbol, operations);

    return val === undefined
        ? error(symbol, "Unknown operation: ASSEMBLE")
        : head(tail(val));
}

// PAIR OPERATIONS

// head in "a", tail in "b"
const pair_controller = list(
    "pair",
    save("continue"),
    assign("continue", label("pair_after_gc")),
    test(list(op("==="), reg("free"), reg("SIZE"))),
    branch(label("begin_garbage_collection")),
    "pair_after_gc",
    restore("continue"),
    perform(list(op("vector_set"), reg("the_heads"), reg("free"), reg("a"))),
    perform(list(op("vector_set"), reg("the_tails"), reg("free"), reg("b"))),
    assign("res", reg("free")),
    assign("free", list(op("inc_ptr"), reg("free"))),
    go_to(reg("continue"))
);

// number of elements in "a"
const list_controller = list(
    "list",
    assign("c", reg("a")),
    assign("res", list(op("make_null_ptr"))),
    assign("b", list(op("make_null_ptr"))),
    "list_loop",
    test(list(op("==="), reg("c"), constant(0))),
    branch(label("list_return")),
    restore("a"),
    save("continue"),
    assign("continue", label("list_after_pair")),
    go_to(label("pair")),
    "list_after_pair",
    restore("continue"),
    assign("b", reg("res")),
    assign("c", list(op("-"), reg("c"), constant(1))),
    go_to(label("list_loop")),    
    "list_return",
    go_to(reg("continue"))
);

// list in "a"
const is_tagged_list_controller = list(
    "is_tagged_list",
    test(list(op("is_ptr_ptr"), reg("a"))),
    branch(label("is_tagged_list_ptr_ptr")),
    test(list(op("is_prog_ptr"), reg("a"))),
    branch(label("is_tagged_list_prog_ptr")),
    assign("res", constant(false)),
    go_to(reg("continue")),
    "is_tagged_list_ptr_ptr",
    assign("a", list(op("vector_ref"), reg("the_heads"), reg("a"))),
    assign("res", list(op("==="), reg("a"), reg("b"))),
    go_to(reg("continue")),
    "is_tagged_list_prog_ptr",
    assign("a", list(op("vector_ref"), reg("prog_heads"), reg("a"))),
    assign("res", list(op("==="), reg("a"), reg("b"))),
    go_to(reg("continue"))
);

// list to be reversed in "a"
const reverse_list = list(
    "reverse_list",
    save("continue"),
    assign("c", reg("a")),
    assign("b", list(op("make_null_ptr"))),
    "reverse_list_loop",
    test(list(op("is_null_ptr"), reg("c"))),
    branch(label("reverse_list_return")),
    assign("a", list(op("vector_ref"), reg("the_heads"), reg("c"))),
    assign("continue", label("reverse_list_after_pair")),
    go_to(label("pair")),
    "reverse_list_after_pair",
    assign("b", reg("res")),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("c"))),
    go_to(label("reverse_list_loop")),
    "reverse_list_return",
    restore("continue"),
    go_to(reg("continue"))
);

// 5.4 code

const eval_dispatch = flatten_controller_seqs(list(
    "eval_dispatch",
    test(list(op("is_number_ptr"), reg("exp"))),
    branch(label("ev_self_eval")),
    test(list(op("is_bool_ptr"), reg("exp"))),
    branch(label("ev_self_eval")),
    test(list(op("is_string_ptr"), reg("exp"))),
    branch(label("ev_self_eval")),
    make_is_tagged_list_seq(reg("exp"), "name", "ev_name"),
    make_is_tagged_list_seq(reg("exp"), "constant_declaration", "ev_definition"),
    make_is_tagged_list_seq(reg("exp"), "variable_declaration", "ev_definition"),
    make_is_tagged_list_seq(reg("exp"), "assignment", "ev_assignment"),
    make_is_tagged_list_seq(reg("exp"), "conditional_expression", "ev_if"),
    make_is_tagged_list_seq(reg("exp"), "function_definition", "ev_lambda"),
    make_is_tagged_list_seq(reg("exp"), "sequence", "ev_sequence_from_dispatch"),
    make_is_tagged_list_seq(reg("exp"), "application", "ev_application"),
    make_is_tagged_list_seq(reg("exp"), "boolean_operation", "ev_application"),
    make_is_tagged_list_seq(reg("exp"), "return_statement", "ev_return"),
    assign("res", reg("exp")),
    assign("err", constant("unknown_expression_type")),
    go_to(label("error"))
));

const eval_return = list(
    "ev_return",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    go_to(label("eval_dispatch"))
);

const eval_self = list(
    "ev_self_eval",
    assign("val", reg("exp")),
    go_to(reg("continue"))
);

const eval_name = list(
    "ev_name",
    assign("a", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("a", list(op("vector_ref"), reg("prog_heads"), reg("a"))),
    save("continue"),
    assign("continue", label("ev_name_after_lookup")),
    go_to(label("lookup_name_value")),
    "ev_name_after_lookup",
    restore("continue"),
    assign("val", reg("res")),
    go_to(reg("continue"))
);

const eval_if = list(
    "ev_if",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))), // remove tag
    save("exp"), // save expression for later
    save("env"),
    save("continue"),
    assign("continue", label("ev_if_decide")),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    go_to(label("eval_dispatch")), // evaluate the predicate
    "ev_if_decide",
    restore("continue"),
    restore("env"),
    restore("exp"),
    test(list(op("==="), reg("val"), constant(true))),
    branch(label("ev_if_consequent")),
    "ev_if_alternative",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    go_to(label("eval_dispatch")),
    "ev_if_consequent",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    go_to(label("eval_dispatch"))
);

const eval_lambda = list(
    "ev_lambda",
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    go_to(label("make_compound_function"))
);

// Evaluating function applications
const eval_application = list(
    "ev_application",
    save("continue"),
    save("env"),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    save("unev"),
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    assign("continue", label("ev_appl_did_operator")),
    go_to(label("eval_dispatch"))
);

const eval_appl_operator = list(
    "ev_appl_did_operator",
    restore("unev"),                  // the operands
    restore("env"),
    assign("argl", list(op("make_null_ptr"))),
    assign("fun", reg("val")),       // the operator
    test(list(op("is_null_ptr"), reg("unev"))),
    branch(label("apply_dispatch")),
    save("fun")
);

const eval_operand_loop = list(
    "ev_appl_operand_loop",
    save("argl"),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    assign("a", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    test(list(op("is_null_ptr"), reg("a"))),
    branch(label("ev_appl_last_arg")),
    save("env"),
    save("unev"),
    assign("continue", label("ev_appl_accumulate_arg")),
    go_to(label("eval_dispatch"))
);

const eval_appl_accumulate_arg = list(
    "ev_appl_accumulate_arg",
    restore("unev"),
    restore("env"),
    restore("argl"),
    assign("a", reg("val")),
    assign("b", reg("argl")), // argl is reversed!
    assign("continue", label("accumulate_arg_after_pair")),
    go_to(label("pair")),
    "accumulate_arg_after_pair",
    assign("argl", reg("res")),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    go_to(label("ev_appl_operand_loop"))
);


const eval_appl_last_arg = list(
    "ev_appl_last_arg",
    assign("continue", label("ev_appl_accum_last_arg")),
    go_to(label("eval_dispatch"))
);

// Function application
const eval_appl_accum_last_arg = list(
    "ev_appl_accum_last_arg",
    restore("argl"),
    assign("a", reg("val")),
    assign("b", reg("argl")),
    assign("continue", label("accumulate_last_arg_after_pair")),
    go_to(label("pair")),
    "accumulate_last_arg_after_pair",
    assign("a", reg("res")),
    assign("continue", label("accumulate_last_arg_after_reverse_list")),
    go_to(label("reverse_list")),
    "accumulate_last_arg_after_reverse_list",
    assign("argl", reg("res")),
    restore("fun"),
    go_to(label("apply_dispatch"))
);

const apply_dispatch = flatten_controller_seqs(list(
    "apply_dispatch",
    make_is_tagged_list_seq(reg("fun"), "primitive", "primitive_apply"),
    make_is_tagged_list_seq(reg("fun"), "compound_function", "compound_apply"),
    assign("res", reg("fun")),
    assign("err", constant("Unknown procedure type:")),
    go_to(label("error"))
));

function make_primitive_function_branch(name, arity) {
    const after_label = "primitive_apply_after_" + name;
    const op_list = arity === 1 ? list(op(name), reg("b")) :
        arity === 2 ? list(op(name), reg("b"), reg("c")) :
        list(op(name));
    const seq = list(
        test(list(op("!=="), reg("a"), constant(name))),
        branch(label(after_label)),
        assign("val", op_list),
        go_to(label("primitive_apply_after_apply")),
        after_label
    );
    return make_controller_seq(seq);
}

const primitive_function_branches = make_controller_seq(
    flatten_controller_seqs(
        map(
            p => make_primitive_function_branch(head(p), tail(p)),
            primitive_function_names_arities
        )
    )
);

const primitive_apply = flatten_controller_seqs(list(
    "primitive_apply",
    assign("a", list(op("vector_ref"), reg("the_tails"), reg("fun"))),
    assign("a", list(op("vector_ref"), reg("the_heads"), reg("a"))),
    test(list(op("is_null_ptr"), reg("argl"))),
    branch(label("primitive_apply_after_args")),
    assign("b", list(op("vector_ref"), reg("the_heads"), reg("argl"))),
    assign("argl", list(op("vector_ref"), reg("the_tails"), reg("argl"))),
    test(list(op("is_null_ptr"), reg("argl"))),
    branch(label("primitive_apply_after_args")),
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("argl"))),
    "primitive_apply_after_args",
    primitive_function_branches,
    "primitive_apply_after_apply",
    restore("continue"),
    go_to(reg("continue")))
);

const compound_apply = flatten_controller_seqs(list(
    "compound_apply",
    assign("fun", list(op("vector_ref"), reg("the_tails"), reg("fun"))),
    assign("unev", list(op("vector_ref"), reg("the_heads"), reg("fun"))),
    assign("fun", list(op("vector_ref"), reg("the_tails"), reg("fun"))),
    assign("env", list(op("vector_ref"), reg("the_tails"), reg("fun"))),
    assign("env", list(op("vector_ref"), reg("the_heads"), reg("env"))),
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("fun"))),
    make_is_tagged_list_seq(reg("c"), "return_statement", "compound_apply_before_extend_environment"),
    make_is_tagged_list_seq(reg("c"), "sequence", "compound_apply_before_local_names"),
    assign("val", constant(undefined)),
    restore("continue"),
    go_to(reg("continue")),
    "compound_apply_before_local_names",
    assign("a", reg("c")),
    assign("continue", label("compound_apply_after_local_names")),
    go_to(label("local_names")),
    "compound_apply_after_local_names",
    assign("d", reg("res")),
    assign("c", reg("a")),
    "compound_apply_local_names_nvy_loop",
    test(list(op("==="), reg("c"), constant(0))),
    branch(label("compound_apply_join_name_list")),
    assign("a", list(op("make_no_value_yet_ptr"))),
    assign("b", reg("argl")),
    assign("continue", label("compound_apply_after_pair")),
    go_to(label("pair")),
    "compound_apply_after_pair",
    assign("argl", reg("res")),
    assign("c", list(op("-"), reg("c"), constant(1))),
    go_to(label("compound_apply_local_names_nvy_loop")),
    "compound_apply_join_name_list",
    test(list(op("is_null_ptr"), reg("d"))),
    branch(label("compound_apply_before_extend_environment")),
    assign("a", reg("d")),
    "compound_apply_join_name_list_loop",
    assign("b", list(op("vector_ref"), reg("the_tails"), reg("a"))),
    test(list(op("is_null_ptr"), reg("b"))),
    branch(label("compound_apply_set_tail")),
    assign("a", list(op("vector_ref"), reg("the_tails"), reg("a"))),
    go_to(label("compound_apply_join_name_list_loop")),
    "compound_apply_set_tail",
    perform(list(op("vector_set"), reg("the_tails"), reg("a"), reg("unev"))),
    assign("unev", reg("d")),
    "compound_apply_before_extend_environment",
    assign("continue", label("compound_apply_after_extend_environment")),
    go_to(label("extend_environment")),
    "compound_apply_after_extend_environment",
    restore("continue"),
    assign("exp", list(op("vector_ref"), reg("the_heads"), reg("fun"))),
    go_to(label("eval_dispatch"))
));

const eval_sequence = flatten_controller_seqs(list(
    "ev_sequence_from_dispatch",
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    "ev_sequence",
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    assign("a", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    test(list(op("is_null_ptr"), reg("a"))),
    branch(label("ev_sequence_last_exp")),
    make_is_tagged_list_seq(reg("exp"), "return_statement", "ev_sequence_last_exp"),
    save("continue"),
    save("unev"),
    save("env"),
    assign("continue", label("ev_sequence_continue")),
    go_to(label("eval_dispatch")),
    "ev_sequence_continue",
    restore("env"),
    restore("unev"),
    restore("continue"),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    go_to(label("ev_sequence")),
    "ev_sequence_last_exp",
    go_to(label("eval_dispatch"))
));

const eval_assignment = list(
    "ev_assignment",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    save("unev"), // save variable for later
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    save("env"),
    save("continue"),
    assign("continue", label("ev_assignment_1")),
    go_to(label("eval_dispatch")), // evaluate the assignment value
    "ev_assignment_1",
    restore("continue"),
    restore("env"),
    restore("unev"),
    assign("res", reg("val")),
    assign("a", reg("unev")),
    save("continue"),
    assign("continue", label("ev_assignment_after_anv")),
    go_to(label("assign_name_value")),
    "ev_assignment_after_anv",
    restore("continue"),
    assign("val", constant("ok")),
    go_to(reg("continue"))
);

const eval_definition = list(
    "ev_definition",
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    assign("unev", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    save("unev"),// save variable for later
    assign("exp", list(op("vector_ref"), reg("prog_tails"), reg("exp"))),
    assign("exp", list(op("vector_ref"), reg("prog_heads"), reg("exp"))),
    save("env"),
    save("continue"),
    assign("continue", label("ev_definition_1")),
    go_to(label("eval_dispatch")), // evaluate the definition value
    "ev_definition_1",
    restore("continue"),
    restore("env"),
    restore("unev"),
    assign("a", reg("unev")),
    assign("res", reg("val")),
    save("continue"),
    assign("continue", label("ev_definition_after_snv")),
    go_to(label("set_name_value")),
    "ev_definition_after_snv",
    restore("continue"),
    assign("val", constant("ok")),
    go_to(reg("continue"))
);

// 4.1 code

// Name in "a", value in "res"
const set_name_value = list(
    "set_name_value",
    assign("b", list(op("vector_ref"), reg("the_heads"), reg("env"))),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("b"))), // values
    assign("b", list(op("vector_ref"), reg("the_heads"), reg("b"))), // names
    "snv_loop",
    test(list(op("is_null_ptr"), reg("b"))),
    branch(label("snv_name_not_found")),
    assign("d", list(op("vector_ref"), reg("the_heads"), reg("b"))),
    test(list(op("==="), reg("a"), reg("d"))),
    branch(label("snv_assign")),
    assign("b", list(op("vector_ref"), reg("the_tails"), reg("b"))),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("c"))),
    go_to(label("snv_loop")),
    "snv_assign",
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("c"))), // names
    perform(list(op("vector_set"), reg("the_heads"), reg("c"), reg("res"))),
    go_to(reg("continue")),
    "snv_name_not_found",
    assign("res", reg("a")),
    assign("err", constant("internal error: name not found")),
    go_to(label("error"))
);

// Name in "a"
const lookup_name_value = list(
    "lnv_env_loop",
    assign("b", list(op("vector_ref"), reg("the_tails"), reg("b"))), // rest frames
    test(list(op("is_null_ptr"), reg("b"))),
    branch(label("lnv_unbound_name")),
    go_to(label("lnv_skip_assign_env")),
    "lookup_name_value",
    assign("b", reg("env")),
    "lnv_skip_assign_env",
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("b"))), // first frame
    assign("d", list(op("vector_ref"), reg("the_tails"), reg("c"))), // values
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("c"))), // names
    "lnv_scan_loop",
    test(list(op("is_null_ptr"), reg("c"))),
    branch(label("lnv_env_loop")),
    assign("e", list(op("vector_ref"), reg("the_heads"), reg("c"))),
    test(list(op("==="), reg("a"), reg("e"))),
    branch(label("lnv_return_value")),
    assign("d", list(op("vector_ref"), reg("the_tails"), reg("d"))),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("c"))),
    go_to(label("lnv_scan_loop")),
    "lnv_return_value",
    assign("res", list(op("vector_ref"), reg("the_heads"), reg("d"))),
    assign("res", list(op("vector_ref"), reg("the_heads"), reg("res"))),
    test(list(op("is_no_value_yet_ptr"), reg("res"))),
    branch(label("lnv_no_value_yet")),
    go_to(reg("continue")),
    "lnv_unbound_name",
    assign("res", reg("a")),
    assign("err", constant("Unbound name:")),
    go_to(label("error")),
    "lnv_no_value_yet",
    assign("res", reg("a")),
    assign("err", constant("Name used before declaration: ")),
    go_to(label("error"))
);

// Name in "a", value in "res"
const assign_name_value = list(
    "anv_env_loop",
    assign("b", list(op("vector_ref"), reg("the_tails"), reg("b"))), // rest frames
    go_to(label("anv_skip_assign_env")),
    "assign_name_value",
    assign("b", reg("env")),
    "anv_skip_assign_env",
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("b"))), // first frame
    assign("d", list(op("vector_ref"), reg("the_tails"), reg("c"))), // values
    assign("c", list(op("vector_ref"), reg("the_heads"), reg("c"))), // names
    "anv_scan_loop",
    test(list(op("is_null_ptr"), reg("c"))),
    branch(label("anv_env_loop")),
    assign("e", list(op("vector_ref"), reg("the_heads"), reg("c"))),
    test(list(op("==="), reg("a"), reg("e"))),
    branch(label("anv_set_value")),
    assign("d", list(op("vector_ref"), reg("the_tails"), reg("d"))),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("c"))),
    go_to(label("anv_scan_loop")),
    "anv_set_value",
    assign("d", list(op("vector_ref"), reg("the_heads"), reg("d"))),
    assign("e", list(op("vector_ref"), reg("the_tails"), reg("d"))),
    test(list(op("==="), reg("e"), constant(false))),
    branch(label("anv_assign_const")),
    perform(list(op("vector_set"), reg("the_heads"), reg("d"), reg("res"))),
    go_to(reg("continue")),
    "anv_assign_const",
    assign("res", reg("a")),
    assign("err", constant("no assignment to constants allowed")),
    go_to(label("error"))
);

const make_compound_function = list(
    "make_compound_function",
    save("continue"),
    assign("a", constant("compound_function")),
    save("a"),
    assign("continue", label("make_compound_function_after_map")),
    go_to(label("map_params_to_names")),
    "make_compound_function_after_map",
    save("res"),
    save("exp"),
    save("env"),
    assign("continue", label("make_compound_function_after_list")),
    assign("a", constant(4)),
    go_to(label("list")),
    "make_compound_function_after_list",
    restore("continue"),
    assign("val", reg("res")),
    go_to(reg("continue"))
);

const map_params_to_names = list(
    "map_params_to_names",
    assign("a", constant(0)),
    "map_params_to_names_loop",
    test(list(op("is_null_ptr"), reg("unev"))),
    branch(label("list")),
    assign("b", list(op("vector_ref"), reg("prog_heads"), reg("unev"))),
    assign("b", list(op("vector_ref"), reg("prog_tails"), reg("b"))),
    assign("b", list(op("vector_ref"), reg("prog_heads"), reg("b"))),
    save("b"),
    assign("unev", list(op("vector_ref"), reg("prog_tails"), reg("unev"))),
    assign("a", list(op("+"), reg("a"), constant(1))),
    go_to(label("map_params_to_names_loop"))
);

// name list "unev", value list "argl", env "env"
const extend_environment = list(
    "extend_environment",
    save("continue"),
    assign("c", reg("argl")), // values
    "extend_environment_argl_loop",
    test(list(op("is_null_ptr"), reg("c"))),
    branch(label("extend_environment_after_pair_loop")),
    assign("a", list(op("vector_ref"), reg("the_heads"), reg("c"))),
    assign("b", constant(true)),
    assign("continue", label("extend_environment_loop_after_pair")),
    go_to(label("pair")),
    "extend_environment_loop_after_pair",
    perform(list(op("vector_set"), reg("the_heads"), reg("c"), reg("res"))),
    assign("c", list(op("vector_ref"), reg("the_tails"), reg("c"))),
    go_to(label("extend_environment_argl_loop")),
    "extend_environment_after_pair_loop",
    assign("a", reg("unev")),
    assign("b", reg("argl")),
    assign("continue", label("extend_environment_after_make_frame")),
    go_to(label("pair")),
    "extend_environment_after_make_frame",
    assign("a", reg("res")),
    assign("b", reg("env")),
    assign("continue", label("extend_environment_after_pair_frames")),
    go_to(label("pair")),
    "extend_environment_after_pair_frames",
    assign("env", reg("res")),
    restore("continue"),
    go_to(reg("continue"))
);

// wrapped seq in "a"
const local_names = flatten_controller_seqs(list(
    "local_names",
    save("continue"),
    assign("c", list(op("vector_ref"), reg("prog_tails"), reg("a"))),
    assign("c", list(op("vector_ref"), reg("prog_heads"), reg("c"))),
    assign("d", list(op("make_null_ptr"))), // list of names
    assign("f", constant(0)), // count
    "local_names_loop",
    test(list(op("is_null_ptr"), reg("c"))),
    branch(label("local_names_done")),
    assign("e", list(op("vector_ref"), reg("prog_heads"), reg("c"))),
    make_is_tagged_list_seq(reg("e"), "constant_declaration", "local_names_add_name"),
    make_is_tagged_list_seq(reg("e"), "variable_declaration", "local_names_add_name"),
    assign("c", list(op("vector_ref"), reg("prog_tails"), reg("c"))),
    go_to(label("local_names_loop")),
    "local_names_add_name",
    assign("a", list(op("vector_ref"), reg("prog_tails"), reg("e"))),
    assign("a", list(op("vector_ref"), reg("prog_heads"), reg("a"))),
    assign("a", list(op("vector_ref"), reg("prog_tails"), reg("a"))),
    assign("a", list(op("vector_ref"), reg("prog_heads"), reg("a"))),
    assign("b", reg("d")),
    assign("continue", label("local_names_after_pair")),
    go_to(label("pair")),
    "local_names_after_pair",
    assign("d", reg("res")),
    assign("c", list(op("vector_ref"), reg("prog_tails"), reg("c"))),
    assign("f", list(op("+"), reg("f"), constant(1))),
    go_to(label("local_names_loop")),
    "local_names_done",
    assign("res", reg("d")),
    assign("a", reg("f")), // return count in "a"
    restore("continue"),
    go_to(reg("continue"))
));

// extras

// parsetree list in "exp"
const begin_evaluation = flatten_controller_seqs(list(
    "begin_evaluation",
    make_is_tagged_list_seq(reg("exp"), "sequence", "begin_evaluation_sequence"),
    assign("continue", label("end_evaluation")),
    go_to(label("eval_dispatch")),
    "begin_evaluation_sequence",
    assign("a", reg("exp")),
    assign("continue", label("begin_evaluation_after_local_names")),
    go_to(label("local_names")),
    "begin_evaluation_after_local_names",
    // below is copied from compound_apply
    assign("unev", reg("res")), // name list in "unev"
    assign("argl", list(op("make_null_ptr"))), // value list in "argl"
    assign("c", reg("a")),
    "begin_evaluation_local_names_nvy_loop",
    test(list(op("==="), reg("c"), constant(0))),
    branch(label("begin_evaluation_before_extend_environment")),
    assign("a", list(op("make_no_value_yet_ptr"))),
    assign("b", reg("argl")),
    assign("continue", label("begin_evaluation_after_pair")),
    go_to(label("pair")),
    "begin_evaluation_after_pair",
    assign("argl", reg("res")),
    assign("c", list(op("-"), reg("c"), constant(1))),
    go_to(label("begin_evaluation_local_names_nvy_loop")),
    "begin_evaluation_before_extend_environment",
    assign("continue", label("begin_evaluation_after_extend_environment")),
    go_to(label("extend_environment")),
    "begin_evaluation_after_extend_environment",
    assign("continue", label("end_evaluation")),
    go_to(label("eval_dispatch"))
));

function underlying_javascript_closure(fn) {
    return args => apply_in_underlying_javascript(fn, args);
}

function unwrap_args(fn) {
    return args => fn(map(unwrap_ptr, args));
}

function wrap_return_value(fn) {
    return args => wrap_ptr(fn(args));
}

function primitive_function(fn) {
    return wrap_return_value(unwrap_args(underlying_javascript_closure(fn)));
}

// 5.3 MEMORY MANAGEMENT

function vector_ref(vector, idx) {
    return vector[unwrap_ptr(idx)];
}

function vector_set(vector, idx, val) {
    vector[unwrap_ptr(idx)] = val;
}

function make_vector() {
    return [];
}

function inc_ptr(ptr) {
    return make_ptr_ptr(unwrap_ptr(ptr) + 1);
}

const vector_ops = list(
    list("vector_ref", underlying_javascript_closure(vector_ref)),
    list("vector_set", underlying_javascript_closure(vector_set)),
    list("inc_ptr", underlying_javascript_closure(inc_ptr))
);

// MACHINE SETUP
const ptr_ops = list(
    list("make_ptr_ptr", unwrap_args(underlying_javascript_closure(make_ptr_ptr))),
    list("make_null_ptr", underlying_javascript_closure(make_null_ptr)),
    list("make_no_value_yet_ptr", underlying_javascript_closure(make_no_value_yet_ptr)),
    list("make_prog_ptr", underlying_javascript_closure(make_prog_ptr)),
    list("make_broken_heart_ptr", underlying_javascript_closure(make_broken_heart_ptr)),
    list("is_number_ptr", wrap_return_value(underlying_javascript_closure(is_number_ptr))),
    list("is_bool_ptr", wrap_return_value(underlying_javascript_closure(is_bool_ptr))),
    list("is_string_ptr", wrap_return_value(underlying_javascript_closure(is_string_ptr))),
    list("is_ptr_ptr", wrap_return_value(underlying_javascript_closure(is_ptr_ptr))),
    list("is_null_ptr", wrap_return_value(underlying_javascript_closure(is_null_ptr))),
    list("is_undefined_ptr", wrap_return_value(underlying_javascript_closure(is_undefined_ptr))),
    list("is_prog_ptr", wrap_return_value(underlying_javascript_closure(is_prog_ptr))),
    list("is_no_value_yet_ptr", wrap_return_value(underlying_javascript_closure(is_no_value_yet_ptr))),
    list("is_broken_heart_ptr", wrap_return_value(underlying_javascript_closure(is_broken_heart_ptr)))
);

const primitive_ops = list(
    list("display", primitive_function(display)),
    list("error", primitive_function(error)),
    list("+", primitive_function((x, y) => x + y)),
    list("-", primitive_function((x, y) => x - y)),
    list("*", primitive_function((x, y) => x * y)),
    list("/", primitive_function((x, y) => x / y)),
    list("%", primitive_function((x, y) => x % y)),
    list("===", primitive_function((x, y) => x === y)),
    list("!==", primitive_function((x, y) => x !== y)),
    list("<", primitive_function((x, y) => x < y)),
    list("<=", primitive_function((x, y) => x <= y)),
    list(">", primitive_function((x, y) => x > y)),
    list(">=", primitive_function((x, y) => x >= y)),
    list("!", primitive_function(x => !x)),
    list("||", primitive_function((x, y) => x || y)),
    list("&&", primitive_function((x, y) => x && y))
);

const gc_ops = list(
    list("call_proc", underlying_javascript_closure(proc => proc()))
);

const eval_controller = accumulate(append, null, list(
    pair_controller,
    list_controller,
    is_tagged_list_controller,
    reverse_list,
    eval_dispatch,
    eval_return,
    eval_self,
    eval_name,
    eval_if,
    eval_lambda,
    eval_application,
    eval_appl_operator,
    eval_operand_loop,
    eval_appl_accumulate_arg,
    eval_appl_last_arg,
    eval_appl_accum_last_arg,
    apply_dispatch,
    primitive_apply,
    compound_apply,
    eval_sequence,
    eval_assignment,
    eval_definition,
    set_name_value,
    lookup_name_value,
    assign_name_value,
    make_compound_function,
    map_params_to_names,
    extend_environment,
    local_names
));

const gc_controller = list(
    "begin_garbage_collection",
    perform(list(op("call_proc"), reg("root_populate_proc"))),
    assign("free", list(op("make_ptr_ptr"), constant(0))),
    assign("scan", list(op("make_ptr_ptr"), constant(0))),
    assign("old", reg("root")),
    assign("relocate_continue", label("reassign_root")),
    go_to(label("relocate_old_result_in_new")),
    "reassign_root",
    assign("root", reg("new")),
    go_to(label("gc_loop")),
    "gc_loop",
    test(list(op("==="), reg("scan"), reg("free"))),
    branch(label("gc_flip")),
    assign("old", list(op("vector_ref"), reg("new_heads"), reg("scan"))),
    assign("relocate_continue", label("update_head")),
    go_to(label("relocate_old_result_in_new")),
    "update_head",
    perform(list(op("vector_set"), reg("new_heads"), reg("scan"), reg("new"))),
    assign("old", list(op("vector_ref"), reg("new_tails"), reg("scan"))),
    assign("relocate_continue", label("update_tail")),
    go_to(label("relocate_old_result_in_new")),
    "update_tail",
    perform(list(op("vector_set"), reg("new_tails"), reg("scan"), reg("new"))),
    assign("scan", list(op("inc_ptr"), reg("scan"))),
    go_to(label("gc_loop")),
    "relocate_old_result_in_new",
    test(list(op("is_ptr_ptr"), reg("old"))),
    branch(label("gc_pair")),
    assign("new", reg("old")),
    go_to(reg("relocate_continue")),
    "gc_pair",
    assign("oldhr", list(op("vector_ref"), reg("the_heads"), reg("old"))),
    test(list(op("is_broken_heart_ptr"), reg("oldhr"))),
    branch(label("already_moved")),
    assign("new", reg("free")),
    // new location for pair
    // Update "free" pointer.
    assign("free", list(op("inc_ptr"), reg("free"))),
    // Copy the head and tail to new memory
    perform(list(op("vector_set"),
                 reg("new_heads"), reg("new"), reg("oldhr"))),
    assign("oldhr", list(op("vector_ref"), reg("the_tails"), reg("old"))),
    perform(list(op("vector_set"),
                 reg("new_tails"), reg("new"), reg("oldhr"))),
    // Construct the broken heart
    assign("oldhr", list(op("make_broken_heart_ptr"))),
    perform(list(op("vector_set"),
                 reg("the_heads"), reg("old"), reg("oldhr"))),
    perform(list(op("vector_set"),
                 reg("the_tails"), reg("old"), reg("new"))),
    go_to(reg("relocate_continue")),
    "already_moved",
    assign("new", list(op("vector_ref"), reg("the_tails"), reg("old"))),
    go_to(reg("relocate_continue")),
    "gc_flip",
    perform(list(op("call_proc"), reg("stack_reassign_proc"))),
    assign("temp", reg("the_tails")),
    assign("the_tails", reg("new_tails")),
    assign("new_tails", reg("temp")),
    assign("temp", reg("the_heads")),
    assign("the_heads", reg("new_heads")),
    assign("new_heads", reg("temp")),
    perform(list(op("call_proc"), reg("root_restore_proc"))),
    go_to(reg("continue"))
);

const error_controller = list(
    "error",
    perform(list(op("error"), reg("res"), reg("err"))),
    go_to(label("end_evaluation"))
);

const begin_controller = begin_evaluation;

const end_controller = list(
    "end_evaluation"
);

const ops = accumulate(append, null, list(
    vector_ops,
    ptr_ops,
    gc_ops,
    primitive_ops
));

const controller = accumulate(append, null, list(
    begin_controller,
    eval_controller,
    gc_controller,
    error_controller,
    end_controller
));

function make_evaluator_machine(size) {
    const evaluator_machine = make_machine(null, ops, controller);
    set_register_contents(evaluator_machine, "SIZE", wrap_ptr(size));
    return evaluator_machine;
}

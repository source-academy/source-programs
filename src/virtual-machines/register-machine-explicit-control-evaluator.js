/*
Explicit control evaluator for Source §1 sublanguage

This is an "explicit control evaluator", that is, a register machine that acts as a meta-circular evaluator.
It is described in 5.4 of SICP JS (https://sicp.comp.nus.edu.sg/chapters/109#top).

An example usage:
```
set_program_to_run("1 + 3 * 4;");   // This parses the program and loads it into the register machine
start(m);                           // This runs the register machine
get_register_contents(m, "val");    // The output is in the register named "val"
```

The Source §1 evaluator skeleton code is in lines 20-558
The skeleton code for a register machine is in lines 560-1160
The register machine is in the function "evaluator_machine" (lines 1162-1671)
*/

/*
Evaluator for language with booleans, conditionals,
sequences, functions, constants, variables and blocks
This is an evaluator for a language that lets you declare
functions, variables and constants, apply functions, and
carry out simple arithmetic calculations, boolean operations.
The covered Source §1 sublanguage is:
stmt    ::= const name = expr ; 
         |  let name = expr ; 
         |  function name(params) block
         |  expr ; 
         |  stmt stmt
         |  name = expr ; 
         |  block
block   ::= { stmt }
expr    ::= expr ? expr : expr
         |  expr binop expr
         |  unop expr
         |  name
         |  number
         |  expr(expr, expr, ...)
binop   ::= + | - | * | / | % | < | > | <= | >= 
         | === | !== |  && | ||
unop    ::= ! | -
*/

/* CONSTANTS: NUMBERS, STRINGS, TRUE, FALSE */

// constants (numbers, strings, booleans)
// are considered "self_evaluating". This means, they
// represent themselves in the syntax tree

function is_self_evaluating(stmt) {
  return is_number(stmt) || is_string(stmt) || is_boolean(stmt);
}

// all other statements and expressions are
// tagged lists. Their tag tells us what
// kind of statement/expression they are

function is_tagged_list(stmt, the_tag) {
  return is_pair(stmt) && head(stmt) === the_tag;
}

/* NAMES */

// In this evaluator, the operators are referred
// to as "names" in expressions.

// Names are tagged with "name".
// In this evaluator, typical names
// are
// list("name", "+")
// list("name", "factorial")
// list("name", "n")

function is_name(stmt) {
  return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
  return head(tail(stmt));
}

/* CONSTANT DECLARATIONS */

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

/* VARIABLE DECLARATIONS */

function is_variable_declaration(stmt) {
  return is_tagged_list(stmt, "variable_declaration");
}
function variable_declaration_name(stmt) {
  return head(tail(head(tail(stmt))));
}
function variable_declaration_value(stmt) {
  return head(tail(tail(stmt)));
}

/* CONDITIONAL EXPRESSIONS */

// conditional expressions are tagged
// with "conditional_expression"

function is_conditional_expression(stmt) {
  return is_tagged_list(stmt, "conditional_expression");
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
function is_true(x) {
  return x === true;
}

/* FUNCTION DEFINITION EXPRESSIONS */

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

// compound function values keep track of parameters, body
// and environment, in a list tagged as "compound_function"

function make_compound_function(parameters, body, env) {
  return list("compound_function", parameters, body, env);
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
function function_environment(f) {
  return list_ref(f, 3);
}

// evaluating a function definition expression
// results in a function value. Note that the
// current environment is stored as the function
// value's environment

function eval_function_definition(stmt, env) {
  return make_compound_function(
    map(name_of_name, function_definition_parameters(stmt)),
    function_definition_body(stmt),
    env
  );
}

/* SEQUENCES */

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

/* FUNCTION APPLICATION */

// The core of our evaluator is formed by the
// implementation of function applications.
// Applications are tagged with "application"
// and have "operator" and "operands"

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

// primitive functions are tagged with "primitive"
// and come with a Source function "implementation"

function make_primitive_function(impl) {
  return list("primitive", impl);
}
function is_primitive_function(fun) {
  return is_tagged_list(fun, "primitive");
}
function primitive_implementation(fun) {
  return list_ref(fun, 1);
}

/* APPLY */

// apply_in_underlying_javascript allows us
// to make use of JavaScript's primitive functions
// in order to access operators such as addition

function apply_primitive_function(fun, argument_list) {
  return apply_in_underlying_javascript(
    primitive_implementation(fun),
    argument_list
  );
}

// We use a nullary function as temporary value for names whose
// declaration has not yet been evaluated. The purpose of the
// function definition is purely to create a unique identity;
// the function will never be applied and its return value
// (null) is irrelevant.
const no_value_yet = () => null;

// The function local_names collects all names declared in the
// body statements. For a name to be included in the list of
// local_names, it needs to be declared outside of any other
// block or function.

function insert_all(xs, ys) {
  return is_null(xs)
    ? ys
    : is_null(member(head(xs), ys))
    ? pair(head(xs), insert_all(tail(xs), ys))
    : error(head(xs), "multiple declarations of: ");
}

function local_names(stmt) {
  if (is_sequence(stmt)) {
    const stmts = sequence_statements(stmt);
    return is_empty_sequence(stmts)
      ? null
      : insert_all(
          local_names(first_statement(stmts)),
          local_names(make_sequence(rest_statements(stmts)))
        );
  } else {
    return is_constant_declaration(stmt)
      ? list(constant_declaration_name(stmt))
      : is_variable_declaration(stmt)
      ? list(variable_declaration_name(stmt))
      : null;
  }
}

/* RETURN STATEMENTS */

// functions return the value that results from
// evaluating their expression

function is_return_statement(stmt) {
  return is_tagged_list(stmt, "return_statement");
}
function return_statement_expression(stmt) {
  return head(tail(stmt));
}

function make_return_value(content) {
  return list("return_value", content);
}
function is_return_value(value) {
  return is_tagged_list(value, "return_value");
}
function return_value_content(value) {
  return head(tail(value));
}

/* ASSIGNMENT */

function is_assignment(stmt) {
  return is_tagged_list(stmt, "assignment");
}
function assignment_name(stmt) {
  return head(tail(head(tail(stmt))));
}
function assignment_value(stmt) {
  return head(tail(tail(stmt)));
}

/* BLOCKS */

// blocks are tagged with "block"
function is_block(stmt) {
  return is_tagged_list(stmt, "block");
}
function make_block(stmt) {
  return list("block", stmt);
}
function block_body(stmt) {
  return head(tail(stmt));
}

/* ENVIRONMENTS */

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
    return is_null(names)
      ? error("internal error: name not found")
      : name === head(names)
      ? set_head(head(vals), val)
      : scan(tail(names), tail(vals));
  }
  const frame = first_frame(env);
  return scan(frame_names(frame), frame_values(frame));
}

// name lookup proceeds from the innermost
// frame and continues to look in enclosing
// environments until the name is found

function lookup_name_value(name, env) {
  function env_loop(env) {
    function scan(names, vals) {
      return is_null(names)
        ? env_loop(enclosing_environment(env))
        : name === head(names)
        ? head(head(vals))
        : scan(tail(names), tail(vals));
    }
    if (is_empty_environment(env)) {
      error(name, "Unbound name: ");
    } else {
      const frame = first_frame(env);
      const value = scan(frame_names(frame), frame_values(frame));
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
      return is_null(names)
        ? env_loop(enclosing_environment(env))
        : name === head(names)
        ? tail(head(vals))
          ? set_head(head(vals), val)
          : error("no assignment " + "to constants allowed")
        : scan(tail(names), tail(vals));
    }
    if (is_empty_environment(env)) {
      error(name, "Unbound name in assignment: ");
    } else {
      const frame = first_frame(env);
      return scan(frame_names(frame), frame_values(frame));
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
      make_frame(
        names,
        map((x) => pair(x, true), vals)
      ),
      base_env
    );
  } else if (length(names) < length(vals)) {
    error(
      "Too many arguments supplied: " +
        stringify(names) +
        ", " +
        stringify(vals)
    );
  } else {
    error(
      "Too few arguments supplied: " + stringify(names) + ", " + stringify(vals)
    );
  }
}

/* THE GLOBAL ENVIRONMENT */

const the_empty_environment = null;

// the minus operation is overloaded to
// support both binary minus and unary minus

function minus(x, y) {
  if (is_number(x) && is_number(y)) {
    return x - y;
  } else {
    return -x;
  }
}

// the global environment has bindings for all
// primitive functions, including the operators

const primitive_functions = list(
  list("display", display),
  list("error", error),
  list("+", (x, y) => x + y),
  list("-", (x, y) => minus(x, y)),
  list("*", (x, y) => x * y),
  list("/", (x, y) => x / y),
  list("%", (x, y) => x % y),
  list("===", (x, y) => x === y),
  list("!==", (x, y) => x !== y),
  list("<", (x, y) => x < y),
  list("<=", (x, y) => x <= y),
  list(">", (x, y) => x > y),
  list(">=", (x, y) => x >= y),
  list("!", (x) => !x)
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
  const primitive_function_names = map((f) => head(f), primitive_functions);
  const primitive_function_values = map(
    (f) => make_primitive_function(head(tail(f))),
    primitive_functions
  );
  const primitive_constant_names = map((f) => head(f), primitive_constants);
  const primitive_constant_values = map(
    (f) => head(tail(f)),
    primitive_constants
  );
  return extend_environment(
    append(primitive_function_names, primitive_constant_names),
    append(primitive_function_values, primitive_constant_values),
    the_empty_environment
  );
}

const the_global_environment = setup_environment();

function get_global_environment() {
  return the_global_environment;
}

function user_print(object) {
  return is_compound_function(object)
    ? "function" +
        stringify(function_parameters(object)) +
        stringify(function_body(object)) +
        "<environment>"
    : object;
}

// END EVALUATOR SKELETON

// Global registers
let the_heads = [];
let the_tails = [];
let free = 0;

const POINTER_TAG = 800;
const NUMBER_TAG = 801;
const STRING_TAG = 802;
const NULL_TAG = -1;

// Implementation is with arrays...
function head_(n) {
  return vector_ref(the_heads, n);
}

function tail_(n) {
  return vector_ref(the_tails, n);
}

function vector_ref(xs, index) {
  return xs[index];
}

function vector_set(xs, index, value) {
  xs[index] = value;
  display(xs);
  return undefined;
}

function pair_(a, b) {
  // perform(list(op("vector_set"), reg("the_heads"), reg("free"), a));
  // perform(list(op("vector_set"), reg("the_tails"), reg("free"), b));
  // assign("free", list(op("+"), reg("free"), constant(1)));
  // display(is_number(a), "is_number");

  const ret = free;
  vector_set(the_heads, free, a);
  vector_set(the_tails, free, b);

  free = free + 1;
  return ret;
}

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

function assign(register_name, source) {
  const a = append(list("assign", register_name), source);
  return a;
}

function perform(args) {
  const a = append(list("perform"), args);
  return a;
}

// Made an n-ary function helper...
function nary_function(f) {
  // f is n-ary
  return (arg_list) => apply_in_underlying_javascript(f, arg_list);
}

function save(value) {
  return list("save", value);
}

function restore(value) {
  return list("restore", value);
}

function go_to(label) {
  return list("go_to", label);
}

function test(op, lhs, rhs) {
  return list("test", op, lhs, rhs);
}

function binary_function(f) {
  // f is binary
  return (arg_list) =>
    length(arg_list) === 2
      ? apply_in_underlying_javascript(f, arg_list)
      : error(
          arg_list,
          "Incorrect number of arguments passed to binary function "
        );
}

function make_machine(register_names, ops, controller_text) {
  const machine = make_new_machine();

  map((reg_name) => machine("allocate_register")(reg_name), register_names);
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
        return (value) => {
          contents = value;
        };
      } else {
        error(message, "Unknown request: REGISTER");
      }
    }
  }

  return dispatch;
}

function debug(reg) {
  display(reg);
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
      ? () => {
          set_contents(pc, the_instruction_sequence);
          return execute();
        }
      : message === "install_instruction_sequence"
      ? (seq) => {
          the_instruction_sequence = seq;
        }
      : message === "allocate_register"
      ? allocate_register
      : message === "get_register"
      ? lookup_register
      : message === "install_operations"
      ? (ops) => {
          the_ops = append(the_ops, ops);
        }
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
  function helper(insts, labels) {
    /// FIXME: rename to something useful
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
  return map(
    (i) =>
      set_iep(
        i,
        make_ep(instruction_text(i), labels, machine, pc, flag, stack, ops)
      ),
    insts
  );
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

  // FIX FOR LABEL
  const value_proc = is_operation_exp(value_exp)
    ? make_operation_exp(value_exp, machine, labels, operations)
    : // fix for label...
    is_label_exp(value_exp)
    ? make_primitive_exp(value_exp, machine, labels)
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
    const condition_proc = make_operation_exp(
      condition,
      machine,
      labels,
      operations
    );

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
  } else if (is_register_exp(dest)) {
    const reg = get_register(machine, register_exp_reg(dest));

    function perform_make_branch() {
      if (get_contents(flag)) {
        set_contents(pc, get_contents(reg));
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
    return () => {
      action_proc();
      advance_pc(pc);
    };
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
  const aprocs = map(
    (e) => make_primitive_exp(e, machine, labels),
    operation_exp_operands(exp)
  );

  function perform_make_operation_exp() {
    return op(map((p) => p(), aprocs));
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

function evaluator_machine() {
  return make_machine(
    list(
      "exp",
      "env",
      "val",
      "continue",
      "proc",
      "argl",
      "unev",
      "fun",
      "temp"
    ),
    list(
      // basic functions
      list(
        "rem",
        binary_function((a, b) => a % b)
      ),
      list(
        "=",
        binary_function((a, b) => a === b)
      ),
      list(
        "+",
        binary_function((a, b) => a + b)
      ),
      list(
        "===",
        binary_function((a, b) => a === b)
      ),
      // operands
      list("operands", nary_function(operands)),
      list("operator", nary_function(operator)),
      list("has_no_operands", nary_function(no_operands)),
      list("first_operand", nary_function(first_operand)),
      list(
        "is_last_operand",
        nary_function((a) => is_null(tail(a)))
      ),
      list("rest_operands", nary_function(rest_operands)),

      //arg
      list(
        "empty_arglist",
        nary_function((_) => list())
      ),
      list(
        "adjoin_arg",
        nary_function((val, argl) => append(argl, list(val)))
      ),

      // exp (sequence)
      list("first_statement", nary_function(first_statement)),
      list("rest_statements", nary_function(rest_statements)),
      list("is_last_statement", nary_function(is_last_statement)),
      list("sequence_statements", nary_function(sequence_statements)),

      // eval functions from meta-circular evaluator
      list("is_self_evaluating", nary_function(is_self_evaluating)),
      list("is_name", nary_function(is_name)),
      list("name_of_name", nary_function(name_of_name)),
      list(
        "all_names_of_names",
        nary_function((names) => map(name_of_name, names))
      ),
      list("is_assignment", nary_function(is_assignment)),
      list("assignment_name", nary_function(assignment_name)),
      list("assignment_value", nary_function(assignment_value)),
      list("assign_name_value", nary_function(assign_name_value)),
      list("is_constant_declaration", nary_function(is_constant_declaration)),
      list(
        "constant_declaration_name",
        nary_function(constant_declaration_name)
      ),
      list(
        "constant_declaration_value",
        nary_function(constant_declaration_value)
      ),
      list("is_variable_declaration", nary_function(is_variable_declaration)),
      list(
        "variable_declaration_name",
        nary_function(variable_declaration_name)
      ),
      list(
        "variable_declaration_value",
        nary_function(variable_declaration_value)
      ),
      list("declare_value", nary_function(set_name_value)),
      list("is_function_definition", nary_function(is_function_definition)),
      list(
        "function_definition_parameters",
        nary_function(function_definition_parameters)
      ),
      list("function_definition_body", nary_function(function_definition_body)),
      list("is_return_statement", nary_function(is_return_statement)),
      list(
        "is_conditional_expression",
        nary_function(is_conditional_expression)
      ),
      list("conditional_pred", nary_function(cond_expr_pred)),
      list("conditional_cons", nary_function(cond_expr_cons)),
      list("conditional_alt", nary_function(cond_expr_alt)),

      list("is_sequence", nary_function(is_sequence)),
      list("make_sequence", nary_function(make_sequence)),
      list("is_block", nary_function(is_block)),
      list("block_body", nary_function(block_body)),
      list("local_names", nary_function(local_names)),
      list(
        "get_temp_block_values",
        nary_function((locals) => map((x) => no_value_yet, locals))
      ),
      list("is_application", nary_function(is_application)),
      list("is_primitive_function", nary_function(is_primitive_function)),
      list("apply_primitive_function", nary_function(apply_primitive_function)),
      list("is_compound_function", nary_function(is_compound_function)),
      list("function_parameters", nary_function(function_parameters)),
      list("function_environment", nary_function(function_environment)),
      list("function_body", nary_function(function_body)),
      list("insert_all", nary_function(insert_all)),
      list("extend_environment", nary_function(extend_environment)),
      list("make_compound_function", nary_function(make_compound_function)),

      list(
        "lookup_name_value",
        nary_function((stmt, env) => lookup_name_value(name_of_name(stmt), env))
      ),
      list("get_global_environment", nary_function(get_global_environment)),

      // generic helpers
      list("is_true", nary_function(is_true)),
      list("is_null", nary_function(is_null)),
      list(
        "is_pair",
        nary_function((a) => is_pair(a))
      ),
      list(
        "is_number",
        nary_function((a) => is_number(a))
      ),
      list(
        "append",
        nary_function((xs, ys) => append(xs, ys))
      ),

      list("vector_ref", binary_function(vector_ref)),
      list("vector_set", nary_function(vector_set)),
      list("pair", nary_function(pair_)),

      list("user_print", nary_function(user_print)),
      list("display", nary_function(display))
    ),
    list(
      assign("continue", label("evaluator-done")),
      assign("env", list(op("get_global_environment"))),
      "ev_begin",

      // This corresponds to the 'evaluate' function
      // The workhorse of our evaluator is the evaluate function.
      // It dispatches on the kind of statement at hand, and
      // invokes the appropriate implementations of their
      // evaluation process, as described above, always using
      // a current environment
      // See the source code at bottom of file for refrence
      "eval_dispatch",
      test(op("is_self_evaluating"), reg("exp"), constant(true)),
      branch(label("ev_self_eval")),
      test(op("is_name"), reg("exp"), constant(true)),
      branch(label("ev_name")),

      // for now, treat let/const the same
      test(op("is_variable_declaration"), reg("exp"), constant(true)),
      branch(label("ev_variable_declaration")),
      test(op("is_constant_declaration"), reg("exp"), constant(true)),
      branch(label("ev_constant_declaration")),
      test(op("is_assignment"), reg("exp"), constant(true)),
      branch(label("ev_assignment")),

      test(op("is_conditional_expression"), reg("exp"), constant(true)),
      branch(label("ev_if")),
      test(op("is_function_definition"), reg("exp"), constant(true)),
      branch(label("ev_lambda")),
      test(op("is_sequence"), reg("exp"), constant(true)),
      branch(label("ev_seq")),
      test(op("is_block"), reg("exp"), constant(true)),
      branch(label("ev_block")),
      test(op("is_application"), reg("exp"), constant(true)),
      branch(label("ev_application")),
      go_to(label("unknown_expression_type")),

      "ev_self_eval",
      assign("val", list(reg("exp"))),
      go_to(reg("continue")),

      "ev_name",
      assign("val", list(op("lookup_name_value"), reg("exp"), reg("env"))),
      go_to(reg("continue")),

      "ev_lambda",
      assign("unev", list(op("function_definition_parameters"), reg("exp"))),
      assign("exp", list(op("function_definition_body"), reg("exp"))),
      assign(
        "val",
        list(op("make_compound_function"), reg("unev"), reg("exp"), reg("env"))
      ),
      go_to(reg("continue")),

      "ev_application",
      save("continue"),
      save("env"),
      assign("unev", list(op("operands"), reg("exp"))),
      save("unev"),
      assign("exp", list(op("operator"), reg("exp"))),
      assign("continue", label("ev_appl_did_operator")),
      go_to(label("eval_dispatch")),

      "ev_appl_did_operator",
      restore("unev"), // the operands
      restore("env"),
      assign("argl", list(op("empty_arglist"))),
      assign("fun", list(reg("val"))), // the operator
      test(op("has_no_operands"), reg("unev"), constant(true)),
      branch(label("apply_dispatch")),
      save("fun"),

      "ev_appl_operand_loop",
      save("argl"),
      assign("exp", list(op("first_operand"), reg("unev"))),
      test(op("is_last_operand"), reg("unev"), constant(true)),
      branch(label("ev_appl_last_arg")),
      save("env"),
      save("unev"),
      assign("continue", label("ev_appl_accumulate_arg")),
      go_to(label("eval_dispatch")),

      "ev_appl_accumulate_arg",
      restore("unev"),
      restore("env"),
      restore("argl"),
      assign("argl", list(op("adjoin_arg"), reg("val"), reg("argl"))),
      assign("unev", list(op("rest_operands"), reg("unev"))),
      go_to(label("ev_appl_operand_loop")),

      "ev_appl_last_arg",
      assign("continue", label("ev_appl_accum_last_arg")),
      go_to(label("eval_dispatch")),

      "ev_appl_accum_last_arg",
      restore("argl"),
      assign("argl", list(op("adjoin_arg"), reg("val"), reg("argl"))),
      restore("fun"),
      go_to(label("apply_dispatch")),

      // function application needs to distinguish between
      // primitive functions (which are evaluated using the
      // underlying JavaScript), and compound functions.
      // An application of the latter needs to evaluate the
      // body of the function value with respect to an
      // environment that results from extending the function
      // object's environment by a binding of the function
      // parameters to the arguments and of local names to
      // the special value no_value_yet

      // function apply(fun, args) {
      //   if (is_primitive_function(fun)) {
      //     return apply_primitive_function(fun, args);
      //   } else if (is_compound_function(fun)) {
      //     const body = function_body(fun);
      //     const locals = local_names(body);
      //     const names = insert_all(function_parameters(fun), locals);
      //     const temp_values = map((x) => no_value_yet, locals);
      //     const values = append(args, temp_values);
      //     const result = evaluate(
      //       body,
      //       extend_environment(names, values, function_environment(fun))
      //     );
      //     if (is_return_value(result)) {
      //       return return_value_content(result);
      //     } else {
      //       return undefined;
      //     }
      //   } else {
      //     error(fun, "Unknown function type in apply");
      //   }
      // }
      "apply_dispatch",
      test(op("is_primitive_function"), reg("fun"), constant(true)),
      branch(label("primitive_apply")),
      test(op("is_compound_function"), reg("fun"), constant(true)),
      branch(label("compound_apply")),
      go_to(label("unknown_procedure_type")),

      "primitive_apply",
      assign(
        "val",
        list(op("apply_primitive_function"), reg("fun"), reg("argl"))
      ),
      restore("continue"),
      go_to(reg("continue")),

      "compound_apply",
      assign("unev", list(op("function_parameters"), reg("fun"))), // params
      // A QUICK HACK HERE, UNSURE WHY IT'S NEEDED
      assign("unev", list(op("all_names_of_names"), reg("unev"))), // params destructured

      assign("temp", list(op("function_body"), reg("fun"))), // body
      assign("temp", list(op("local_names"), reg("unev"))), // locals

      assign("unev", list(op("insert_all"), reg("unev"), reg("temp"))), //names
      assign("temp", list(op("get_temp_block_values"), reg("temp"))), // temp_values

      assign("temp", list(op("append"), reg("argl"), reg("temp"))), // values
      assign("env", list(op("function_environment"), reg("fun"))),

      assign(
        "env",
        list(op("extend_environment"), reg("unev"), reg("temp"), reg("env"))
      ),
      assign("unev", list(op("function_body"), reg("fun"))),
      go_to(label("ev_sequence")),

      // to evaluate a sequence, we need to evaluate
      // its statements one after the other, and return
      // the value of the last statement.
      // An exception to this rule is when a return
      // statement is encountered. In that case, the
      // remaining statements are ignored and the
      // return value is the value of the sequence.

      // function eval_sequence(stmts, env) {
      //   if (is_empty_sequence(stmts)) {
      //     return undefined;
      //   } else if (is_last_statement(stmts)) {
      //     return evaluate(first_statement(stmts), env);
      //   } else {
      //     const first_stmt_value = evaluate(first_statement(stmts), env);
      //     if (is_return_value(first_stmt_value)) {
      //       return first_stmt_value;
      //     } else {
      //       return eval_sequence(rest_statements(stmts), env);
      //     }
      //   }
      // }
      "ev_seq",
      save("continue"),
      assign("unev", list(op("sequence_statements"), reg("exp"))),

      "ev_sequence",
      assign("exp", list(op("first_statement"), reg("unev"))),
      test(op("is_last_statement"), reg("unev"), constant(true)),
      branch(label("ev_sequence_last_exp")),
      save("unev"),
      save("env"),
      assign("continue", label("ev_sequence_continue")),
      go_to(label("eval_dispatch")),

      "ev_sequence_continue",
      restore("env"),
      restore("unev"),
      assign("unev", list(op("rest_statements"), reg("unev"))),
      go_to(label("ev_sequence")),

      "ev_sequence_last_exp",
      restore("continue"),
      go_to(label("eval_dispatch")),

      // evaluation of blocks evaluates the body of the block
      // with respect to the current environment extended by
      // a binding of all local names to the special value
      // no_value_yet

      // function eval_block(stmt, env) {
      //   const body = block_body(stmt);
      //   const locals = local_names(body);
      //   const temp_values = map((x) => no_value_yet, locals);
      //   return evaluate(body, extend_environment(locals, temp_values, env));
      // }
      "ev_block",
      save("continue"),
      assign("exp", list(op("block_body"), reg("exp"))),
      assign("val", list(op("local_names"), reg("exp"))),
      assign("temp", list(op("get_temp_block_values"), reg("val"))),
      assign(
        "env",
        list(op("extend_environment"), reg("val"), reg("temp"), reg("env"))
      ),
      go_to(label("eval_dispatch")),

      // the meta-circular evaluation of conditional expressions
      // evaluates the predicate and then the appropriate
      // branch, depending on whether the predicate evaluates to
      // true or not

      // function eval_conditional_expression(stmt, env) {
      //   return is_true(evaluate(cond_expr_pred(stmt), env))
      //     ? evaluate(cond_expr_cons(stmt), env)
      //     : evaluate(cond_expr_alt(stmt), env);
      // }
      "ev_if",
      save("exp"), // save expression for later
      save("env"),
      save("continue"),
      assign("continue", label("ev_if_decide")),
      assign("exp", list(op("conditional_pred"), reg("exp"))),
      go_to(label("eval_dispatch")), // evaluate the predicate

      "ev_if_decide",
      restore("continue"),
      restore("env"),
      restore("exp"),
      test(op("is_true"), reg("val"), constant(true)),
      branch(label("ev_if_consequent")),

      "ev_if_alternative",
      assign("exp", list(op("conditional_alt"), reg("exp"))),
      go_to(label("eval_dispatch")),

      "ev_if_consequent",
      assign("exp", list(op("conditional_cons"), reg("exp"))),
      go_to(label("eval_dispatch")),

      // function eval_assignment(stmt, env) {
      //   const value = evaluate(assignment_value(stmt), env);
      //   assign_name_value(assignment_name(stmt), value, env);
      //   return value;
      // }
      "ev_assignment",
      assign("unev", list(op("assignment_name"), reg("exp"))),
      save("unev"), // save variable for later
      assign("exp", list(op("assignment_value"), reg("exp"))),
      save("env"),
      save("continue"),
      assign("continue", label("ev_assignment_1")),
      go_to(label("eval_dispatch")), // evaluate the assignment value

      "ev_assignment_1",
      restore("continue"),
      restore("env"),
      restore("unev"),
      perform(
        list(op("assign_name_value"), reg("unev"), reg("val"), reg("env"))
      ),
      assign("val", list(constant("ok"))),
      go_to(reg("continue")),

      // evaluation of a constant declaration evaluates
      // the right-hand expression and binds the
      // name to the resulting value in the
      // first (innermost) frame

      // function eval_constant_declaration(stmt, env) {
      //   set_name_value(
      //     constant_declaration_name(stmt),
      //     evaluate(constant_declaration_value(stmt), env),
      //     env
      //   );
      // }
      "ev_variable_declaration",
      assign("unev", list(op("variable_declaration_name"), reg("exp"))),
      save("unev"), // save variable for later
      assign("exp", list(op("variable_declaration_value"), reg("exp"))),
      save("env"),
      save("continue"),
      assign("continue", label("ev_variable_declaration_1")),
      go_to(label("eval_dispatch")), // evaluate the declaration value

      "ev_variable_declaration_1",
      restore("continue"),
      restore("env"),
      restore("unev"),
      perform(list(op("declare_value"), reg("unev"), reg("val"), reg("env"))),
      assign("val", list(constant("ok"))),
      go_to(reg("continue")),

      "ev_constant_declaration",
      assign("unev", list(op("constant_declaration_name"), reg("exp"))),
      save("unev"), // save constant for later
      assign("exp", list(op("constant_declaration_value"), reg("exp"))),
      save("env"),
      save("continue"),
      assign("continue", label("ev_constant_declaration_1")),
      go_to(label("eval_dispatch")), // evaluate the declaration value

      "ev_constant_declaration_1",
      restore("continue"),
      restore("env"),
      restore("unev"),
      perform(list(op("declare_value"), reg("unev"), reg("val"), reg("env"))),
      assign("val", list(constant("ok"))),
      go_to(reg("continue")),

      // Error handling
      "unknown_expression_type",
      assign("val", list(constant("unknown_expression_type_error"))),
      go_to(label("signal_error")),

      "unknown_procedure_type",
      restore("continue"), /// clean up stack (from apply_dispatch)
      assign("val", list(constant("unknown_procedure_type_error"))),
      go_to(label("signal_error")),

      "signal_error",
      perform(list(op("user_print"), reg("val"))),
      go_to(label("evaluator-done")),

      "evaluator-done"
    )
  );
}

const m = evaluator_machine();
set_register_contents(m, "exp", "1;");

function set_program_to_run(str) {
  const parsed = parse(str);
  // wrap program in block to create
  // program environment
  const program_block = make_block(parsed);

  set_register_contents(m, "exp", program_block);
}

// See /__tests__ for examples
// set_program_to_run("1;");
// set_program_to_run("1 + 1;");
// set_program_to_run("1 + 3 * 4;");
// set_program_to_run("(1 + 3) * 4;");
// set_program_to_run("1.4 / 2.3 + 70.4 * 18.3;");
// set_program_to_run("true;");
// set_program_to_run("! (1 === 1);");
// set_program_to_run("(! (1 === 1)) ? 1 : 2;");
// set_program_to_run("'hello' + ' ' + 'world';");

// set_program_to_run("-12 - 8; 2;");
// set_program_to_run("function foo() {return 1;}");
// set_program_to_run("function foo() {return 1;} foo();");
// set_program_to_run("function foo() {return 1;} 2 + 2; foo(); 2 - 3;");
// set_program_to_run("function add(a, b) {return a + b;} add(1, 3);");

// set_program_to_run(
//   "function factorial(n) { return n === 1 ? 1 : n * factorial(n - 1);} factorial(4);"
// );

// start(m);

// get_register_contents(m, "val");

// The evaluate function in source
// function evaluate(stmt, env) {
//   if (is_application(stmt)) {
//   } else {
//   }
//   return is_self_evaluating(stmt)
//     ? stmt
//     : is_name(stmt)
//     ? lookup_name_value(name_of_name(stmt), env)
//     : is_constant_declaration(stmt)
//     ? eval_constant_declaration(stmt, env)
//     : is_variable_declaration(stmt)
//     ? eval_variable_declaration(stmt, env)
//     : is_assignment(stmt)
//     ? eval_assignment(stmt, env)
//     : is_conditional_expression(stmt)
//     ? eval_conditional_expression(stmt, env)
//     : is_function_definition(stmt)
//     ? eval_function_definition(stmt, env)
//     : is_sequence(stmt)
//     ? eval_sequence(sequence_statements(stmt), env)
//     : is_block(stmt)
//     ? eval_block(stmt, env)
//     : is_return_statement(stmt)
//     ? eval_return_statement(stmt, env)
//     : is_application(stmt)
//     ? apply(evaluate(operator(stmt), env), list_of_values(operands(stmt), env))
//     : is_object_expression(stmt)
//     ? eval_object_expression(stmt, env)
//     : is_object_access(stmt)
//     ? eval_object_access(stmt, env)
//     : error(stmt, "Unknown statement type in evaluate: ");
// }

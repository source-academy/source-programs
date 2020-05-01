/*
Included here:
* compiler S1- to sVML
* sVM implementation with mark-region garbage collection
* examples
*/

/*

Compiler for language Source §1- to sVML

following Lecture Week 5 of CS4215

Instructions: press "Run" to evaluate an example expression
              (scroll down and un-comment one example)

The language Source §1- is defined as follows:

stmt    ::= expr ;
         |  const x = expr ;
         |  return expr ;
         |  stmt stmt ;

expr    ::= number
         |  true | false
         |  expr ? expr : expr
         |  expr && expr
         |  expr || expr
         |  expr binop expr
         |  unop expr
         |  expr ( expr (, expr)* )
         |  ( params ) => { stmt } ;
binop   ::= + | - | * | / | < | > | <= | >= | === | !==
unop    ::= !
params  ::= ε | name ( , name ) . . .
*/

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

// applications are tagged with "application"
// and have "operator" and "operands"

function is_application(expr) {
  return is_tagged_list(expr, "application");
}
// we distinguish primitive applications by their
// operator name

function is_primitive_application(expr) {
  return (
    is_tagged_list(expr, "application") &&
    !is_null(
      member(
        primitive_operator_name(expr),
        list("!", "+", "-", "*", "/", "===", "!==", "<", ">", "<=", ">=")
      )
    )
  );
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
  return is_tagged_list(expr, "conditional_expression");
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
  return list("conditional_expression", expr1, expr2, expr3);
}

function to_string(expr) {
  return is_number(expr) || is_boolean(expr)
    ? stringify(expr)
    : length(operands(expr)) === 1
    ? "(" + operator(expr) + to_string(list_ref(operands(expr), 0)) + ")"
    : "(" +
      to_string(list_ref(operands(expr), 0)) +
      operator(expr) +
      to_string(list_ref(operands(expr), 1)) +
      ")";
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

// OP-CODES

// op-codes of machine instructions, used by compiler
// and machine

const START = 0;
const LDCN = 1; // followed by: number
const LDCB = 2; // followed by: boolean
const LDCU = 3;
const PLUS = 4;
const MINUS = 5;
const TIMES = 6;
const EQUAL = 7;
const LESS = 8;
const GREATER = 9;
const LEQ = 10;
const GEQ = 11;
const NOT = 12;
const DIV = 13;
const POP = 14;
const ASSIGN = 15; // followed by: index of value in environment
const JOF = 16; // followed by: jump address
const GOTO = 17; // followed by: jump address
const LDF = 18; // followed by: max_stack_size, address, env extensn count
const CALL = 19;
const LD = 20; // followed by: index of value in environment
const RTN = 21;
const DONE = 22;

// some auxiliary constants
// to keep track of the inline data

const LDF_MAX_OS_SIZE_OFFSET = 1;
const LDF_ADDRESS_OFFSET = 2;
const LDF_ENV_EXTENSION_COUNT_OFFSET = 3;
const LDCN_VALUE_OFFSET = 1;
const LDCB_VALUE_OFFSET = 1;

// printing opcodes for debugging

const OPCODES = list(
  pair(START, "START  "),
  pair(LDCN, "LDCN   "),
  pair(LDCB, "LDCB   "),
  pair(LDCU, "LDCU   "),
  pair(PLUS, "PLUS   "),
  pair(MINUS, "MINUS  "),
  pair(TIMES, "TIMES  "),
  pair(EQUAL, "EQUAL  "),
  pair(LESS, "LESS   "),
  pair(GREATER, "GREATER"),
  pair(LEQ, "LEQ    "),
  pair(GEQ, "GEQ    "),
  pair(NOT, "NOT    "),
  pair(DIV, "DIV    "),
  pair(POP, "POP    "),
  pair(ASSIGN, "ASSIGN "),
  pair(JOF, "JOF    "),
  pair(GOTO, "GOTO   "),
  pair(LDF, "LDF    "),
  pair(CALL, "CALL   "),
  pair(LD, "LD     "),
  pair(RTN, "RTN    "),
  pair(DONE, "DONE   ")
);

// get a the name of an opcode, for debugging

function get_name(op) {
  function lookup(opcodes) {
    return is_null(opcodes)
      ? error(op, "unknown opcode")
      : op === head(head(opcodes))
      ? tail(head(opcodes))
      : lookup(tail(opcodes));
  }
  return lookup(OPCODES);
}

// pretty-print the program

function print_program(P) {
  let i = 0;
  while (i < array_length(P)) {
    let s = stringify(i);
    const op = P[i];
    s = s + ": " + get_name(P[i]);
    i = i + 1;
    if (
      op === LDCN ||
      op === LDCB ||
      op === GOTO ||
      op === JOF ||
      op === ASSIGN ||
      op === LDF ||
      op === LD ||
      op === CALL
    ) {
      s = s + " " + stringify(P[i]);
      i = i + 1;
    } else {
    }
    if (op === LDF) {
      s = s + " " + stringify(P[i]) + " " + stringify(P[i + 1]);
      i = i + 2;
    } else {
    }
    display(undefined, s);
  }
}

// COMPILER FROM SOURCE TO SVML

// parse given string and compile it to machine code
// return the machine code in an array

function parse_and_compile(string) {
  // machine_code is array for machine instructions
  const machine_code = [];

  // insert_pointer keeps track of the next free place
  // in machine_code
  let insert_pointer = 0;

  // three insert functions (nullary, unary, binary instructions)
  function add_nullary_instruction(op_code) {
    machine_code[insert_pointer] = op_code;
    insert_pointer = insert_pointer + 1;
  }
  // unary instructions have one argument (constant or address)
  function add_unary_instruction(op_code, arg_1) {
    machine_code[insert_pointer] = op_code;
    machine_code[insert_pointer + 1] = arg_1;
    insert_pointer = insert_pointer + 2;
  }
  // binary instructions have two arguments
  function add_binary_instruction(op_code, arg_1, arg_2) {
    machine_code[insert_pointer] = op_code;
    machine_code[insert_pointer + 1] = arg_1;
    machine_code[insert_pointer + 2] = arg_2;
    insert_pointer = insert_pointer + 3;
  }
  // ternary instructions have three arguments
  function add_ternary_instruction(op_code, arg_1, arg_2, arg_3) {
    machine_code[insert_pointer] = op_code;
    machine_code[insert_pointer + 1] = arg_1;
    machine_code[insert_pointer + 2] = arg_2;
    machine_code[insert_pointer + 3] = arg_3;
    insert_pointer = insert_pointer + 4;
  }

  // to_compile stack keeps track of remaining compiler work:
  // these are function bodies that still need to be compiled
  let to_compile = null;
  function no_more_to_compile() {
    return is_null(to_compile);
  }
  function pop_to_compile() {
    const next = head(to_compile);
    to_compile = tail(to_compile);
    return next;
  }
  function push_to_compile(task) {
    to_compile = pair(task, to_compile);
  }

  // to compile a function body, we need an index table
  // to get the environment indices for each name
  // (parameters, globals and locals)
  // Each compile function returns the max operand stack
  // size needed for running the code. When compilation of
  // a function body is done, the function continue_to_compile
  // writes the max operand stack size and the address of the
  // function body to the given addresses.

  function make_to_compile_task(
    function_body,
    max_stack_size_address,
    address_address,
    index_table
  ) {
    return list(
      function_body,
      max_stack_size_address,
      address_address,
      index_table
    );
  }
  function to_compile_task_body(to_compile_task) {
    return list_ref(to_compile_task, 0);
  }
  function to_compile_task_max_stack_size_address(to_compile_task) {
    return list_ref(to_compile_task, 1);
  }
  function to_compile_task_address_address(to_compile_task) {
    return list_ref(to_compile_task, 2);
  }
  function to_compile_task_index_table(to_compile_task) {
    return list_ref(to_compile_task, 3);
  }

  // index_table keeps track of environment addresses
  // assigned to names
  function make_empty_index_table() {
    return null;
  }
  function extend_index_table(t, s) {
    return is_null(t) ? list(pair(s, 0)) : pair(pair(s, tail(head(t)) + 1), t);
  }
  function index_of(t, s) {
    return is_null(t)
      ? error(s, "name not found:")
      : head(head(t)) === s
      ? tail(head(t))
      : index_of(tail(t), s);
  }

  // a small complication: the toplevel function
  // needs to return the value of the last statement
  let toplevel = true;

  function continue_to_compile() {
    while (!is_null(to_compile)) {
      const next_to_compile = pop_to_compile();
      const address_address = to_compile_task_address_address(next_to_compile);
      machine_code[address_address] = insert_pointer;
      const index_table = to_compile_task_index_table(next_to_compile);
      const max_stack_size_address = to_compile_task_max_stack_size_address(
        next_to_compile
      );
      const body = to_compile_task_body(next_to_compile);
      const max_stack_size = compile(body, index_table, true);
      machine_code[max_stack_size_address] = max_stack_size;
      toplevel = false;
    }
  }

  function local_names(stmt) {
    if (is_sequence(stmt)) {
      const stmts = sequence_statements(stmt);
      return is_empty_sequence(stmts)
        ? null
        : append(
            local_names(first_statement(stmts)),
            local_names(make_sequence(rest_statements(stmts)))
          );
    } else {
      return is_constant_declaration(stmt)
        ? list(constant_declaration_name(stmt))
        : null;
    }
  }

  // compile_arguments compiles the arguments and
  // computes the maximal stack size needed for
  // computing the arguments. Note that the arguments
  // themselves accumulate on the operand stack, which
  // explains the "i + compile(...)"
  function compile_arguments(exprs, index_table) {
    let i = 0;
    let s = length(exprs);
    let max_stack_size = 0;
    while (i < s) {
      max_stack_size = math_max(
        i + compile(head(exprs), index_table, false),
        max_stack_size
      );
      i = i + 1;
      exprs = tail(exprs);
    }
    return max_stack_size;
  }

  function compile_boolean_operation(expr, index_table) {
    if (boolean_operator_name(expr) === "&&") {
      return compile(
        make_conditional_expression(
          first_operand(operands(expr)),
          first_operand(rest_operands(operands(expr))),
          false
        ),
        index_table,
        false
      );
    } else {
      return compile(
        make_conditional_expression(
          first_operand(operands(expr)),
          true,
          first_operand(rest_operands(operands(expr)))
        ),
        index_table,
        false
      );
    }
  }

  function compile_conditional_expression(expr, index_table, insert_flag) {
    const m_1 = compile(cond_expr_pred(expr), index_table, false);
    add_unary_instruction(JOF, NaN);
    const JOF_address_address = insert_pointer - 1;
    const m_2 = compile(cond_expr_cons(expr), index_table, insert_flag);
    let GOTO_address_address = NaN;
    if (!insert_flag) {
      add_unary_instruction(GOTO, NaN);
      GOTO_address_address = insert_pointer - 1;
    } else {
    }
    machine_code[JOF_address_address] = insert_pointer;
    const m_3 = compile(cond_expr_alt(expr), index_table, insert_flag);
    if (!insert_flag) {
      machine_code[GOTO_address_address] = insert_pointer;
    } else {
    }
    return math_max(m_1, m_2, m_3);
  }

  function compile_primitive_application(expr, index_table) {
    const op = primitive_operator_name(expr);
    const ops = operands(expr);
    const operand_1 = first_operand(ops);
    if (op === "!") {
      const max_stack_size = compile(operand_1, index_table, false);
      add_nullary_instruction(NOT);
      return max_stack_size;
    } else {
      const operand_2 = first_operand(rest_operands(ops));
      const op_code =
        op === "+"
          ? PLUS
          : op === "-"
          ? MINUS
          : op === "*"
          ? TIMES
          : op === "/"
          ? DIV
          : op === "==="
          ? EQUAL
          : op === "<"
          ? LESS
          : op === "<="
          ? LEQ
          : op === ">"
          ? GREATER
          : op === ">="
          ? GEQ
          : error(op, "unknown operator:");
      const m_1 = compile(operand_1, index_table, false);
      const m_2 = compile(operand_2, index_table, false);
      add_nullary_instruction(op_code);
      return math_max(m_1, 1 + m_2);
    }
  }

  function compile_application(expr, index_table) {
    const max_stack_operator = compile(operator(expr), index_table, false);
    const max_stack_operands = compile_arguments(operands(expr), index_table);
    add_unary_instruction(CALL, length(operands(expr)));
    return math_max(max_stack_operator, max_stack_operands + 1);
  }

  function compile_function_definition(expr, index_table) {
    const body = function_definition_body(expr);
    const locals = local_names(body);
    const parameters = map(
      x => name_of_name(x),
      function_definition_parameters(expr)
    );
    const extended_index_table = accumulate(
      (s, it) => extend_index_table(it, s),
      index_table,
      append(reverse(locals), reverse(parameters))
    );
    add_ternary_instruction(LDF, NaN, NaN, length(parameters) + length(locals));
    const max_stack_size_address = insert_pointer - 3;
    const address_address = insert_pointer - 2;
    push_to_compile(
      make_to_compile_task(
        body,
        max_stack_size_address,
        address_address,
        extended_index_table
      )
    );
    return 1;
  }

  function compile_sequence(expr, index_table, insert_flag) {
    const statements = sequence_statements(expr);
    if (is_empty_sequence(statements)) {
      return 0;
    } else if (is_last_statement(statements)) {
      return compile(first_statement(statements), index_table, insert_flag);
    } else {
      const m_1 = compile(first_statement(statements), index_table, false);
      add_nullary_instruction(POP);
      const m_2 = compile(
        make_sequence(rest_statements(statements)),
        index_table,
        insert_flag
      );
      return math_max(m_1, m_2);
    }
  }

  function compile_constant_declaration(expr, index_table) {
    const name = constant_declaration_name(expr);
    const index = index_of(index_table, name);
    const max_stack_size = compile(
      constant_declaration_value(expr),
      index_table,
      false
    );
    add_unary_instruction(ASSIGN, index);
    add_nullary_instruction(LDCU);
    return max_stack_size;
  }

  function compile(expr, index_table, insert_flag) {
    let max_stack_size = 0;
    if (is_number(expr)) {
      add_unary_instruction(LDCN, expr);
      max_stack_size = 1;
    } else if (is_boolean(expr)) {
      add_unary_instruction(LDCB, expr);
      max_stack_size = 1;
    } else if (is_undefined_expression(expr)) {
      add_nullary_instruction(LDCU);
      max_stack_size = 1;
    } else if (is_boolean_operation(expr)) {
      max_stack_size = compile_boolean_operation(expr, index_table);
    } else if (is_conditional_expression(expr)) {
      max_stack_size = compile_conditional_expression(
        expr,
        index_table,
        insert_flag
      );
      insert_flag = false;
    } else if (is_primitive_application(expr)) {
      max_stack_size = compile_primitive_application(expr, index_table);
    } else if (is_application(expr)) {
      max_stack_size = compile_application(expr, index_table);
    } else if (is_function_definition(expr)) {
      max_stack_size = compile_function_definition(expr, index_table);
    } else if (is_name(expr)) {
      add_unary_instruction(LD, index_of(index_table, name_of_name(expr)));
      max_stack_size = 1;
    } else if (is_sequence(expr)) {
      max_stack_size = compile_sequence(expr, index_table, insert_flag);
      insert_flag = false;
    } else if (is_constant_declaration(expr)) {
      max_stack_size = compile_constant_declaration(expr, index_table);
    } else if (is_return_statement(expr)) {
      max_stack_size = compile(
        return_statement_expression(expr),
        index_table,
        false
      );
    } else {
      error(expr, "unknown expression:");
    }

    // handling of return
    if (insert_flag) {
      if (is_return_statement(expr)) {
        add_nullary_instruction(RTN);
      } else if (
        toplevel &&
        (is_self_evaluating(expr) ||
          is_undefined_expression(expr) ||
          is_application(expr) ||
          is_primitive_application(expr))
      ) {
        add_nullary_instruction(RTN);
      } else {
        add_nullary_instruction(LDCU);
        max_stack_size = max_stack_size + 1;
        add_nullary_instruction(RTN);
      }
    } else {
    }
    return max_stack_size;
  }

  const program = parse(string);
  add_nullary_instruction(START);
  add_ternary_instruction(LDF, NaN, NaN, length(local_names(program)));
  const LDF_max_stack_size_address = insert_pointer - 3;
  const LDF_address_address = insert_pointer - 2;
  add_unary_instruction(CALL, 0);
  add_nullary_instruction(DONE);

  const locals = reverse(local_names(program));
  const program_names_index_table = accumulate(
    (s, it) => extend_index_table(it, s),
    make_empty_index_table(),
    locals
  );

  push_to_compile(
    make_to_compile_task(
      program,
      LDF_max_stack_size_address,
      LDF_address_address,
      program_names_index_table
    )
  );
  continue_to_compile();
  return machine_code;
}

// VIRTUAL MACHINE WITH CHENEY GARBAGE COLLECTOR

// "registers" are the global variables of our machine.
// These contain primitive values (numbers or boolean
// values) or arrays of primitive values

// P is an array that contains an SVML machine program:
// the op-codes of instructions and their arguments
let P = [];
// PC is program counter: index of the next instruction
let PC = -Infinity;
// OS is address of current environment in HEAP; initially a dummy value
let ENV = -Infinity;
// OS is address of current operand stack in HEAP; initially a dummy value
let OS = -Infinity;
// temporary value, used by PUSH and POP; initially a dummy value
let RES = -Infinity;

// RTS: runtime stack
let RTS = [];
let TOP_RTS = -1;

// boolean that says whether machine is running
let RUNNING = NaN;

// exit state: NORMAL, DIV_ERROR, OUT_OF_MEMORY_ERROR, etc
let STATE = NaN;

// //////////////////////////////
// some general-purpose registers
// //////////////////////////////

let A = 0;
let B = 0;
let C = 0;
let D = 0;
let E = 0;
let F = 0;
let G = 0;
let H = 0;
let I = 0; // loop counter
let J = 0;
let K = 0;
let L = 0;
let N = 0;

function show_executing(s) {
  display(undefined, "--- RUN ---" + s);
  display(PC, "PC :");
  display(get_name(P[PC]), "instr:");
}

// for debugging: show all registers
function show_registers(s) {
  show_executing(s);
  display(undefined, "--- REGISTERS ---");
  display(RES, "RES:");
  display(A, "A  :");
  display(B, "B  :");
  display(C, "C  :");
  display(D, "D  :");
  display(E, "E  :");
  display(F, "F  :");
  display(G, "G  :");
  display(H, "H  :");
  display(I, "I  :");
  display(J, "J  :");
  display(K, "K  :");
  display(L, "L  :");
  display(N, "N  :");
  display(BUMP_HEAD, "BUMP_HEAD  :");
  display(BUMP_TAIL, "BUMP_TAIL  :");
  display(OS, "OS :");
  display(ENV, "ENV:");
  display(RTS, "RTS:");
  display(TOP_RTS, "TOP_RTS:");
}

// HEAP is array containing all dynamically allocated data structures
let HEAP = NaN;
// bump allocator pointers
let BUMP_HEAD = -Infinity; // for insertion
let BUMP_TAIL = -Infinity; // for free line size checking
// scan pointer in Immix
let SCAN = -Infinity;
// flag to indicate when overflow allocation was used
let OVERFLOW = false;
// the size of the heap is fixed
let HEAP_SIZE = -Infinity;
// smallest heap address
let HEAPBOTTOM = -Infinity;

// general node layout
const TAG_SLOT = 0;
const SIZE_SLOT = 1;
const FIRST_CHILD_SLOT = 2;
const LAST_CHILD_SLOT = 3;
const MARK_SLOT = 4;

// ///////////////////////////////////
// Immix Mark-Region Garbage Collector
// ///////////////////////////////////
// Mark-Region Garbage Collection is a modern granular garbage collection algorithm that has similar characteristics
// of both Mark-and-Sweep and Copying algorithms, yet performing better than both in a large heap space.
// TODO: Detail documentation at: https://github.com/source-academy/source-programs/wiki/

// General metadata for Immix Garbage Collector
// In Immix, usually a 2.5% of the blocks are reserved in the Headroom for evacuation, similar to Cheney's copying
// algorithm, but much less than 50%. In this mimicked version of Immix, we allocate 1 block for evacuation.
// initialize header info for Mark-Region algorithm
let NUMBER_OF_BLOCKS = -Infinity;
let HEADROOM_BLOCK = -Infinity;
// address of current working block
let CURR_BLOCK = -Infinity;
// address of meta data of current working line
let CURR_LINE = -Infinity;

// initialize machine with heapsize, number of blocks in heap, and number of lines in each block
function initialize_machine(linesize, linenumber, blocknumber) {
  HEAP = [];
  LINE_SIZE = linesize;
  NUM_OF_LINES_PER_BLOCK = linenumber;
  NUMBER_OF_BLOCKS = blocknumber;
  BLOCK_SIZE = (linesize + LINE_BK_SIZE) * NUM_OF_LINES_PER_BLOCK + BLOCK_BK_SIZE;
  HEAP_SIZE = BLOCK_SIZE * blocknumber;
  // display(HEAP_SIZE, "\nRunning VM with heap size:");
  // display(linesize * linenumber * blocknumber, "\nEffective memory size:");
  HEAPBOTTOM = 0;
  INITIALIZE_BLOCKS_AND_LINES();
  TEMP_ROOT = -1;
  RUNNING = true;
  STATE = NORMAL;
  PC = 0;
}

// succinct helper function to ensure that all blocks are occupied
function all_blocks_occupied() {
  for (let i = 0; i < NUMBER_OF_BLOCKS; i = i + 1) {
    const state = HEAP[i * BLOCK_SIZE + BLOCK_STATE_SLOT];
    if (state === FREE || state === RECYCLABLE) {
      return false;
    } else {}
  }
  return true;
}

// We introduce TEMP_ROOT register to handle instructions
// that allocate nodes on the heap and then may flip.
// The address of those nodes are assigned to TEMP_ROOT.
// TEMP_ROOT is treated as a root in garbage collection,
// and thus gets updated to point to the correct copy in
// the to-space.
let TEMP_ROOT = -Infinity;

// NEW expects tag in A and size in B
// changes A, B, C, J, K
function NEW() {
  const trace_root = list("Allocating new node " + node_kind(A) + " of size " + stringify(B));
  J = A;
  K = B;
//   visualize_heap('============================================================================================START' + stringify(A) + stringify(B));
  if (BUMP_HEAD + K > BUMP_TAIL) {
    assert_false(OVERFLOW, "bump and head pointers should be at free block", list("OVERFLOW ALLOCATION: NEW()"));
    // if the hole is too small for the new node
    GET_FREE_BLOCK();
    assert_valid_node(OS, pair("first check", trace_root));
    if (K > LINE_SIZE && RES !== NO_BLOCK_FOUND) {
      // use overflow allocator
      return ALLOCATE_OVERFLOW();
    } else {
      // set bump_head block to occupied
    }

    A = BUMP_HEAD - 1; // possible for BUMP_HEAD to overflow into next block if block is fully filled
    GET_BLOCK();
    HEAP[RES + BLOCK_STATE_SLOT] = OCCUPIED;
    ALLOCATE_TO_RECYCLABLE();
  } else {}

  if (BUMP_HEAD + K > BUMP_TAIL) {
    assert_false(OVERFLOW, "bump and head pointers should be at free block", list("OVERFLOW ALLOCATION: NEW()"));
    GET_FREE_BLOCK();
    if (RES === NO_BLOCK_FOUND) {
      // mark and granular sweep
      MARK();
      assert_valid_node(OS, pair("after mark", trace_root));
      FREE_REGION();
      unmark_all();
      assert_valid_node(OS, pair("after free", trace_root));
    } else {
      ALLOCATE_TO_FREE();
    }
  } else {}

  // if still no space for allocation
  if (BUMP_HEAD + K > BUMP_TAIL || all_blocks_occupied()) {
    STATE = OUT_OF_MEMORY_ERROR;
    RUNNING = false;
    error("reached oom");
  } else {}

  HEAP[BUMP_HEAD + TAG_SLOT] = J;
  HEAP[BUMP_HEAD + SIZE_SLOT] = K;
  HEAP[BUMP_HEAD + MARK_SLOT] = UNMARKED;

  // update line limits
  A = BUMP_HEAD;
  const line = ref_get_line(A, list("line 924"));
  GET_LINE();
  assert_same(line, RES, trace_root);
  A = RES;
  GET_BLOCK();

  // loop through all lines and set line limits
  while (A <= RES + HEAP[RES + LAST_CHILD_SLOT] &&
         HEAP[A + LINE_ADDRESS_SLOT] + LINE_SIZE <
         BUMP_HEAD + K) {
    // lines are filled
    HEAP[A + LINE_LIMIT_SLOT] = HEAP[A + LINE_ADDRESS_SLOT] + LINE_SIZE;
    A = A + LINE_BK_SIZE;
  }
  // update the last line to the actual occupied size
  HEAP[A + LINE_LIMIT_SLOT] = BUMP_HEAD + K;

  // set block state
  HEAP[RES + BLOCK_STATE_SLOT] = RECYCLABLE;
  // return
  RES = BUMP_HEAD;
  assert_unfree(RES, trace_root);
  BUMP_HEAD = BUMP_HEAD + K;
  LIVE_NODES = ref_mark(trace_root);
  
}

// Finds next recyclable block, if none available, find next free block
// Returns address of block if found, else NO_BLOCK_FOUND
function GET_NEXT_BLOCK() {
  GET_NEXT_RECYCLABLE_BLOCK();
  if (RES === NO_BLOCK_FOUND) {
    GET_FREE_BLOCK();
  } else {}
}

// expects free/recyclable block address in A
// Finds first hole and sets bump head and bump tail
function ALLOCATE_BUMP_HEAD_AND_TAIL() {
  if (HEAP[A + BLOCK_STATE_SLOT] === FREE) {
    BUMP_HEAD = HEAP[A + HEAP[A + FIRST_CHILD_SLOT]];
    BUMP_TAIL = A + BLOCK_SIZE;
  } else {
    // finds a hole (one or more free lines) and allocate new bump head and tail
    SCAN = A + HEAP[A + FIRST_CHILD_SLOT];
    while (SCAN <= A + HEAP[A + LAST_CHILD_SLOT]) {
      // if line is free/empty
      if (HEAP[SCAN + LINE_LIMIT_SLOT] === HEAP[SCAN + LINE_ADDRESS_SLOT]) {
        // set bump head to start of line
        BUMP_HEAD = HEAP[SCAN + LINE_ADDRESS_SLOT];
        ALLOCATE_BUMP_TAIL();
        break;
      } else {
        SCAN = SCAN + LINE_BK_SIZE;
      }
    }
  }
}

// requirement to clear object markings 
let MARK_STACK = [];
let TOP_MARK = -1;

function push_stack(i) {
    TOP_MARK = TOP_MARK + 1;
    MARK_STACK[TOP_MARK] = i;
}

function pop_stack() {
    TOP_MARK = TOP_MARK - 1;
    return MARK_STACK[TOP_MARK + 1];
}

function unmark_all() {
    while (TOP_MARK >= 0) {
        const ptr = pop_stack();
        HEAP[ptr + MARK_SLOT] = UNMARKED;
    }
    MARK_STACK = [];
}

/**
 * Assertions and reference implementations 
 * FOR DEBUGGING
 */

let LIVE_NODES = list();

function assert_true(bool, msg, stack) {
    if (bool) {
        // yay 
    } else {
        visualize_heap("");
        show_registers("");
        display(stack);
        error(msg);
    }
}

function assert_false(bool, msg, stack) {
    return assert_true(!bool, msg, stack);
}

function assert_same(v1, v2, stack) {
    return assert_true(v1 === v2, 
                       "v1: " + stringify(v1) + " and v2: " + stringify(v2) + " are not the same", 
                       stack);
}

function assert_same_as_ref(v1, ref_wrapper, stack) {
    const new_stack = pair("assert_same_as_ref", stack);
    return assert_same(v1, ref_wrapper(stack), new_stack);
}

/**
 * Reference implemntation for the mark algorithm, returns a list of all live nodes
 * @param {list} stack list of current executions
 */
function ref_mark(stack) {
    const new_stack = pair("MARKING_REFERENCE", stack);
    let marked = list();
    function dfs(node_address, stack) {
        const dfs_stack = pair("currently on: " + stringify(node_address), stack);
        assert_valid_address(node_address, dfs_stack);
        marked = pair(node_address, marked);
        const first_child_index = HEAP[node_address + FIRST_CHILD_SLOT];
        const last_child_index = HEAP[node_address + LAST_CHILD_SLOT];
        for (let i = first_child_index; i < last_child_index; i = i + 1) {
            const child_address = HEAP[node_address + i];
            if (child_address !== undefined && length(member(child_address, marked)) === 0) {
                dfs(child_address, dfs_stack);
            } else {}
        }
    }
    const rts_list = build_list(OVERFLOW ? TOP_RTS - 2 : TOP_RTS, i => RTS[i]);
    const roots = pair(OS, pair(ENV, rts_list));
    map(a => a < 0 ? "not initialized" : dfs(a, new_stack), TEMP_ROOT === -1 ? roots : pair(TEMP_ROOT, roots));
    return marked;
}

function assert_valid_address(address, stack) {
    const new_stack = pair("assert address in addressable space: " + stringify(address), stack);
    assert_false(address === undefined, "node is undefined", new_stack);
    const block_address = math_floor(address / BLOCK_SIZE) * BLOCK_SIZE;
    const start = block_address + BLOCK_BK_SIZE + NUM_OF_LINES_PER_BLOCK * LINE_BK_SIZE;
    const end = block_address + BLOCK_SIZE;
    assert_true(start <= address && address < end,
                "not in addressable space",
                new_stack);
}

function assert_valid_node(node_address, stack) {
    const new_stack = pair("assert node " + stringify(node_address) + " must not have undefined or unaddressable children",
                            stack);
    assert_false(node_address === undefined, "node is undefined", new_stack);
    if (is_leaf_node(node_address)) {
        const leaf_stack = pair("node identified as leaf", new_stack);
        const size = HEAP[node_address + SIZE_SLOT];
        for (let i = 0; i < size; i = i + 1) {
            assert_false(HEAP[node_address + i] === undefined, "address " + stringify(node_address + i) + " is undefined", leaf_stack);
        }
    } else {
        const branch_stack = pair("node not leaf", new_stack);
        const firstchild = HEAP[node_address + FIRST_CHILD_SLOT];
        const lastchild = HEAP[node_address + LAST_CHILD_SLOT];
        for (let i = firstchild; i < lastchild; i = i + 1) {
            assert_valid_address(HEAP[node_address + i], branch_stack);
        }
    }
}

function is_leaf_node(node) {
    return node === BOOL_TAG || node === UNDEFINED_TAG || node === NUMBER_TAG;
}

function ref_get_block(address, stack) {
    const new_stack = pair("getting block address of: ", stringify(address), stack);
    assert_true(0 <= address && address < HEAP_SIZE, "address supplied not in heapspace", new_stack);
    return math_floor(address / BLOCK_SIZE) * BLOCK_SIZE;
}

function ref_get_line(address, stack) {
  const new_stack = pair("getting line address of: ", stringify(address),
                         stack);
  assert_valid_address(address, new_stack);
  const block_address = ref_get_block(address, new_stack);
  const start = block_address + BLOCK_BK_SIZE + NUM_OF_LINES_PER_BLOCK * LINE_BK_SIZE;
  const line_no = (address - start) / LINE_SIZE;
  const line_address = math_floor(line_no) * LINE_BK_SIZE + block_address + BLOCK_BK_SIZE;
//   display("line address result", line_address);
  return line_address;
}

function copy_rts(top) {
    let copy = [];
    for (let i = 0; i <= top; i = i + 1) {
        copy[i] = RTS[i];
    }
    return copy;
}

/**
 * Ensures that RTS stack has not been modified since ~copy~
 * @param {array} copy array of duplicated stack before changes
 * @param {array} stack current RTS array
 */
function assert_rts(copy, stack) {
    const new_stack = pair("ensuring rts did not change since last snapshot: ", stack);
    assert_same(array_length(copy), TOP_RTS + 1, new_stack);
    for (let i = 0; i < TOP_RTS; i = i + 1) {
        assert_same(copy[i], RTS[i], new_stack);
    }
}

function assert_lines_marked(node_address, stack) {
    const new_stack = pair("assert lines marked for node: " + stringify(node_address), stack);
    const size = HEAP[node_address + SIZE_SLOT];
    for (let i = 0; i < size; i = i + 1) {
        const line_address = ref_get_line(node_address + i, new_stack);
        assert_marked(LINE_MARK_SLOT, line_address, new_stack);
    }
}

function assert_marked(mark_offset, address, stack) {
    const new_stack = pair("assert mark slot of address: " + stringify(address) + " is marked", stack);
    assert_true(HEAP[address + mark_offset] === MARKED, 
                "object is not marked",
                new_stack);
}

function assert_node_marked(node_address, stack) {
  const new_stack = pair("assert node: " + stringify(node_address) + " is marked", stack);
  assert_marked(MARK_SLOT, node_address, new_stack);
  assert_lines_marked(node_address, new_stack);
  const block_address = ref_get_block(node_address, new_stack);
  assert_marked(MARK_SLOT, block_address, new_stack);
}

/**
 * Make sures that the block and lines of a node is not free 
 * @param {number} address Address of the node in the HEAP
 * @param {list} stack stacktrace stack
 */
function assert_unfree(address, stack) {
    const new_stack = pair("assert node at " + stringify(address) + " should not be free", stack);
    const block_address = ref_get_block(address, new_stack);
    assert_false(HEAP[block_address + BLOCK_STATE_SLOT] === FREE, "the block of this node should not be free", new_stack);
    const size = HEAP[address + SIZE_SLOT];
    for (let i = 0; i < size; i = i + 1) {
        const line_address = ref_get_line(address + i, new_stack);
        const msg = "line limit of " + stringify(line_address) + " should not be smaller than live node";
        assert_true(address + i < HEAP[line_address + LINE_LIMIT_SLOT], 
            msg, new_stack);
    }
}

// Changes A, B, C, I, SCAN
function MARK() {
  const trace_root = list("START TRACE: MARK()");
  const rts_copy = copy_rts(TOP_RTS);
  // keep old TOP_RTS to prevent deleting stacks
  B = TOP_RTS;
  // init roots for dfs
  for (I = 0; I <= B; I = I + 1) {
    A = RTS[I]; // add all rts stacks
    PUSH_RTS();
  }
  A = OS;
  PUSH_RTS(); // add current os
  A = ENV;
  PUSH_RTS(); // add current env
  if (TEMP_ROOT !== -1) {
    A = TEMP_ROOT;
    PUSH_RTS();
  } else {}

  const live_nodes = ref_mark(trace_root);

  while (B < TOP_RTS) {
    POP_RTS();
    SCAN = RES;
    // mark node if unmarked
    if (HEAP[SCAN + MARK_SLOT] === MARKED) {
      continue;
    } else {
      HEAP[SCAN + MARK_SLOT] = MARKED;
      push_stack(SCAN);
    }
    // mark node's block
    CURR_BLOCK = math_floor(SCAN / BLOCK_SIZE) * BLOCK_SIZE;
    HEAP[CURR_BLOCK + MARK_SLOT] = MARKED;

    A = SCAN;
    GET_LINE();
    // assertions
    const get_line_wrapper = stack => ref_get_line(SCAN, pair("line 1125", stack));
    assert_same_as_ref(RES, get_line_wrapper, pair("assert line address of node: " + stringify(SCAN), trace_root));

    A = RES; // mark node's start line to end line
    while (A <= CURR_BLOCK + HEAP[CURR_BLOCK + LAST_CHILD_SLOT] &&
           HEAP[A + LINE_ADDRESS_SLOT] <= SCAN + HEAP[SCAN + SIZE_SLOT]) {
      HEAP[A + LINE_MARK_SLOT] = MARKED;
      A = A + LINE_BK_SIZE;
    }
    assert_lines_marked(SCAN, pair("line 1137", trace_root));

    for (
      I = HEAP[SCAN + FIRST_CHILD_SLOT];
      I <= HEAP[SCAN + LAST_CHILD_SLOT];
      I = I + 1
    ) {
      // child is invalid or not yet loaded
      if (HEAP[SCAN + I] === undefined) { continue; } else {}

      A = HEAP[SCAN + I]; // address of child
      GET_LINE();
      A = HEAP[SCAN + I]; // address of child

      // child is not marked 
      if (HEAP[A + MARK_SLOT] !== MARKED) {
        PUSH_RTS();
      } else {}
    }
  }
  map(add => assert_node_marked(add, trace_root), live_nodes);
  assert_rts(rts_copy, pair("line 1149, ", trace_root));
}

// expects hole-size in K
function FREE_REGION() {
    const trace_root = list("TRACE START: FREE_REGION()");
  // granular collection
  // free blocks
  const live_nodes = ref_mark(trace_root);

  for (I = 0; I < NUMBER_OF_BLOCKS; I = I + 1) {
    if (HEAP[I * BLOCK_SIZE + MARK_SLOT] === UNMARKED) {
      // if block is not MARKED, set state to FREE
      HEAP[I * BLOCK_SIZE + BLOCK_STATE_SLOT] = FREE;
    } else {
      // assume OCCUPIED
      HEAP[I * BLOCK_SIZE + BLOCK_STATE_SLOT] = OCCUPIED;

      // free lines in non-free block
      for (
        // line pseudo node address in SCAN
        SCAN = I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + FIRST_CHILD_SLOT];
        SCAN < I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + LAST_CHILD_SLOT];
        SCAN = SCAN + LINE_BK_SIZE
      ) {
        if (HEAP[SCAN + LINE_MARK_SLOT] === UNMARKED) {
          // free line that is not marked
          HEAP[SCAN + LINE_LIMIT_SLOT] = HEAP[SCAN + LINE_ADDRESS_SLOT];
          // set block to recyclable
          HEAP[I * BLOCK_SIZE + BLOCK_STATE_SLOT] = RECYCLABLE;
        } else {}
        // unmark line
        HEAP[SCAN + LINE_MARK_SLOT] = UNMARKED;
      }
    }
    // unmark whole block
    HEAP[I * BLOCK_SIZE + MARK_SLOT] = UNMARKED;
  }
  map(a => assert_unfree(a, trace_root), live_nodes);

  // finds a hole of at least k size and allocate new bump head and tail
  ALLOCATE_TO_RECYCLABLE();
  // if hole found still too small, allocate to a free block
  if (BUMP_HEAD + K > BUMP_TAIL) {
    ALLOCATE_TO_FREE();
  } else {}
}

// choose k-sized hole from ALL recyclable blocks
// if hole large enough isn't found, bump head and tail will be last hole.
function ALLOCATE_TO_RECYCLABLE() {
  for (I = 0; I < NUMBER_OF_BLOCKS; I = I + 1) {
    if ( // if block is free or recyclable,
      HEAP[I * BLOCK_SIZE + BLOCK_STATE_SLOT] === RECYCLABLE
    ) {
      // find k-sized hole
      SCAN = I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + FIRST_CHILD_SLOT];
      while (SCAN <= I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + LAST_CHILD_SLOT]) {
        // if line is free/empty
        if (HEAP[SCAN + LINE_LIMIT_SLOT] === HEAP[SCAN + LINE_ADDRESS_SLOT]) {
          // set bump head to end of previous line
          BUMP_HEAD = SCAN === I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + FIRST_CHILD_SLOT] // if first line
            ? HEAP[SCAN + LINE_ADDRESS_SLOT]
            : HEAP[SCAN - LINE_BK_SIZE + LINE_LIMIT_SLOT];
          ALLOCATE_BUMP_TAIL();

          if (BUMP_HEAD + K <= BUMP_TAIL) {
            return undefined;
          } else {
            A = BUMP_TAIL - 1;
            GET_LINE();
            SCAN = RES + LINE_BK_SIZE; // get previous line but increment manually
          }
        } else {
          SCAN = SCAN + LINE_BK_SIZE;
        }
      }
    } else {}
  }
}

// find first free block and set BUMP_HEAD and BUMP_TAIL immediately
// if no free blocks, BUMP_HEAD and BUMP_TAIL remain as previous
function ALLOCATE_TO_FREE() {
  for (I = 0; I < NUMBER_OF_BLOCKS; I = I + 1) {
    if (HEAP[I * BLOCK_SIZE + BLOCK_STATE_SLOT] === FREE) {
      BUMP_HEAD = HEAP[I * BLOCK_SIZE + HEAP[I * BLOCK_SIZE + FIRST_CHILD_SLOT]];
      BUMP_TAIL = I * BLOCK_SIZE + BLOCK_SIZE;
      break;
    } else {}
  }
}

let old_bumphead = -Infinity;
let old_bumptail = -Infinity;
function ALLOCATE_OVERFLOW() {
  old_bumphead = BUMP_HEAD;
  old_bumptail = BUMP_TAIL;
  OVERFLOW = true;
  A = BUMP_HEAD;
  PUSH_RTS();
  A = BUMP_TAIL;
  PUSH_RTS();
  ALLOCATE_TO_FREE();
  // since bump head and tail are at free block, new node is guaranteed to load properly
  A = J;
  NEW();
}

// Expects old RES in A
function RESTORE_BUMP_PTRS() {
  // restore old bump head and tail values if
  // overflow allocation was used
  // else does nothing
  if (OVERFLOW) {
    POP_RTS();
    BUMP_TAIL = RES;
    POP_RTS();
    BUMP_HEAD = RES;
    OVERFLOW = false;
    assert_true(old_bumphead === BUMP_HEAD, "bump head pointer not restored", list("restore ptrs"));
    assert_true(old_bumptail === BUMP_TAIL, "bump tail pointer not restored", list("restore ptrs"));
    old_bumphead = -Infinity;
    old_bumptail = -Infinity;
  } else {}
  RES = A;
}

// finds bump tail based on bump_head
// changes A
function ALLOCATE_BUMP_TAIL() {
  A = BUMP_HEAD;
  GET_LINE();
  // assuming line of bump head may be occupied, start from next line from bump head
  A = BUMP_HEAD === HEAP[RES + LINE_ADDRESS_SLOT] ? RES : RES + LINE_BK_SIZE; // line node address in A
  GET_BLOCK();
  while (A <= RES + HEAP[RES + LAST_CHILD_SLOT] &&
         HEAP[A + LINE_ADDRESS_SLOT] === HEAP[A + LINE_LIMIT_SLOT]) {
    A = A + LINE_BK_SIZE;
  }
  // A should be first occupied line / line after last free line
  BUMP_TAIL = HEAP[A - LINE_BK_SIZE + LINE_ADDRESS_SLOT] + LINE_SIZE;
}

// expects object address in A
// returns block node address in RES
function GET_BLOCK() {
  RES = math_floor(A / BLOCK_SIZE) * BLOCK_SIZE;
}

// expects object address in A
// returns line node address in RES
function GET_LINE() {
  C = math_floor(A / BLOCK_SIZE) * BLOCK_SIZE;                 // block address in C
  // find offset from start of block
  RES = HEAP[C + HEAP[C + FIRST_CHILD_SLOT] + LINE_ADDRESS_SLOT]; // start of addressable space in RES
  A = math_floor((A - RES) / LINE_SIZE);                       // line offset number in A
  RES = C + HEAP[C + FIRST_CHILD_SLOT] + A * LINE_BK_SIZE;            // line node address in RES
  // debugging
  if (RES < 0) {
    error(RES, "negative line number");
  } else {}
}

// use tag slot as forwarding address;
// the trick: since tags are negative, they
// can never be confused with heap addresses
const FORWARDINGADDRESS = 0;

// Creates NUMBER_OF_BLOCKS blocks starting from HEAP_BOTTOM,
// sets CURR_BLOCK to HEAP_BOTTOM, CURR_LINE to first child address
// Changes A, B, BUMP_HEAD, BUMP_TAIL
function INITIALIZE_BLOCKS_AND_LINES() {
  // populate the heap space with blocks
  A = HEAPBOTTOM;
  for (I = 0; I < NUMBER_OF_BLOCKS; I = I + 1) {
    NEW_BLOCK();
    A = B;
  }
  HEADROOM_BLOCK = RES; // last block dedicated as Headroom
  CURR_BLOCK = HEAPBOTTOM;
  CURR_LINE = CURR_BLOCK + FIRST_CHILD_SLOT;

  // reallocate bump pointers for actual use
  BUMP_HEAD = HEAP[HEAP[CURR_BLOCK + FIRST_CHILD_SLOT]];
  BUMP_TAIL = CURR_BLOCK + BLOCK_SIZE; // bump_tail is EXCLUSIVE
}

// machine states

const NORMAL = 0;
const DIV_ERROR = 1;
const OUT_OF_MEMORY_ERROR = 2;

// NODEs available so far (v0.1)
//
// number node (-100)
// bool node (-101)
// environment node (-102)
// closure node (-103)
// stackframe node (-104)
// operandstack node (-105)
// undefined node (-106)
// block node (-107)

// state of line and block
const OCCUPIED = 0;
const RECYCLABLE = 1;
const FREE = 2;
const HEADROOM = 3; // special state so that global allocator skips this block

// Liveness of line and block
const UNMARKED = 0;
const MARKED = 1;

// ** BLOCK NODE DESIGN **
//
// Immix GC partitions the heap space of a program into large size blocks in order to achieve granular collection and,
// at the same time, not to waste as much space as copying algorithm like Cheney's. A block in Immix has three states:
// free (all lines are free), recyclable (some but not all lines are free) and occupied (all lines are occupied).
// It utilizes fast bump allocation to get free hole (one or more lines) in either a free or recyclable block to achieve
// fast allocation.
//
// Since Immix allows multi-line allocation but not multi-block allocation,
// the block exists as an actual node that demarcates the block region,
// and the lines exist as virtual nodes whose metadata is stored at the block header
//
// block nodes layout
//
// 0: tag  = -107
// 1: size = total size of block
// 2: offset of first child from the tag: 6
// 3: offset of last child from the tag: (NUM_OF_LINES_PER_BLOCK - 1) * LINE_BK_SIZE (3)
// 4: mark (free: 0, occupied: 1)
// 5: block state (occupied: 0, recyclable: 1, free: 2)
// 6: line 0 address
// 7: line 0 mark bit (marked: 1, unmarked: 0)
// 8: line 0 start of free address (for block occupancy profiling purpose)
// 9: line 1 address
// ...
// NUM_OF_LINES_PER_BLOCK * LINE_BK_SIZE + BLOCK_BK_SIZE: start of line 0 usable memory

const BLOCK_TAG = -107;
const BLOCK_BK_SIZE = 6; // size of book keeping entries
let NUM_OF_LINES_PER_BLOCK = -Infinity;
let BLOCK_SIZE = -Infinity; // actual size of the block
const BLOCK_STATE_SLOT = 5;
const NO_BLOCK_FOUND = -1;

// virtual line nodes
const LINE_BK_SIZE = 3;
const LINE_ADDRESS_SLOT = 0;
const LINE_MARK_SLOT = 1;
const LINE_LIMIT_SLOT = 2; // limit address === next line's start address if current line is full
let LINE_SIZE = -Infinity;

// Allocates new block at the start of the program (initialization)
//
// Expects root address in A
// changes A, B
// Final: RES = block address, B = last address + 1
function NEW_BLOCK() {
  HEAP[A] = BLOCK_TAG;
  HEAP[A + SIZE_SLOT] = BLOCK_SIZE;
  HEAP[A + FIRST_CHILD_SLOT] = 6;
  HEAP[A + LAST_CHILD_SLOT] = 6 + (NUM_OF_LINES_PER_BLOCK - 1) * LINE_BK_SIZE;
  HEAP[A + MARK_SLOT] = UNMARKED; // mark slot will be used for mark status
  HEAP[A + BLOCK_STATE_SLOT] = FREE; // state slot will be used for determining to skip objects or not.

  // store line address in B
  B = A + HEAP[A + LAST_CHILD_SLOT] + LINE_BK_SIZE;
  // initialize line metadata
  for (let i = 0; i < NUM_OF_LINES_PER_BLOCK; i = i + 1) {
    C = A + HEAP[A + FIRST_CHILD_SLOT] + i * LINE_BK_SIZE; // C points at the virtual line node
    HEAP[C + LINE_ADDRESS_SLOT] = B;
    HEAP[C + LINE_MARK_SLOT] = UNMARKED;
    HEAP[C + LINE_LIMIT_SLOT] = B; // no occupied data yet
    // update address to next line
    B = B + LINE_SIZE;
  }
  // B is now pointing at end of the block
  RES = A;
}

// Returns the address of the first free block scanning from the first block
function GET_FREE_BLOCK() {
  RES = NO_BLOCK_FOUND;
  for (let i = 0; i < NUMBER_OF_BLOCKS; i = i + 1) {
    // if no block is recyclable
    if (HEAP[i * BLOCK_SIZE + BLOCK_STATE_SLOT] === FREE) {
      RES = BLOCK_SIZE * i;
      break;
    } else {}
  }
}

// Returns the address of the first recyclable block scanning from the first block
function GET_NEXT_RECYCLABLE_BLOCK() {
  RES = NO_BLOCK_FOUND;
  for (let i = 0; i < NUMBER_OF_BLOCKS; i = i + 1) {
    // if no block is recyclable
    if (HEAP[i * BLOCK_SIZE + BLOCK_STATE_SLOT] === RECYCLABLE) {
      RES = BLOCK_SIZE * i;
      break;
    } else {}
  }
}

// number nodes layout
//
// 0: tag  = -100
// 1: size = 6
// 2: offset of first child from the tag: 6 (no children)
// 3: offset of last child from the tag: 5 (must be less than first)
// 4: mark slot
// 5: value

const NUMBER_TAG = -100;
const NUMBER_SIZE = 6;
const NUMBER_VALUE_SLOT = 5;

// expects number in A
// changes A, B, C, D, E, J, K
function NEW_NUMBER() {
  E = A;
  A = NUMBER_TAG;
  B = NUMBER_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = 6;
  HEAP[RES + LAST_CHILD_SLOT] = 5; // no children
  HEAP[RES + NUMBER_VALUE_SLOT] = E;
  A = RES;
  RESTORE_BUMP_PTRS();
}

// bool nodes layout
//
// 0: tag  = -101
// 1: size = 5
// 2: offset of first child from the tag: 6 (no children)
// 3: offset of last child from the tag: 5 (must be less than first)
// 4: mark slot
// 5: value

const BOOL_TAG = -101;
const BOOL_SIZE = 6;
const BOOL_VALUE_SLOT = 5;

// expects boolean in A
// changes A, B, C, D, E, J, K
function NEW_BOOL() {
  E = A;
  A = BOOL_TAG;
  B = BOOL_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = 6;
  HEAP[RES + LAST_CHILD_SLOT] = 5; // no children
  HEAP[RES + BOOL_VALUE_SLOT] = E;
  A = RES;
  RESTORE_BUMP_PTRS();
}

// undefined nodes layout
//
// 0: tag  = -106
// 1: size = 5
// 2: offset of first child from the tag: 5 (no children)
// 3: offset of last child from the tag: 4 (must be less than first)
// 4: mark slot

const UNDEFINED_TAG = -106;
const UNDEFINED_SIZE = 5;

// changes A, B, C, D, J, K
function NEW_UNDEFINED() {
  A = UNDEFINED_TAG;
  B = UNDEFINED_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = 5;
  HEAP[RES + LAST_CHILD_SLOT] = 4; // no children
  A = RES;
  RESTORE_BUMP_PTRS();
}

// operandstack nodes layout
//
// 0: tag  = -105
// 1: size = maximal number of entries + 4
// 2: first child slot = 5
// 3: last child slot = current top of stack; initially 4 (empty stack)
// 4: mark slot
// 5: first entry
// 6: second entry
// ...

const OS_TAG = -105;

// expects max size in A
// changes A, B, C, D, E, J, K
function NEW_OS() {
  E = A;
  A = OS_TAG;
  B = E + 5;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = 5;
  // operand stack initially empty
  HEAP[RES + LAST_CHILD_SLOT] = 4;
  A = RES;
  RESTORE_BUMP_PTRS();
}

// PUSH and POP are convenient subroutines that operate on
// the operand stack OS

// expects its argument in A
// changes A, B
function PUSH_OS() {
  B = HEAP[OS + LAST_CHILD_SLOT]; // address of current top of OS
  B = B + 1;
  HEAP[OS + LAST_CHILD_SLOT] = B; // update address of current top of OS
  HEAP[OS + B] = A;
}

// POP puts the top-most value into RES
// changes B
function POP_OS() {
  B = HEAP[OS + LAST_CHILD_SLOT]; // address of current top of OS
  HEAP[OS + LAST_CHILD_SLOT] = B - 1; // update address of current top of OS
  RES = HEAP[OS + B];
}

// closure nodes layout
//
// 0: tag  = -103
// 1: size = 8
// 2: offset of first child from the tag: 7 (only environment)
// 3: offset of last child from the tag: 7
// 4: mark slot
// 5: stack size = max stack size needed for executing function body
// 6: address = address of function
// 7: environment
// 8: extension count = number of entries by which to extend env

const CLOSURE_TAG = -103;
const CLOSURE_SIZE = 9;
const CLOSURE_OS_SIZE_SLOT = 5;
const CLOSURE_ADDRESS_SLOT = 6;
const CLOSURE_ENV_SLOT = 7;
const CLOSURE_ENV_EXTENSION_COUNT_SLOT = 8;

// expects stack size in A, P address in B, environment extension count in C
// changes A, B, C, D, E, F, J, K
function NEW_CLOSURE() {
  D = A;
  E = B;
  F = C;
  A = CLOSURE_TAG;
  B = CLOSURE_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = CLOSURE_ENV_SLOT;
  HEAP[RES + LAST_CHILD_SLOT] = CLOSURE_ENV_SLOT;
  HEAP[RES + CLOSURE_OS_SIZE_SLOT] = D;
  HEAP[RES + CLOSURE_ADDRESS_SLOT] = E;
  HEAP[RES + CLOSURE_ENV_SLOT] = ENV;
  HEAP[RES + CLOSURE_ENV_EXTENSION_COUNT_SLOT] = F;
  A = RES;
  RESTORE_BUMP_PTRS();
}

// expects closure in A, environment in B
function SET_CLOSURE_ENV() {
  HEAP[A + CLOSURE_ENV_SLOT] = B;
}

// stackframe nodes layout
//
// 0: tag  = -104
// 1: size = 8
// 2: offset of first child from the tag: 6 (environment)
// 3: offset of last child from the tag: 7 (operand stack)
// 4: mark slot
// 5: program counter = return address
// 6: environment
// 7: operand stack

const RTS_FRAME_TAG = -104;
const RTS_FRAME_SIZE = 8;
const RTS_FRAME_PC_SLOT = 5;
const RTS_FRAME_ENV_SLOT = 6;
const RTS_FRAME_OS_SLOT = 7;

// expects current PC, ENV, OS in their registers
// changes A, B, C, D, J, K
function NEW_RTS_FRAME() {
  A = RTS_FRAME_TAG;
  B = RTS_FRAME_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = RTS_FRAME_ENV_SLOT;
  HEAP[RES + LAST_CHILD_SLOT] = RTS_FRAME_OS_SLOT;
  HEAP[RES + RTS_FRAME_PC_SLOT] = PC + 2; // next instruction!
  HEAP[RES + RTS_FRAME_ENV_SLOT] = ENV;
  HEAP[RES + RTS_FRAME_OS_SLOT] = OS;
  A = RES;
  RESTORE_BUMP_PTRS();
}

// expects stack frame in A
function PUSH_RTS() {
  TOP_RTS = TOP_RTS + 1;
  RTS[TOP_RTS] = A;
}

// places stack frame into RES
function POP_RTS() {
  RES = RTS[TOP_RTS];
  TOP_RTS = TOP_RTS - 1;
}

// environment nodes layout
//
// 0: tag  = -102
// 1: size = number of entries + 5
// 2: first child = 5
// 3: last child
// 4: mark slot
// 5: first entry
// 6: second entry
// ...

const ENV_TAG = -102;
const ENV_BK_SIZE = 5;

// expects number of env entries in A
// changes A, B, C, D, J, K
function NEW_ENVIRONMENT() {
  D = A;
  A = ENV_TAG;
  B = D + ENV_BK_SIZE;
  NEW();
  HEAP[RES + FIRST_CHILD_SLOT] = 5;
  HEAP[RES + LAST_CHILD_SLOT] = 4 + D;
  A = RES;
  const correct_ptr = RES;
  RESTORE_BUMP_PTRS();
  const ptr_from_restore = RES;
  assert_same(correct_ptr, ptr_from_restore, list("EXTEND ptr check"));
}

// expects env in A, by-how-many in B
// changes A, B, C, D
// Using TEMP_ROOT to make sure the
// origin on copying is updated when
// garbage collection happens in NEW_ENVIRONMENT
function EXTEND() {
  TEMP_ROOT = A;
  A = HEAP[A + SIZE_SLOT] - ENV_BK_SIZE + B;
  NEW_ENVIRONMENT();
  for (
    B = HEAP[TEMP_ROOT + FIRST_CHILD_SLOT];
    B <= HEAP[TEMP_ROOT + LAST_CHILD_SLOT];
    B = B + 1
  ) {
    HEAP[RES + B] = HEAP[TEMP_ROOT + B];
  }
  TEMP_ROOT = -1;
}

// debugging: show current heap
function is_node_tag(x) {
  return x !== undefined && x <= -100 && x >= -110;
}
function node_kind(x) {
  return x === NUMBER_TAG
    ? "number"
    : x === BOOL_TAG
    ? "bool"
    : x === CLOSURE_TAG
    ? "closure"
    : x === RTS_FRAME_TAG
    ? "RTS frame"
    : x === OS_TAG
    ? "OS"
    : x === ENV_TAG
    ? "environment"
    : x === UNDEFINED_TAG
    ? "undefined"
    : x === BLOCK_TAG
    ? "block"
    : " (unknown node kind)";
}
function show_heap(s) {
  const len = array_length(HEAP);
  let i = 0;
  display("--- HEAP --- " + s);
  while (i < len) {
    display(
      stringify(i) +
        ": " +
        stringify(HEAP[i]) +
        (is_number(HEAP[i]) && is_node_tag(HEAP[i])
         ? " (" + node_kind(HEAP[i]) + ")"
         : "")
    );
    i = i + 1;
  }
}

function show_node(address) {
  const tag = HEAP[address];
  const size = HEAP[address + SIZE_SLOT];
  display("======================");
  display(node_kind(tag), address);
  for (let i = 1; i < size; i = i + 1) {
    display(stringify(address + i) + ": " + stringify(HEAP[address + i]));
  }
  display("======================");
}

function show_heap_value(address) {
  return "result: heap node of type = " +
      node_kind(HEAP[address]) +
      ", value = " +
      stringify(HEAP[address + NUMBER_VALUE_SLOT]);
}

const thin_border = "-------------------------------------------";
const inner_border = "+++++++++++++++++++++++++++++++++++++++++++";
function visualize_heap(s) {
    display(s);
    display("============ VISUALIZER ===================");
    display("BLOCK LAYOUT");
    display("NO. OF LINES: " + stringify(NUM_OF_LINES_PER_BLOCK) +
            ", LINE SIZE: " + stringify(LINE_SIZE));
    display(thin_border);
    for (let i = 0; i < NUMBER_OF_BLOCKS; i = i + 1) {
        show_block(i * BLOCK_SIZE);
    }
}

function show_block(blkaddress) {
    display("BLOCK ADDR: " + stringify(blkaddress));
    display("STATE: " + blk_state(blkaddress) + ", " + mk_state(blkaddress));
    display(inner_border);
    // concatenate line status
    const first_line_addr = blkaddress + BLOCK_BK_SIZE;
    const last_line_addr = blkaddress + BLOCK_BK_SIZE + NUM_OF_LINES_PER_BLOCK * LINE_BK_SIZE;
    // display(thin_border);
    for (let i = first_line_addr; i < last_line_addr; i = i + LINE_BK_SIZE) {
        let top = line_header + stringify(i) + " ";
        let bottom = get_line_header(i);
        const padding = array_length(top) - array_length(bottom);
        if (padding < 0) {
            top = pad(top, -padding);
        } else {
            bottom = pad(bottom, padding);
        }
        show_line(i, top, bottom);
    }
    display(thin_border);
}

function get_line_header(i) {
    const line_limit = HEAP[i + LINE_LIMIT_SLOT];
    const occupancy = line_limit - HEAP[i];
    let display_text = "M:[" + (HEAP[i + LINE_MARK_SLOT] === MARKED ? "✓" : "✗") + "] | ";
    display_text = display_text + stringify(occupancy) + "/" + stringify(LINE_SIZE);
    return display_text;
}

function show_line(address, top, bottom) {
    let addr_acc = "| ";
    let value_acc = "| ";
    const end = HEAP[address + LINE_LIMIT_SLOT];
    for (let i = HEAP[address]; i < end; i = i + 1) {
        let a = stringify(i);
        let v = stringify(HEAP[i]);
        const padding = array_length(a) - array_length(v);
        if (padding < 0) {
            a = pad(a, -padding);
        } else {
            v = pad(v, padding);
        }
        addr_acc = addr_acc + a + " | ";
        value_acc = value_acc + v + " | ";
    }
    display(top + addr_acc);
    display(bottom + value_acc);
    return addr_acc + "\n" + value_acc;
}

function pad(str, v) {
    return v <= 0 ? str : pad_f(str + " ", v - 1);
}

function pad_f(str, v) {
    return v <= 0? str : pad(" " + str, v - 1);
}

function blk_state(blkaddress) {
    const states = ["OCCUPIED", "RECYCLABLE", "FREE", "HEADROOM"];
    return states[HEAP[blkaddress + BLOCK_STATE_SLOT]];
}

function mk_state(blkaddress) {
    const states = ["UNMARKED", "MARKED"];
    return states[HEAP[blkaddress + MARK_SLOT]];
}

const line_header = "LINE NO: ";

// SVMLa implementation

// We implement our machine with an array M that
// contains subroutines. Each subroutine implements
// a machine instruction, using a nullary function.
// The machine can then index into M using the op-codes
// of the machine instructions. To be implementable on
// common hardware, the subroutines have the
// following structure:
// * they have no parameters
// * they do not return any results
// * they do not have local variables
// * they do not call other functions except the
//   subroutines PUSH and POP
// * each line is very simple, for example an array access
// Ideally, each line can be implemented directly with a
// machine instruction of a real computer. In that case,
// the subroutines could become machine language macros,
// and the compiler could generate real machine code.

const M = [];

M[START] = () => {
  A = 1; // first OS only needs to hold one closure
  NEW_OS();
  OS = RES;
  A = 0; // first environment is empty
  NEW_ENVIRONMENT();
  ENV = RES;
  PC = PC + 1;
};

M[LDCN] = () => {
  A = P[PC + LDCN_VALUE_OFFSET];
  NEW_NUMBER();
  A = RES;
  PUSH_OS();
  PC = PC + 2;
};

M[LDCB] = () => {
  A = P[PC + LDCB_VALUE_OFFSET];
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 2;
};

M[LDCU] = () => {
  NEW_UNDEFINED();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[PLUS] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] + A;
  NEW_NUMBER();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[MINUS] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] - A;
  NEW_NUMBER();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[TIMES] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] * A;
  NEW_NUMBER();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[EQUAL] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] === A;
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[LESS] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] < A;
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[GEQ] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] >= A;
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[LEQ] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] <= A;
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[GREATER] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] > A;
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[NOT] = () => {
  POP_OS();
  A = !HEAP[RES + BOOL_VALUE_SLOT];
  NEW_BOOL();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
};

M[DIV] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  E = A;
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT] / A;
  NEW_NUMBER();
  A = RES;
  PUSH_OS();
  PC = PC + 1;
  E = E === 0;
  if (E) {
    STATE = DIV_ERROR;
    RUNNING = false;
  } else {
  }
};

M[POP] = () => {
  POP_OS();
  PC = PC + 1;
};

M[ASSIGN] = () => {
  POP_OS();
  HEAP[ENV + HEAP[ENV + FIRST_CHILD_SLOT] + P[PC + 1]] = RES;
  PC = PC + 2;
};

M[JOF] = () => {
  POP_OS();
  A = HEAP[RES + NUMBER_VALUE_SLOT];
  if (!A) {
    PC = P[PC + 1];
  } else {
  }
  if (A) {
    PC = PC + 2;
  } else {
  }
};

M[GOTO] = () => {
  PC = P[PC + 1];
};

M[LDF] = () => {
  A = P[PC + LDF_MAX_OS_SIZE_OFFSET];
  B = P[PC + LDF_ADDRESS_OFFSET];
  C = P[PC + LDF_ENV_EXTENSION_COUNT_OFFSET];
  NEW_CLOSURE();
  A = RES;
  PUSH_OS();
  PC = PC + 4;
};

M[LD] = () => {
  A = HEAP[ENV + HEAP[ENV + FIRST_CHILD_SLOT] + P[PC + 1]];
  PUSH_OS();
  PC = PC + 2;
};

M[CALL] = () => {
  G = P[PC + 1]; // lets keep number of arguments in G
  // we peek down OS to get the closure
  F = HEAP[OS + HEAP[OS + LAST_CHILD_SLOT] - G];
  // prep for EXTEND
  A = HEAP[F + CLOSURE_ENV_SLOT];
  // A is now env to be extended
  H = HEAP[A + LAST_CHILD_SLOT];
  // H is now offset of last child slot
  B = HEAP[F + CLOSURE_ENV_EXTENSION_COUNT_SLOT];
  // B is now the environment extension count
  L = HEAP[F + CLOSURE_ADDRESS_SLOT];
  N = HEAP[F + CLOSURE_OS_SIZE_SLOT]; // closure stack size

  EXTEND(); // after this, RES is new env

  // Heap address of new environment can
  // be changed by NEW_RS_FRAME and NEW_OS below.
  // Assigning TEMP_ROOT to address makes sure we
  // restore the updated value before competing CALL.
  TEMP_ROOT = RES;

  H = RES + H + G;
  // H is now address where last argument goes in new env
  for (C = H; C > H - G; C = C - 1) {
    POP_OS(); // now RES has the address of the next arg
    HEAP[C] = RES; // copy argument into new env
  }
  POP_OS(); // closure is on top of OS; pop; no more needed
  NEW_RTS_FRAME(); // saves PC + 2, ENV, OS

  A = RES;
  PUSH_RTS();
  A = N;
  NEW_OS();

  OS = RES;
  PC = L;
  ENV = TEMP_ROOT;
//   assert_valid_node(ENV, list("env node is fully copied"));
  TEMP_ROOT = -1;
};

M[RTN] = () => {
  POP_RTS();
  H = RES;
  PC = HEAP[H + RTS_FRAME_PC_SLOT];
  ENV = HEAP[H + RTS_FRAME_ENV_SLOT];
  POP_OS();
  A = RES;
  OS = HEAP[H + RTS_FRAME_OS_SLOT];
  PUSH_OS();
};

M[DONE] = () => {
  RUNNING = false;
};

function run() {
  while (RUNNING) {
    if (M[P[PC]] === undefined) {
      error(P[PC], "unknown op-code:");
    } else {
      M[P[PC]]();
      assert_valid_node(OS, list("assert valid OS at PC: " + stringify(PC)));
    }
  }
  if (STATE === DIV_ERROR) {
    POP_OS();
    error(RES, "execution aborted:");
  } else if (STATE === OUT_OF_MEMORY_ERROR) {
    error(RES, "memory exhausted despite garbage collection");
  } else {
    POP_OS();
    return show_heap_value(RES);
  }
}

function parse_and_compile_and_run(linesize, linenumber, blocknumber, string) {
    initialize_machine(linesize, linenumber, blocknumber);
    P = parse_and_compile(string);
    const output = run();
    return output;
}


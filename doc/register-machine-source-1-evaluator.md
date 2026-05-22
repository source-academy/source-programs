CS4215 Project: Garbage Collection for Register Machines
===

# Introduction
Our work build upon the contents of Structure and Interpretation of Computer Programs - JavaScript Adaptation, Chapter 5.

Chapter 5.1 describes the concept of register machines, chapter 5.2 describes a register machine assembler and simulator, chapter 5.3 describes a vector-based memory system and stop-and-copy garbage colletor, and chapter 5.4 provides a Source evaluator for Source §1 written in register machine instructions, equivalent to the Source §1 evaluator provided in Chapter 4.

The Source evaluator in chapter 5.4 abstracts away some functionality into primitive functions for brevity. Our task is thus to provide concrete implementations in register machine language for the full evaluator, dealing with some memory management along the way.

# Overview of program
This program is an evaluator for Source §1 written in register machine instructions. It provides functionality equivalent to the metacircular evaluator provided in SICP Chapter 4.1, with the addition of support for the boolean operators `&&` and `||`.
## Typed pointers

Chapter 5.3 describes typed pointers for use in vector memory as a way of distinguishing between plain values and pointers to other memory slots, without providing an implementation. We have thus implemented typed pointers as a pair of `(TAG, value)`, where `TAG` takes on one of several constants for specifying the type. We also decided that typed pointers should be the fundamental unit of computation, meaning that registers themselves should hold typed pointers. This is necessary to support primitive functions for working with the types of the pointers themselves.

Primitive ops must be modified to account for these typed pointers. We have defined a `underlying_javascript_closure()` function which simply takes a Source function and returns a function that takes arguments as a Source list and calls `apply_in_underlying_javascript()`. This is the only way to call a Source function of indeterminate arity with arguments in a Source list. There are also additional wrappers `unwrap_args()` and `wrap_return_value()` which are self-explanatory.

## Source program storage
We have a function, `flatten_list_to_vectors()`, which takes a Source list and places it into two input `the_heads` and `the_tails` vectors (Source arrays). We thus use it to flatten the parsetree returned from the built-in `parse()` function in the form of a Source list into separate vectors, `prog_heads` and `prog_tails`. Placing the parsetree into separate vectors excludes them from garbage collection, improving efficiency.

## Pair/list operations
We have implemented the `pair()` function in register machine code. If the `free` pointer is already at the maximum `SIZE` of memory allowed, it will jump to `begin_garbage_collection`. With this function, we can build lists. For instance, compound functions, which were the original goal of this project, can now be implemented as a list of `(parameters, prog_ptr, env)`, where `prog_ptr` is a pointer to the index in the parsetree that contains the body of the function. This matches the implementation in the metacircular evaluator, and other list constructs our created by our program have the same format as their counterparts in Chapter 4.

# Register machine configuration
This section describes the changes to the configuration of the register machine on top of that provided in Chapter 5.2.

## Registers
The following registers are included in `make_new_machine()` on top of those provided in Chapter 5.2:
* Garbage collector registers (given in Chapter 5.3)
* Evaluator registers (given in chapter 5.4)
* Auxiliary registers
    * "res", "err", "a" to "f"
* the_heads, the_tails
* prog_heads, prog_tails
* SIZE
* free
* root
* root_populate_proc
* root_restore_proc
* stack_reassign_proc

Our machine does not make use of any additional registers that may be passed into `make_machine()`.

## Operations
The following operations are included in our program:
* Vector operations
    * `vector_set`, `vector_ref`
    * `inc_ptr`
        * Takes a `ptr_ptr` and returns a `ptr_ptr` with address one higher than that of the input pointer.
* Pointer operations
    * `make_ptr_ptr`
    * `make_null_ptr`
    * `make_no_value_yet_ptr`
    * `make_prog_ptr`
    * `is_*_ptr`, where `*` is a wildcard for a pointer type, with one for each pointer type.
* Primitive operations
    * Same as `primitive_functions` in Chapter 4.1 metacircular evaluator, with the addition of `||` and `&&`.
* Garbage collector operations
    * `call_root_proc`

## Controller
The controller of the evaluator machine can be broken down into the following sections:
* `begin_evaluation` controller
* Pair/list operation controllers
    * `pair`
    * `list`
    * `is_tagged_list`
    * `reverse_list`
* Evaluator controllers
    * From Chapter 5.4, with gaps filled in
* Chapter 4.1 data structure functions
    * `set/lookup/assign_name_value`
    * `make_compound_function`
    * `extend_environment`
    * `local_names`
* Garbage collection controller
* `end_evaluation` label

## Dispatch functions
Our evaluator machine includes an additional dispatch message, `evaluator_machine("install_parsetree")(parsetree)` which installs the input parsetree list into vectors in the registers `prog_heads` and `prog_tails`.

# Garbage collection
This section explains the details of some additional implementation details in the garbage collector.
## Root list
Chapter 5.3 begins its garbage collector description with the following assumption: "We will assume that there is a register called root that contains a pointer to a structure that eventually points at all accessible data." We implemented this with a proc, `root_populate_proc`, defined when the evaluator machine's ``"start"`` dispatch function is called. This proc acts as a closure for the evaluator and auxiliary registers. At the start of garbage collection, this proc is called using the `call_root_proc` operation. The proc then creates a new register machine list appended to `the_heads` and `the tails` containing the contained in the evaluator and auxiliary registers at the time it is called. This allows garbage collection to begin from this `root` list. At the end of garbage collection, another proc, `root_restore_proc` is called to copy all the values in the `root` list back to the respective registers after pointers have been forwarded to their new location in memory.

We chose to do this with a proc for extensibility. This could have been done by hard coding the register retrieval and assignment instruction, but this is would necessitate changes in two places if the register configuration had to be changed.

This also means that when memory usage has hit its limit, the garbage collector uses some more space on top of that to store the `root` list. We find this to be a minor issue, as it is just a matter of offsetting the `SIZE` by a constant amount. For simplicity, we chose not to do such an offset and just let the `root` list use additional space. Another way to look at it is that we are borrowing the space for the new `"root"` list from the existing `"root"` list in memory from a previous round of garbage collection, which will defitely be garbage collected away. This view explains why, when the machine is `"start"`ed, we begin allocating the environment list at an offset of the length of a `"root"` listfrom `0` for safety.

## Stack
The implementation of the stack, and associated `save` and `restore` instructions, are maintained as in Chapter 5.2. This is because in order to implement the stack as a list in memory, it would necessitate changing the `save` and `restore` instructions from elementary register machine instructions to a block of register machine code. While interpolation of machine code is possible, it is not feasible as `save` requires a jump to the `pair` controller section, and thus requires a label to jump back from `pair`. Such generation of labels is possible but deemed too complicated.

There is thus an additional proc `stack_reassign_proc`, which goes through the stack and updates values with new forwarded pointers generated from garbage collection. `make_stack()` has also been modified to return a dispatch function with a new message `"stack"` which returns the stored stack.

# Usage
1. Call `parse(text)` to get a parsetree of the Source program passed as a string as `text`.
2. Call `make_evaluator_machine(size)` with a given heap size to get an evaluator machine. This heap size is the maximum size of `the_heads` and `the_tails`, excluding `new_heads` and `new_tails`.
3. Call `evaluator_machine("install_parsetree")(parsetree)` with the parsetree obtained in step 1.
4. Call `start(evaluator_machine)`.
5. Use `get_register_contents(evaluator_machine, "val")` to check the result of the evaluation.
6. Additionaly, set size to a large number and use `get_register_contents(evaluator_machine, "free")` to get the final space usage. Then set a size smaller than this space usage to verify that the garbage collector works.
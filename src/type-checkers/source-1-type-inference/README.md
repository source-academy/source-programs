Type Inference for Source 1
================================
> See [here](https://github.com/tysng/source-type-inference) for a detailed commit history

Up and Running
--------------------

1. This project runs on the `js-slang` interpreter. Run `yarn install` to install `js-slang`.
2. Use `yarn bundle && yarn start` to generated the bundled Source program file, and run the 
code.
   * `main.js` will be bundled at the end all the Source program file
   * You can also copy the bundled `source-1-type-inference.js` file to
the Source Academy





Testing
----------------
The project uses the Source Programs testing framework. To run the tests, run
```
yarn bundled && yarn test
```

The test specifications are located under `__tests__/`.


Program Specifications
-----------------

### Types
Type inference for Source 1 supports:
* `number`: `float` and `int`
* `bool`: for boolean types
* `string`
* `undefined`
* Compound function type: `(t1, t2, .. tn) -> t`
* Polymorphic type: `(a)=>(a);` has type `T -> T`


### Type Variable
Every node on the program syntax tree has a unique type variable. A type variable is 
represented by a tagged list:
```js
list("type_variable", "T", 1)
```

Addable type variables are marked with `A`, and others are marked with 
`T`. We use the addable type to handle the overloading of operators,
such as `+`, which can take both `string` and `number`.

We use a number to identify type variables. Two variables are the 
same if they have the same number, regardless of the variable type (i.e 
`A` or `T`). This enables us to convert a `T` variable to an `A` 
variable, without causing confusion in the program.



### Annotation
```js
annotate(statement) -> annotated_statement
```
The `annotate` function takes an untyped parse tree of the Source program, and add 
a type variable to every node of the tree. 

```js
list("name", name) -> list("name", name, type_var)
list("name", op_name, loc) -> list("name", name, type_var, loc) // for primitive operators
list("conditional_expression", pred, cons, alt) -> list("conditional_expression", annotated_pred, annotated_cons, annotated_alt, type_var)
list("application", operator, operands) -> list("application", annotated_op, annotated_operands, type_var)
list("function_definition", [param], body) -> list("function_definition", [annotated_param], annotated_body, type_var)

```

### Top-Level Transformation
```js
transform(annotated_statement) -> transformed_statement
```

To facilitates the constraint generation, we will wrap the top level statements 
in a block, and add `return` to the last statement in a sequence. 

### Constraint Generation
```js
collect(transformed_statement, {constraint}, type_environment) -> {constraint}
```
A `constraint` is a pair of type variable and a type, and it represents the type 
constraints arose from the statements and their typing relations. 
For a detailed set of typing relations, see the Source Type Inference document. 

The type environment is used to look up the corresponding type 
variable of a name. Its structure and behavior resembles that of 
the program environment introduced in the Meta-circular Evaluator section.

### Constraint Solving
```js
solve(constraint, {constraint}) -> {constraint}
```

The `solve` function takes a set of constraints and a new constraint, and
goes through a list of rules to either generate a new set of 
constraints, or throw a type error. Please refer to the Source Type
Inference document for the set of 8 rules.

We always keep the set of constraints in solved forms, thus `solve` is 
called whenever we encounter a new constraint.


### The `sigma` Function
`sigma` function is used to retrieve the type of a type variable. 
`sigma(t)` is inductively defined as:
* if `t` is a base type, then `sigma(t) = t`
* if `t = t'` exist in the set of solved constraints, then 
`sigma(t) = sigma(t')`


When we have a set of constraints in their solved forms, we can
access the type of any type variable using the `sigma` function. 
Therefore, given the syntax tree annotated with type variable, we
can obtain the type of any node.

The `enumerate_sigma(solved_form, n)` function is useful to display
the types of all of the syntax tree nodes. It is used 
extensively in the tests.

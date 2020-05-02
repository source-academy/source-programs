# CS4215 T1 GC for Register Machine

## Overview

This implements a register machine evaluator for Source §1, as described in [<https://sicp.comp.nus.edu.sg/chapters/109#top>](Chapter 5.4) of SICP JS. It adopts the evaluator from Chapter 4.1 into machine instructions.

Register machine code format is found [<https://github.com/source-academy/source-programs/wiki/Register-Machine-Code-Format>](in this wiki).

## Usage

Example:

```js
set_program_to_run("1 + 3 * 4;");   // This parses the program and loads it into the register machine
start(m);                           // This runs the register machine
get_register_contents(m, "val");    // The output is in the register named "val"
```

## Testing

Test cases are provided.

Install dependencies by running `yarn`.

Run tests by executing `yarn test`.

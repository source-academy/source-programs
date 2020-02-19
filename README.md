# Source Programs

This repo contains programs written in [Source](https://en.wikipedia.org/wiki/Source_(programming_language)), developed for [SICP JS](https://en.wikipedia.org/wiki/Structure_and_Interpretation_of_Computer_Programs,_JavaScript_Adaptation) and other educational projects. 

All programs in this repository are runnable in the [Source Academy playground](https://sourceacademy.nus.edu.sg/playground#chap=4): copy the program into the editor, choose "Source §4", and press "Run".

## Evaluators

The evaluators in this section all follow the general style of SICP JS Section 4.1.

* [`src/evaluators/source-0.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/source-0.js): evaluator for Source §0 (calculator language)
* [`src/evaluators/source-0pp.js`](https://github.com/source-academy/source-programs/blob/master/): evaluator for Source §0++ (calculator language plus conditionals, blocks and sequences)
* [`src/evaluators/source-1.js`](https://github.com/source-academy/source-programs/blob/master/): evaluator for Source §1
* [`src/evaluators/typed-source.js`](https://github.com/source-academy/source-programs/blob/master/): evaluator for Typed Source (typed version of a Source §1 sublanguage)

## Steppers

The steppers in this section implement a small-step semantics, following the substitution model of SICP JS Chapter 1 and 2.

* [`src/steppers/source-0.js`](https://github.com/source-academy/source-programs/blob/master/): stepper for Source §0

## Type checkers

The type checkers in this section follow a rule-based static semantics available in [doc/type-checking.pdf](https://github.com/source-academy/source-programs/blob/master/doc/type-checking.pdf).

* [`src/type-checkers/source-0.js`](https://github.com/source-academy/source-programs/blob/master/): type checker for Source §0
* [`src/type-checkers/typed-source.js`](https://github.com/source-academy/source-programs/blob/master/): type checker for Typed Source, a typed version of a Source §1 sublanguage

## Virtual machines

The virtual machines in this section are SECD-style and follow a description in [doc/virtual-machines.pdf](https://github.com/source-academy/source-programs/blob/master/doc/virtual-machines.pdf). Each virtual machine comes with a compiler, implemented in the same file.

* [`src/virtual-machines/source-0m.js`](https://github.com/source-academy/source-programs/blob/master/): virtual machine for Source §0- (calculator language without division)
* [`src/virtual-machines/source-0.js`](https://github.com/source-academy/source-programs/blob/master/): virtual machine for Source §0 (calculator language)
* [`src/virtual-machines/source-0p.js`](https://github.com/source-academy/source-programs/blob/master/): virtual machine for Source §0 (calculator language with conditionals)
* [`src/virtual-machines/source-1.js`](https://github.com/source-academy/source-programs/blob/master/): virtual machine for a Source §1 sublanguage (without memory management)
* [`src/virtual-machines/source-1-with-copying-gc.js`](https://github.com/source-academy/source-programs/blob/master/): virtual machine for a Source §1 sublanguage with a Cheney-style stop-and-copy garbage collector
* [`src/virtual-machines/register-machine-gcd.js`](https://github.com/source-academy/source-programs/blob/master/): register machine following SICP JS Section 5.2, using GCD example

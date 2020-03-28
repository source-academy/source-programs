# Source Programs

This repo contains programs written in [Source](https://en.wikipedia.org/wiki/Source_(programming_language)), developed for [SICP JS](https://en.wikipedia.org/wiki/Structure_and_Interpretation_of_Computer_Programs,_JavaScript_Adaptation) and other educational projects. 

All programs in this repository are runnable in the [Source Academy playground](https://sourceacademy.nus.edu.sg/playground#chap=4): copy the program into the editor, choose "Source §4", and press "Run".

## Evaluators

The evaluators in this section all follow the general style of SICP JS Chapter 4.

* [`src/evaluators/source-0.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/source-0.js): evaluator for Source §0 (calculator language)
* [`src/evaluators/source-0pp.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/source-0pp.js): evaluator for Source §0++ (calculator language plus conditionals, blocks and sequences)
* [`src/evaluators/source-4-1.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/source-4-1.js): evaluator for Source §1, described in SICP JS 4.1
* [`src/evaluators/typed-source.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/typed-source.js): evaluator for Typed Source (typed version of a Source §1 sublanguage)
* [`src/evaluators/source-4-3.js`](https://github.com/source-academy/source-programs/blob/master/src/evaluators/source-4-3.js): meta-circular evaluator for Source §4.3 (non-deterministic programming)

## Steppers

The steppers in this section implement a small-step semantics, following the substitution model of SICP JS Chapter 1 and 2.

* [`src/steppers/source-0.js`](https://github.com/source-academy/source-programs/blob/master/src/steppers/source-0.js): stepper for Source §0

## Type checkers

The type checkers in this section follow a rule-based static semantics available in [doc/type-checking.pdf](https://github.com/source-academy/source-programs/blob/master/doc/type-checking.pdf).

* [`src/type-checkers/source-0.js`](https://github.com/source-academy/source-programs/blob/master/): type checker for Source §0
* [`src/type-checkers/typed-source.js`](https://github.com/source-academy/source-programs/blob/master/src/type-checkers/source-0.js): type checker for Typed Source, a typed version of a Source §1 sublanguage

## Virtual machines

The virtual machines in this section are SECD-style and follow a description in [doc/virtual-machines.pdf](https://github.com/source-academy/source-programs/blob/master/doc/virtual-machines.pdf). Each virtual machine comes with a compiler, implemented in the same file.

* [`src/virtual-machines/source-0m.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/source-0m.js): virtual machine for Source §0- (calculator language without division)
* [`src/virtual-machines/source-0.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/source-0.js): virtual machine for Source §0 (calculator language)
* [`src/virtual-machines/source-0p.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/source-0p.js): virtual machine for Source §0 (calculator language with conditionals)
* [`src/virtual-machines/source-1.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/source-1.js): virtual machine for a Source §1 sublanguage (without memory management)
* [`src/virtual-machines/source-1-with-copying-gc.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/source-1-with-copying-gc.js): virtual machine for a Source §1 sublanguage with a Cheney-style stop-and-copy garbage collector
* [`src/virtual-machines/register-machine-gcd.js`](https://github.com/source-academy/source-programs/blob/master/src/virtual-machines/register-machine-gcd.js): register machine following SICP JS Section 5.2, using GCD example

## Tool Demos

(click to run; for actual sources, go to [`src/tool-demos/`](https://github.com/source-academy/source-programs/blob/master/src/tool-demos/))

* [`src/tool-demos/stepper.js`](https://tinyurl.com/SICPJS-stepper): stepper tool (small-step semantics, based on substitution)
* [`src/tool-demos/box-and-pointer-diagrams.js`](https://tinyurl.com/SICPJS-box-and-pointer): box-and-pointer diagram visualizer for pairs and lists (following SICP JS chapter 2)
* [`src/tool-demos/environment-model.js`](https://tinyurl.com/SICPJS-env-diagram): environment model visualizer (following SICP JS chapter 3)

## Module Demos

(click to run; for actual sources, go to [`src/module-demos/`](https://github.com/source-academy/source-programs/blob/master/src/module-demos/))

* [`src/module-demos/runes.js`](https://tinyurl.com/SICPJS-hearts): the "picture language" of SICP JS 2.2.4
* [`src/module-demos/twist.js`](https://tinyurl.com/SICPJS-twist): some fun with the "picture language"
* [`src/module-demos/curves.js`](https://tinyurl.com/SICPJS-circle): a "curves" library for drawing curves with functional programming
* [`src/module-demos/times.js`](https://tinyurl.com/SICPJS-timestables): visual times tables using the "curves" library
* [`src/module-demos/sounds.js`](https://tinyurl.com/SICPJS-siren): a "sounds" library for generating sounds and music, starting from their constituent sine waves
* [`src/module-demos/bohemian.js`](https://tinyurl.com/SICPJS-rhapsody): Bohemian Rhapsody cover using the "sounds" library 
* [`src/module-demos/pix-n-flix.js`](https://tinyurl.com/SICP-distortion): a library for image and video processing, based on the constituent pixels

## Test
* [`src/test/framework/main.js`](https://github.com/source-academy/source-programs/blob/master/src/test/framework/): test framework for Source programs, written in Source §4

### License

[![GPL 3][gpl3-image]][gpl3]
All JavaScript programs in this repository are licensed under the 
[GNU General Public License Version 3][gpl3].

[gpl3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[gpl3-image]: https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png

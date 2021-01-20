# Source Programs

This repo contains programs written in [Source](<https://en.wikipedia.org/wiki/Source_(programming_language)>), developed for [SICP JS](https://en.wikipedia.org/wiki/Structure_and_Interpretation_of_Computer_Programs,_JavaScript_Adaptation) and other educational projects.

All programs in this repository are runnable in the [Source Academy playground](https://sourceacademy.nus.edu.sg/playground#chap=4): copy the program into the editor, choose "Source §4", and press "Run".

## Evaluators

The evaluators in this section all follow the general style of SICP JS Chapter 4.

- [`src/evaluators/source-0.js`](https://share.sourceacademy.nus.edu.sg/y1mpz): evaluator for Source §0 (calculator language)


## Classics

Some classic problems, solved in Source.

- [`src/classics/permutations.js`](https://share.sourceacademy.nus.edu.sg/xvmtm): permutations of a list
- [`src/classics/sorting_lists.js`](https://share.sourceacademy.nus.edu.sg/lshq5): some list sorting functions
- [`src/classics/subsets.js`](https://share.sourceacademy.nus.edu.sg/u9vfe): compute all subsets of a list

## Steppers

The steppers in this section implement a small-step semantics, following the substitution model of SICP JS Chapter 1 and 2.

- [`src/steppers/source-0.js`](https://share.sourceacademy.nus.edu.sg/hnbvq): stepper for Source §0

## Type checkers

The type checkers in this section follow a rule-based static semantics available in [doc/type-checking.pdf](https://github.com/source-academy/source-programs/blob/master/doc/type-checking.pdf).

- [`src/type-checkers/source-0.js`](https://share.sourceacademy.nus.edu.sg/su5ha): type checker for Source §0

## Virtual machines

The virtual machines in this section are SECD-style and follow a description in [doc/virtual-machines.pdf](https://github.com/source-academy/source-programs/blob/master/doc/virtual-machines.pdf). Each virtual machine comes with a compiler, implemented in the same file.

- [`src/virtual-machines/source-0.js`](https://share.sourceacademy.nus.edu.sg/tn6la): virtual machine for Source §0 (calculator language)

## Tool Demos

(click to run; for actual sources, go to [`src/tool-demos/`](https://github.com/source-academy/source-programs/blob/master/src/tool-demos/))

- [`src/tool-demos/stepper.js`](https://tinyurl.com/SICPJS-stepper): stepper tool (small-step semantics, based on substitution)
- [`src/tool-demos/box-and-pointer-diagrams.js`](https://tinyurl.com/SICPJS-box-and-pointer): box-and-pointer diagram visualizer for pairs and lists (following SICP JS chapter 2)
- [`src/tool-demos/environment-model.js`](https://tinyurl.com/SICPJS-env-diagram): environment model visualizer (following SICP JS chapter 3)

## Module Demos

(click to run; for actual sources, go to [`src/module-demos/`](https://github.com/source-academy/source-programs/blob/master/src/module-demos/))

- [`src/module-demos/runes.js`](https://tinyurl.com/SICPJS-hearts): the "picture language" of SICP JS 2.2.4
- [`src/module-demos/twist.js`](https://share.sourceacademy.nus.edu.sg/dy557): some fun with the "picture language"
- [`src/module-demos/curves.js`](https://tinyurl.com/SICPJS-circle): a "curves" library for drawing curves with functional programming
- [`src/module-demos/times.js`](https://tinyurl.com/SICPJS-timestables): visual times tables using the "curves" library
- [`src/module-demos/sounds.js`](https://tinyurl.com/SICPJS-siren): a "sounds" library for generating sounds and music, starting from their constituent sine waves
- [`src/module-demos/bohemian.js`](https://tinyurl.com/SICPJS-rhapsody): Bohemian Rhapsody cover using the "sounds" library

## Test framework

- [`src/test/framework/main.js`](https://github.com/source-academy/source-programs/blob/master/src/test/framework/): test framework for Source programs, written in Source §4

# Testing

[requires bash (any version) and awk (BSD awk 20070501); does not work with gawk]

For testing your Source programs, you need `node` and `yarn`.

Write your test cases in a folder `__tests__` in each `src` subfolder. The name of the file specifies the targeted Source of your test case. For example, if `src/steppers/source-0.js` is the Source, a test case might be `src/steppers/__tests__/source-0.test1.js`.

Only the tests written will be run.

Each test case is appended to your Source, and then run with `js-slang` (using Source §4). The last line of the test case is a `//` comment that must contain the expected result. For example, a stepper test case may be:

```js
parse_and_evaluate("! (1 === 1 && 2 > 3);");
// true
```

Before you can run the tests, you need to install `js-slang` by typing:

```sh
% yarn
% yarn install
```

Run all test cases by typing:

```sh
% yarn test
```

For failure cases (where you program is to throw error, e.g. memory exhausted error for virtual machines), you can include the error message as per normal. The lastest JS-Slang already throws the error message explicitly, without letting the underlying TypeScript handling it. Hence, an error message

```sh
Line 2073: Error: memory exhausted despite garbage collection undefined
```

can be written in the test file:

```js
// Line 2073: Error: memory exhausted despite garbage collection undefined
```

or

```js
// Error: memory exhausted despite garbage collection undefined
```

where only the part that starts from `Error:` will be compared. Line number is be ignored as it varies. If line number is needed for a particular reason, it can be appended to the back.

> Integration of the `test` script with `src/test/framework/` is pending a fix to the `--variant` parameter; any help appreciated.

# License

[![GPL 3][gpl3-image]][gpl3]
All JavaScript programs in this repository are licensed under the
[GNU General Public License Version 3][gpl3].

[gpl3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[gpl3-image]: https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/License_icon-gpl.svg/50px-License_icon-gpl.svg.png

#!/usr/bin/env node
const fs = require("fs");

let root = __dirname + "/../";
let src = root + "src/";

let output_file = root + "source-1-type-inference.js";
let main_file = src + "main.js";

let js_files = fs
    .readdirSync(src)
    .filter((n) => RegExp(".js$").test(n))
    .filter((n) => n !== "main.js");

let output = fs.openSync(output_file, "w");

js_files.forEach((n) => {
    fs.writeSync(output, fs.readFileSync(src + n));
});

fs.writeSync(output, fs.readFileSync(main_file));
fs.closeSync(output);

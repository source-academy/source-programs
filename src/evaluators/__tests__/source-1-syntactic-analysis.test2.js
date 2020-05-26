parse_and_eval('const foo = (x, y) => x * y - 5;\n' +
    '    const x = 2;\n' +
    '    foo(0, 1);');
// -5
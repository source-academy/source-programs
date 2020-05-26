parse_and_eval('function factorial(n) {\n' +
    '    return n === 1\n' +
    '        ? 1\n' +
    '        : factorial(n - 1) * n;\n' +
    '}' +
    'factorial(4);');
// 24

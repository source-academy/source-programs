parse_and_run('function x() {\n' +
    '    let a = 1;\n' +
    '    return a;\n' +
    '    a = 2;\n' +
    '}\n' +
    'x();');
// 1

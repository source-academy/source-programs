partial_evaluator("{const x=3;x+4;}\
const y=2;\
x+y;");
// Error: Unbound name: "x"
partial_evaluator("function f(x){\
function g(y){ return x/y;}\
return g(3);}f(6);");
// '{const f = (x) => (x / 3);2;}'
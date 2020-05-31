partial_evaluator("function f(x){return f(x);}const a=2;");
// '{const f = (x) => (f)(x);const a = 2;}'
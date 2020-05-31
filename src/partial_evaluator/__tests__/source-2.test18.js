partial_evaluator("function f(n,m) { const g=(x)=>x;\
return n===m ? 3:g(g(n));}\
f(4,2);");
// '{const f = (n,m) => (n === m)?3:n;4;}'
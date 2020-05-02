partial_evaluator("function f(n,m) {\
function g(z){return ((x,y) => x+y)(3,4);}\
return n===m ? 3:g(g(n));} f(4,2);");
// '{const f = (n,m) => (n === m)?3:7;7;}'
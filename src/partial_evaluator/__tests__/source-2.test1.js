partial_evaluator("function f(x,y){const tmp=y+3;\
return x+tmp;}\
function b(x){return f(x,0);}\
b(4);\
");
// '{const f = (x,y) => (x + (y + 3));const b = (x) => (x + 3);7;}'

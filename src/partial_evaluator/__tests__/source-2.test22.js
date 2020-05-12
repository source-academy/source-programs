partial_evaluator("function f(x){if(x===1){\
function g(z,y){return y+z+x;}return g(2,1);}\
else{return 4;}}\
f(2);");
// '{const f = (x) => ((x === 1)? (3 + x): 4);4;}'
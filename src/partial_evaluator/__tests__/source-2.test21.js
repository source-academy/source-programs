partial_evaluator("function f(n){\
if(n===9){\
    4;\
}\
else{return 2;}\
return n===1?1:4;}\
f(9);");
// '{const f = (n) => ((n === 9)? (n === 1)?1:4: 2);4;}'
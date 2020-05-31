partial_evaluator("\
function f(x){\
const z=2;\
if(x===1){return x;\
}else{4;}\
if(x===z){x;\
}else{return x;}\
return 2;}f(3);");
// '{const f = (x) => ((x === 1)? x: ((x === 2)? 2: x));3;}'
partial_evaluator("function f(x){return x===1?1:g(x-1);}\
function g(x){return h(x);}\
function h(x){return f(x);} ");
// '{const f = (x) => (x === 1)?1:(g)((x - 1));const g = (x) => (h)(x);const h = (x) => (x === 1)?1:(h)((x - 1));}'
parse_and_eval("function at(xs, n) {\
   return n === 0\
       ?  head(xs)\
       :  at(tail(xs), n-1);\
}\
function intsfrom(n) {\
   return pair(n, intsfrom(n+1));\
}\
function zipWith(f, xs, ys) {\
   return xs === null\
       ?  null\
       :  ys === null\
       ?  null\
       :  pair(f(head(xs), head(ys)), zipWith(f, tail(xs), tail(ys)));\
}\
const facs = pair(1, zipWith((x, y) => x * y, intsfrom(1), facs));\
function fac(n) {\
   return at(facs, n);\
}\
fac(6);");
// 720
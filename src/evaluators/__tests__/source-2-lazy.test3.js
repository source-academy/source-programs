const list_func = "function list (x,y) {\
                    return pair (x,pair (y,null));}";
const map_func = "function map (f,xs) {\
                    return xs === null ? xs\
                    : pair (f(head(xs)), map (f,tail (xs)));\
                    }";
const test2 = map_func + "const a = pair(2,a); const b = map (x => x * x, a);head(tail(b));";
parse_and_eval(test2);
// 4
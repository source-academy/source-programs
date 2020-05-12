partial_evaluator("const a=2;\
const g=(x,y) => y*x;\
const f=(x,y,z)=>x+y*a;\
g(f(2,3,1),f(9,0,0));");
// '{const a = 2;const g = (x,y) => (y * x);const f = (x,y,z) => (x + (y * 2));72;}'
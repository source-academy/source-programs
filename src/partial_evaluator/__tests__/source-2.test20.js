partial_evaluator("function f(x,y){\
{const a=2;return a===2?2*x-y*3:3;}\
const z=3; return z/x;}f(1,1);");
// '{const f = (x,y) => ((2 * x) - (y * 3));-1;}'
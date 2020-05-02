partial_evaluator("const a=2;const f=(x,y,z)=>x+y*a;f(2,3,1);");
// '{const a = 2;const f = (x,y,z) => (x + (y * 2));8;}'
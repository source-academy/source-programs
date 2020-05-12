partial_evaluator("function f(){return (x,y)=>(x*y+3);}f()(2,3);");
// '{const f = () => (x,y) => ((x * y) + 3);9;}'
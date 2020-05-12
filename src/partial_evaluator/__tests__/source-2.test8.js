partial_evaluator("const z=3;if(z===2){\
    const w=1;\
    w;\
}\
else{const t=2;\
t+z;}");
// '{const z = 3;{const t = 2;5;}}'
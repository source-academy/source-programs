partial_evaluator("function factorial(n){\
return n===1?1:n*factorial(n-1);}\
factorial(4);");
// '{const factorial = (n) => (n === 1)?1:(n * (factorial)((n - 1)));24;}'
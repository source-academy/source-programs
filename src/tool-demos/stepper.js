// example for the stepper tool

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §1"

// instructions: click on the <-o-> icon on the right
//               click "Run"
//               click on the blue bar, slide to see steps

function abs(x) {
    return x >= 0 ? x : -x;
}
                
function square(x) {
    return x * x;
}
                
function good_enough(guess, x) {
    return abs(square(guess) - x) < 0.001;
}
                
function average(x,y) {
    return (x + y) / 2;
}
              
function improve(guess, x) {
    return average(guess, x / guess);
}
          
function sqrt_iter(guess, x) {
    return good_enough(guess, x)
           ? guess
           : sqrt_iter(improve(guess, x), x);
}
                
function sqrt(x) {
    return sqrt_iter(1, x);
}
                
sqrt(9);

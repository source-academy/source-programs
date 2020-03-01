// example for environment diagram
//
// following section 3.2.4 of SICP JS
// see: https://sicp.comp.nus.edu.sg/chapters/56

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §3"

// instructions: Click on "25" in Line 25
//               (red dot indicates break point)
//               click on "globe" icon on right
//               click "Run" to see the diagram

function abs(x) {
    return x >= 0 ? x : -x;
}
                
function square(x) {
    return x * x;
}
                
function average(x,y) {
    return (x + y) / 2;
}
              
function sqrt(x) {
    function good_enough(guess) {
        return abs(square(guess) - x) < 0.001;
    }
    function improve(guess) {
        return average(guess,x/guess);
    }
    function sqrt_iter(guess){
        return good_enough(guess)
            ? guess
            : sqrt_iter(improve(guess));
    }
    return sqrt_iter(1.0);
}

sqrt(2);

// example for graphic support
// this is a variant of the right_split function
// in SICP JS section 2.2.4: 
// https://sicp.comp.nus.edu.sg/chapters/33#p8

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2" and "RUNES"

// Instructions: Press "Run"
//               (resize REPL tab on right if needed)

function right_split(p, n) {
    return n === 0
        ? p
        : beside(p, right_split(stack(p, p), n - 1));
}

show(right_split(heart, 4));
            

// Source §2 program by CS1101S student
// YUKI AKIZUKI
// September 2019

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2" and "RUNES"

// Instructions: 
// press "Run" repeatedly and enjoy the variations
// (if needed, maximize the REPL tab on the right)

function twist(counter) {
    return counter === 100
        ? yellow(circle)
        : stack_frac(1/10,
             random_color(
                 scale_independent(0.1, 1, square)),
             rotate(runtime(),
                 twist(counter + 1))
            );
}

show(twist(1));

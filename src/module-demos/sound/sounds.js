// example for SOUNDS library
// for details, see here: 
// https://sicp.comp.nus.edu.sg/source/SOUNDS/index.html
// 
// Instructions: turn on browser sound and press "Run"

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2" and "SOUNDS"

const π = math_PI;

const base_freq = 900;
const modulation_frequency = 2;
const modulation_index = 40;

function american_police_sound(t) {
    return math_sin(2 * π * t * base_freq - 
                    modulation_index * 
                    math_sin(2 * π * t * 
                             modulation_frequency));
}

play(pair(american_police_sound, 3));
 

// demo of box-and-pointer diagrams

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2"

// instructions: click "eye" icon on right
//               then repeatedly press "Run"

function random_tree(n) {
    return math_random() < n / 6 
        ? pair(random_tree(n - 1), 
               random_tree(n - 1))
        : n;
}

draw_data(random_tree(6));

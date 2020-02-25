// Cardioids: example for CURVES library

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2" and "CURVES"

// instructions: uncomment one of the draw_times_table lines
//               below and then press "Run"
//               (if necessary, adjust the size of REPL tab)

// connect_in_circle(n, f) connects n positions on the unit
// circle. Each dot results from applying f to position number.
// For full documentation of CURVES, see 
//                  https://sicp.comp.nus.edu.sg/source/CURVES/

const connect_in_circle =
    (n, f) =>
        draw_connected_full_view(n)
        (t => unit_circle(f(math_round(t * n)) / n));
           
const draw_times_table =
    (n, m) =>
    connect_in_circle(n * 3,
                      k => { const v = math_round((k - 1) / 3);
                             // pattern: pos1-dest1-pos1-pos2-dest2...
                             return k % 3 === 1 ? m * v * 3 : v * 3; }
                     );

// example how connect_in_circle works: draw polygon with 11 points:
// connect_in_circle(11, k => k);

// draw star with 11 points:
// connect_in_circle(11, k => 4 * k);

// for background on times tables and cardoids, see 
// https://www.youtube.com/watch?v=qhbuKbxJsk8

// draw_times_table(100, 2);      // m = 2: cardioid: 1 lobe
// draw_times_table(100, 3);      // m = 3: nephroid: 2 lobes
// draw_times_table(100, 4);      // m = 4: 3 lobes...

// draw_times_table(397, 200);    // m = (n + 3) / 2: 2-layer cardioid
// draw_times_table(500, 252);    // m = (n + 4) / 2: 2-layer nephroid
// draw_times_table(501, 253);    // m = (n + 5) / 2: 3-layer 3 lobes...

// draw_times_table(500, 168);    // m = (n + 4) / 3: 3-layer cardioid
// draw_times_table(295, 100);    // m = (n + 5) / 3: 3-layer nephroid
// draw_times_table(594, 200);    // m = (n + 6) / 3: 3-layer 3 lobes...

 draw_times_table(395, 100);    // m = (n + 5) / 4: 4-layer cardioid
// draw_times_table(494, 100);    // m = (n + 6) / 5: 5-layer cardioid
// draw_times_table(593, 100);    // m = (n + 7) / 6: 6-layer cardioid...

// also nice:
// draw_times_table(400, 201);    // m = n / 2 + 1 (/4,/8,/16)
// draw_times_table(200, 99);     // m = (n / 2) - 1: square pattern

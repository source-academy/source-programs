// example for PIX & FLIX library

// for details see:
// https://sicp.comp.nus.edu.sg/source/PIX%26FLIX/index.html

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §3" and "PIX&FLIX"

// Instructions: click on camera icon on the right
//               and press "Run"
//               adjust the display size, and play
//               with wave_length and distortion
            
function sine_distortion(src, dest) {
    const wave_length = 5 * (2 * math_PI);
    const distortion = 10;

    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();

    const mid_x = WIDTH/2;
    const mid_y = HEIGHT/2;
    for (let x=0; x<WIDTH; x = x + 1){
        for (let y=0; y<HEIGHT; y = y + 1){
            const d_x = math_abs(mid_x - x);
            const d_y = math_abs(mid_y - y);
            const d = d_x + d_y; 
            const s = math_round(distortion * math_sin( d / wave_length));
            const x_raw =  x + s;
            const y_raw = y +  s;
            const x_src = math_max(0,math_min(WIDTH - 1, x_raw));
            const y_src = math_max(0,math_min(HEIGHT - 1, y_raw));
            copy_pixel(src[x_src][y_src], dest[x][y]);
        }
    }
}

apply_filter(sine_distortion);

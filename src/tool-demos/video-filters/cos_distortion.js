function cos_distortion(src, dest)
{
    let wave_length = 5 * (2 * math_PI);
    let distortion = 10;

    let WIDTH = get_video_width();
    let HEIGHT = get_video_height();

    let mid_x = WIDTH/2;
    let mid_y = HEIGHT/2;
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            let d_x = math_abs(mid_x - x);
            let d_y = math_abs(mid_y - y);
            let d = d_x + d_y; 
            let s = math_round(distortion * math_cos( d / wave_length));
            let x_raw =  x + s;
            let y_raw = y +  s;
            let x_src = math_max(0,math_min(WIDTH - 1, x_raw));
            let y_src = math_max(0,math_min(HEIGHT - 1, y_raw));
            dest[x][y] = src[x_src][y_src];
        }
    }
}
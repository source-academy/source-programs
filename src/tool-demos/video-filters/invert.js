function invert(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            let red_value = 255 - src[x][y][0];
            let green_value = 255 - src[x][y][1];
            let blue_value = 255 - src[x][y][2];
            dest[x][y] = [red_value, green_value, blue_value];
        }
    }
}
function upside_down(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    for(let x=0; x<WIDTH; x = x + 1)
    {
        
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            dest[x][y] = src[x][HEIGHT - 1 - y];
        }
         
    }
}
// this code is just to give a glimpse of green room filters and green backgrounds
// the limiting values have been chosen to fit the most commonly used case
// however that doesn't satisfy all the needs

// anyways, this code offers a good idea of how boundaries can be highlighted and colors added
// in background
// and adding, the suitable threshold values and conditions,
// it can be optimised to meet any requirements

function greenbg(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    
    for (let x=0; x<WIDTH; x = x + 1)
    {
        for (let y=0; y<HEIGHT; y = y + 1)
        {
            if(green_of(src[x][y]) > 120
            &&red_of(src[x][y]) < 150
            &&blue_of(src[x][y])<220)
            {
                dest[x][y] = [0, 255, 0];
            }
            else
            {
                dest[x][y]=dest[x][y];
            }
        }
    }
}
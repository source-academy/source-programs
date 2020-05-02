let sum1 = 0;
let sum2 = 0;
let sum3 = 0;
function blur3x3(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    
    for(let y=0; y<HEIGHT; y = y + 1)
    {
        dest[0][y] = [red_of(src[1][y]),
                        green_of(src[1][y]),
                        blue_of(src[1][y])];
        dest[WIDTH][y] = [red_of(src[WIDTH-1][y]),
                        green_of(src[WIDTH-1][y]),
                        blue_of(src[WIDTH-1][y])];
                      
    }

    for(let x=0; x<WIDTH; x = x + 1)
    {
        dest[x][0] = [red_of(src[x][1]),
                        green_of(src[x][1]),
                        blue_of(src[x][1])];
        dest[x][HEIGHT] = [red_of(src[x][HEIGHT - 1]),
                        green_of(src[x][HEIGHT - 1]),
                        blue_of(src[x][HEIGHT - 1])];
                      
    }
            
    for(let x=1; x<WIDTH-1; x = x + 1)
    {
        for (let y=1; y<HEIGHT-1; y = y + 1)
        {
            for(let i=-1; i < 2; i=i+1)
            {
            	for(let j=-1; j < 2; j=j+1)
            	{
            		sum1 = sum1 + red_of(src[x+i][y+i]);
            		sum2 = sum2 + green_of(src[x+i][y+i]);
            		sum3 = sum3 + blue_of(src[x+i][y+i]);
            	}
            }

            sum1 = sum1 / 9;
            sum2 = sum2 / 9;
            sum3 = sum3 / 9;

            dest[x][y] = [sum1, sum2, sum3];
        }
    }
}

let sum1 = 0;
let sum2 = 0;
let sum3 = 0;
function blur5x5(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    
    for(let y=0; y<HEIGHT; y = y + 1)
    {
        dest[0][y] = src[0][y];
        dest[1][y] = src[1][y];
        dest[WIDTH-1][y] = src[WIDTH-1][y];
        dest[WIDTH-2][y] = src[WIDTH-2][y];
                      
    }

    for(let x=0; x<WIDTH; x = x + 1)
    {
        dest[x][0] = src[x][0];
        dest[x][1] = src[x][1];
        dest[x][HEIGHT-1] = src[x][HEIGHT-1];
        dest[x][HEIGHT-2] = src[x][HEIGHT-2];
                      
    }
            
    for(let x=2; x<WIDTH-2; x = x + 1)
    {
        for (let y=2; y<HEIGHT-2; y = y + 1)
        {
            for(let i=-2; i < 3; i=i+1)
            {
              
              for(let j=-2; j < 3; j=j+1)
              {
                sum1 = sum1 + red_of(src[x+i][y+j]);
                sum2 = sum2 + green_of(src[x+i][y+j]);
                sum3 = sum3 + blue_of(src[x+i][y+j]);
              }
            }

            sum1 = sum1 / 25;
            sum2 = sum2 / 25;
            sum3 = sum3 / 25;

            dest[x][y] = [sum1, sum2, sum3];
        }
    }
}
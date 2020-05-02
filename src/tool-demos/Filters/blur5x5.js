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
    const WIDTH4=WIDTH-4;
    const HEIGHT4=HEIGHT-4;
    for(let x=0; x<WIDTH4; x = x + 1)
    {
        for (let y=0; y<HEIGHT4; y = y + 1)
        {
            let sum1 = 0;
            let sum2 = 0;
            let sum3 = 0;
            
            for(let i=0; i < 5; i=i+1)
            {
              
              for(let j=0; j < 5; j=j+1)
              {
                sum1 = sum1 + (src[x+i][y+j][0]);
                sum2 = sum2 + (src[x+i][y+j][1]);
                sum3 = sum3 + (src[x+i][y+j][2]);
              }
            }
            sum1 = sum1 / 9;
            sum2 = sum2 / 9;
            sum3 = sum3 / 9;
            // dest[x][y]=dest[x][y];

            dest[x][y] = [sum1, sum2, sum3];
        }
    }
}
// apply_filter(blur5x5);
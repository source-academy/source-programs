function blur3x3(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    
    for(let y=0; y<HEIGHT; y = y + 1)
    {
        
        dest[0][y] = src[0][y];
        dest[WIDTH-1][y] = src[WIDTH-1][y];
                      
    }

    for(let x=0; x<WIDTH; x = x + 1)
    {
        let r1=src[x][0][0];
        let g1=src[x][0][1];
        let b1=src[x][0][2];
        
        let new_height = HEIGHT-1;
        
        let r2=src[x][new_height][0];
        let g2=src[x][new_height][1];
        let b2=src[x][new_height][2];
        
        dest[x][0] = [r1,g1,b1];
        dest[x][new_height] = [r2,b2,g2];
                      
    }
            

    const WIDTH1= WIDTH -2;
    const HEIGHT1= HEIGHT-2;
    for(let x=0; x<WIDTH1; x = x + 1)
    {
        for (let y=0; y<HEIGHT1; y = y + 1)
        {
    
            let r=src[x][y][0]+
                  src[x][y+1][0]+
                  src[x][y+2][0]+
                  src[x+1][y][0]+
                  src[x+1][y+1][0]+
                  src[x+1][y+2][0]+
                  src[x+2][y][0]+
                  src[x+2][y+1][0]+
                  src[x+2][y+2][0];
                  let g=src[x][y][1]+
                  src[x][y+1][1]+
                  src[x][y+2][1]+
                  src[x+1][y][1]+
                  src[x+1][y+1][1]+
                  src[x+1][y+2][1]+
                  src[x+2][y][1]+
                  src[x+2][y+1][1]+
                  src[x+2][y+2][1];
                  let b=src[x][y][2]+
                  src[x][y+1][2]+
                  src[x][y+2][2]+
                  src[x+1][y][2]+
                  src[x+1][y+1][2]+
                  src[x+1][y+2][2]+
                  src[x+2][y][2]+
                  src[x+2][y+1][2]+
                  src[x+2][y+2][2];
 
            r = r/9;
            b = b/9;
            g = g/9;

            dest[x][y] = [r,g,b];
        }
    }
}

// apply_filter(blur3x3);
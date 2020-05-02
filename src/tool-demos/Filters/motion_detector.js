const WIDTH = get_video_width();
const HEIGHT = get_video_height();

let prev =[];
for (let i=0; i<WIDTH; i = i+1)
{
    prev[i] = [];
    for (let j=0; j<HEIGHT; j = j+1)
    {
        prev[i][j] = [0,0,0];
    }
}
let xx=0;
function motiondetector(src,dest)
{
    if(xx===0)
    {
        for (let x=0; x<WIDTH; x = x + 1)
        {
            for (let y=0; y<HEIGHT; y = y + 1)
            {
                prev[x][y][0]=src[x][y][0];
                prev[x][y][1]=src[x][y][1];
                prev[x][y][2]=src[x][y][2];
            }
        }
        xx=xx+1;
    }
    else
    {
        for(let x=0; x<WIDTH; x = x + 1)
        {
            for(let y=0; y<HEIGHT; y = y + 1)
            {
                let exp=0.2126*(red_of(src[x][y]) - red_of(prev[x][y])) +
                        0.7152*(green_of(src[x][y]) - green_of(prev[x][y])) +
                        0.0722*(blue_of(src[x][y]) - blue_of(prev[x][y]));
                if(exp>100 || exp <-1000)
                {
                    dest[x][y] = [255,0 ,0];
                }
                else
                {
                    dest[x][y] = src[x][y];
                }
            }
    }
    
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            prev[x][y][0]=src[x][y][0];
            prev[x][y][1]=src[x][y][1];
            prev[x][y][2]=src[x][y][2];
        }}
    }
    
}
let x=0;
let ini= runtime();

function framerate(src,dest)
{
    let today= runtime();
    let z=1000.0/(today-ini);
    if(x===1)
    {
        display(z);
    }
    else
    {
        x=x;
    }
    ini=today;
    x=x+1;    
}
let x=0;
let ini= runtime();

function ping_single(src,dest)
{
    let today= runtime();
    let z=(today-ini);
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

// apply_filter(ping_single);
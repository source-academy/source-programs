let x=0;
let ini= runtime();

function ping_cont(src,dest)
{
    let today= runtime();
    let z=(today-ini);
    display(z);
    ini=today;
    x=x+1;
    
    
}

// apply_filter(ping_cont);
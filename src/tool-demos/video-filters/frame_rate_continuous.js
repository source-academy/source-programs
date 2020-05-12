let x=0;
let ini= runtime();

function framerate_cont(src,dest)
{
    let today= runtime();
    let z=1000.0/(today-ini);
    display(z);
    ini=today;
    x=x+1;
    
    
}

// apply_filter(framerate_cont);
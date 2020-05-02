let x=0;
let ini= runtime();

function framerate(src,dest)
{
    let today= runtime();
    let z=1000.0/(today-ini);
    display(z);
    ini=today;
    x=x+1;
    
    
}

// apply_filter(framerate);
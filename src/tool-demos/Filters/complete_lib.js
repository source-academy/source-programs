/* pixels
 * A pixel is an array with three numbers ranging from 0 to 255, representing
 * RGB values
 */

/* no constructor: we simply use literal arrays to construct pixels,
 * as for example in
 * VD._SRCIMG[i][j] = [0,0,0];
 * VD._DESTIMG[i][j] = [0,0,0];
 * VD._TEMP[i][j] = [0,0,0];
 */

/**
 * Returns the red component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the red component as a number between 0 and 255
 */
function red_of(px) {
  // returns the red value of px respectively
  return px[0];
}

/**
 * Returns the green component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the green component as a number between 0 and 255
 */
function green_of(px) {
  // returns the green value of px respectively
  return px[1];
}

/**
 * Returns the blue component of a given Pixel <CODE>px</CODE>
 * @param {px} Pixel - given Pixel
 * @returns {Number} the blue component as a number between 0 and 255
 */
function blue_of(px) {
  // returns the blue value of px respectively
  return px[2];
}

/**
 * Assigns the red, green and blue components of a pixel
 * <CODE>px</CODE> to given values
 * @param {px} Pixel - given Pixel
 * @param {r} Number - the red component as a number between 0 and 255
 * @param {g} Number - the green component as a number between 0 and 255
 * @param {b} Number - the blue component as a number between 0 and 255
 * @param {px} Pixel - given Pixel
 * @returns {undefined}
 */
function set_rgb(px, r, g, b) {
  // assigns the r,g,b values to this px
  px[0] = r;
  px[1] = g;
  px[2] = b;
}

/**
 * Copies the red, green and blue components of a Pixel
 * <CODE>src</CODE> to a Pixel <CODE>dst</CODE>
 * @param {px} Pixel - source Pixel
 * @param {px} Pixel - destination Pixel
 * @returns {undefined}
 */
function copy_pixel(src, dest) {
  dest[0] = src[0];
  dest[1] = src[1];
  dest[2] = src[2];
}

/**
 * Filter that copies all Pixels faithfully from the
 * source Image to the destination Image
 * @param {src} Image - source Image
 * @param {dst} Image - destination Image
 * @returns {undefined}
 */
function copy_image(src, dest) {
  for (let i = 0; i < _WIDTH; i = i + 1) {
    for (let j = 0; j < _HEIGHT; j = j + 1) {
      copy_pixel(src[i][j], dest[i][j]);
    }
  }
}

/**
 * Constrains a given color value to lie between 0 and 255
 * @param {Number} val - source value
 * @returns {Number} constrained value between 0 and 255
 */
function constrain_color(val) {
  return val > 255 ? 255 : val < 0 ? 0 : val;
}

// returns a new filter that will have the effect of applying filter1 first and then filter2
function compose_filter(filter1, filter2) {
  return (src, dest) => {
    filter1(src, dest);
    copy_image(dest, src);
    filter2(src, dest);
  };
}

// returns true if the absolute difference in red( and green and blue) value of px1 and px2
//     is smaller than the threshold value
function pixel_similar(p1, p2, threshold) {
  return (
    math_abs(p1[0] - p2[0]) < threshold &&
    math_abs(p1[1] - p2[1]) < threshold &&
    math_abs(p1[2] - p2[2]) < threshold
  );
}

var _WIDTH = 400;
var _HEIGHT = 300;

/**
 * Returns the current height of the output video display in
 * pixels, i.e. the number of pixels in vertical direction
 * @returns {Number} height of output display (in pixels)
 */
function get_video_height() {
  return _HEIGHT;
}

/**
 * Returns the current width of the output video display in
 * pixels, i.e. the number of pixels in horizontal direction
 * @returns {Number} width of output display (in pixels)
 */
function get_video_width() {
  return _WIDTH;
}

// changes the current filter to my_filter
// default filter is copy_image
/**
 * Installs a given filter to be used to transform
 * the images that the camera captures into images
 * displayed on the screen. A filter is a function
 * that is applied to two two-dimensional arrays
 * of Pixels: the source image and the destination
 * image.
 * @param {f} filter - the filter to be installed
 * @returns {undefined}
 */
function apply_filter(filter) {
  VD._student_filter = filter;
  if (!VD._video_playing) {
    VD.handleStart(() => {
      VD._draw_once();
      VD._noLoop();
    });
  }
}

/*
  make_distortion_filter(reverse_mapping)
  make_static_distortion_filter(reverse_mapping)
  distortion
  a rearrangement of the pixels in the original src
  reverse_mapping([x,y])
  this is a function that takes in [x,y], which are the coordinates of a pixel on dest
  and returns [u,v], the coordinates of a pixel on src
  These two functions will return a filter that will
  map every pixel - dest[x][y] for all x,y - to take the rgb values of src[u][v]
  if [u,v] exceeds the boundaries of src, a black pixel will be displayed instead
  
  make_static_distortion_filter
  for filters that will not change with time
  the pixel mappings are only calculated once
  make_distortion_filter
  for filters that will change with time
  the pixel mappings are recalculated in every frame
*/
function make_distortion_filter(reverse_mapping) {
  function filter(src, dest) {
    for (let i = 0; i < _WIDTH; i = i + 1) {
      for (let j = 0; j < _HEIGHT; j = j + 1) {
        let pt = reverse_mapping([i, j]);
        if (0 <= pt[0] && pt[0] < _WIDTH && 0 <= pt[1] && pt[1] < _HEIGHT) {
          copy_pixel(src[pt[0]][pt[1]], dest[i][j]);
        } else {
          set_rgb(dest[i][j], 0, 0, 0);
        }
      }
    }
  }
  return filter;
}

function make_static_distortion_filter(reverse_mapping) {
  let rev_map_grid = [];
  for (let i = 0; i < _WIDTH; i = i + 1) {
    rev_map_grid[i] = [];
    for (let j = 0; j < _HEIGHT; j = j + 1) {
      let pt = reverse_mapping([i, j]);
      if (0 <= pt[0] && pt[0] < _WIDTH && 0 <= pt[1] && pt[1] < _HEIGHT) {
        rev_map_grid[i][j] = pt;
      } else {
        rev_map_grid[i][j] = null;
      }
    }
  }
  function filter(src, dest) {
    for (let i = 0; i < _WIDTH; i = i + 1) {
      for (let j = 0; j < _HEIGHT; j = j + 1) {
        let pt = rev_map_grid[i][j];
        if (pt != null) {
          copy_pixel(src[pt[0]][pt[1]], dest[i][j]);
        } else {
          set_rgb(dest[i][j], 0, 0, 0);
        }
      }
    }
  }
  return filter;
}

function reset_filter() {
  apply_filter(copy_image);
}

VD = {};
VD._SRCIMG = [];
VD._DESTIMG = [];
VD._TEMP = [];
VD._timeInCurrentFrame = 0;
VD._student_filter = copy_image;
VD._requestID = null;
VD._pixelData = null;
VD._video_playing = false;
VD._video = null;
VD._canvas = null;
VD._context = null;

VD._setup = function() {
  //create the two image arrays that will be used throughout
  for (let i = 0; i < _WIDTH; i = i + 1) {
    VD._SRCIMG[i] = [];
    VD._DESTIMG[i] = [];
    VD._TEMP[i] = [];
    for (let j = 0; j < _HEIGHT; j = j + 1) {
      VD._SRCIMG[i][j] = [0, 0, 0];
      VD._DESTIMG[i][j] = [0, 0, 0];
      VD._TEMP[i][j] = [0, 0, 0];
    }
  }
};

//load the data from the 1D array into the 2D array VD._SRCIMG
VD._make_image_abstraction = function(arr) {
  for (let i = 0; i < _WIDTH; i++) {
    for (let j = 0; j < _HEIGHT; j++) {
      let pix = VD._SRCIMG[i][j];
      let red = (j * _WIDTH + i) * 4;
      pix[0] = arr[red];
      pix[1] = arr[red + 1];
      pix[2] = arr[red + 2];
    }
  }
};

//load the data from the 2D array VD._DESTIMG into the 1D pixel array pixelData
VD._make_pixelData = function(pixelData) {
  for (let i = 0; i < _WIDTH; i++) {
    for (let j = 0; j < _HEIGHT; j++) {
      let pix = VD._DESTIMG[i][j];
      console.log(pix);
      let red = (j * _WIDTH + i) * 4;
      pixelData.data[red] = pix[0];
      pixelData.data[red + 1] = pix[1];
      pixelData.data[red + 2] = pix[2];
      pixelData.data[red + 3] = 255;
    }
  }
};

/**
 * draw one frame only
 */
VD._draw_once = function() {
  VD._timeInCurrentFrame = Date.now();

  VD._context.drawImage(VD._video, 0, 0, _WIDTH, _HEIGHT);
  VD._pixelData = VD._context.getImageData(0, 0, _WIDTH, _HEIGHT);

  VD._make_image_abstraction(VD._pixelData.data); //from 1D to 2D
  VD._student_filter(VD._SRCIMG, VD._DESTIMG); //process the image
  VD._make_pixelData(VD._pixelData); //from 2D to 1D
  VD._context.putImageData(VD._pixelData, 0, 0);
};

/**
 * The main loop
 */
VD._draw = function() {
  VD._requestID = window.requestAnimationFrame(VD._draw);

  VD._draw_once();

  // for debugging purposes
  // _frameNo++;
  // let timeSpent = Date.now() - VD._timeInCurrentFrame;
  // _sumTime += timeSpent;
  // console.log("Average: " + (_sumTime/_frameNo).toFixed(2) + "    Current frame: " + timeSpent);
};
// let _frameNo = 0;
// let _sumTime = 0;

//stops the looping
VD._noLoop = function() {
  if (VD._video_playing) {
    VD._video_playing = false;
    window.cancelAnimationFrame(VD._requestID);
  }
};

//starts the main loop
VD._loop = function() {
  if (!VD._video_playing) {
    VD._video_playing = true;
    VD._requestID = window.requestAnimationFrame(VD._draw);
  }
};

VD.init = function($video, $canvas) {
  VD._video = $video;
  VD._canvas = $canvas;
  VD._context = VD._canvas.getContext('2d');
  VD._setup();
  VD.handleStartVideo();
};

VD.deinit = function() {
  VD._noLoop();
  VD._closeWebcam();
  VD._video = null;
  VD._canvas = null;
  VD._context = null;
};

VD._closeWebcam = function() {
  let stream = VD._video.srcObject;
  if (stream !== null) {
    let tracks = stream.getTracks();
    tracks.forEach(track => {
      track.stop();
    });
    VD._video.srcObject = null;
  }
};

VD.handleCloseVideo = function() {
  VD._noLoop();
  VD._closeWebcam();
  VD._requestID = window.requestAnimationFrame(() => {
    VD._context.clearRect(0, 0, VD._canvas.width, VD._canvas.height);
  });
};

VD.handleStartVideo = function() {
  VD.handleStart(() => VD._loop());
};

VD.handleSnapPicture = function() {
  VD.handleStart(() => {
    VD._draw_once();
    VD._noLoop();
  });
};

let errorName;
VD.handleStart = function(cont) {
  if (!VD._video.srcObject) {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => {
          VD._video.srcObject = stream;
          const afterVideoLoad = function() {
            VD._video.removeEventListener('loadeddata', afterVideoLoad);
            cont();
          };
          VD._video.addEventListener('loadeddata', afterVideoLoad);
        })
        .catch(function(err) {
          //console.log(err.name); /* handle the error */
          errorName = err.name;
          //console.log(`errorName assigned: ${errorName}`);
        });
        //console.log(`errorName: ${errorName}`);
        if (errorName == 'NotFoundError' || errorName == 'DevicesNotFoundError') {
            throw new Error('Devices not found: Check your camera');
          } else if (errorName == 'NotReadableError' || errorName == 'TrackStartError') {
            throw new Error('Your webcam is already in use.');
          } else if (
            errorName == 'OverconstrainedError' ||
            errorName == 'ConstraintNotSatisfiedError'
          ) {
            throw new Error('constraints cannot be satisfied ' + 'by available devices');
          } else if (errorName == 'NotAllowedError' || errorName == 'PermissionDeniedError') {
            throw new Error('Permission denied in browser');
          } else if (errorName == 'TypeError' || errorName == 'TypeError') {
            throw new Error('empty constraints object');
          } else {
          }
    } else {
      throw new Error('The browser you are using does not support getUserMedia');
    }
  } else {
    cont();
  }
};

VD.handleUpdateDimensions = function(w, h) {
  if (w === _WIDTH && h === _HEIGHT) {
    return;
  }
  _WIDTH = w;
  _HEIGHT = h;
  VD._video.width = w;
  VD._video.height = h;
  VD._canvas.width = w;
  VD._canvas.height = h;

  VD._setup();
  if (VD._video_playing) {
    VD._loop();
  } else {
    setTimeout(() => VD.handleSnapPicture(), 50);
  }
};

// run this in playground for testing


// inversion filter

function invert(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            let red_value = 255 - src[x][y][0];
            let green_value = 255 - src[x][y][1];
            let blue_value = 255 - src[x][y][2];
            dest[x][y] = [red_value, green_value, blue_value];
        }
    }
}

// apply_filter(invert);

// upside-down (GPU optimised)

function upside_down(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    for(let x=0; x<WIDTH; x = x + 1)
    {
        
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            dest[x][y] = src[x][HEIGHT - 1 - y];
        }
         
    }
}

// apply_filter(upside_down);


// sine distortion
            
function sine_distortion(src, dest)
{
    let wave_length = 5 * (2 * math_PI);
    let distortion = 10;

    let WIDTH = get_video_width();
    let HEIGHT = get_video_height();

    let mid_x = WIDTH/2;
    let mid_y = HEIGHT/2;
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            let d_x = math_abs(mid_x - x);
            let d_y = math_abs(mid_y - y);
            let d = d_x + d_y; 
            let s = math_round(distortion * math_sin( d / wave_length));
            let x_raw =  x + s;
            let y_raw = y +  s;
            let x_src = math_max(0,math_min(WIDTH - 1, x_raw));
            let y_src = math_max(0,math_min(HEIGHT - 1, y_raw));
            dest[x][y] = src[x_src][y_src];
        }
    }
}

// apply_filter(sine_distortion);

// cos distortion
function cos_distortion(src, dest)
{
    let wave_length = 5 * (2 * math_PI);
    let distortion = 10;

    let WIDTH = get_video_width();
    let HEIGHT = get_video_height();

    let mid_x = WIDTH/2;
    let mid_y = HEIGHT/2;
    for(let x=0; x<WIDTH; x = x + 1)
    {
        for(let y=0; y<HEIGHT; y = y + 1)
        {
            let d_x = math_abs(mid_x - x);
            let d_y = math_abs(mid_y - y);
            let d = d_x + d_y; 
            let s = math_round(distortion * math_cos( d / wave_length));
            let x_raw =  x + s;
            let y_raw = y +  s;
            let x_src = math_max(0,math_min(WIDTH - 1, x_raw));
            let y_src = math_max(0,math_min(HEIGHT - 1, y_raw));
            dest[x][y] = src[x_src][y_src];
        }
    }
}

// apply_filter(cos_distortion);


// blur 3x3 mask

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

// blur 5x5 mask


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

// green background

// this code is just to give a glimpse of green room filters and green backgrounds
// the limiting values have been chosen to fit the most commonly used case
// however that doesn't satisfy all the needs

// anyways, this code offers a good idea of how boundaries can be highlighted and colors added
// in background
// and adding, the suitable threshold values and conditions,
// it can be optimised to meet any requirements

function greenbg(src, dest)
{
    const WIDTH = get_video_width();
    const HEIGHT = get_video_height();
    
    for (let x=0; x<WIDTH; x = x + 1)
    {
        for (let y=0; y<HEIGHT; y = y + 1)
        {
            if(green_of(src[x][y]) > 120
            &&red_of(src[x][y]) < 150
            &&blue_of(src[x][y])<220)
            {
                dest[x][y] = [0, 255, 0];
            }
            else
            {
                dest[x][y]=dest[x][y];
            }
        }
    }
}

// apply_filter(greenbg);


// motion detection
const WIDTH = get_video_width();
const HEIGHT = get_video_height();

let prev =[];
for (let i=0; i<WIDTH; i = i+1)
{
    prev[i] = [];
    
}
for (let i=0; i<WIDTH; i = i+1)
{
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
                prev[x][y]=src[x][y];
                
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
            prev[x][y]=src[x][y];
            
        }}
    }
    
}

// apply_filter(motiondetector);

// Continuous Frame Rate 

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

// Single Frame Rate 

let x=0;
let ini= runtime();

function framerate_single(src,dest)
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

// apply_filter(framerate_single);

// Continuous Ping

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

// Single Frame Rate 

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


// const startTime = runtime();
// const endTime = runtime();
// const timeTaken = endTime - startTime;
// display(timeTaken, "Time taken : ");


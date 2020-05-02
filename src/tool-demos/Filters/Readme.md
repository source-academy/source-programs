Please find here 13 beautiful filters that you can use in your codes and other video places
Here are brief descriptions for them.

1. Blur3x3 :- This filter blurs the content on screen using a 3*3 mask
2. Blur5x5 :- This filter blurs the content on screen using a 5*5 mask.
			  Due to more averaging of pixels (277.78%) of 3*3 mask, the images here are generally are more blurred.
3. Cos_distortion :- This is also a blur filter which shrinks and expands the pixels according to a sine wave. 						 It uses various parameters like wave-length and distortion constant, which can be varies to 					  see various types of effects.
4. Sine_distortion :- Same as above filter, except that it uses sine wave properties. (*2)
5. Invert :- This filter inverts the colors, ie, shows the multimedia in the contrast color
6. Upside down :- As the name suggests, this filter inverts the multimedia upside down.
7. Motion Detector(Probably the most exciting) :- This filter detects the motion in videos, and highlights the one where the motion is happening
8. Green Background :- This filter targets to make the sharp contrasts in the background to totally green
					   so that the face and other-contrast-parity can be brought to focus
9. Frame Rate (Continuous) :- This filter continuously keeps on printing the video's Frame Rate with each frame
10. Frame_Rate (Single) :- It prints the Frame rate for a video for a single moment, and then stops.
11. Ping (Continous) :- It is the time between two consecutive frames. This code continuously prints the ping rate for a video with each frame. It has extensive applications in games, etc.
12.  Ping (Single) :- This filter prints the initial value of ping and then stops.

Other filters that I have researched can can be added to this collection :-
1. Converting the video to black and white
2. Coloring the video (B&W to Color)
3. Segmentation
4. edge detection
and so on

As per the knowledege I could gain from the Source $4 GPU document(*1), I have tried to bring as many of these filters to Source $4 GPU, however, since I could not find ways to convert all forms of code into this format, some codes are yet on their way to this destination. 

I am sure, with better understanding of GPU, and code improvisations, this can be extended to a beautiful library of fast filters catering to all types of requirements.

Further scope of improvement:-
Undoubtedly, this branch of Source Academy has room for tremendous improvement with various new and exciting filters that thrive on new situations and ideas. Apart from that, we can improve for these filters, the error-handling portion. Sure, it's not a big deal to report these errors from console to the REPL, in only a few cases as yet, for the user's consideration, but also to establish the code supremacy to establish their minimum occurence.

I have commpiled all these filter codes along with the earlier video_lib file "complete_lib.js" for anyone who wants to know more about the implementation.

Credits :-
I was suggested to explore this library and work on this exciting idea by my course Professor, Prof. Martin.
He is an enthusiastic and energetic prof with lots of devotion for this project. Due to his these qualities, it has been a wonderful experience working with him. He used to provide me instant solutions to my queries, and various useful resources along with motivating me to explore more while having fun.
Next, I would love to thank my dear friends who helped me in this Project, especially  Rachit Bansal and Chow Jia Ying, who spent the nights together with me to make the code run, debug and managing all their other tasks independent of it. Needless to say, there have been other people too, whose names haven't been mentioned here.

Suggestions are always welcome

(*1) I have added the document along for further consideration by other people.
(*2) It might feel that the sine and cosine filters are similar, but the images they impact have a significant difference. Feel free to play with them to know the difference.

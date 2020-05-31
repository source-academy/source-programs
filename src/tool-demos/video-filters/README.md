Here 13 filters that you can use in your codes and other video and multimedia.
Brief descriptions for them :-

1. Blur3x3 :- Blurs using a 3*3 mask
2. Blur5x5 :- Blurs using a 5*5 mask, (277.78%) more effective than 3*3 mask.
3. Cos_distortion :- Blurs by modifying pixels according to a cosine wave.
					 [Various parameters like wave-length and distortion constant, can be varied to see various types of effects.]
4. Sine_distortion :- Same as above, except it uses sine properties. (*2)
5. Invert :- Inverts the colors, ie, shows the multimedia in the contrast color
6. Upside down :- Inverts the multimedia upside down.
7. Motion Detector:- Detects motion in videos and highlights the areas where the motion is happening
8. Green Background :- Marks sharp contrasts in the background to green them, so that the face and other-contrast-parity objects can be brought to focus
9. Frame Rate (Continuous) :- Continuously prints the video's Frame Rate
10. Frame_Rate (Single) :- Prints Frame rate for a video for the initial frame, and then stops.
11. Ping (Continous) :- Ping is the time between two consecutive frames. Continuously prints the ping for a video. [Has extensive applications in games, etc].
12.  Ping (Single) :- Prints the initial value of ping and then stops.

Other filters that I have researched can can be added to this collection :-
1. Converting the video to black and white
2. Coloring the video (B&W to Color)
3. Segmentation
4. Edge detection
and so on

As per the knowledege I could gain from the Source $4 GPU document(*1), I have tried to bring as many of these filters to Source $4 GPU, however, since I could not find ways to convert all forms of code into this format, some codes are yet on their way to this destination. 

I am sure, with code improvisations, this can be extended to a  library of faster filters catering to all types of requirements.

Further scope of improvement:-
Undoubtedly, this branch of Source Academy has room for tremendous improvement with various new filters. Apart from that, we can improve the error-handling portion. It's not a big deal to report these errors from console to REPL for the user's consideration, but also to minimum their occurence.

Credits :-
I would love to thank my professor, batchmates and friends who helped me in this Project, especially who spent the nights together with me to make it work.

(*1) I have added the document along for further consideration by other people.
(*2) It might feel that the sine and cosine filters are similar, but the images they impact have a significant difference. Feel free to play with them to know the difference.

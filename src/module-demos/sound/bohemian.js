// Source §2 program by CS1101S student
// SIDDARTH NANDANAHOSUR SURESH
// September 2019

// copy this program into the Source Academy playground
// https://sourceacademy.nus.edu.sg/playground
// and choose "Source §2" and "SOUNDS"

// Instructions: turn on your browser sound
// press "Run" and wait a few seconds

function rhapsody() {
    const c = consecutively;
    const s = simultaneously;
    
    const zero = silence_sound;
    const s1 = bell;
    const s2 = cello;
    const s3 = bell;
    const s4 = trombone;
    
    function helper(freq, dur) {
        return s(list(s3(freq, dur / 2), s3(freq - 12, dur / 2),
                      s4(freq, dur), s4(freq - 12, dur)));
    }
                       
    const chords1 = c(list(s(list(s1(58, 0.5), s1(62, 0.5))), s1(53, 0.5), 
                           s1(58, 0.5), s1(62, 0.5), 
                           s(list(s1(79, 1), c(list(s1(67, 0.5), s1(53, 0.5))))),
                           s(list(s1(77, 1), c(list(s1(65, 0.5), s1(53, 0.5)))))));
                           
    const chords2 = c(list(s(list(s1(58, 0.5), s1(62, 0.5))), s1(55, 0.5), 
                           s1(58, 0.5), s1(62, 0.5), 
                           s(list(s1(81, 1), c(list(s1(69, 0.5), s1(55, 0.5))))),
                           s(list(s1(79, 1), c(list(s1(67, 0.5), s1(55, 0.5)))))));
            
    const chords3 = c(list(s(list(s1(60, 0.5), s1(63, 0.5))), s1(60, 0.5), 
                           s1(63, 0.5), s1(67, 0.5), 
                           s(list(s1(86, 1), c(list(s1(74, 0.5), s1(60, 0.5))))),
                           s(list(s1(84, 1), c(list(s1(72, 0.5), s1(60, 0.5)))))));
                       
    const chords4 = c(list(s(list(s1(63, 0.5), s1(67, 0.5))), s1(60, 0.5), 
                           s1(63, 0.5), s1(67, 0.5), 
                           s(list(s1(60, 0.5), s1(63, 0.5), s1(69, 0.5))),
                           s1(63, 0.5), s1(65, 0.5), s1(72, 0.5)));       
                          
    const chords5 = chords1;
    
    const chords6 = chords2;
    
    const chords7 = c(list(s(list(s1(63, 0.5), s1(67, 0.5))), s1(60, 0.5), 
                           s1(63, 0.5), s1(67, 0.5), 
                           s(list(s1(59, 0.5), s1(63, 0.5))), s1(67, 0.5),
                           s(list(s1(58, 0.5), s1(63, 0.5))), s1(67, 0.5)));
                          
    const chords8 = c(list(s(list(s1(57, 0.5), s1(63, 0.5))), s1(57, 0.5), 
                           s1(63, 0.5), s1(67, 0.5), 
                           s(list(s1(56, 0.5), s1(63, 0.5))), s1(67, 0.5),
                           s(list(s1(55, 0.5), s1(63, 0.5))), s1(67, 0.5)));                  
                          
	const vocals1 = c(list(zero(8), s2(62, 0.33), s2(62, 2.92), zero(0.25), 
                           s2(58, 0.5), s2(60, 0.5), s2(62, 0.25), 
                           s2(62, 2.25), zero(0.5), s2(62, 0.25), s2(62, 0.25),
                           s2(63, 0.33), s2(65, 0.33), s2(63, 0.59), s2(62, 0.5),
                           s2(60, 0.75), zero(0.5), s2(60, 0.5), s2(62, 0.5),
                           s2(63, 0.25), s2(65, 0.5), s2(63, 0.5), s2(62, 0.5), 
                           s2(60, 1.25), zero(1)));         
    
	const vocals2 = c(list(s2(62, 0.33), s2(62, 2.42), zero(0.25), s2(62, 0.5), 
	                       s2(65, 0.5), s2(69, 0.75), s2(67, 0.25), s2(67, 2), 
	                       zero(0.5), s2(67, 0.5), s2(70, 0.5), s2(70, 0.5), 
	                       s2(70, 0.5), s2(70, 0.5), s2(70, 0.75), s2(67, 0.25), 
	                       s2(63, 0.67), s2(62, 0.33), s2(60, 3), zero(1)));  
                       
    const BASS = c(list(helper(46, 4), helper(46, 4), helper(46, 4), helper(43, 4),
                        helper(48, 4), helper(48, 2), helper(53, 2), helper(46, 4), 
						helper(43, 4), helper(48, 2), helper(47, 1), helper(46, 1),
						helper(45, 2), helper(44, 1), helper(43, 1)));
    
    const CHORDS = c(list(chords1, chords1, chords1, chords2, chords3, chords4,
                          chords5, chords6, chords7, chords8));

	const VOCALS = c(list(vocals1, vocals2));
	                      
    return s(list(VOCALS, BASS, CHORDS));
}

 play(rhapsody());

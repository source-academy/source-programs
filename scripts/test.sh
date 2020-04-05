#! /usr/bin/env bash

JS_SLANG=js-slang

SOURCEFILES=src/*/*.js

red=`tput setaf 1`
green=`tput setaf 2`
normal=`tput setaf 7`

passed=0
failed=0

# $1 is the source file to be tested
# $2 is the test file
test_source() {

    # run concatenation of source and test case
    # compare the result with the commented last line in test case
    DIFF=$(diff <($JS_SLANG -e --chapter=4 "$(cat $1 $2)") \
		<(cat $2 | tail -1 | cut -c4-))
    
    if [ "$DIFF" = "" ]
    then passed=$(($passed+1)); echo "${green}PASS $2"
    else failed=$(($failed+1)); echo "${red}FAIL $2:
$DIFF"
    fi
    
}

main() {
    for s in ${SOURCEFILES}
    do
        DIR=$(dirname ${s})
	# if __tests__ directory exists
	if [ -d "$DIR/__tests__" ]
	then
	    # call test_source on each test case in __tests__
	    for i in "$DIR/__tests__/$(basename ${s})"*
	    do
		test_source $s $i
	    done
	fi
    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0

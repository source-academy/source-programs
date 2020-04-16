#! /usr/bin/env bash

JS_SLANG="node node_modules/js-slang/dist/repl/repl.js"

SOURCEFILES=src/*/*.js
SOURCE_TEST=src/test/framework/main.js

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
    # if program throws error, ignore the output and compare the error message only
    # NOTE: error output line is striped of line number as it is machine dependent
    ERROR=$( { $JS_SLANG -e --chapter=4 "$(cat $1 $2)">$DIR/__tests__/output; } 2>&1 )
    if [ ! -z "$ERROR" ]
    then
        DIFF=$(diff <(echo $ERROR | cut -c11-) <(cat $2 | tail -1 | cut -c14-))
    else 
        DIFF=$(diff <($JS_SLANG -e --chapter=4 "$(cat $1 $2)") \
            <(cat $2 | tail -1 | cut -c4-))
    fi
    
    if [ "$DIFF" = "" ]
    then passed=$(($passed+1)); echo "${green}PASS $2"
    else failed=$(($failed+1)); echo "${red}FAIL $2:
$DIFF"
    fi
    # clean up temp file
    rm $DIR/__tests__/output
    
}

main() {
    for s in ${SOURCEFILES}
    do
        DIR=$(dirname ${s})
	# if __tests__ directory exists
	if [ -d "$DIR/__tests__" ]
	then
	    # call test_source on each test case in __tests__
	    for i in "$DIR/__tests__/$(basename ${s} .js)".*
        do
        if [ -f "$i" ]; then
            test_source $s $i
        fi
        done
	fi

    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0

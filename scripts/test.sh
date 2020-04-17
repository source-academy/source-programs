#! /usr/bin/env bash

JS_SLANG="node node_modules/js-slang/dist/repl/repl.js"

SOURCEFILES=src/*/*.js
SOURCE_TEST="src/test/framework/main.js"

DEFAULT_CHAPTER=4
DEFAULT_VARIANT="default"

red=`tput setaf 1`
green=`tput setaf 2`
normal=`tput setaf 7`

passed=0
failed=0

# $1 is the source file to be tested
# $2 is the test file
# $3 is the chapter
# $4 is the variant

test_source() {

    # if program throws error, ignore the output and compare the error message only
    # NOTE: error output line is striped of line number as it is machine dependent
    ERROR=$( { $JS_SLANG -e --chapter=$3 "$(cat $1 $2)">$DIR/__tests__/output; } 2>&1 )
    if [ ! -z "$ERROR" ]
    then
        DIFF=$(diff <(echo $ERROR | cut -c11-) <(cat $2 | tail -1 | cut -c14-))
    else 
        DIFF=$(diff <(cat $DIR/__tests__/output) \
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

test_source_framework() {

    # run concatenation of source-test framework, source and test files
    RESULTS=$($JS_SLANG -e --chapter=$3 --variant=$4 "$(cat $SOURCE_TEST $1 $2)")
    
    # retrieve names for tests that passed
    while read test_name
    do 
        passed=$(($passed+1))
        echo "${green}PASS $2 $test_name"
    done < <(echo ${RESULTS} | grep -o '\w* PASSED' | awk -F 'PASSED' '{ print $1 }')
    
    # retrieve names and error messages for tests that failed
    while read test_info 
    do 
        failed=$(($failed+1))
        echo $test_info | awk -F 'FAILED:' '{ print $1 ":" $2 }' | awk -F '"' '{ print $1 $2 }' | 
            while read test_name test_error 
            do echo "${red}FAIL $2 $test_name $test_error"; 
            done
    done < <(echo ${RESULTS} | grep -o '\w* FAILED:[^"]*')
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
            # check if first line of test file contains 'chapter=' and retrieve its value. Set to the default chapter if it does not
            chapter=$(awk -F 'chapter=' 'FNR==1{ if ($0~"chapter=") { print $2 } else { print '$DEFAULT_CHAPTER' } }' $i | awk -F ' ' '{ print $1 }')
        
            # check if first line of test file contains 'variant=' and retrieve its value. Set to the default variant if it does not
            variant=$(awk -F 'variant=' 'FNR==1{ if ($0~"variant=") { print $2 } else { print '$DEFAULT_VARIANT' } }' $i | awk -F ' ' '{ print $1 }')
            
            # check if first line of test file contains 'source-test'
            use_source_test=$(awk 'FNR==1{ if ($0~"source-test") print "yes" }' $i)
            if [[ $use_source_test == "yes" ]]
            then chapter=4 ; test_source_framework $s $i $chapter $variant
            else test_source $s $i $chapter $variant
            fi
        fi
        done
	fi
    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0

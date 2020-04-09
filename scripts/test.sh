#! /usr/bin/env bash

JS_SLANG="node node_modules/js-slang/dist/repl/repl.js"

SOURCEFILES=src/*/*.js
SOURCE_TEST="src/test/framework/main.js"

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

# $1 is the source file to be tested
# $2 is the Source test file which uses the source-test framework
test_source_framework() {
    # run concatenation of source-test framework, source and test files
    RESULTS=$($JS_SLANG -e --chapter=4 "$(cat $SOURCE_TEST $1 $2)")
    
    # retrieve names for tests that passed
    while read test_name
    do 
        passed=$(($passed+1))
        echo "${green}PASS $2 $test_name"
    done < <(echo ${RESULTS} | grep -o '\w* PASSED' | awk -F 'PASSED' '{print $1}')
    
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
            # check if first line of test file contains '// source-test'
            use_source_test=$(awk 'FNR==1{if ($0~"//[[:space:]]*source-test") print "yes";}' $i)
            if [[ $use_source_test == "yes" ]]
            then test_source_framework $s $i
            else test_source $s $i
            fi
        done
	fi
    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0

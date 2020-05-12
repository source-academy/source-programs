#! /usr/bin/env bash

JS_SLANG="node --stack-size=4000 node_modules/js-slang/dist/repl/repl.js"

SOURCEFILES=src/*/*.js
SOURCE_TEST="src/test/framework/main.js"

DEFAULT_CHAPTER=4
DEFAULT_VARIANT='default'
DEFAULT_EXECUTION_METHOD=''

red=`tput setaf 1`
green=`tput setaf 2`
normal=`tput setaf 7`

passed=0
failed=0

# $1 is the source file to be tested
# $2 is the test file
# $3 is the chapter
# $4 is the variant
# $5 specifies the execution method. '-i' for 'interpreter'. '' for 'native'.

test_source() {
    # read in test file to find the number of comment lines
    IFS=$'\n' read -d '' -r -a lines < $2
    NUM_VALID_COMMENT=0
    
    for ((i=${#lines[@]}-1;i >= 0; i--))
    do
        COMMENT=$(echo "${lines[i]}" | grep ^//)
        if [ -z "$COMMENT" ]
        then
            break
        else
            ((NUM_VALID_COMMENT++))
        fi
    done


    # if program throws error, ignore the output and compare the error message only
    # NOTE: error output line is striped of line number as it is machine dependent
    ERROR=$( { $JS_SLANG $5 -e --chapter=$3 --variant=$4 "$(cat $1 $2)">$DIR/__tests__/output; } 2>&1 )
    if [ ! -z "$ERROR" ]
    then
        DIFF=$(diff <(echo $ERROR | grep -o 'Error:.*') <(cat $2 | tail -$NUM_VALID_COMMENT | grep -o 'Error:.*'))
    else 
        DIFF=$(diff <(cat $DIR/__tests__/output) \
            <(cat $2 | tail -$NUM_VALID_COMMENT | cut -c4-))
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
    RESULTS=$($JS_SLANG $5 -e --chapter=$3 --variant=$4 "$(cat $SOURCE_TEST $1 $2)")
    
    # retrieve names for tests that passed
    while read test_name
    do 
        passed=$(($passed+1))
        echo "${green}PASS $2 $test_name"
    done < <(echo ${RESULTS} | grep -o '\w* PASSED' | cut -d ' ' -f 1)
    
    # retrieve names and error messages for tests that failed
    while read test_info 
    do 
        failed=$(($failed+1))
        echo $test_info | grep -o 'FAILED:.*' | cut -d ' ' -f 2- | 
            while read test_name test_error 
            do echo "${red}FAIL $2 $test_name : $test_error"; 
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
            ### check if first line of test file contains various keys and retrieve their values ###

            chapter=$(cat $i | head -n1 | grep -o 'chapter=.*' | cut -d '=' -f 2 | cut -d ' ' -f 1)
            if [ "$chapter" = "" ]
            then chapter=$DEFAULT_CHAPTER
            fi

            variant=$(cat $i | head -n1 | grep -o 'variant=.*' | cut -d '=' -f 2 | cut -d ' ' -f 1)
            if [ "$variant" = "" ]
            then variant=$DEFAULT_VARIANT
            fi

            execution_method=$(cat $i | head -n1 | grep -o 'executionMethod=.*' | cut -d '=' -f 2 | cut -d ' ' -f 1)
            if [ "$execution_method" = "interpreter" ]
            then execution_method='-i'
            else execution_method=$DEFAULT_EXECUTION_METHOD
            fi
            
            # check if first line of test file contains 'framework'
            use_source_test=$(cat $i | head -n1 | grep -o 'framework')
            if [[ $use_source_test == "framework" ]]
            then chapter=4 ; test_source_framework $s $i $chapter $variant $execution_method
            else test_source $s $i $chapter $variant $execution_method
            fi
        fi
        done
	fi
    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0

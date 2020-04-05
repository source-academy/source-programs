#! /usr/bin/env bash

SOURCEFILES="../source-0.js"

test_source() {
    
    DIFF=$(diff <(js-slang -e --chapter=4 "$(cat $1 $2)") \
		<(cat $2 | tail -1 | cut -c4-))

    if [ "$DIFF" = "" ]
    then echo "PASS $2"
    else echo "FAIL $2: $DIFF"
    fi
    
}

main() {
    for s in ${SOURCEFILES}
    do
	for i in "$(basename ${s})"*
	do
	    test_source $s $i
	done
    done
}

main

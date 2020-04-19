// The following sorting algorithms work on numbers and
// strings: they use the comparison operator <=.
// For other data types, replace this operator
// appropriately.

// Merge sort

function merge_sort(xs) {
    if ( is_null(xs) || is_null(tail(xs))) {
        return xs;
    } else {
        const mid = middle(length(xs)) ;
        return merge(merge_sort(take(xs, mid)),
                     merge_sort(drop(xs, mid)));
    }
}

function middle(n) {
    return math_floor(n / 2) ;
}

function merge(xs , ys) {
    if ( is_null(xs)) {
        return ys;
    } else if (is_null(ys)) {
        return xs;
    } else {
        const x = head(xs) ;
        const y = head(ys) ;
        if (x <= y) {
            return pair(x, merge(tail(xs), ys));
        } else {
            return pair(y, merge(xs, tail(ys)));
        }
    }
}

function take(xs , n) {
    return (n === 0) 
        ? null
        : pair(head(xs), take(tail(xs), n - 1));
}

function drop(xs, n) {
    return n === 0
        ? xs
        : drop(tail(xs), n - 1);
}

// selection sort

function selection_sort(xs) {
    if (is_null(xs)) {
        return xs;
    } else {
	const s = smallest(xs) ;
	return pair(s, selection_sort(remove(s, xs)));
    }
}

// iterative smallest
function smallest (xs) {
    function sm(x, ys) {
	return is_null(ys)
	    ? x 
            : x <= head(ys)
	      ? sm(x, tail(ys))
              : sm(head(ys), tail(ys));
    }
    return sm(head(xs), tail(xs));
}

// insertion sort

function insertion_sort (xs) {
    return is_null(xs)
        ? xs
        : insert(head(xs), insertion_sort(tail(xs)));
}

function insert(x, xs) {
    return is_null(xs)
        ? list(x)
        : x <= head(xs)
          ? pair(x, xs)
          : pair(head(xs), insert(x, tail(xs)));
}

// quicksort (not given here, because it's a homework exercise
//            in CS1101S at NUS; no spoilers please)

function quicksort(xs) {
    // uses partition
}

function partition (xs, p) {
    // ...
}

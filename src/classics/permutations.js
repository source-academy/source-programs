// SICP JS 2.2.3

function flatmap(f, seq) {
    return accumulate(append, null, map(f, seq));
}

function permutations(s) {
    return is_null(s)             // empty set?
           ? list(null)           // sequence containing empty set
           : flatmap(x => map(p => pair(x, p),
                              permutations(remove(x, s))),
                     s);
}

permutations(list(1, 2, 3));

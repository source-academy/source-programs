// util_set.js: a hand-rolled key-value data structure
function set_insert(s, p) {
    return set_contain(s, p) ? s : pair(p, s);
}

function set_insert_cons(s, cons) {
    return set_contain_cons(s, cons) ? s : pair(cons, s);
}

function set_contain(s, p) {
    return is_null(s)
        ? false
        : equal(head(s), p)
        ? true
        : set_contain(tail(s), p);
}

function set_contain_cons(s, cons) {
    return is_null(s)
        ? false
        : equal_type(head(cons), head(head(s))) &&
          equal_type(tail(cons), tail(head(s)))
        ? true
        : set_contain_cons(tail(s), cons);
}

function set_find_key_type(s, type) {
    // type variable are equated only by the number
    const res = filter((p) => equal_type(head(p), type), s);
    return is_null(res) ? null : head(res);
}

/** Return the key-value pair, null if not found*/
function set_find_key(s, h) {
    const res = filter((p) => equal(head(p), h), s);
    return is_null(res) ? null : head(res);
}

/** Return the key-value pair, null if not found */
function set_find_val(s, v) {
    const res = filter((p) => equal(tail(p), v), s);
    return is_null(res) ? null : head(res);
}

/* SICP JS Exercise 4.31
   
   This file contains a fast(er) solution to the multiple dwelling puzzle.
   The key idea is that we perform every 'require' check immediately once
   the information it needs is available. This minimises wasteful backtracking.
*/

function distinct(items) {
    return is_null(items)
        ? true
        : is_null(tail(items))
        ? true
        : is_null(member(head(items), tail(items)))
            ? distinct(tail(items))
            : false;
  }
  
  function multiple_dwelling() {
      const baker = amb(1, 2, 3, 4, 5);
      require(!(baker === 5));
      const cooper = amb(1, 2, 3, 4, 5);
      require(!(cooper === 1));
      const fletcher = amb(1, 2, 3, 4, 5);
      require(!(fletcher === 5));
      require(!(fletcher === 1));
      require(!(math_abs(fletcher - cooper) === 1));
      const miller = amb(1, 2, 3, 4, 5);
      require(miller > cooper);
      const smith = amb(1, 2, 3, 4, 5);
      require(!(math_abs(smith - fletcher) === 1));
      require(distinct(list(baker, cooper, fletcher, miller, smith)));
  
  
      return list(list("baker", baker),
                  list("cooper", cooper),
                  list("fletcher", fletcher),
                  list("miller", miller),
                  list("smith", smith));
  }
  // multiple_dwelling();
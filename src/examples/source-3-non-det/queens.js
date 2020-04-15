/*
  SICP JS Exercise 4.35

  This file contains two solutions for the n-queens puzzle using non-determinism.
  Each of them makes use of the generate-and-test paradigm.
  
  The first (queens_slow) uses non-determinism for generating both the row and column
  for each position. It does so in an optimized manner, testing the corresponding condition
  as soon as the choice is generated, thereby reducing the search space. However, this is not
  enough to yield a quick solution when N = 8.
  This solution also gives repeated solutions (i.e different permutations that have all the same positions) upon backtracking.

  The second (queens_fast) uses non-determinism in picking only the row and not the column of each position, with the
  columns being fixed. This further reduces the search space, yielding a quick solution when N = 8.
*/

const N = 8; // the number of queens and the size of the board
const empty_positions = null;

/******************************************************************************/
/* Slow version which uses non-determinism for both the columns and rows,     */
/* perform testing of a required condition as soon as the choice is generated */
/******************************************************************************/

// const result_queens_slow = queens_slow(N, N);
// pretty_print(result_queens_slow, N);
// generate more solutions by entering 'try again' in the REPL

function queens_slow(board_size, num_queens) {
  require(num_queens <= board_size);
  const possible_positions = enum_list(1, board_size);

  const result = accumulate(
    (_, so_far) => {
      const row = an_element_of(possible_positions);
      require(is_row_safe(row, so_far));

      const col = an_element_of(possible_positions);
      require(is_col_safe(col, so_far));

      const new_position = pair(row, col);
      require(is_diagonal_safe(new_position, so_far));

      const new_positions = pair(new_position, so_far);
      return new_positions;
    },
    empty_positions,
    enum_list(1, num_queens)
  );

  return result;
}

function is_row_safe(new_row, queen_positions) {
  const rows = map(position => head(position), queen_positions);
  return member(new_row, rows) === null;
}

function is_col_safe(new_col, queen_positions) {
  const cols = map(position => tail(position), queen_positions);
  return member(new_col, cols) === null;
}

function is_diagonal_safe(new_position, queen_positions) {
  const new_sum = head(new_position) + tail(new_position);
  const new_sub = head(new_position) - tail(new_position);
  const sums = map(
    position => head(position) + tail(position),
    queen_positions
  );

  return (
    member(new_sum, sums) === null &&
    member(
      new_sub,
      map(position => head(position) - tail(position), queen_positions)
    ) === null
  );
}

/******************************************************************************/
/* Fast version which uses non-determinism only for the rows,                 */
/* with the columns being hardcoded.                                          */
/******************************************************************************/

// const result_queens_fast = queens_fast(N, N);
// pretty_print(result_queens_fast, N);
// generate more solutions by entering 'try again' in the REPL

function queens_fast(board_size, num_queens) {
  require(num_queens <= board_size);
  const possible_positions = enum_list(1, board_size);

  function queen_cols(k) {
    if (k === 0) {
      return empty_positions;
    } else {
      const so_far = queen_cols(k - 1);

      const new_row = an_element_of(possible_positions);
      const new_position = pair(new_row, k);
      require(is_safe(new_position, so_far));

      const new_positions = pair(new_position, so_far);
      return new_positions;
    }
  }
  return queen_cols(num_queens);
}

function is_safe(new_position, positions) {
  const new_row = head(new_position);
  const new_col = tail(new_position);

  return accumulate(
    (position, so_far) => {
      const row = head(position);
      const col = tail(position);

      return (
        so_far &&
        new_row - new_col !== row - col &&
        new_row + new_col !== row + col &&
        new_row !== row
      );
    },
    true,
    positions
  );
}


/* Pretty prints a solution to the n-queens puzzle */
function pretty_print(result, board_size) {
  function member_eq(v, xs) {
    return is_null(xs)
      ? null
      : equal(v, head(xs))
      ? xs
      : member_eq(v, tail(xs));
  }
  const possible_positions = enum_list(1, board_size);

  let col_index_str = "  ";
  for_each(i => {
    col_index_str = col_index_str + stringify(i) + " ";
  }, possible_positions);
  display(col_index_str);

  for_each(row => {
    let row_str = stringify(row) + " ";
    for_each(col => {
      const position = pair(row, col);
      const contains_position = member_eq(position, result) !== null;
      if (contains_position) {
        row_str = row_str + "Q ";
      } else {
        row_str = row_str + ". ";
      }
    }, possible_positions);

    display(row_str);
  }, possible_positions);
}

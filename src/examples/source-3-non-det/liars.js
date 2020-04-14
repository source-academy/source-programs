/*
  SICP JS Exercise 4.33

  This file contains a solution to the Liar's puzzle
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

const betty = amb(1, 2, 3, 4, 5);
const ethel = amb(1, 2, 3, 4, 5);
const joan = amb(1, 2, 3, 4, 5);
const kitty = amb(1, 2, 3, 4, 5);
const mary = amb(1, 2, 3, 4, 5);

require(amb(kitty === 2, betty === 3));
require(amb(ethel === 1, joan === 2));
require(amb(joan === 3, ethel === 5));
require(amb(kitty === 2, mary === 4));
require(amb(mary === 4, betty === 1));

require(distinct(list(betty, ethel, joan, kitty, mary)));

list(list('betty', betty), list('ethel', ethel), list('joan', joan),
  list('kitty', kitty), list('mary', mary));

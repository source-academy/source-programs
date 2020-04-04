
const betty = amb(1, 2, 3, 4, 5);
const ethel = amb(1, 2, 3, 4, 5);
const joan = amb(1, 2, 3, 4, 5);
const kitty = amb(1, 2, 3, 4, 5);
const mary = amb(1, 2, 3, 4, 5);

require((kitty === 2) || (betty === 3));
require((ethel === 1) || (joan === 2));
require((joan === 3) || (ethel === 5));
require((kitty === 2) || (mary === 4));
require((mary === 4) || (betty === 1));

require(distinct(list(betty, ethel, joan, kitty, mary)));

list(list('betty', betty), list('ethel', ethel), list('joan', joan),
     list('kitty', kitty), list('mary', mary));

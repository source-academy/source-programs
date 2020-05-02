// chapter=3 variant=non-det executionMethod=interpreter
const liars = list(list('betty', betty), list('ethel', ethel), list('joan', joan),
list('kitty', kitty), list('mary', mary));
let res = '';
for (let i = 0; i < length(liars); i=i+1) {
    const person_rank = list_ref(liars, i);
    const person = head(person_rank);
    const rank = stringify(head(tail(person_rank))); 
    res = res + person + rank + ',';
}
res;
// 'betty3,ethel5,joan2,kitty1,mary4,'
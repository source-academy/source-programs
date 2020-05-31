// chapter=3 variant=non-det executionMethod=interpreter
const queens = queens_fast(8, 8);
let res = '';
for (let i = 0; i < length(queens); i=i+1) {
    const position = list_ref(queens, i);
    const x = stringify(head(position));
    const y = stringify(tail(position)); 
    res = res + '(' + x + ',' + y + '),';
}
res;
// '(4,8),(2,7),(7,6),(3,5),(6,4),(8,3),(5,2),(1,1),'
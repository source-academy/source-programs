// chapter=3 variant=non-det executionMethod=interpreter
const md = multiple_dwelling();
let res = '';
for (let i = 0; i < length(md); i=i+1) {
    const person_floor = list_ref(md, i);
    const person = head(person_floor);
    const floor = stringify(head(tail(person_floor))); 
    res = res + person + floor + ',';
}
res;
// 'baker3,cooper2,fletcher4,miller5,smith1,'
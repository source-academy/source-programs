const result = parse_and_run(" \
function multiple_dwelling() { \
const baker = amb(1, 2, 3, 4, 5); \
const cooper = amb(1, 2, 3, 4, 5); \
const fletcher = amb(1, 2, 3, 4, 5); \
const miller = amb(1, 2, 3, 4, 5); \
const smith = amb(1, 2, 3, 4, 5); \
require(distinct(list(baker, cooper, fletcher, miller, smith))); \
require(! (baker === 5)); \
require(! (cooper === 1)); \
require(! (fletcher === 5)); \
require(! (fletcher === 1)); \
require(! (miller > cooper)); \
require(! ((math_abs(smith - fletcher)) === 1)); \
require(! ((math_abs(fletcher - cooper)) === 1)); \
return list(list('baker', baker), \
list('cooper', cooper), \
list('fletcher', fletcher), \
list('miller', miller), \
list('smith', smith)); \
} \
multiple_dwelling(); \
");

function print_one_line_list(li) {
    let result = "";
    for_each((s) => { result = result + head(s) + stringify(head(tail(s))) + ","; }, li);
    return result;
}
print_one_line_list(result);
// 'baker1,cooper4,fletcher2,miller3,smith5,'
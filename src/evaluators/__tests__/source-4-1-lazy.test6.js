parse_and_eval("function infinite_list(n)\
                {\
                return pair(n, infinite_list(n+1))\
                ;}\
                const a = head(tail(tail(tail(tail(infinite_list(1))))));\
                a;"
              );

// 5
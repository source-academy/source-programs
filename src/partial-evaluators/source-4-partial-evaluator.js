//Given a program, list of global variables, and list of global values
//Note: variables and values are corresponding respect to its order
function partial_evaluation(f, names, values) {
    let name = list_ref(function_name(f), 1);
    let binded_f = bind(f, names, values);
    
    let final_simplified = null;
    while (!equal(final_simplified, binded_f)) {
        final_simplified = binded_f;
        
        binded_f = repeatedDFSapplication(binded_f, function_parameters(binded_f));
        binded_f = merge_simplified_conditionals(binded_f);
    }
    
    let pretty_printed = pretty_print(final_simplified);
    display(pretty_printed);
    
    return final_simplified;
}

//prints all simplified math expressions in the function
function pretty_print(f) {
    if (!is_list(f)) {
        return f;
    } else {
        if (is_math_application(f) || is_number(f) || is_variable(f)) {
            let pretty_printed_expression = pretty_print_application(f)+";";
            //display("-----simplified expression-----");
            //display(pretty_printed_expression);
            //display("-------------------------------");
            return pretty_printed_expression;
        } else {
            return build_list(length(f), i => pretty_print(list_ref(f, i)));
        }
    }
}

function pretty_print_application(f) {
    let operation = application_operation(f);
    let parameter1 = application_parameter1(f);
    let parameter2 = application_parameter2(f);
    if (operation === "+") {
        return "(" + pretty_print_application(parameter1)
        + " + " + pretty_print_application(parameter2) + ")";
    } else if (operation === "-") {
        return "(" + pretty_print_application(parameter1)
        + " - " + pretty_print_application(parameter2) + ")";
    } else if (operation === "*") {
        return "(" + pretty_print_application(parameter1)
        + " * " + pretty_print_application(parameter2) + ")";
    } else if (operation === "/") {
        return "(" + pretty_print_application(parameter1)
        + " / " + pretty_print_application(parameter2) + ")";
    } else if (is_variable(f)) {
        return list_ref(f, 1);
    } else {
        return stringify(f);
    }
}

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

function is_constant_declaration(f) {
    return is_tagged_list(f, "constant_declaration");
}

function is_function_definition(f) {
    return is_tagged_list(f, "function_definition");
}

function is_sequence(f) {
    return is_tagged_list(f, "sequence");
}

function is_return_statement(f) {
    return is_tagged_list(f, "return_statement");
}

function is_math_application(f) {
    if (!is_tagged_list(f, "application")) {
        return false;
    } else {
        let op = list_ref(list_ref(f, 1), 1);
        return op === "+" ||  op === "-" || op === "*" || op === "/";
    }
}

function is_variable(f) {
    return is_tagged_list(f, "name")
    && list_ref(f, 1) !== "==="
    && list_ref(f, 1) !== "!=="
    && list_ref(f, 1) !== ">"
    && list_ref(f, 1) !== "<"
    && list_ref(f, 1) !== ">="
    && list_ref(f, 1) !== "<=";
}

//Verify if a statement is a conditional statement
function is_conditional_statement(f) {
    return is_tagged_list(f, "conditional_statement");
}

//Verify if a statement is a conditional expression
function is_conditional_expression(f) {
    return is_tagged_list(f, "conditional_expression");
}

//Verify if a condition is evaluable
function is_trivial_condition(f) {
    if (is_tagged_list(f, "application")) {
        let operation = list_ref(list_ref(f, 1), 1);
        let parameters = list_ref(f, 2);
        let lhs = list_ref(parameters, 0);
        let rhs = list_ref(parameters, 1);
        return (operation === "===" 
                || operation === "!=="
                || operation === ">"
                || operation === "<"
                || operation === ">="
                || operation === "<=")
                && is_number(lhs)
                && is_number(rhs);
    } else {
        if (is_boolean(f)) {
            return true;
        } else {
            return false;
        }
    }
}

//Evaluate the boolean value of an evaluable condition
function evaluate_trivial_condition(f) {
    if (is_tagged_list(f, "application")) {
        let operation = list_ref(list_ref(f, 1), 1);
        let parameters = list_ref(f, 2);
        let lhs = list_ref(parameters, 0);
        let rhs = list_ref(parameters, 1);
        if (operation === "===") {
            return lhs === rhs;
        } else if (operation === "!==") {
            return lhs !== rhs;
        } else if (operation === ">") {
            return lhs > rhs;
        } else if (operation === "<") {
            return lhs < rhs;
        } else if (operation === ">=") {
            return lhs >= rhs;
        } else if (operation === "<=") {
            return lhs <= rhs;
        } else {
            return false;
        }
    } else {
        if (is_boolean(f)) {
            return f;
        } else{
            return false;
        }
    }
}

//Evaluate the boolean value of a variable condition if possible
function evaluate_true_variable_equation(f) {
    if (is_tagged_list(f, "application")) {
        let operation = list_ref(list_ref(f, 1), 1);
        let parameters = list_ref(f, 2);
        let lhs = list_ref(parameters, 0);
        let rhs = list_ref(parameters, 1);
        if (operation === "===" 
            || operation === "<="
            || operation === ">=") {
            return equal(lhs, rhs) || lhs === rhs;
        }
        else {
            return false;
        }
    } else {
        return false;
    }
}

//Evaluate the boolean value of a variable condition if possible
function evaluate_false_variable_equation(f) {
    if (is_tagged_list(f, "application")) {
        let operation = list_ref(list_ref(f, 1), 1);
        let parameters = list_ref(f, 2);
        let lhs = list_ref(parameters, 0);
        let rhs = list_ref(parameters, 1);
        if (operation === "!==" 
            || operation === "<"
            || operation === ">") {
            return equal(lhs, rhs) || lhs === rhs;
        }
        else {
            return false;
        }
    } else {
        return false;
    }
}

function var_name(v) {
    if (!is_variable(v)) {
        return undefined;
    } else {}
    
    return list_ref(v, 1);
}

//The name of function
function function_name(f) {
    if (!is_constant_declaration(f)) {
        return undefined;
    } else {}
    
    return list_ref(f, 1);
}

//The function definition of the function
function function_definition(f) {
    if (!is_constant_declaration(f)) {
        return undefined;
    } else {}
    
    return list_ref(f, 2);
}

//The parameter pair of a math application
function function_parameters(f) {
    if (!is_function_definition(f)){
        if(!is_constant_declaration(f)
        || !is_function_definition(list_ref(f, 2))){
            return undefined;
        } else {}
        f = list_ref(f, 2);
    } else {}
    
    return list_ref(f, 1);
}

//The return block of a function
function function_return(f) {
    if (!is_function_definition(f)){
        if(!is_constant_declaration(f)
        || !is_function_definition(list_ref(f, 2))){
            return undefined;
        } else {}
        f = list_ref(f, 2);
    } else {}
    
    f = list_ref(f, 2);
    
    return f;
}

//The operator of a math application
function application_operation(f){
    if (!is_math_application(f)){
        return undefined;
    } else {}
    
    return list_ref(list_ref(f, 1), 1);
}

//The first paramter of a math application
function application_parameter1(f){
    if (!is_math_application(f)){
        return undefined;
    } else {}
    
    let parameters = list_ref(f, 2);
    return list_ref(parameters, 0);
}

//The second paramter of a math application
function application_parameter2(f){
    if (!is_math_application(f)){
        return undefined;
    } else {}
    
    let parameters = list_ref(f, 2);
    return list_ref(parameters, 1);
}

//The condition of a conditional
function condition(f) {
    if (!is_conditional_statement(f) 
        && !is_conditional_expression(f)) {
        return undefined;
    } else {
        return list_ref(f, 1);
    }
}

//The true branch of a conditional
function true_branch(f) {
    if (!is_conditional_statement(f) 
        && !is_conditional_expression(f)) {
        return undefined;
    } else {
        return list_ref(f, 2);
    }
}

//The false branch of a conditional
function false_branch(f) {
    if (!is_conditional_statement(f) 
        && !is_conditional_expression(f)) {
        return undefined;
    } else {
        return list_ref(f, 3);
    }
}

//Substitute all variables given the global values
function bind(sequence, names, values) {
    function helper(m) {
        if (is_variable(m)) {
            if (!is_null(member(var_name(m), names))) {
                let sublist = member(var_name(m), names);
                let value = list_ref(values, 
                                    length(values) - length(sublist));
                return value;
            } else {
                return m;
            }
        } else {
            if (is_list(m)) {
                return bind(m, names, values);
            } else {
                return m;
            }
        }
    }
    
    return map(helper, sequence);
}

//Omit the other branch if the condition is evaluable, 
//leave it if not
function branching(conditional, bool) {
    let true_b = true_branch(conditional);
    let false_b = false_branch(conditional);
    if (bool) {
        if (is_conditional_statement(conditional)) {
            if (is_sequence(list_ref(true_b, 1))) {
                return list_ref(list_ref(true_b, 1), 1);
            } else {
                return list(list_ref(true_b, 1));
            }
        }
        else {
            if (is_conditional_expression(conditional)) {
                return list(true_b);
            } else {}
        }
    } else {
        if (is_conditional_statement(conditional)) {
            if (is_sequence(list_ref(false_b, 1))) {
                return list_ref(list_ref(false_b, 1), 1);
            } else {
                return list(list_ref(false_b, 1));
            }
        }
        else {
            if (is_conditional_expression(conditional)) {
                return list(false_b);
            } else {}
        }
    }
}

//Removes all trivial conditionals after arithmetic simplification
function merge_simplified_conditionals(f) {
    if (is_null(f)) {
        return f;
    } else {
        if (is_list(head(f))) {
            if ((is_conditional_statement(head(f))
                || is_conditional_expression(head(f)))
                && is_trivial_condition(condition(head(f)))) {
                return append(merge_simplified_conditionals(branching(head(f), 
                            evaluate_trivial_condition(condition(head(f))))),
                            merge_simplified_conditionals(tail(f)));
            } else {
                return append(list(merge_simplified_conditionals(head(f))), 
                                    merge_simplified_conditionals(tail(f)));
            }
        } else {
            return append(list(head(f)), 
                            merge_simplified_conditionals(tail(f)));
        }
    }
}

//doing DFS multiple times on the function to find to simplify math expressions
function repeatedDFSapplication(return_sequence, parameter_order) {
    let PE = DFSapplication(return_sequence, parameter_order);
    let i = 0;
    const limit = 20; //additional precaution against too many loops
    while (!equal(PE, return_sequence) && i < limit){
        return_sequence = PE;
        PE = DFSapplication(PE, parameter_order);
        i = i + 1;
    }
    return PE;
}

//simplifies math applications and leaves everything else alone
function DFSapplication(f, parameter_order) {
    if (!is_list(f)) { 
        return f;
    } else {
        if (is_math_application(f)) {
            return simplifyFoundApplication(f, parameter_order);
        } else if (evaluate_true_variable_equation(f)) {
            return true;
        } else if (evaluate_false_variable_equation(f)) {
            return false;
        } else {
            return build_list(length(f), i => DFSapplication(list_ref(f, i), parameter_order));
        }
    }
}

//does a single operation to standardise and simplify a math application
//and recursivisely searches for more math applications
function simplifyFoundApplication(f, parameter_order) {
    let operation = application_operation(f);
    let parameter1 = application_parameter1(f);
    let parameter2 = application_parameter2(f);
    
    if (operation === "+") { //X + Y
        if (parameter1 === 0) {
            return parameter2;
        } else if (parameter2 === 0) {
            return parameter1;
        } else if (is_number(parameter1) && is_number(parameter2)) {
            return parameter1 + parameter2;
        } else if (!is_number(parameter1) && is_number(parameter2)
        || is_variable(parameter2) && is_math_application(parameter1)) {
            return form_application("+", 
                parameter2,
                DFSapplication(parameter1, parameter_order));
        } else if ((!is_number(parameter1) && is_number(application_parameter1(parameter2))
        || is_variable(application_parameter1(parameter2)) && is_math_application(parameter1))
        && application_operation(parameter2) === "+") {
            let subaddition = form_application("+", 
                parameter1, application_parameter2(parameter2));
            
            return form_application("+", 
                DFSapplication(application_parameter1(parameter2), parameter_order),
                DFSapplication(subaddition, parameter_order));
        } else if (is_list(parameter1) && is_list(parameter1) && (length(parameter1) < length(parameter1) 
	|| clear_constant_and_check_is_before_addition(parameter2, parameter1, parameter_order))) {
            return form_application("+", 
                DFSapplication(parameter2, parameter_order),
                DFSapplication(parameter1, parameter_order));
        } else if (is_number(parameter1) && is_number(application_parameter1(parameter2))
        && application_operation(parameter2) === "+") {
            return form_application("+", 
                parameter1 + application_parameter1(parameter2),
                DFSapplication(application_parameter2(parameter2), parameter_order));
        } else if (application_operation(parameter1) === "+") {
            let subaddition = form_application("+", 
            application_parameter2(parameter1), parameter2);
            
            let mainaddition = form_application("+", 
            DFSapplication(application_parameter1(parameter1), parameter_order), DFSapplication(subaddition, parameter_order));
            
            return mainaddition;
        } else if ((is_number(application_parameter1(parameter2)) || application_operation(application_parameter1(parameter2)) === "/")
        && application_operation(parameter2) === "+") {
            let subaddition = form_application("+", 
            application_parameter2(parameter2), parameter1);
            
            let mainaddition = form_application("+", 
            application_parameter1(parameter2), DFSapplication(subaddition, parameter_order));
            
            return mainaddition;
        } else if (application_operation(parameter2) === "+") {
            parameter1 = DFSapplication(parameter1, parameter_order);
            let newpara2para1 = DFSapplication(application_parameter1(parameter2), parameter_order);
            let numerator_p1 = 1;
            let numerator_p2 = 1;
            let denominator_p1 = 1;
            let denominator_p2 = 1;
            let p1 = parameter1;
            let p2 = newpara2para1;
            while (application_operation(p1) === "*" 
            && is_number(application_parameter1(p1))) {
                numerator_p1 = numerator_p1 * application_parameter1(p1);
                p1 = application_parameter2(p1);
            }
            while (application_operation(p1) === "*" 
            && application_operation(application_parameter1(p1)) === "/" 
            && is_number(application_parameter2(application_parameter1(p1)))) {
                denominator_p1 = denominator_p1 * application_parameter2(application_parameter1(p1));
                p1 = application_parameter2(p1);
            }
            while (application_operation(p1) === "*" 
            && application_operation(application_parameter1(p1)) === "/" 
            && application_operation(application_parameter2(application_parameter1(p1))) === "*"
            && is_number(application_parameter1(application_parameter2(application_parameter1(p1))))) {
                denominator_p1 = denominator_p1 * application_parameter1(application_parameter2(application_parameter1(p1)));
                let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p1))));
                p1 = form_application("*", denominator_extract, application_parameter2(p1));
            }
            while (application_operation(p2) === "*" 
            && is_number(application_parameter1(p2))) {
                numerator_p2 = numerator_p2 * application_parameter1(p2);
                p2 = application_parameter2(p2);
            }
            while (application_operation(p2) === "*" 
            && application_operation(application_parameter1(p2)) === "/" 
            && is_number(application_parameter2(application_parameter1(p2)))) {
                denominator_p2 = denominator_p2 * application_parameter2(application_parameter1(p2));
                p2 = application_parameter2(p2);
            }
            while (application_operation(p2) === "*" 
            && application_operation(application_parameter1(p2)) === "/" 
            && application_operation(application_parameter2(application_parameter1(p2))) === "*"
            && is_number(application_parameter1(application_parameter2(application_parameter1(p2))))) {
                denominator_p2 = denominator_p2 * application_parameter1(application_parameter2(application_parameter1(p2)));
                let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p2))));
                p2 = form_application("*", denominator_extract, application_parameter2(p2));
            }
            
            if (equal(p1, p2)) {
                numerator_p1 = numerator_p1 * denominator_p2 + numerator_p2 * denominator_p1;
                denominator_p1 = denominator_p1 * denominator_p2;
                if(numerator_p1 === denominator_p1){
                    numerator_p1 = 1;
                    denominator_p1 = 1;
                } else {}
                let reciprocal = form_application("/", 1, denominator_p1);
                
                let submultiply1 = form_application("*", reciprocal, p1);
                let submultiply2 = form_application("*", numerator_p1, submultiply1);
                let addition = form_application("+", submultiply2, DFSapplication(application_parameter2(parameter2), parameter_order));
                
                return DFSapplication(addition, parameter_order);
            } else if (is_list(p1) && is_list(p2) && (length(p2) < length(p1) || is_before_addition(p2, p1, parameter_order))) {
                let subaddition = form_application("+", 
                parameter1, application_parameter2(parameter2));
            
                return form_application("+", 
                    DFSapplication(newpara2para1, parameter_order),
                    DFSapplication(subaddition, parameter_order));
            } else {}
            
            let subaddition = DFSapplication(form_application("+", 
                newpara2para1,
                application_parameter2(parameter2)), parameter_order);
                
            return form_application("+", parameter1, subaddition);
        } else {
            //merge terms if their variables are the same
            parameter1 = DFSapplication(parameter1, parameter_order);
            parameter2 = DFSapplication(parameter2, parameter_order);
            let numerator_p1 = 1;
            let numerator_p2 = 1;
            let denominator_p1 = 1;
            let denominator_p2 = 1;
            let p1 = parameter1;
            let p2 = parameter2;
            while (application_operation(p1) === "*" 
            && is_number(application_parameter1(p1))) {
                numerator_p1 = numerator_p1 * application_parameter1(p1);
                p1 = application_parameter2(p1);
            }
            while (application_operation(p1) === "*" 
            && application_operation(application_parameter1(p1)) === "/" 
            && is_number(application_parameter2(application_parameter1(p1)))) {
                denominator_p1 = denominator_p1 * application_parameter2(application_parameter1(p1));
                p1 = application_parameter2(p1);
            }
            while (application_operation(p1) === "*" 
            && application_operation(application_parameter1(p1)) === "/" 
            && application_operation(application_parameter2(application_parameter1(p1))) === "*"
            && is_number(application_parameter1(application_parameter2(application_parameter1(p1))))) {
                denominator_p1 = denominator_p1 * application_parameter1(application_parameter2(application_parameter1(p1)));
                let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p1))));
                p1 = form_application("*", denominator_extract, application_parameter2(p1));
            }
            while (application_operation(p2) === "*" 
            && is_number(application_parameter1(p2))) {
                numerator_p2 = numerator_p2 * application_parameter1(p2);
                p2 = application_parameter2(p2);
            }
            while (application_operation(p2) === "*" 
            && application_operation(application_parameter1(p2)) === "/" 
            && is_number(application_parameter2(application_parameter1(p2)))) {
                denominator_p2 = denominator_p2 * application_parameter2(application_parameter1(p2));
                p2 = application_parameter2(p2);
            }
            while (application_operation(p2) === "*" 
            && application_operation(application_parameter1(p2)) === "/" 
            && application_operation(application_parameter2(application_parameter1(p2))) === "*"
            && is_number(application_parameter1(application_parameter2(application_parameter1(p2))))) {
                denominator_p2 = denominator_p2 * application_parameter1(application_parameter2(application_parameter1(p2)));
                let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p2))));
                p2 = form_application("*", denominator_extract, application_parameter2(p2));
            }
            
            if (equal(p1, p2)) {
                numerator_p1 = numerator_p1 * denominator_p2 + numerator_p2 * denominator_p1;
                denominator_p1 = denominator_p1 * denominator_p2;
                if(numerator_p1 === denominator_p1){
                    numerator_p1 = 1;
                    denominator_p1 = 1;
                } else {}
                let reciprocal = form_application("/", 1, denominator_p1);
                
                let submultiply = form_application("*", reciprocal, p1);
                
                let mainmultiply = DFSapplication(form_application("*", numerator_p1, submultiply), parameter_order);
                
                return mainmultiply;
            } else if(is_list(p1) && is_list(p2) && (length(p2) < length(p1) || is_before_addition(p2, p1, parameter_order))){
                let temp = parameter1;
                parameter1 = parameter2;
                parameter2 = temp;
            } else {}
            
            return form_application("+", parameter1, parameter2);
        }
    } else if (operation === "-") { //X - Y = X + (-1 * Y)
        let negatedparameter2 = form_application("*", -1, parameter2);
        
        let sum = form_application("+", 
                DFSapplication(parameter1, parameter_order), DFSapplication(negatedparameter2, parameter_order));
                
        return sum;
    } else if (operation === "*") { //X * (Y + Z) = X * Y + X * Z
        if (application_operation(parameter2) === "+") {
            let distributed1 = form_application("*", 
                parameter1, application_parameter1(parameter2));
            
            let distributed2 = form_application("*", 
                parameter1, application_parameter2(parameter2));
            
            let distributedSum = form_application("+", 
                DFSapplication(distributed1, parameter_order), DFSapplication(distributed2, parameter_order));
                
            return distributedSum;
        } else if (application_operation(parameter1) === "+") {
            let distributed1 = form_application("*", 
                parameter2, application_parameter1(parameter1));
            
            let distributed2 = form_application("*", 
                parameter2, application_parameter2(parameter1));
            
            let distributedSum = form_application("+", 
                DFSapplication(distributed1, parameter_order), DFSapplication(distributed2, parameter_order));
                
            return distributedSum;
        } else if (parameter1 === 1) {
            return parameter2;
        } else if (parameter1 === 0 || parameter2 === 0) {
            return 0;
        } else if (is_number(parameter1) && is_number(parameter2)) {
            return parameter1 * parameter2;
        } else if ((application_operation(parameter2)) === "/"
        && application_parameter1(parameter2) === 1 && equal(parameter1, application_parameter2(parameter2))) {
            return 1;
        } else if (application_operation(parameter2) === "*" && application_operation(application_parameter1(parameter2)) === "/"
        && application_parameter1(application_parameter1(parameter2)) === 1
        && equal(parameter1, application_parameter2(application_parameter1(parameter2)))) {
            return form_application("*", 
                1, DFSapplication(application_parameter2(parameter2), parameter_order));
        } else if (is_number(parameter1) && is_number(application_parameter1(parameter2)) && application_operation(parameter2) === "*") {
            return form_application("*", 
                parameter1 * application_parameter1(parameter2),
                DFSapplication(application_parameter2(parameter2), parameter_order));
        } else if (is_math_application(parameter1) && application_operation(parameter1) !== "/" && !is_math_application(parameter2)
            || (!is_math_application(parameter1) && !is_math_application(parameter2)
            && is_before_multiply(parameter2, parameter1, parameter_order))
            //|| application_operation(parameter1) === "/" && application_operation(parameter2) !== "/"
            || application_operation(parameter2) === "/" && application_operation(parameter1) !== "/"
            ) {
                return form_application("*", 
                    DFSapplication(parameter2, parameter_order), DFSapplication(parameter1, parameter_order));
        } else if (application_operation(parameter1) === "*") {
            let submultiply = form_application("*", 
            application_parameter2(parameter1), parameter2);
            
            let mainmultiply = form_application("*", 
            DFSapplication(application_parameter1(parameter1), parameter_order), DFSapplication(submultiply, parameter_order));
            
            return mainmultiply;
        } else if (is_number(application_parameter1(parameter2))
        && application_operation(parameter2) === "*"
        || application_operation(application_parameter1(parameter2)) === "/"
        && application_operation(parameter2) === "*" && is_variable(parameter1)
        ) {
            let submultiply = form_application("*", 
            application_parameter2(parameter2), parameter1);
            
            let mainmultiply = form_application("*", 
            application_parameter1(parameter2), DFSapplication(submultiply, parameter_order));
            
            return mainmultiply;
        } else if (!is_number(application_parameter1(parameter2)) && !is_number(parameter1) 
        && application_operation(parameter2) === "*" && is_before_multiply(application_parameter1(parameter2), parameter1, parameter_order)
        ) {
            let submultiply = form_application("*", 
            application_parameter2(parameter2), parameter1);
            
            let mainmultiply = form_application("*", 
            application_parameter1(parameter2), DFSapplication(submultiply, parameter_order));
            
            return mainmultiply;
        } else if (application_operation(parameter1) === "/" && application_operation(parameter2) === "/"
        ) {
            let submultiply1 = form_application("*", 
            application_parameter1(parameter1), application_parameter1(parameter2));
            
            let submultiply2 = form_application("*", 
            application_parameter2(parameter1), application_parameter2(parameter2));
            
            let mainmultiply = form_application("/", 
            DFSapplication(submultiply1, parameter_order), DFSapplication(submultiply2, parameter_order));
            
            return mainmultiply;
        } else if (application_operation(parameter1) === "/" && application_operation(application_parameter1(parameter2)) === "/"
        && application_operation(parameter2) === "*" 
        ) {
            let submultiply1 = form_application("*", 
            application_parameter1(parameter1), application_parameter1(application_parameter1(parameter2)));
            
            let submultiply2 = form_application("*", 
            application_parameter2(parameter1), application_parameter2(application_parameter1(parameter2)));
            
            let mainmultiply = form_application("/", 
            DFSapplication(submultiply1, parameter_order), DFSapplication(submultiply2, parameter_order));
            
            return form_application("*", 
            DFSapplication(mainmultiply, parameter_order), DFSapplication(application_parameter2(parameter2), parameter_order));
        } else {
            return form_application("*", 
                DFSapplication(parameter1, parameter_order), DFSapplication(parameter2, parameter_order));
        }
    } else if (operation === "/") {
        if (parameter2 === 1) {
            //this has 1 as denominator
            return parameter1;
        } else if (equal(parameter1, parameter2)) {
            return 1;
        } else if (parameter1 === 1 && application_operation(parameter2) !== "/") {
            let extracted_denominator_denominator = 1;
            if (application_operation(parameter2) === "*") {
                let checkparameter2 = application_parameter1(parameter2);
                if (application_operation(checkparameter2) === "/"
                && application_parameter1(checkparameter2) === 1) {
                    extracted_denominator_denominator = application_parameter2(checkparameter2);
                    parameter2 = application_parameter2(parameter2);
                } else if (is_number(checkparameter2) && application_operation(application_parameter2(parameter2)) === "*") {
                    let checkparameter2 = application_parameter1(application_parameter2(parameter2));
                    if(application_operation(checkparameter2) === "/"
                    && application_parameter1(checkparameter2) === 1){
                        extracted_denominator_denominator = application_parameter2(checkparameter2);
                        parameter2 = form_application("*", application_parameter1(parameter2), application_parameter2(application_parameter2(parameter2)));
                            display(parameter2);
                    } else {}
                } else {}
            } else {}
            
            //this has 1 as numerator && the denominator has no denominator
            return form_application("/", 
                extracted_denominator_denominator, DFSapplication(parameter2, parameter_order));
        } else {
            let reciprocal_numerator = 1;
            let reciprocal_denominator = parameter2;
            
            if (application_operation(parameter2) === "/") {
                reciprocal_numerator = application_parameter2(parameter2);
                reciprocal_denominator = application_parameter1(parameter2);
            } else {}
            
            let reciprocal = form_application("/", reciprocal_numerator, reciprocal_denominator);

            let productWithReciprocal = form_application("*", 
                DFSapplication(reciprocal, parameter_order), DFSapplication(parameter1, parameter_order));
            
            return productWithReciprocal;
        }
    } else {
        return f;
    }
}

//for + operations, clear the constants and return whether to swap the parameters to sort it by variable terms
function clear_constant_and_check_is_before_addition(p1, p2, parameter_order) {
    let numerator_p1 = 1;
    let numerator_p2 = 1;
    let denominator_p1 = 1;
    let denominator_p2 = 1;
    while (application_operation(p1) === "*" 
    && is_number(application_parameter1(p1))) {
        numerator_p1 = numerator_p1 * application_parameter1(p1);
        p1 = application_parameter2(p1);
    }
    while (application_operation(p1) === "*" 
    && application_operation(application_parameter1(p1)) === "/" 
    && is_number(application_parameter2(application_parameter1(p1)))) {
        denominator_p1 = denominator_p1 * application_parameter2(application_parameter1(p1));
        p1 = application_parameter2(p1);
    }
    while (application_operation(p1) === "*" 
    && application_operation(application_parameter1(p1)) === "/" 
    && application_operation(application_parameter2(application_parameter1(p1))) === "*"
    && is_number(application_parameter1(application_parameter2(application_parameter1(p1))))) {
        denominator_p1 = denominator_p1 * application_parameter1(application_parameter2(application_parameter1(p1)));
        let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p1))));
        p1 = form_application("*", denominator_extract, application_parameter2(p1));
    }
    while (application_operation(p2) === "*" 
    && is_number(application_parameter1(p2))) {
        numerator_p2 = numerator_p2 * application_parameter1(p2);
        p2 = application_parameter2(p2);
    }
    while (application_operation(p2) === "*" 
    && application_operation(application_parameter1(p2)) === "/" 
    && is_number(application_parameter2(application_parameter1(p2)))) {
        denominator_p2 = denominator_p2 * application_parameter2(application_parameter1(p2));
        p2 = application_parameter2(p2);
    }
    while (application_operation(p2) === "*" 
    && application_operation(application_parameter1(p2)) === "/" 
    && application_operation(application_parameter2(application_parameter1(p2))) === "*"
    && is_number(application_parameter1(application_parameter2(application_parameter1(p2))))) {
        denominator_p2 = denominator_p2 * application_parameter1(application_parameter2(application_parameter1(p2)));
        let denominator_extract = form_application("/", 1, application_parameter2(application_parameter2(application_parameter1(p2))));
        p2 = form_application("*", denominator_extract, application_parameter2(p2));
    }
    return is_before_addition(p1, p2, parameter_order);
}

//for + operations, return whether to swap the parameters to sort it by variable terms
function is_before_addition(p1, p2, parameter_order) {
    if (application_operation(p1) === "*" && application_operation(p2) === "*") {
        let p1head = application_parameter1(p1);
        let p2head = application_parameter1(p2);
        if (is_variable(p1head) && is_variable(p2head) && !equal(p1head, p2head)) {
            return is_before_multiply(p1head, p2head, parameter_order);
        } else {
            return is_before_addition(application_parameter2(p1), application_parameter2(p2), parameter_order);
        }
    } else if (is_variable(p1) && is_variable(p2)) {
        return is_before_multiply(p1, p2, parameter_order);
    } else {
        return false;
    }
}

//for * operation, return whether to swap ther variable order to sort it by parameter order
function is_before_multiply(p1, p2, parameter_order) {
    let result = false;
    if (application_operation(p2) === "/") {
        result = false;
    } else if (is_number(p1) && !is_number(p2)) {
        result = true;
    } else if (!is_number(p1) && is_number(p2)) {
        result = false;
    } else if (parameter_order === null) {
        result = false;
    } else if (equal(list_ref(parameter_order, 0), p2)) {
        result = false;
    } else if (equal(list_ref(parameter_order, 0), p1)) {
        result = true;
    } else {
        result = is_before_multiply(p1, p2, tail(parameter_order));
    }
    return result;
}

//creates a math application
function form_application(operation, parameter1, parameter2){
    let app =
    [
        "application",
        [
            ["name", [operation, null]],
            [
                [
                    parameter1,
                    [
                        parameter2,
                        null
                    ]
                ],
                null
            ]
        ]
    ];
    return app;
}

//creates a function
function form_function(function_name, parameter_order, simplified_return_sequence){
    let func =
    [ "constant_declaration",
    [ ["name", [function_name, null]],
    [ [ "function_definition",
      [ parameter_order,
      [simplified_return_sequence, null] ] ],
    null ] ] ];
    return func;
}


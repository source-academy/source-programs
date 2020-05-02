/*
Partial Evaluator for Source §2 
*/

let constevaluation=1;
let checkcondst=0;
let some=null;

// constants (numbers, booleans)
// are considered "self_evaluating". This means, they
// represent themselves in the syntax tree

function is_self_evaluating(stmt) {
    return is_number(stmt) ||
           is_string(stmt) || 
           is_boolean(stmt);
}
   
// all other statements and expressions are
// tagged lists. Their tag tells us what
// kind of statement/expression they are

function is_tagged_list(stmt, the_tag) {
    return is_pair(stmt) && head(stmt) === the_tag;
}

/* NAMES */

// In this evaluator, the operators are referred
// to as "names" in expressions.

// Names are tagged with "name".
// In this evaluator, typical names
// are 
// list("name", "+")
// list("name", "factorial")
// list("name", "n")

function is_name(stmt) {
    return is_tagged_list(stmt, "name");
}
function name_of_name(stmt) {
    return head(tail(stmt));
}

/* CONSTANT DECLARATIONS */

// constant declarations are tagged with "constant_declaration"
// and have "name" and "value" properties

function is_constant_declaration(stmt) {
   return is_tagged_list(stmt, "constant_declaration");
}
function constant_declaration_name(stmt) {
   return head(tail(head(tail(stmt))));
}
function constant_declaration_value(stmt) {
   return head(tail(tail(stmt)));
}
      
// evaluation of a constant declaration evaluates
// the right-hand expression and binds the
// name to the resulting value in the
// first (innermost) frame

function eval_constant_declaration(stmt, env,final_pro) {
    const e=evaluate(constant_declaration_value(stmt), env,final_pro);
    set_name_value(constant_declaration_name(stmt),
        e,
        env);
    
    return "const "+constant_declaration_name(stmt)+" = "+(is_string(e)?e:stringify(e));
}


function func_eval_constant_declaration(stmt, env,final_pro) {
    set_name_value(constant_declaration_name(stmt),
        evaluate(constant_declaration_value(stmt), env,final_pro),
        env);
}

/* VARIABLE DECLARATIONS */

function is_variable_declaration(stmt) {
   return is_tagged_list(stmt, "variable_declaration");
}
function variable_declaration_name(stmt) {
   return head(tail(head(tail(stmt))));
}
function variable_declaration_value(stmt) {
   return head(tail(tail(stmt)));
}

function eval_variable_declaration(stmt, env,final_pro) {
    const e=evaluate(variable_declaration_value(stmt), env,final_pro);
    set_name_value(variable_declaration_name(stmt),
        e,
        env);
    return "let "+variable_declaration_name(stmt)+" = "+stringify(e);
}  

function is_conditional_statement(stmt) {
   return is_tagged_list(stmt, 
                "conditional_statement");
}
function cond_st_pred(stmt) {
   return list_ref(stmt, 1);
}
function cond_st_cons(stmt) {
   return list_ref(stmt, 2);
}
function cond_st_alt(stmt) {
   return list_ref(stmt, 3);
}
    
/* CONDITIONAL EXPRESSIONS */

// conditional expressions are tagged
// with "conditional_expression"

function is_conditional_expression(stmt) {
   return is_tagged_list(stmt, 
                "conditional_expression");
}
function cond_expr_pred(stmt) {
   return list_ref(stmt, 1);
}
function cond_expr_cons(stmt) {
   return list_ref(stmt, 2);
}
function cond_expr_alt(stmt) {
   return list_ref(stmt, 3);
}
function is_true(x) {
    return x === true;
}
function is_false(x) {
    return x === false;
}

// the meta-circular evaluation of conditional expressions
// evaluates the predicate and then the appropriate
// branch, depending on whether the predicate evaluates to
// true or not
function eval_conditional_expression(stmt, env,final_pro) {
    
    return is_true(evaluate(cond_expr_pred(stmt),
                            env,final_pro))
           ? evaluate(cond_expr_cons(stmt), env,final_pro)
           : is_false(evaluate(cond_expr_pred(stmt),
                            env, final_pro)) 
           ? evaluate(cond_expr_alt(stmt), env,final_pro)
           : evaluate(cond_expr_pred(stmt),
                            env, final_pro)+"?"+(is_string(evaluate(cond_expr_cons(stmt), env,final_pro))?evaluate(cond_expr_cons(stmt), env,final_pro):stringify(evaluate(cond_expr_cons(stmt), env,final_pro)))+":"+(is_string(evaluate(cond_expr_alt(stmt), env,final_pro))?evaluate(cond_expr_alt(stmt), env,final_pro):stringify(evaluate(cond_expr_alt(stmt), env,final_pro)));
}

function func_eval_conditional_expression(stmt, env, final_pro) {
    
    return is_true(evaluatefunc(cond_expr_pred(stmt),
                            env, final_pro)) 
           ? evaluatefunc(cond_expr_cons(stmt), env, final_pro)
           : is_false(evaluatefunc(cond_expr_pred(stmt),
                            env, final_pro)) 
           ? evaluatefunc(cond_expr_alt(stmt), env, final_pro)
           : evaluatefunc(cond_expr_pred(stmt),
                            env, final_pro)+"?"+(is_string(evaluatefunc(cond_expr_cons(stmt), env,final_pro))?evaluatefunc(cond_expr_cons(stmt), env,final_pro):stringify(evaluatefunc(cond_expr_cons(stmt), env,final_pro)))+":"+(is_string(evaluatefunc(cond_expr_alt(stmt), env,final_pro))?evaluatefunc(cond_expr_alt(stmt), env,final_pro):stringify(evaluatefunc(cond_expr_alt(stmt), env,final_pro)));
}

function eval_conditional_statement(stmt, env,final_pro) {
    return is_true(evaluate(cond_st_pred(stmt),
                            env,final_pro))
           ? evaluate(cond_st_cons(stmt), env,final_pro)
           : evaluate(cond_st_alt(stmt), env,final_pro);
} 


function eval_func_conditional_statement(stmt, env,final_pro) {
    let somea=0;
    let someb=0;
    let somec=0;
    let checkreturn =0;
    let predvar=evaluatefunc(cond_st_pred(stmt),
                            env,final_pro);
    somea=predvar;
    checkcondst=1;

    
    let temp=checkreturn;

                            
    let consvar=0;
    if(is_pair(evaluatefunc(cond_st_cons(stmt), env,final_pro))){
    consvar=head(evaluatefunc(cond_st_cons(stmt), env,final_pro));
                            
    checkreturn=tail(evaluatefunc(cond_st_cons(stmt), env,final_pro));}
    else{
        consvar=evaluatefunc(cond_st_cons(stmt), env,final_pro);
        checkreturn =0;
                                
    }

    if(checkreturn - temp===1){
        temp=checkreturn;
        checkreturn =0;
    }else{
        checkreturn =0;
    }

    let altvar=0;
    if(is_pair(evaluatefunc(cond_st_alt(stmt), env,final_pro))){
        altvar=head(evaluatefunc(cond_st_alt(stmt), env,final_pro));
        checkreturn=tail(evaluatefunc(cond_st_alt(stmt), env,final_pro));
    }else{
        altvar=evaluatefunc(cond_st_alt(stmt), env,final_pro);
        checkreturn =0;
    }

    let tempb=checkreturn;
    if(temp*checkreturn===1){
        checkreturn =1;
                                
    }else{
        checkreturn=0;
    }
    if(temp===1){
        someb=consvar;         
    }else{
        someb=undefined;
    }
    if(tempb===1){
        somec=altvar;
    }else{
        somec=undefined;
    }
    some=pair(pair(somea,pair(someb,somec)),some);
    checkcondst=1;
    return pair(checkreturn,checkreturn);
}

/* FUNCTION DEFINITION EXPRESSIONS */

// function definitions are tagged with "function_definition"
// have a list of "parameters" and a "body" statement

function is_function_definition(stmt) {
   return is_tagged_list(stmt, "function_definition");
}
function function_definition_parameters(stmt) {
   return head(tail(stmt));
}
function function_definition_body(stmt) {
   return head(tail(tail(stmt)));
}

// compound function values keep track of parameters, body
// and environment, in a list tagged as "compound_function"

function make_compound_function(parameters, body, env) {
    return list("compound_function",
                parameters, body, env);
}
function is_compound_function(f) {
    return is_tagged_list(f, "compound_function");
}
function function_parameters(f) {
    return list_ref(f, 1);
}
function function_body(f) {
    return list_ref(f, 2);
}
function function_environment(f) {
    return list_ref(f, 3);
}

// Partially evaluating function definition

function partial_eval(stmt,env,final_pro){
   
    let l=map(f => name_of_name(f), function_definition_parameters(stmt));
    let exenv=extend_environment(l, l, env);
    let s="";
    let x=0;
    let ll=l;
    
    for(x=0;x<length(l)-1;x=x+1){
        s=s+head(ll)+",";
        ll=tail(ll);
        
    }
    if(l!==null){
    s=s+head(ll);
    }
    else{s=s;}
    
    let ee=(evaluatefunc(make_block(function_definition_body(stmt)),exenv,final_pro));
    let e=head(ee);
    let checkreturn=tail(ee);
    if(checkreturn===0){
        e=undefined;
    }else{e=e;}
    
    
    if(checkcondst===1){
        
        while(some!==null){
            let wow=head(some);
            some=tail(some);
            let somea=head(wow);
            let someb=head(tail(wow));
            let somec=tail(tail(wow));
            if(someb===undefined){
                someb=e;
            }else{
                someb=someb;
            }
            if(somec===undefined){
                somec=e;
            }else{
                somec=somec;
            }
            
            e="("+(is_string(somea)?somea:stringify(somea)) + "? "  + (is_string(someb)?someb:(stringify(someb))) + ": " + (is_string(somec)?somec:(stringify(somec))) +")";
            somea=undefined;
            someb=undefined;
            somec=undefined;
        }
    }else{e=e;}
    
    if(checkreturn===1 || checkcondst===1){
        checkreturn =0;
        checkcondst=0;
        return "("+s+")"+" => "+(is_string(e)?e:stringify(e));
    }else{
        return "("+s+")"+" => "+"undefined";
    }
}

// evluating a function definition expression
// results in a function value. Note that the
// current environment is stored as the function
// value's environment

function eval_function_definition(stmt, env,final_pro) {
    if(constevaluation===0){
        return make_compound_function(
              map(name_of_name,
                  function_definition_parameters(stmt)),
              function_definition_body(stmt),
              env);
    }
    else{
        return partial_eval(stmt,env,final_pro);
    }
}

/* SEQUENCES */

// sequences of statements are just represented
// by tagged lists of statements by the parser.

function is_sequence(stmt) {
   return is_tagged_list(stmt, "sequence");
}
function make_sequence(stmts) {
   return list("sequence", stmts);
}
function sequence_statements(stmt) {   
   return head(tail(stmt));
}
function is_empty_sequence(stmts) {
   return is_null(stmts);
}
function is_last_statement(stmts) {
   return is_null(tail(stmts));
}
function first_statement(stmts) {
   return head(stmts);
}
function rest_statements(stmts) {
   return tail(stmts);
}

// to evaluate a sequence, we need to evaluate
// its statements one after the other, and return
// the value of the last statement. 
// An exception to this rule is when a return
// statement is encountered. In that case, the
// remaining statements are ignored and the 
// return value is the value of the sequence.

function eval_sequence(stmts, env, final_pro) {
    if (is_empty_sequence(stmts)) {
        return undefined;
    } else if (is_last_statement(stmts)) {
        const first_stmt_value = evaluate(first_statement(stmts),env,final_pro);
        if (is_block(first_statement(stmts)) || is_conditional_statement(first_statement(stmts))){
            final_pro=final_pro+first_stmt_value;
        }else if(is_string(first_stmt_value)){
            final_pro=final_pro+first_stmt_value+";";
        }else{
            final_pro=final_pro+stringify(first_stmt_value)+";";
        }
        return final_pro;
    } else {
        const first_stmt_value = 
            evaluate(first_statement(stmts),env,final_pro);
            
        if (is_return_statement(first_statement(stmts))) {
            if(is_string(first_stmt_value)){
                final_pro=final_pro+"return"+first_stmt_value+";";
            }else{
                final_pro=final_pro+"return"+stringify(first_stmt_value)+";";
            }
            
            return final_pro;
            
        } else {
            if (is_block(first_statement(stmts)) || is_conditional_statement(first_statement(stmts))){
                final_pro=final_pro+first_stmt_value;
            }
            else if(is_string(first_stmt_value)){
                final_pro=final_pro+first_stmt_value+";";
            }else{
                final_pro=final_pro+stringify(first_stmt_value)+";";
            }
            return eval_sequence(
                rest_statements(stmts),env,final_pro);
        }
    }
}

function func_eval_sequence(stmts, env,final_pro) {
    if (is_empty_sequence(stmts)) {
        return undefined;
    } else if (is_last_statement(stmts)) {
        let wowe= evaluatefunc(first_statement(stmts),
                                env,
                                final_pro);
        if (is_pair(wowe) && tail(wowe) ===1) {
            return wowe;
        } else {
            return [undefined,0];
        }
    } else {
        const first_stmt_value = 
            evaluatefunc(first_statement(stmts),env,final_pro);
        if (is_pair(first_stmt_value) && tail(first_stmt_value) ===1) {
            return first_stmt_value;
        } else {
            return func_eval_sequence(
                rest_statements(stmts),env,final_pro);
        }
    }
}


/* FUNCTION APPLICATION */

// The core of our evaluator is formed by the
// implementation of function applications.
// Applications are tagged with "application"
// and have "operator" and "operands"

function is_application(stmt) {
   return is_tagged_list(stmt, "application") ||
          is_tagged_list(stmt, "boolean_operation");
}
function operator(stmt) {
   return head(tail(stmt));
}
function operands(stmt) {
   return head(tail(tail(stmt)));
}
function no_operands(ops) {
   return is_null(ops);
}
function first_operand(ops) {
   return head(ops);
}
function rest_operands(ops) {
   return tail(ops);
}
      
// primitive functions are tagged with "primitive"      
// and come with a Source function "implementation"

function make_primitive_function(impl) {
    return list("primitive", impl);
}
function is_primitive_function(fun) {
   return is_tagged_list(fun, "primitive");
}
function primitive_implementation(fun) {
   return list_ref(fun, 1);
}

/* APPLY */

// apply_in_underlying_javascript allows us
// to make use of JavaScript's primitive functions
// in order to access operators such as addition

function apply_primitive_function(fun, argument_list) {
    return apply_in_underlying_javascript(
                primitive_implementation(fun),
                argument_list);     
}
    
// function application needs to distinguish between
// primitive functions (which are evaluated using the
// underlying JavaScript), and compound functions.
// An application of the latter needs to evaluate the
// body of the function value with respect to an 
// environment that results from extending the function
// object's environment by a binding of the function
// parameters to the arguments and of local names to
// the special value no_value_yet

function apply(fun, args,final_pro) {
    if (is_primitive_function(fun)) {
        let e= apply_primitive_function(fun, args);
        
        return e;
        
    } else if (is_compound_function(fun)) {
        const body = function_body(fun);
        const locals = local_names(body);
        const names = insert_all(function_parameters(fun),
                               locals);
        const temp_values = map(x => no_value_yet,
                              locals);
        const values = append(args, temp_values);              
        const result = evaluate(body,
                                extend_environment(
                                names,
                                values,
                                function_environment(fun)),final_pro);

        if (is_return_value(result)) {
            let e= return_value_content(result);
            return e;
         
        } else {
            return head(result);
        }
    } else {
       return "doagain";
    }
}

function fapply(stmt,env,final_pro){
    constevaluation=0;
    let e=apply(evaluate(operator(stmt), env,final_pro),
                  list_of_values(operands(stmt), env,final_pro),final_pro);
    if(e==="doagain"){
        
        let s="";
        let l=list_of_values(operands(stmt), env,final_pro);
        let ll=l;
        for(let x=0;x<length(l)-1;x=x+1){
            s=s+(is_string(head(ll))?head(ll):stringify(head(ll)))+",";
            ll=tail(ll);
        }
        if(l!==null){
        s=s+(is_string(head(ll))?head(ll):stringify(head(ll)));}else {s=s;}
        let ss="("+lookup_name_value(name_of_name(operator(stmt)), env)+")("+s+")";

        if(lookup_name_value(name_of_name(operator(stmt)), env)=== name_of_name(operator(stmt))){
            e=ss;
        }else{
            ss=ss+";";
            
            e= evaluate(parse(ss),env,final_pro);
            
        }
    }else{
        "1";
    }
    
    if(e==="doagain"){
        error( "Unknown function type in apply");
    }
    else{
        1;
    }
    constevaluation=1;
    return e;
}

// We use a nullary function as temporary value for names whose
// declaration has not yet been evaluated. The purpose of the
// function definition is purely to create a unique identity;
// the function will never be applied and its return value 
// (null) is irrelevant.
const no_value_yet = () => null;

// The function local_names collects all names declared in the
// body statements. For a name to be included in the list of
// local_names, it needs to be declared outside of any other
// block or function.

function insert_all(xs, ys) {
    return is_null(xs)
        ? ys
        : is_null(member(head(xs), ys))
          ? pair(head(xs), insert_all(tail(xs), ys))
          : error(head(xs), "multiple declarations of: ");
}

function local_names(stmt) {
    if (is_sequence(stmt)) {
        const stmts = sequence_statements(stmt);
        return is_empty_sequence(stmts)
            ? null
            : insert_all(
                  local_names(first_statement(stmts)),
                  local_names(make_sequence(
                       rest_statements(stmts))));
    } else {
       return is_constant_declaration(stmt)
           ? list(constant_declaration_name(stmt))
           : is_variable_declaration(stmt)
             ? list(variable_declaration_name(stmt))
             : null;
    }
}        

/* RETURN STATEMENTS */

// functions return the value that results from
// evaluating their expression

function is_return_statement(stmt) {
   return is_tagged_list(stmt, "return_statement");
}
function return_statement_expression(stmt) {
   return head(tail(stmt));
}
  
// since return statements can occur anywhere in the
// body, we need to identify them during the evaluation
// process

function make_return_value(content) {
    return list("return_value", content);
}
function is_return_value(value) {
    return is_tagged_list(value,"return_value");
}
function return_value_content(value) {
    return head(tail(value));
}
function eval_return_statement(stmt, env,final_pro) {
    if(constevaluation===0){
        return make_return_value(
               evaluate(return_statement_expression(stmt),
                        env,final_pro));
    }
    else{
        return pair(evaluatefunc(return_statement_expression(stmt),env,final_pro),1);
    }
}

/* ASSIGNMENT */

function is_assignment(stmt) {
   return is_tagged_list(stmt, "assignment");
}
function assignment_name(stmt) {
   return head(tail(head(tail(stmt))));
}
function assignment_value(stmt) {
   return head(tail(tail(stmt)));
}
function eval_assignment(stmt, env,final_pro) {
    const value = evaluate(assignment_value(stmt), env,final_pro);
    assign_name_value(assignment_name(stmt), value, env);
    return assignment_name(stmt)+" = "+stringify(value);
}

/* BLOCKS */

// blocks are tagged with "block"
function is_block(stmt) {
    return is_tagged_list(stmt, "block");
}
function make_block(stmt) {
   return list("block", stmt);
}
function block_body(stmt) {
    return head(tail(stmt));
}

// evaluation of blocks evaluates the body of the block
// with respect to the current environment extended by
// a binding of all local names to the special value
// no_value_yet

function eval_block(stmt, env,final_pro) {
   
    let body = block_body(stmt);
     if(is_sequence(body)){
       body=body;
    }
    else{
       body=["sequence", [[1, [body , null]], null]];
        
    }
    const locals = local_names(body);       
    const temp_values = map(x => no_value_yet,
                            locals);
    let evalv=evaluate(body,
                extend_environment(locals, temp_values, env),"");
    
    return "{"+(is_string(evalv)?evalv:stringify(evalv))+"}";
    
}
function func_eval_block(stmt, env,final_pro) {
    const body = block_body(stmt);
    const locals = local_names(body);       
    const temp_values = map(x => no_value_yet, locals);
    let wowe= evaluatefunc(body,
                            extend_environment(locals, temp_values, env),
                            final_pro);
    if (is_pair(wowe) && tail(wowe) ===1) {
        return wowe;
    } else {
        return [undefined,0];
    }
}
/* ENVIRONMENTS */

// frames are pairs with a list of names as head
// an a list of pairs as tail (values). Each value 
// pair has the proper value as head and a flag
// as tail, which indicates whether assignment
// is allowed for the corresponding name

function make_frame(names, values) {
    return pair(names, values);
}
function frame_names(frame) {    
    return head(frame);
}
function frame_values(frame) {    
    return tail(frame);
}

// The first frame in an environment is the
// "innermost" frame. The tail operation
// takes you to the "enclosing" environment

function first_frame(env) {
   return head(env);
}
function enclosing_environment(env) {
   return tail(env);
}
function enclose_by(frame,env) {
   return pair(frame,env);
}
function is_empty_environment(env) {
   return is_null(env);
}

// set_name_value is used for let and const to give
// the initial value to the name in the first
// (innermost) frame of the given environment

function set_name_value(name, val, env) {
    function scan(names, vals) {
        
        return is_null(names)
            ? error("internal error: name not found")
            : name === head(names)
              ? set_head(head(vals), val)
              : scan(tail(names), tail(vals));
    } 
    const frame = first_frame(env);
    return scan(frame_names(frame),
                frame_values(frame));
}

// name lookup proceeds from the innermost
// frame and continues to look in enclosing
// environments until the name is found

function lookup_name_value(name, env) {
    function env_loop(env) {
        function scan(names, vals) {
            return is_null(names)
                   ? env_loop(
                       enclosing_environment(env))
                   : name === head(names)
                     ? head(head(vals))
                     : scan(tail(names), tail(vals));
        }
        if (is_empty_environment(env)) {
            error(name, "Unbound name: ");
        } else {
            const frame = first_frame(env);
            const value =  scan(frame_names(frame),
                                frame_values(frame));
        if (value === no_value_yet) {
                return name;
            } else {
            return value;
        }
        }
    }
    return env_loop(env);
}

// to assign a name to a new value in a specified environment,
// we scan for the name, just as in lookup_name_value, and
// change the corresponding value when we find it,
// provided it is tagged as mutable

function assign_name_value(name, val, env) {
    function env_loop(env) {
        function scan(names, vals) {
            return is_null(names)
                ? env_loop(
                    enclosing_environment(env))
                : name === head(names)
                  ? ( tail(head(vals))
                      ? set_head(head(vals), val)
                      : error("no assignment " +
                          "to constants allowed") )
                  : scan(tail(names), tail(vals));
        } 
        if (is_empty_environment(env)) {
            error(name, "Unbound name in assignment: ");
        } else {
            const frame = first_frame(env);
            return scan(frame_names(frame),
                        frame_values(frame));
        }
    }
    return env_loop(env);
}

// applying a compound function to parameters will
// lead to the creation of a new environment, with
// respect to which the body of the function needs
// to be evaluated
// (also used for blocks)

function extend_environment(names, vals, base_env) {
    
    if (length(names) === length(vals)) {
        return enclose_by(
                   make_frame(names, 
                      map(x => pair(x, true), vals)),
                   base_env);
    } else if (length(names) < length(vals)) {
        error("Too many arguments supplied: " + 
              stringify(names) + ", " + 
              stringify(vals));
    } else {
        error("Too few arguments supplied: " + 
              stringify(names) + ", " + 
              stringify(vals));
    }
}

/* EVALUATE */

// list_of_values evaluates a given list of expressions
// with respect to an environment

function list_of_values(exps, env,final_pro) {
    if (no_operands(exps)) {
        return null;
    } else {
        let e= pair(evaluate(first_operand(exps), env,final_pro),
                    list_of_values(rest_operands(exps), env,final_pro));
        
        
        return e;
   }
}

// The workhorse of our evaluator is the evaluate function.
// It dispatches on the kind of statement at hand, and
// invokes the appropriate implementations of their
// evaluation process, as described above, always using
// a current environment
function evaluate(stmt, env,final_pro) {
    
   return is_self_evaluating(stmt)
          ?  stmt
        : is_name(stmt)
          ? lookup_name_value(name_of_name(stmt), env)
        : is_constant_declaration(stmt)
          ? eval_constant_declaration(stmt, env,final_pro)
        : is_variable_declaration(stmt)
          ? eval_variable_declaration(stmt, env,final_pro)
        : is_assignment(stmt)
          ? eval_assignment(stmt, env,final_pro)
        : is_conditional_expression(stmt)
          ? eval_conditional_expression(stmt, env,final_pro)
        : is_function_definition(stmt)
          ? eval_function_definition(stmt, env,final_pro)
        : is_sequence(stmt)
          ? eval_sequence(sequence_statements(stmt), env,final_pro)
        : is_block(stmt)
          ? eval_block(stmt, env,final_pro)
        : is_return_statement(stmt)
          ? eval_return_statement(stmt, env,final_pro)
        : is_application(stmt)
          ? fapply(stmt,env,final_pro)
        : is_conditional_statement(stmt)
          ? eval_conditional_statement(stmt,env,final_pro)
        : error(stmt, "Unknown statement type in evaluate: ");
}

function evaluatefunc(stmt, env,final_pro) {
   return is_self_evaluating(stmt)
          ?  stmt
        : is_name(stmt)
          ? lookup_name_value(name_of_name(stmt), env)
        : is_constant_declaration(stmt)
          ? func_eval_constant_declaration(stmt, env,final_pro)
        : is_variable_declaration(stmt)
          ? eval_variable_declaration(stmt, env,final_pro)
        : is_assignment(stmt)
          ? eval_assignment(stmt, env,final_pro)
        : is_conditional_expression(stmt)
          ? func_eval_conditional_expression(stmt, env,final_pro)
        : is_function_definition(stmt)
          ? eval_function_definition(stmt, env,final_pro)
        : is_sequence(stmt)
          ? func_eval_sequence(sequence_statements(stmt), env,final_pro)
        : is_block(stmt)
          ? func_eval_block(stmt, env,final_pro)
        : is_return_statement(stmt)
          ? eval_return_statement(stmt, env,final_pro)
        : is_application(stmt)
          ? fapply(stmt,env,final_pro)
        : is_conditional_statement(stmt)
          ? eval_func_conditional_statement(stmt,env,final_pro)
        : error(stmt, "Unknown statement type in evaluate: ");
}

// at the toplevel (outside of functions), return statements
// are not allowed. The function evaluate_toplevel detects
// return values and displays an error in when it encounters one.
// The program statement is wrapped in a block, to create the
// program environment.

function eval_toplevel(stmt,final_pro) {
   // wrap program in block to create
   // program environment
   
   const program_block = make_block(stmt);
   const value = evaluate(program_block, 
                          the_global_environment,final_pro);
    
   if (is_return_value(value)) {
       error("return not allowed " +
             "outside of function definitions");
   } else {
       return value;
   }
}

/* THE GLOBAL ENVIRONMENT */

const the_empty_environment = null;

// the global environment has bindings for all
// primitive functions, including the operators

const primitive_functions = list(
       list("pair",          (x,y) => pair(x,y)),
       list("display",       (x) => (!is_string(x))?"display("+stringify(x)+")":  "display('"+x+"')"      ),
       list("error",         (x) => (!is_string(x))?"error("+stringify(x)+")":  "error('"+x+"')"  ),
       list("&&",            (x,y) => (is_string(x) && !is_string(y))?"("+x+" && "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" && "+y+")":(is_string(x) && is_string(y))?"("+x+" && "+y+")": x && y  ),
       list("||",            (x,y) => (is_string(x) && !is_string(y))?"("+x+" || "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" || "+y+")":(is_string(x) && is_string(y))?"("+x+" || "+y+")": x || y  ),
       list("+",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" + "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" + "+y+")":(is_string(x) && is_string(y))?"("+x+" + "+y+")": x + y  ),
       list("-",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" - "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" - "+y+")":(is_string(x) && is_string(y))?"("+x+" - "+y+")": x - y  ),
       list("*",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" * "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" * "+y+")":(is_string(x) && is_string(y))?"("+x+" * "+y+")": x * y  ),
       list("/",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" / "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" / "+y+")":(is_string(x) && is_string(y))?"("+x+" / "+y+")": x / y  ),
       list("%",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" % "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" % "+y+")":(is_string(x) && is_string(y))?"("+x+" % "+y+")": x % y  ),
       list("===",           (x,y) => (is_string(x) && !is_string(y))?"("+x+" === "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" === "+y+")":(is_string(x) && is_string(y))?"("+x+" === "+y+")": x === y  ),
       list("!==",           (x,y) => (is_string(x) && !is_string(y))?"("+x+" !== "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" !== "+y+")":(is_string(x) && is_string(y))?"("+x+" !== "+y+")": x !== y  ),
       list("<",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" < "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" < "+y+")":(is_string(x) && is_string(y))?"("+x+" <"+y+")": x < y  ),
       list("<=",            (x,y) => (is_string(x) && !is_string(y))?"("+x+" <= "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" <= "+y+")":(is_string(x) && is_string(y))?"("+x+" <= "+y+")": x <= y  ),
       list(">",             (x,y) => (is_string(x) && !is_string(y))?"("+x+" > "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" > "+y+")":(is_string(x) && is_string(y))?"("+x+" > "+y+")": x > y  ),
       list(">=",            (x,y) => (is_string(x) && !is_string(y))?"("+x+" >= "+stringify(y)+")":(!is_string(x) && is_string(y))?"("+stringify(x)+" >= "+y+")":(is_string(x) && is_string(y))?"("+x+" >= "+y+")": x >= y  ),
       list("!",              x    => (is_string(x)?"("+"!"+x+")":!x))
       );

// the global environment also has bindings for all
// primitive non-function values, such as undefined and 
// math_PI

const primitive_constants = list(
       list("undefined", undefined),
       list("math_PI"  , math_PI),
       list("math_SQRT1_2" , math_SQRT1_2),
       list("math_SQRT2" , math_SQRT2)
       
      );
       
// setup_environment makes an environment that has
// one single frame, and adds a binding of all names
// listed as primitive_functions and primitive_values. 
// The values of primitive functions are "primitive" 
// objects, see line 281 how such functions are applied

function setup_environment() {
    const primitive_function_names =
        map(f => head(f), primitive_functions);
    const primitive_function_values =
        map(f => make_primitive_function(head(tail(f))),
            primitive_functions);
    const primitive_constant_names =
        map(f => head(f), primitive_constants);
    const primitive_constant_values =
        map(f => head(tail(f)),
            primitive_constants);
    return extend_environment(
               append(primitive_function_names, 
                      primitive_constant_names),
               append(primitive_function_values, 
                      primitive_constant_values),
               the_empty_environment);
}

const the_global_environment = setup_environment();

function partial_evaluator(str) {
    let final_pro="";
    constevaluation=1;
    
   
   return eval_toplevel(parse(str),final_pro);
 
}


// --------------------------examples----------------------

// partial_evaluator("function f(x,y){const tmp=y+3;\
// return x+tmp;}\
// function b(x){return f(x,0);}\
// b(4);\
// ");

// partial_evaluator("display(3);\
// const x=(4+5)===(3*6/2) && (true || false);\
// x;");

// partial_evaluator("const x=3;\
// x;");

// partial_evaluator("const x=3;\
// const y=2;\
// (x!==y)? (x*y) : (x+y);");

// partial_evaluator("const x=2;\
// const y=5;\
// if(x===y){\
//     display(x); \
//     display(y);\
// }\
// else{\
//     display(x);\
//     display(y);\
// }");


// partial_evaluator("{const x=3;x+4;}\
// const y=2;\
// x+y;");

// partial_evaluator("const z=4;\
// {const x=3;x+z;}");

// partial_evaluator("const z=3;if(z===2){\
//     const w=1;\
//     w;\
// }\
// else{const t=2;\
// t+z;}");

// partial_evaluator("56;\
// (! (1 === 1)) ? 1 : 2;");

// partial_evaluator("const a=2;\
// const f=(x,y,z)=>x+y*a;f(2,3,1);");

// partial_evaluator("const a=2;\
// const g=(x,y) => y*x;\
// const f=(x,y,z)=>x+y*a;\
// g(f(2,3,1),f(9,0,0));");

// partial_evaluator("function f(n,m){n+m;} f(4,2);");//no return statement

// partial_evaluator("function f(n,m) { return n ===m ? 1 : n - m;} f(4,2);");

// partial_evaluator("function f(n,m) { const g=(x)=>x;\
// return n===m ? 3:g(g(n));}\
// f(4,2);");

// partial_evaluator("function f(n,m) {\
// function g(z){return ((x,y) => x+y)(3,4);}\
// return n===m ? 3:g(g(n));} f(4,2);");

// partial_evaluator("34;((x,y) => pair(x,y))(3,4);");

// partial_evaluator("function f(x){return x===1?1:f(x-1);}(f)(3);");

// partial_evaluator("function f(x,y){\
// {const a=2;return a===2?2*x-y*3:3;}\
// const z=3; return z/x;}f(1,1);");

// partial_evaluator("const a=2;function f(x){const z=2;\
// if(x===z){\
// return 8;\
// }\
// else{\
//     return 4;\
// }\
// return 2;}f(3);");

// partial_evaluator("function f(n){\
// if(n===9){\
//     4;\
// }\
// else{return 2;}\
// return n===1?1:4;}\
// f(9);");


// partial_evaluator("function factorial(n){\
// return n===1?1:n*factorial(n-1);}\
// factorial(4);");

// partial_evaluator("function f(x){\
// function g(y){ return x/y;}\
// return g(3);}f(6);");

// partial_evaluator("\
// function f(x){\
// const z=2;\
// if(x===1){return x;\
// }else{4;}\
// if(x===z){x;\
// }else{return x;}\
// return 2;}f(3);");

// partial_evaluator("function f(x){if(x===1){\
// function g(z,y){return y+z+x;}return g(2,1);}\
// else{return 4;}}\
// f(2);");

// partial_evaluator("function f(x,y,z){return x*y*z+y/z;}f(2,5,3);");

// partial_evaluator("function f(){return (x,y)=>(x*y+3);}f()(2,3);");

// partial_evaluator("function f(){return 1;}display(f());");

// partial_evaluator("function f(x){return x===1?1:g(x-1);}\
// function g(x){return h(x);}\
// function h(x){return f(x);} ");

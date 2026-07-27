"use strict"
// ============================================
// Phase 1: Tokenizer (LEXER)
// ============================================

function isDigit(ch) {
    return ch >= '0' && ch <= '9'
}

function tokenize(input) {
    let tokens = [];
    for (let i = 0; i < input.length; i++) {

        if (input[i] === ' ' || input[i] === '\n' || input[i] === '\t' || input[i] === '\r') {
            continue; // whitespace: skip, no token

        } else if (input[i] === '{') {
            tokens.push({ type: "brace-open" });
        } else if (input[i] === '}') {
            tokens.push({ type: "brace-close" });
        } else if (input[i] === '[') {
            tokens.push({ type: "bracket-open" });
        } else if (input[i] === ']') {
            tokens.push({ type: "bracket-close" });
        } else if (input[i] === ':') {
            tokens.push({ type: "colon" });
        } else if (input[i] === ',') {
            tokens.push({ type: "comma" });

        } else if (input[i] === '"') {
            let value = "";
            i++;
            while (i < input.length && input[i] !== '"') {
                value += input[i];
                i++;
            }
            tokens.push({ type: "string", value: value });

        } else if (input[i] === 't' && input.slice(i, i + 4) === "true") {
            tokens.push({ type: "true" });
            i += 3;
        } else if (input[i] === 'f' && input.slice(i, i + 5) === "false") {
            tokens.push({ type: "false" });
            i += 4;
        } else if (input[i] === 'n' && input.slice(i, i + 4) === "null") {
            tokens.push({ type: "null" });
            i += 3;

        } else if (input[i] === '-' || isDigit(input[i])) {
            let value = "";
            value += input[i];
            i++;
            while (i < input.length && (isDigit(input[i]) || input[i] === ".")) {
                value += input[i];
                i++;
            }
            i--; // give the neighbor back to the for loop
            tokens.push({ type: "number", value: Number(value) });

        } else {
            throw new SyntaxError("Unexpected character '" + input[i] + "' at position " + i);
        }
    }
    return tokens;
}

// ============================================
// Phase 2: Parser
// ============================================

function parse(tokens) {
    let pos = 0;   // shared pointer: which token we're standing on

    function parseValue() {
        let token = tokens[pos];

       
       if(token.type ==="string"){
             pos++
             return token.value

       }else if(token.type === "number"){
             pos++
             return token.value
             
       }else if(token.type ==="true"){
             pos++
             return true

       }else if(token.type ==="false"){
             pos++
             return false

       }else if(token.type === "null"){
             pos++
             return null

       }else if(token.type === "brace-open"){
             
             return parseObject()

       }else if (token.type === "bracket-open"){

             return parseArray()

       }else {

                throw new SyntaxError("Unexpected token " + token.type)

       }    
    }

    function parseArray() {
        pos++;               // consume the bracket-open we're standing on
        let arr = [];
      
        while(tokens[pos].type !== "bracket-close"){
             
              if(tokens[pos].type === "comma"){
                  
                  pos++
                    continue                 
              }else {
                  
                  arr.push(parseValue())
                   
              }
             
        }    
           pos++        
           return arr


    }

    function parseObject() {
        pos++;               // consume the brace-open
        let obj = {};

        

        while(tokens[pos].type !== "brace-close"){

           if(tokens[pos].type !== "string") throw new SyntaxError("Expected string got : " + tokens[pos].type) 
           let key = tokens[pos].value
           pos++
           
           if(tokens[pos].type !== "colon") throw new SyntaxError("Expected colon got : " + tokens[pos].type)
           pos++

           obj[key] = parseValue()

           if(tokens[pos].type === "comma") pos++
        }
        pos++ 
        return obj

    }

    return parseValue();
}

// ===== PARSER TESTS =====
console.log(parse(tokenize('"hello"')));      // hello
console.log(parse(tokenize('5')));            // 5
console.log(parse(tokenize('true')));         // true
console.log(parse(tokenize('[1,2,3]')));      // [ 1, 2, 3 ]
console.log(parse(tokenize('[1,[2,[3]]]')));  // [ 1, [ 2, [ 3 ] ] ]
console.log(parse(tokenize('{"a":5}')));      // { a: 5 }
console.log(parse(tokenize('{"a":{"b":[1,true,null]}}'))); // { a: { b: [ 1, true, null ] } }
let x = parse(tokenize('{"user":{"name":"salamo"}}'));
console.log(x.user.name);                     // salamo
try { parse(tokenize('{"a" 5}')) } catch (e) { console.log("caught:", e.message) }
try { parse(tokenize('[1,]')) } catch (e) { console.log("caught:", e.message) }

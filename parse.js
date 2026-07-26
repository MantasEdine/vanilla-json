"use strict"
//phase 1 :  Building Tokenizer (LEXER)
function isDigit(ch) {
    return ch >= '0' && ch <= '9'
}

function tokenize(input) {
    let tokens = [];
    for (let i = 0; i < input.length; i++) {

        if (input[i] === ' ' || input[i] === '\n' || input[i] === '\t' || input[i] === '\r') {
            continue;                                    // whitespace: skip, no token

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

        } else if (input[i] === '-' || isDigit(input[i])) {   
            let value = "";
            value += input[i];
            i++;
            while (i < input.length && (isDigit(input[i]) || input[i] === ".")) {
                value += input[i];
                i++;
            }
            i--;                                         
            tokens.push({ type: "number", value: value });

        } else {
            throw new SyntaxError("Unexpected character '" + input[i] + "' at position " + i);
        }
    }
    return tokens;
}// ===== TESTS =====

// 1. The acceptance test — want 13 flat tokens
console.log(tokenize('{"a":5,"b":[1,2]}'));

// 2. Whitespace-proof — same tokens as without spaces
console.log(tokenize('{ "name" : "salamo" }'));

// 3. Negative number + decimal
console.log(tokenize('[-2.5,3]'));

// 4. Lone string — valid JSON on its own
console.log(tokenize('"hello"'));

// 5. Empty containers
console.log(tokenize('[]'));
console.log(tokenize('{}'));

// 6. Bad input — must throw with character + position
try { tokenize('{oops}') } catch (e) { console.log("caught:", e.message) }

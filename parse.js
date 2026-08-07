"use strict"
// could change soon

function isDigit(ch) {
    return ch >= '0' && ch <= '9'
}

function tokenize(input) {
    let tokens = []

    for (let i = 0; i < input.length; i++) {
        if (input[i] === ' ' || input[i] === '\n' || input[i] === '\t' || input[i] === '\r') {
            continue
        } else if (input[i] === '{') {
            tokens.push({ type: "brace-open" })
        } else if (input[i] === '}') {
            tokens.push({ type: "brace-close" })
        } else if (input[i] === '[') {
            tokens.push({ type: "bracket-open" })
        } else if (input[i] === ']') {
            tokens.push({ type: "bracket-close" })
        } else if (input[i] === ':') {
            tokens.push({ type: "colon" })
        } else if (input[i] === ',') {
            tokens.push({ type: "comma" })
        } else if (input[i] === '"') {
            let value = ""
            i++
            while (i < input.length && input[i] !== '"') {
                if (input[i] === '\\' && i + 1 < input.length) {
                    value += input[i]
                    i++
                    value += input[i]
                } else {
                    value += input[i]
                }
                i++
            }
            tokens.push({ type: "string", value: value })
        } else if (input[i] === 't' && input.slice(i, i + 4) === "true") {
            tokens.push({ type: "true" })
            i += 3
        } else if (input[i] === 'f' && input.slice(i, i + 5) === "false") {
            tokens.push({ type: "false" })
            i += 4
        } else if (input[i] === 'n' && input.slice(i, i + 4) === "null") {
            tokens.push({ type: "null" })
            i += 3
        } else if (input[i] === '-' || isDigit(input[i])) {
            let value = ""
            value += input[i]
            i++

            while (i < input.length && isDigit(input[i])) {
                value += input[i]
                i++
            }

            if (i < input.length && input[i] === '.') {
                value += input[i]
                i++
                while (i < input.length && isDigit(input[i])) {
                    value += input[i]
                    i++
                }
            }

            if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
                value += input[i]
                i++
                if (i < input.length && (input[i] === '+' || input[i] === '-')) {
                    value += input[i]
                    i++
                }
                while (i < input.length && isDigit(input[i])) {
                    value += input[i]
                    i++
                }
            }

            i--
            tokens.push({ type: "number", value: Number(value) })
        } else {
            throw new SyntaxError("Unexpected character '" + input[i] + "' at position " + i)
        }
    }

    return tokens
}

function parse(tokens) {
    let pos = 0

    function unescape(str) {
        let out = ""
        for (let i = 0; i < str.length; i++) {
            if (str[i] === '\\' && i + 1 < str.length) {
                const next = str[i + 1]
                if (next === 'n') { out += '\n'; i++ }
                else if (next === 't') { out += '\t'; i++ }
                else if (next === 'r') { out += '\r'; i++ }
                else if (next === 'b') { out += '\b'; i++ }
                else if (next === 'f') { out += '\f'; i++ }
                else if (next === '\\') { out += '\\'; i++ }
                else if (next === '"') { out += '"'; i++ }
                else if (next === 'u') {
                    const hex = str.slice(i + 2, i + 6)
                    out += String.fromCharCode(parseInt(hex, 16))
                    i += 5
                } else {
                    out += str[i]
                }
            } else {
                out += str[i]
            }
        }
        return out
    }

    function parseValue() {
        let token = tokens[pos]

        if (token.type === "string") {
            pos++
            return unescape(token.value)
        } else if (token.type === "number") {
            pos++
            return token.value
        } else if (token.type === "true") {
            pos++
            return true
        } else if (token.type === "false") {
            pos++
            return false
        } else if (token.type === "null") {
            pos++
            return null
        } else if (token.type === "brace-open") {
            return parseObject()
        } else if (token.type === "bracket-open") {
            return parseArray()
        } else {
            throw new SyntaxError("Unexpected token " + token.type)
        }
    }

    function parseArray() {
        pos++
        let arr = []

        if (tokens[pos].type === "bracket-close") {
            pos++
            return arr
        }

        while (true) {
            arr.push(parseValue())

            if (tokens[pos].type === "bracket-close") {
                pos++
                return arr
            } else if (tokens[pos].type === "comma") {
                pos++
            } else {
                throw new SyntaxError("Expected comma or bracket-close, got " + tokens[pos].type)
            }
        }
    }

    function parseObject() {
        pos++
        let obj = {}

        while (tokens[pos].type !== "brace-close") {
            if (tokens[pos].type !== "string") {
                throw new SyntaxError("Expected string got : " + tokens[pos].type)
            }
            let key = tokens[pos].value
            pos++

            if (tokens[pos].type !== "colon") {
                throw new SyntaxError("Expected colon got : " + tokens[pos].type)
            }
            pos++

            obj[key] = parseValue()

            if (tokens[pos].type === "comma") {
                pos++
            }
        }

        pos++
        return obj
    }

    return parseValue()
}

module.exports = { parse, tokenize }

"use strict"

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
                value += input[i]
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
            while (i < input.length && (isDigit(input[i]) || input[i] === ".")) {
                value += input[i]
                i++
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

    function parseValue() {
        let token = tokens[pos]

        if (token.type === "string") {
            pos++
            return token.value
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

module.exports = {parse , tokenize}

"use strict"
function stringify(input) {
    let seen = new WeakSet()

    function serialize(input) {

        switch (typeof input) {

            case "string": {
                let str = ""
                for (let i = 0; i < input.length; i++) {
                    if (input[i] === '"') {
                        str += '\\"'
                    } else if (input[i] === "\\") {
                        str += "\\\\"
                    } else if (input[i] === "\n") {
                        str += '\\n'
                    } else if (input[i] === "\t") {
                        str += '\\t'
                    } else if (input[i] === '\r') {
                        str += '\\r'

                    } else if (input[i] === '\b'){
                        str += '\\b'

                    }else if (input[i]  === '\f'){
                        str += '\\f'

                    } else if (input.charCodeAt(i) <= 0x1F) {
                        str += '\\u' + input.charCodeAt(i).toString(16).padStart(4, '0');
                    } else {
                        str += input[i]
                    }
                }
                return '"' + str + '"'
            }

            case "boolean": return String(input)
            case "bigint" : throw new TypeError("Do not know how to serialize a BigInt")

            case "number":
                if (Number.isFinite(input)) {
                    return String(input)
                } else {
                    return "null"
                }

            case "undefined": return undefined

            case "object":
                if (input === null) {
                    return "null"

                }

                else if (typeof input.toJSON === "function") {
                 return serialize(input.toJSON());
            
            




                } else if (Array.isArray(input)) {
                    if (seen.has(input)) throw new TypeError("Converting circular structure to JSON")  // ← guard
                    seen.add(input)                                                                    // ← "I'm inside now"

                    if (input.length > 0) {
                        let str = "["
                        for (let i = 0; i < input.length; i++) {
                            str += (serialize(input[i]) ?? "null") + ","
                        }
                        seen.delete(input)                                                             // ← "done, leaving"
                        return str.slice(0, -1) + "]"
                    } else {
                        seen.delete(input)                                                             // ← same, empty case
                        return "[]"
                    }

                } else {
                    if (seen.has(input)) throw new TypeError("Converting circular structure to JSON")  // ← guard
                    seen.add(input)                                                                    // ← "I'm inside now"

                    let key_s = Object.keys(input)
                    let str = "{"
                    for (let i = 0; i < key_s.length; i++) {
                        let piece = serialize(input[key_s[i]])
                        if (piece === undefined) continue
                        str += '"' + key_s[i] + '":' + piece + ","
                    }

                    seen.delete(input)                                                                 // ← "done, leaving"
                    if (str !== "{") {
                        return str.slice(0, -1) + "}"
                    } else {
                        return "{}"
                    }
                }
        }
    }

    return serialize(input)
}

module.exports = {stringify}

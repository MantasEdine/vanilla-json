"use strict"
const { stringify } = require("./stringify.js")
const { parse, tokenize } = require("./parse.js")

let passed = 0, failed = 0

function check(name, got, want) {
    let ok = JSON.stringify(got) === JSON.stringify(want)
    if (ok) { passed++ } else { failed++; console.log("❌", name, "| got:", JSON.stringify(got), "| want:", JSON.stringify(want)) }
}

function checkEqual(name, got, want) {
    let ok = got === want
    if (ok) { passed++ } else { failed++; console.log("❌", name, "| got:", JSON.stringify(got), "| want:", JSON.stringify(want)) }
}

function checkThrows(name, fn, wantType) {
    try { 
        fn(); 
        failed++; 
        console.log("❌", name, "| expected a throw, got none") 
    }
    catch (e) { 
        if (wantType && !(e instanceof wantType)) {
            failed++; 
            console.log("❌", name, "| threw wrong type:", e.constructor.name, "| want:", wantType.name)
        } else {
            passed++ 
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// PART 1: SERIALIZER (stringify)
// ═══════════════════════════════════════════════════════════════

// ── Primitives ──
checkEqual("stringify string", stringify("hello"), '"hello"')
checkEqual("stringify empty string", stringify(""), '""')
checkEqual("stringify number int", stringify(42), "42")
checkEqual("stringify number float", stringify(3.14), "3.14")
checkEqual("stringify zero", stringify(0), "0")
checkEqual("stringify negative zero", stringify(-0), "0")
checkEqual("stringify negative", stringify(-5), "-5")
checkEqual("stringify true", stringify(true), "true")
checkEqual("stringify false", stringify(false), "false")
checkEqual("stringify null", stringify(null), "null")

// ── String Escaping ──
checkEqual("escape quote", stringify('say "hello"'), '"say \\"hello\\""')
checkEqual("escape backslash", stringify("a\\b"), '"a\\\\b"')
checkEqual("escape newline", stringify("a\nb"), '"a\\nb"')
checkEqual("escape tab", stringify("a\tb"), '"a\\tb"')
checkEqual("escape carriage return", stringify("a\rb"), '"a\\rb"')
checkEqual("escape backspace", stringify("a\bb"), '"a\\bb"')
checkEqual("escape form feed", stringify("a\fb"), '"a\\fb"')
checkEqual("escape null byte", stringify("a\x00b"), '"a\\u0000b"')
checkEqual("escape control 0x01", stringify("a\x01b"), '"a\\u0001b"')
checkEqual("escape control 0x1F", stringify("a\x1Fb"), '"a\\u001fb"')
checkEqual("escape all specials", stringify('\\"\n\r\t\b\f'), '"\\\\\\\\"\\n\\r\\t\\b\\f"')

// ── Special Numbers ──
checkEqual("stringify NaN", stringify(NaN), "null")
checkEqual("stringify Infinity", stringify(Infinity), "null")
checkEqual("stringify -Infinity", stringify(-Infinity), "null")

// ── Undefined Behavior ──
checkEqual("undefined top-level", stringify(undefined), undefined)
checkEqual("undefined in array", stringify([1, undefined, 3]), "[1,null,3]")
checkEqual("undefined in object", stringify({a: 1, b: undefined, c: 3}), '{"a":1,"c":3}')
checkEqual("undefined value omitted", stringify({x: undefined}), "{}")

// ── Arrays ──
checkEqual("empty array", stringify([]), "[]")
checkEqual("number array", stringify([1, 2, 3]), "[1,2,3]")
checkEqual("mixed array", stringify([1, "two", true, null]), '[1,"two",true,null]')
checkEqual("nested array", stringify([1, [2, [3]]]), "[1,[2,[3]]]")
checkEqual("sparse array", stringify([1, , 3]), "[1,null,3]")
checkEqual("array with function", stringify([1, function() {}, 3]), "[1,null,3]")
checkEqual("array with symbol", stringify([1, Symbol(), 3]), "[1,null,3]")

// ── Objects ──
checkEqual("empty object", stringify({}), "{}")
checkEqual("simple object", stringify({a: 1, b: 2}), '{"a":1,"b":2}')
checkEqual("nested object", stringify({a: {b: {c: 1}}}), '{"a":{"b":{"c":1}}}')
checkEqual("mixed object", stringify({a: 1, b: "s", c: true, d: null}), '{"a":1,"b":"s","c":true,"d":null}')

// ── toJSON ──
const toJSONObj = { toJSON: function() { return "custom" } }
checkEqual("toJSON called", stringify(toJSONObj), '"custom"')
const dateObj = { x: new Date("2026-08-07T00:00:00.000Z") }
checkEqual("Date toJSON", stringify(dateObj).includes('"x":"2026'), true)

// ── Circular References ──
const circ1 = { a: 1 }
circ1.self = circ1
checkThrows("circular object", () => stringify(circ1), TypeError)
const circ2 = [1, 2]
circ2.push(circ2)
checkThrows("circular array", () => stringify(circ2), TypeError)

// ── BigInt ──
checkThrows("bigint throws", () => stringify(123n), TypeError)


// ═══════════════════════════════════════════════════════════════
// PART 2: PARSER (tokenize + parse)
// ═══════════════════════════════════════════════════════════════

// ── Primitives ──
check("parse string", parse(tokenize('"hello"')), "hello")
check("parse empty string", parse(tokenize('""')), "")
check("parse number int", parse(tokenize('42')), 42)
check("parse number float", parse(tokenize('3.14')), 3.14)
check("parse negative", parse(tokenize('-5')), -5)
check("parse zero", parse(tokenize('0')), 0)
check("parse true", parse(tokenize('true')), true)
check("parse false", parse(tokenize('false')), false)
check("parse null", parse(tokenize('null')), null)

// ── String Escapes (Parser) ──
check("parse escaped quote", parse(tokenize('"say \\"hello\\""')), 'say "hello"')
check("parse escaped backslash", parse(tokenize('"a\\b"')), 'a\\b')
check("parse escaped newline", parse(tokenize('"a\\nb"')), 'a\nb')
check("parse escaped tab", parse(tokenize('"a\\tb"')), 'a\tb')
check("parse escaped backspace", parse(tokenize('"a\\bb"')), 'a\bb')
check("parse escaped form feed", parse(tokenize('"a\\fb"')), 'a\fb')
check("parse escaped carriage return", parse(tokenize('"a\\rb"')), 'a\rb')
check("parse unicode escape", parse(tokenize('"\\u0041\\u0042\\u0043"')), 'ABC')
check("parse unicode smiley", parse(tokenize('"\\uD83D\\uDE00"')), '😀')

// ── Numbers (Parser) ──
check("parse negative float", parse(tokenize('-3.14')), -3.14)
check("parse scientific notation", parse(tokenize('1e10')), 1e10)
check("parse scientific negative exp", parse(tokenize('1e-5')), 1e-5)
check("parse scientific capital E", parse(tokenize('1E10')), 1E10)
check("parse negative scientific", parse(tokenize('-1.5e+3')), -1.5e+3)

// ── Arrays ──
check("parse empty array", parse(tokenize('[]')), [])
check("parse number array", parse(tokenize('[1,2,3]')), [1, 2, 3])
check("parse mixed array", parse(tokenize('[1,"two",true,null]')), [1, "two", true, null])
check("parse nested array", parse(tokenize('[1,[2,[3]]]')), [1, [2, [3]]])
check("parse array with spaces", parse(tokenize('[ 1 , 2 , 3 ]')), [1, 2, 3])
check("parse array with newlines", parse(tokenize('[\n1,\n2\n]')), [1, 2])

// ── Objects ──
check("parse empty object", parse(tokenize('{}')), {})
check("parse simple object", parse(tokenize('{"a":1,"b":2}')), {a: 1, b: 2})
check("parse nested object", parse(tokenize('{"a":{"b":{"c":1}}}')), {a: {b: {c: 1}}})
check("parse object with spaces", parse(tokenize('{ "a" : 1 , "b" : 2 }')), {a: 1, b: 2})
check("parse object with newlines", parse(tokenize('{\n"a": 1\n}')), {a: 1})

// ── Deep / Complex ──
check("parse deep mix", parse(tokenize('{"a":{"b":[1,true,null]}}')), {a: {b: [1, true, null]}})
check("parse array in object", parse(tokenize('{"arr":[1,2,3]}')), {arr: [1, 2, 3]})
check("parse object in array", parse(tokenize('[{"a":1},{"b":2}]')), [{a: 1}, {b: 2}])

// ── Error Cases ──
checkThrows("missing colon", () => parse(tokenize('{"a" 5}')), SyntaxError)
checkThrows("trailing comma array", () => parse(tokenize('[1,]')), SyntaxError)
checkThrows("trailing comma object", () => parse(tokenize('{"a":1,}')), SyntaxError)
checkThrows("leading comma array", () => parse(tokenize('[,1]')), SyntaxError)
checkThrows("double comma", () => parse(tokenize('[1,,2]')), SyntaxError)
checkThrows("bad character", () => tokenize('{oops}'), SyntaxError)
checkThrows("bad keyword", () => tokenize('[trve]'), SyntaxError)
checkThrows("unclosed string", () => tokenize('"hello'), SyntaxError)
checkThrows("unclosed array", () => parse(tokenize('[1,2')), SyntaxError)
checkThrows("unclosed object", () => parse(tokenize('{"a":1')), SyntaxError)
checkThrows("missing comma object", () => parse(tokenize('{"a":1 "b":2}')), SyntaxError)
checkThrows("lonely comma", () => parse(tokenize('[,]')), SyntaxError)
checkThrows("empty input", () => parse(tokenize('')), SyntaxError)
checkThrows("just whitespace", () => parse(tokenize('   ')), SyntaxError)

// ── Scientific notation errors ──
checkThrows("invalid number multiple dots", () => parse(tokenize('1.2.3')), SyntaxError)
checkThrows("invalid number dot start", () => parse(tokenize('.5')), SyntaxError)
checkThrows("invalid number plus start", () => parse(tokenize('+5')), SyntaxError)


// ═══════════════════════════════════════════════════════════════
// PART 3: ROUND-TRIP (stringify → parse should recover original)
// ═══════════════════════════════════════════════════════════════

function roundTrip(name, value) {
    const json = stringify(value)
    if (json === undefined) return
    const recovered = parse(tokenize(json))
    check("round-trip: " + name, recovered, value)
}

roundTrip("number", 42)
roundTrip("string", "hello")
roundTrip("boolean", true)
roundTrip("null", null)
roundTrip("array", [1, 2, 3])
roundTrip("nested array", [1, [2, [3]]])
roundTrip("object", {a: 1, b: 2})
roundTrip("nested object", {a: {b: {c: 1}}})
roundTrip("mixed", {arr: [1, "two", true], obj: {x: null}})


// ═══════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)

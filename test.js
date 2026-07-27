"use strict"
const { stringify } = require("./stringify.js")
const { parse, tokenize } = require("./parse.js")

let passed = 0, failed = 0

function check(name, got, want) {
    let ok = JSON.stringify(got) === JSON.stringify(want)
    if (ok) { passed++ } else { failed++; console.log("❌", name, "| got:", JSON.stringify(got), "| want:", JSON.stringify(want)) }
}

function checkThrows(name, fn) {
    try { fn(); failed++; console.log("❌", name, "| expected a throw, got none") }
    catch (e) { passed++ }
}

// ... checks ...
check("parse string", parse(tokenize('"hello"')), "hello")
check("parse number", parse(tokenize('5')), 5)
check("parse true", parse(tokenize('true')), true)
check("parse null", parse(tokenize('null')), null)
check("parse array", parse(tokenize('[1,2,3]')), [1,2,3])
check("parse nested arrays", parse(tokenize('[1,[2,[3]]]')), [1,[2,[3]]])
check("parse object", parse(tokenize('{"a":5}')), {a:5})
check("parse deep mix", parse(tokenize('{"a":{"b":[1,true,null]}}')), {a:{b:[1,true,null]}})
check("parse empty array", parse(tokenize('[]')), [])
check("parse empty object", parse(tokenize('{}')), {})
check("whitespace ignored", parse(tokenize('{ "a" : 1 }')), {a:1})
checkThrows("missing colon", () => parse(tokenize('{"a" 5}')))
checkThrows("trailing comma", () => parse(tokenize('[1,]')))
checkThrows("leading comma", () => parse(tokenize('[,1]')))
checkThrows("bad character", () => tokenize('{oops}'))
checkThrows("bad keyword", () => tokenize('[trve]'))
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)


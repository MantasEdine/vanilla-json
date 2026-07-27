# Vanilla-JSON

Zero-dependency JSON library built from scratch — a hand-written tokenizer,
a recursive descent parser, and a serializer. No shortcuts, no `eval`,
no native `JSON.*` calls anywhere in the implementation.

## Install

    npm i @rabia_youcef/vanilla-json

## Usage

    const VJSON = require("@rabia_youcef/vanilla-json")

    VJSON.parse('{"name":"salamo","tags":[1,true,null]}')
    // → { name: "salamo", tags: [1, true, null] }

    VJSON.stringify({ a: 1, b: [true, "text"] })
    // → '{"a":1,"b":[true,"text"]}'

## Behavior

Matches native `JSON.parse` / `JSON.stringify`, including the weird parts:

| Case | Result |
|---|---|
| `stringify(NaN)`, `stringify(Infinity)` | `"null"` |
| `undefined` / functions in arrays | become `null` |
| `undefined` / functions as object values | key is dropped |
| Circular references | throws `TypeError`, like native |
| String escaping | `\"` `\\` `\n` `\t` `\r` |
| Trailing commas, missing colons, unquoted keys | throw `SyntaxError` with position info |

## How it works

`parse` runs a two-phase pipeline: a **tokenizer** converts raw text into
typed tokens, then a **recursive descent parser** (`parseValue` /
`parseArray` / `parseObject`) consumes them and builds live values.
`stringify` walks values recursively, tracking the current path in a
`WeakSet` to detect cycles.

## Tests

    npm test

## License

MIT

# Vanilla-JSON

Zero-dependency JSON library built from scratch — both halves, no shortcuts.

**`stringify.js`** — primitives, nested structures, string escaping, circular
reference detection via WeakSet (throws like the native one), and
native-matching edge cases (`NaN` → `null`, `undefined` dropped from objects /
nulled in arrays).

**`parse.js`** — full pipeline: a tokenizer (lexer) producing typed tokens,
then a recursive descent parser (`parseValue` / `parseArray` / `parseObject`)
building live values. Strict grammar: trailing commas, missing colons, and
unquoted keys throw `SyntaxError` with position info, matching native
`JSON.parse`.

Run tests: `node test.js`

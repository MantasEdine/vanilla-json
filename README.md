# Vanilla-JSON

Zero-dependency JSON library built from scratch. `stringify` is complete: primitives, nested structures, string escaping, circular reference detection (throws like the native one), and native-matching edge cases (`NaN` → `null`, `undefined` dropped from objects / nulled in arrays). `parse` is next.

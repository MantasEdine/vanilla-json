"use strict"

const { stringify } = require("./stringify.js")
const { tokenize, parse } = require("./parse.js")

module.exports = {
    stringify: stringify,
    parse: function (text) {
        return parse(tokenize(text))
    }
}

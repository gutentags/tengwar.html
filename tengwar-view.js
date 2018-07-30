"use strict";

module.exports = TengwarEditor;

var modes = require("tengwar/modes");
var fonts = require("tengwar/fonts");

function TengwarEditor() {
}

TengwarEditor.prototype.hookup = function (id, component, scope) {
    if (id === "this") {
        this.element = scope.components.text;
        this.container = scope.components.container;
    }
};

Object.defineProperty(TengwarEditor.prototype, "value", {
    set: function (value) {
        var mode = modes[value.mode];
        var font = fonts[value.font];
        var options = {
            font: font,
            language: value.language,
            block: true
        };
        this.container.className = "tengwar " + value.font + " rendered";
        this.element.value = mode.transcribe(value.value, options);
    }
});

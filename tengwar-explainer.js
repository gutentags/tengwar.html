"use strict";

module.exports = TengwarEditor;

var modes = require("tengwar/modes");
var fonts = require("tengwar/fonts");

function TengwarEditor() {
}

TengwarEditor.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.sections = scope.components.sections;
    } else if (id === "sections:iteration") {
        scope.components.paragraphs.value = component.value;
    } else if (id === "paragraphs:iteration") {
        scope.components.lines.value = component.value;
    } else if (id === "lines:iteration") {
        scope.components.words.value = component.value;
        scope.components.lineBreak.value = component.index !== scope.components.lines.value.length - 1;
    } else if (id === "words:iteration") {
        scope.components.columns.value = component.value;
        scope.components.wordBreak.value = component.index !== scope.components.words.value.length - 1;
    } else if (id === "columns:iteration") {
        scope.components.tildeAbove.value = component.value.tildeAbove ? " " + component.value.tengwa : "";
        scope.components.above.value = component.value.above;
        scope.components.tengwa.value = component.value.tengwa;
        scope.components.below.value = component.value.below;
        scope.components.tildeBelow.value = component.value.tildeBelow ? " ~" : "";
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
        this.sections.value = mode.parse(value.value, options);
    }
});

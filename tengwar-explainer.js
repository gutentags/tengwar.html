"use strict";

module.exports = TengwarEditor;

var modes = require("tengwar/modes");
var fonts = require("tengwar/fonts");

function TengwarEditor() {
}

function from(value) {
    if (value) {
        if (value.from) {
            return value.from.toUpperCase();
        }
    }
}

TengwarEditor.prototype.hookup = function (id, component, scope) {
    var components = scope.components;
    if (id === "this") {
        this.sections = components.sections;
    } else if (id === "sections:iteration") {
        components.paragraphs.value = component.value;
    } else if (id === "paragraphs:iteration") {
        components.lines.value = component.value;
    } else if (id === "lines:iteration") {
        components.words.value = component.value;
        components.lineBreak.value = component.index !== components.lines.value.length - 1;
    } else if (id === "words:iteration") {
        components.columns.value = component.value;
        components.wordBreak.value = component.index !== components.words.value.length - 1;
    } else if (id === "columns:iteration") {
        components.tengwar.value = this.font.transcribeColumn(component.value);
        components.tengwarContainer.className = "tengwar rendered " + this.fontName;
        components.tildeAbove.value = from(component.value.tildeAboveNote);
        components.above.value = from(component.value.aboveNote);
        components.tengwa.value = from(component.value.tengwaNote);
        components.below.value = from(component.value.belowNote);
        components.tildeBelow.value = from(component.value.tildeBelowNote);
        components.following.value = from(component.value.followingNote);
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
        this.font = font;
        this.fontName = value.font;
        this.mode = mode;
        this.sections.value = mode.parse(value.value, options);
    }
});

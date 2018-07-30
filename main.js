"use strict";

var O = require("pop-observe");

module.exports = Main;

function Main() {
    this.language = "english";
    this.mode = "general-use";
    this.latin = "";
    this.font = "parmaite";
}

Main.prototype.hookup = function (id, component, scope) {
    if (id === "this") {
        this.components = scope.components;
        this.init();
    }
};

Main.prototype.init = function () {
    this.components.latin.addEventListener("keyup", this);
    this.components.latin.focus();
    this.chooserObserver = O.observePropertyChange(this.components.chooser, "value", this);
    delete document.body.className;
};

Main.prototype.handleValuePropertyChange = function (value) {
    var parts = value.split(":");
    this.mode = parts[0];
    this.language = parts[1];
    this.font = parts[2];
    this.update();
};

Main.prototype.handleEvent = function (event) {
    this.latin = this.components.latin.value;
    this.update();
};

Main.prototype.update = function () {
    this.components.explanation.value = {
        mode: this.mode,
        font: this.font,
        language: this.language,
        value: this.latin
    };
};


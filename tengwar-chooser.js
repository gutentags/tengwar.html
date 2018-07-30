"use strict";

module.exports = TengwarChooser;

function TengwarChooser() {
    this.value = "general-use-english";
}

TengwarChooser.prototype.hookup = function (id, component, scope) {
    if (id === "select") {
        component.addEventListener("change", this);
        this.select = component;
    }
};

TengwarChooser.prototype.destroy = function () {
    this.select.removeEventListener("change", this);
};

TengwarChooser.prototype.handleEvent = function () {
    this.value = this.select.value;
};

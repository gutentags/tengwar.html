"use strict";

module.exports = TengwarChooser;

function TengwarChooser() {
    this.value = "general-use-english";
}

TengwarChooser.prototype.add = function (component, id, scope) {
    if (id === "select") {
        component.actualNode.addEventListener("change", this);
        this.select = component;
    }
};

TengwarChooser.prototype.destroy = function () {
    this.select.actualNode.removeEventListener("change", this);
};

TengwarChooser.prototype.handleEvent = function () {
    this.value = this.select.actualNode.value;
};

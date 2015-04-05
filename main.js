"use strict";

module.exports = Main;

function Main() {
}

Main.prototype.add = function (component, id, scope) {
    if (id === "this") {
        this.tengwar = scope.components.tengwar;
        this.explanation = scope.components.explanation;
        this.latin = scope.components.latin.actualNode;
        this.init();
    }
};

Main.prototype.init = function () {
    this.latin.addEventListener("keyup", this);
    this.latin.focus();
    delete document.body.className;
};

Main.prototype.handleEvent = function (event) {
    this.tengwar.value = {
        mode: 'general-use',
        font: 'parmaite',
        language: 'english',
        value: this.latin.value
    };
    this.explanation.value = {
        mode: 'general-use',
        font: 'parmaite',
        language: 'english',
        value: this.latin.value
    };
};

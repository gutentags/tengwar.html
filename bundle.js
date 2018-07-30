// @generated
/*eslint semi:[0], no-native-reassign:[0]*/
global = this;
(function (modules) {

    // Bundle allows the run-time to extract already-loaded modules from the
    // boot bundle.
    var bundle = {};
    var main;

    // Unpack module tuples into module objects.
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];
        module = modules[i] = new Module(
            module[0],
            module[1],
            module[2],
            module[3],
            module[4]
        );
        bundle[module.filename] = module;
    }

    function Module(id, dirname, basename, dependencies, factory) {
        this.id = id;
        this.dirname = dirname;
        this.filename = dirname + "/" + basename;
        // Dependency map and factory are used to instantiate bundled modules.
        this.dependencies = dependencies;
        this.factory = factory;
    }

    Module.prototype._require = function () {
        var module = this;
        if (module.exports === void 0) {
            module.exports = {};
            var require = function (id) {
                var index = module.dependencies[id];
                var dependency = modules[index];
                if (!dependency)
                    throw new Error("Bundle is missing a dependency: " + id);
                return dependency._require();
            };
            require.main = main;
            module.exports = module.factory(
                require,
                module.exports,
                module,
                module.filename,
                module.dirname
            ) || module.exports;
        }
        return module.exports;
    };

    // Communicate the bundle to all bundled modules
    Module.prototype.modules = bundle;

    return function require(filename) {
        main = bundle[filename];
        main._require();
    }
})([["html.html","gutentag","html.html",{"./html":1},function (require, exports, module, __filename, __dirname){

// gutentag/html.html
// ------------------

"use strict";
module.exports = (require)("./html");

}],["html.js","gutentag","html.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/html.js
// ----------------

"use strict";

module.exports = Html;
function Html(body, scope) {
    var node = body.ownerDocument.createBody();
    body.appendChild(node);
    this.node = node;
    this.defaultHtml = scope.argument.innerHTML;
    this.value = null;
}

Object.defineProperty(Html.prototype, "value", {
    get: function () {
        return this.node.innerHTML;
    },
    set: function (value) {
        if (value == null) {
            value = this.defaultHtml;
        } else if (typeof value !== "string") {
            throw new Error("HTML component only accepts string values");
        }
        this.node.innerHTML = value;
    }
});

}],["repeat.html","gutentag","repeat.html",{"./repeat":3},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.html
// --------------------

"use strict";
module.exports = (require)("./repeat");

}],["repeat.js","gutentag","repeat.js",{"pop-observe":8,"pop-swap":13},function (require, exports, module, __filename, __dirname){

// gutentag/repeat.js
// ------------------


var O = require("pop-observe");
var swap = require("pop-swap");

var empty = [];

module.exports = Repetition;
function Repetition(body, scope) {
    this.body = body;
    this.scope = scope;
    this.iterations = [];
    this.Iteration = scope.argument.component;
    this.id = scope.id;
    this.observer = null;
    this._value = null;
    this.value = [];
}

Object.defineProperty(Repetition.prototype, "value", {
    get: function () {
        return this._value;
    },
    set: function (value) {
        if (!Array.isArray(value)) {
            throw new Error('Value of repetition must be an array');
        }
        if (this.observer) {
            this.observer.cancel();
            this.handleValueRangeChange(empty, this._value, 0);
        }
        this._value = value;
        this.handleValueRangeChange(this._value, empty, 0);
        this.observer = O.observeRangeChange(this._value, this, "value");
    }
});

Repetition.prototype.handleValueRangeChange = function (plus, minus, index) {
    var body = this.body;
    var document = this.body.ownerDocument;

    for (var offset = index; offset < index + minus.length; offset++) {
        var iteration = this.iterations[offset];
        body.removeChild(iteration.body);
        iteration.value = null;
        iteration.index = null;
        iteration.body = null;
        if (iteration.destroy) {
            iteration.destroy();
        }
    }

    var nextIteration = this.iterations[index];
    var nextSibling = nextIteration && nextIteration.body;

    var add = [];
    for (var offset = 0; offset < plus.length; offset++) {
        var value = plus[offset];
        var iterationNode = document.createBody();
        var iterationScope = this.scope.nestComponents();

        var iteration = new this.Iteration(iterationNode, iterationScope);

        iteration.value = value;
        iteration.index = index + offset;
        iteration.body = iterationNode;

        iterationScope.hookup(this.scope.id + ":iteration", iteration);

        body.insertBefore(iterationNode, nextSibling);
        add.push(iteration);
    }

    swap(this.iterations, index, minus.length, add);

    // Update indexes
    for (var offset = index; offset < this.iterations.length; offset++) {
        this.iterations[offset].index = offset;
    }
};

Repetition.prototype.redraw = function (region) {
    for (var index = 0; index < this.iterations.length; index++) {
        var iteration = this.iterations[index];
        iteration.redraw(region);
    }
};

Repetition.prototype.destroy = function () {
    this.observer.cancel();
    this.handleValuesRangeChange([], this._value, 0);
};


}],["reveal.html","gutentag","reveal.html",{"./reveal":5},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.html
// --------------------

"use strict";
module.exports = (require)("./reveal");

}],["reveal.js","gutentag","reveal.js",{"pop-observe":8},function (require, exports, module, __filename, __dirname){

// gutentag/reveal.js
// ------------------

"use strict";

// TODO create scope for revealed body and add to owner whenever it is created.
// Destroy when retracted, recreate when revealed.

var O = require("pop-observe");

module.exports = Reveal;
function Reveal(body, scope) {
    this.value = false;
    this.observer = O.observePropertyChange(this, "value", this);
    this.body = body;
    this.scope = scope;
    this.Component = scope.argument.component;
    this.component = null;
    this.componentBody = null;
    this.componentScope = null;
}

Reveal.prototype.handleValuePropertyChange = function (value) {
    this.clear();
    if (value) {
        this.componentScope = this.scope.nestComponents();
        this.componentBody = this.body.ownerDocument.createBody();
        this.component = new this.Component(this.componentBody, this.componentScope);
        this.componentScope.hookup(this.scope.id + ":revelation", this.component);
        this.body.appendChild(this.componentBody);
    }
};

Reveal.prototype.clear = function clear() {
    if (this.component) {
        if (this.component.destroy) {
            this.component.destroy();
        }
        this.body.removeChild(this.componentBody);
        this.component = null;
        this.componentBody = null;
    }
};

Reveal.prototype.destroy = function () {
    this.clear();
    this.observer.cancel();
};

}],["scope.js","gutentag","scope.js",{},function (require, exports, module, __filename, __dirname){

// gutentag/scope.js
// -----------------

"use strict";

module.exports = Scope;
function Scope() {
    this.root = this;
    this.components = Object.create(null);
    this.componentsFor = Object.create(null);
}

Scope.prototype.nest = function () {
    var child = Object.create(this);
    child.parent = this;
    child.caller = this.caller && this.caller.nest();
    return child;
};

Scope.prototype.nestComponents = function () {
    var child = this.nest();
    child.components = Object.create(this.components);
    child.componentsFor = Object.create(this.componentsFor);
    return child;
};

// TODO deprecated
Scope.prototype.set = function (id, component) {
    console.log(new Error().stack);
    this.hookup(id, component);
};

Scope.prototype.hookup = function (id, component) {
    var scope = this;
    scope.components[id] = component;

    if (scope.this.hookup) {
        scope.this.hookup(id, component, scope);
    } else if (scope.this.add) {
        // TODO deprecated
        scope.this.add(component, id, scope);
    }

    var exportId = scope.this.exports && scope.this.exports[id];
    if (exportId) {
        var callerId = scope.caller.id;
        scope.caller.hookup(callerId + ":" + exportId, component);
    }
};

}],["koerper.js","koerper","koerper.js",{"wizdom":42},function (require, exports, module, __filename, __dirname){

// koerper/koerper.js
// ------------------

"use strict";

var BaseDocument = require("wizdom");
var BaseNode = BaseDocument.prototype.Node;
var BaseElement = BaseDocument.prototype.Element;
var BaseTextNode = BaseDocument.prototype.TextNode;

module.exports = Document;
function Document(actualNode) {
    Node.call(this, this);
    this.actualNode = actualNode;
    this.actualDocument = actualNode.ownerDocument;

    this.documentElement = this.createBody();
    this.documentElement.parentNode = this;
    actualNode.appendChild(this.documentElement.actualNode);

    this.firstChild = this.documentElement;
    this.lastChild = this.documentElement;
}

Document.prototype = Object.create(BaseDocument.prototype);
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Body = Body;
Document.prototype.OpaqueHtml = OpaqueHtml;

Document.prototype.createBody = function (label) {
    return new this.Body(this, label);
};

Document.prototype.getActualParent = function () {
    return this.actualNode;
};

function Node(document) {
    BaseNode.call(this, document);
    this.actualNode = null;
}

Node.prototype = Object.create(BaseNode.prototype);
Node.prototype.constructor = Node;

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (nextSibling && nextSibling.parentNode !== this) {
        throw new Error("Can't insert before node that is not a child of parent");
    }
    BaseNode.prototype.insertBefore.call(this, childNode, nextSibling);
    var actualParentNode = this.getActualParent();
    var actualNextSibling;
    if (nextSibling) {
        actualNextSibling = nextSibling.getActualFirstChild();
    }
    if (!actualNextSibling) {
        actualNextSibling = this.getActualNextSibling();
    }
    if (actualNextSibling && actualNextSibling.parentNode !== actualParentNode) {
        actualNextSibling = null;
    }
    actualParentNode.insertBefore(childNode.actualNode, actualNextSibling || null);
    childNode.inject();
    return childNode;
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove child " + childNode);
    }
    childNode.extract();
    this.getActualParent().removeChild(childNode.actualNode);
    BaseNode.prototype.removeChild.call(this, childNode);
};

Node.prototype.setAttribute = function setAttribute(key, value) {
    this.actualNode.setAttribute(key, value);
};

Node.prototype.getAttribute = function getAttribute(key) {
    this.actualNode.getAttribute(key);
};

Node.prototype.hasAttribute = function hasAttribute(key) {
    this.actualNode.hasAttribute(key);
};

Node.prototype.removeAttribute = function removeAttribute(key) {
    this.actualNode.removeAttribute(key);
};

Node.prototype.addEventListener = function addEventListener(name, handler, capture) {
    this.actualNode.addEventListener(name, handler, capture);
};

Node.prototype.removeEventListener = function removeEventListener(name, handler, capture) {
    this.actualNode.removeEventListener(name, handler, capture);
};

Node.prototype.inject = function injectNode() { };

Node.prototype.extract = function extractNode() { };

Node.prototype.getActualParent = function () {
    return this.actualNode;
};

Node.prototype.getActualFirstChild = function () {
    return this.actualNode;
};

Node.prototype.getActualNextSibling = function () {
    return null;
};

Object.defineProperty(Node.prototype, "innerHTML", {
    get: function () {
        return this.actualNode.innerHTML;
    }//,
    //set: function (html) {
    //    // TODO invalidate any subcontained child nodes
    //    this.actualNode.innerHTML = html;
    //}
});

function Element(document, type, namespace) {
    BaseNode.call(this, document, namespace);
    if (namespace) {
        this.actualNode = document.actualDocument.createElementNS(namespace, type);
    } else {
        this.actualNode = document.actualDocument.createElement(type);
    }
    this.attributes = this.actualNode.attributes;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

function TextNode(document, text) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode(text);
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

Object.defineProperty(TextNode.prototype, "data", {
    set: function (data) {
        this.actualNode.data = data;
    },
    get: function () {
        return this.actualNode.data;
    }
});

// if parentNode is null, the body is extracted
// if parentNode is non-null, the body is inserted
function Body(document, label) {
    Node.call(this, document);
    this.actualNode = document.actualDocument.createTextNode("");
    //this.actualNode = document.actualDocument.createComment(label || "");
    this.actualFirstChild = null;
    this.actualBody = document.actualDocument.createElement("BODY");
}

Body.prototype = Object.create(Node.prototype);
Body.prototype.constructor = Body;
Body.prototype.nodeType = 13;

Body.prototype.extract = function extract() {
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = this.getActualFirstChild();
    var next;
    while (at && at !== lastChild) {
        next = at.nextSibling;
        if (body) {
            body.appendChild(at);
        } else {
            parentNode.removeChild(at);
        }
        at = next;
    }
};

Body.prototype.inject = function inject() {
    if (!this.parentNode) {
        throw new Error("Can't inject without a parent node");
    }
    var body = this.actualBody;
    var lastChild = this.actualNode;
    var parentNode = this.parentNode.getActualParent();
    var at = body.firstChild;
    var next;
    while (at) {
        next = at.nextSibling;
        parentNode.insertBefore(at, lastChild);
        at = next;
    }
};

Body.prototype.getActualParent = function () {
    if (this.parentNode) {
        return this.parentNode.getActualParent();
    } else {
        return this.actualBody;
    }
};

Body.prototype.getActualFirstChild = function () {
    if (this.firstChild) {
        return this.firstChild.getActualFirstChild();
    } else {
        return this.actualNode;
    }
};

Body.prototype.getActualNextSibling = function () {
    return this.actualNode;
};

Object.defineProperty(Body.prototype, "innerHTML", {
    get: function () {
        if (this.parentNode) {
            this.extract();
            var html = this.actualBody.innerHTML;
            this.inject();
            return html;
        } else {
            return this.actualBody.innerHTML;
        }
    },
    set: function (html) {
        if (this.parentNode) {
            this.extract();
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
            this.inject();
        } else {
            this.actualBody.innerHTML = html;
            this.firstChild = this.lastChild = new OpaqueHtml(
                this.ownerDocument,
                this.actualBody
            );
        }
        return html;
    }
});

function OpaqueHtml(ownerDocument, body) {
    Node.call(this, ownerDocument);
    this.actualFirstChild = body.firstChild;
}

OpaqueHtml.prototype = Object.create(Node.prototype);
OpaqueHtml.prototype.constructor = OpaqueHtml;

OpaqueHtml.prototype.getActualFirstChild = function getActualFirstChild() {
    return this.actualFirstChild;
};

}],["index.js","pop-observe","index.js",{"./observable-array":9,"./observable-object":11,"./observable-range":12,"./observable-map":10},function (require, exports, module, __filename, __dirname){

// pop-observe/index.js
// --------------------

"use strict";

require("./observable-array");
var Oa = require("./observable-array");
var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

exports.makeArrayObservable = Oa.makeArrayObservable;

for (var name in Oo) {
    exports[name] = Oo[name];
}
for (var name in Or) {
    exports[name] = Or[name];
}
for (var name in Om) {
    exports[name] = Om[name];
}


}],["observable-array.js","pop-observe","observable-array.js",{"./observable-object":11,"./observable-range":12,"./observable-map":10,"pop-swap/swap":14},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-array.js
// -------------------------------

/*
 * Based in part on observable arrays from Motorola Mobility’s Montage
 * Copyright (c) 2012, Motorola Mobility LLC. All Rights Reserved.
 *
 * 3-Clause BSD License
 * https://github.com/motorola-mobility/montage/blob/master/LICENSE.md
 */

/**
 * This module is responsible for observing changes to owned properties of
 * objects and changes to the content of arrays caused by method calls. The
 * interface for observing array content changes establishes the methods
 * necessary for any collection with observable content.
 */

var Oo = require("./observable-object");
var Or = require("./observable-range");
var Om = require("./observable-map");

var array_swap = require("pop-swap/swap");
var array_splice = Array.prototype.splice;
var array_slice = Array.prototype.slice;
var array_reverse = Array.prototype.reverse;
var array_sort = Array.prototype.sort;
var array_empty = [];

var observableArrayProperties = {

    swap: {
        value: function swap(start, minusLength, plus) {
            if (plus) {
                if (!Array.isArray(plus)) {
                    plus = array_slice.call(plus);
                }
            } else {
                plus = array_empty;
            }

            if (start < 0) {
                start = this.length + start;
            } else if (start > this.length) {
                var holes = start - this.length;
                var newPlus = Array(holes + plus.length);
                for (var i = 0, j = holes; i < plus.length; i++, j++) {
                    if (i in plus) {
                        newPlus[j] = plus[i];
                    }
                }
                plus = newPlus;
                start = this.length;
            }

            if (start + minusLength > this.length) {
                // Truncate minus length if it extends beyond the length
                minusLength = this.length - start;
            } else if (minusLength < 0) {
                // It is the JavaScript way.
                minusLength = 0;
            }

            var minus;
            if (minusLength === 0) {
                // minus will be empty
                if (plus.length === 0) {
                    // at this point if plus is empty there is nothing to do.
                    return []; // [], but spare us an instantiation
                }
                minus = array_empty;
            } else {
                minus = array_slice.call(this, start, start + minusLength);
            }

            var diff = plus.length - minus.length;
            var oldLength = this.length;
            var newLength = Math.max(this.length + diff, start + plus.length);
            var longest = Math.max(oldLength, newLength);
            var observedLength = Math.min(longest, this.observedLength);

            // dispatch before change events
            if (diff) {
                Oo.dispatchPropertyWillChange(this, "length", newLength, oldLength);
            }
            Or.dispatchRangeWillChange(this, plus, minus, start);
            if (diff === 0) {
                // Substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyWillChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapWillChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < plus.length) {
                            if (plus[j] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, plus[j], this[i]);
                            }
                        } else {
                            if (this[i - diff] !== this[i]) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff], this[i]);
                                Om.dispatchMapWillChange(this, "update", i, this[i - diff], this[i]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < plus.length) {
                            if (plus[j] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, plus[j]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, plus[j]);
                        } else {
                            if (this[i - diff] !== void 0) {
                                Oo.dispatchPropertyWillChange(this, i, this[i - diff]);
                            }
                            Om.dispatchMapWillChange(this, "create", i, this[i - diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (this[i] !== void 0) {
                            Oo.dispatchPropertyWillChange(this, i, void 0, this[i]);
                        }
                        Om.dispatchMapWillChange(this, "delete", i, void 0, this[i]);
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            // actual work
            array_swap(this, start, minusLength, plus);

            // dispatch after change events
            if (diff === 0) { // substring replacement
                for (var i = start, j = 0; i < start + plus.length; i++, j++) {
                    if (plus[j] !== minus[j]) {
                        Oo.dispatchPropertyChange(this, i, plus[j], minus[j]);
                        Om.dispatchMapChange(this, "update", i, plus[j], minus[j]);
                    }
                }
            } else {
                // All subsequent values changed or shifted.
                // Avoid (observedLength - start) long walks if there are no
                // registered descriptors.
                for (var i = start, j = 0; i < observedLength; i++, j++) {
                    if (i < oldLength && i < newLength) { // update
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                                Om.dispatchMapChange(this, "update", i, this[i], minus[j]);
                            }
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                                Om.dispatchMapChange(this, "update", i, this[i], this[i + diff]);
                            }
                        }
                    } else if (i < newLength) { // but i >= oldLength, create
                        if (j < minus.length) {
                            if (this[i] !== minus[j]) {
                                Oo.dispatchPropertyChange(this, i, this[i], minus[j]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], minus[j]);
                        } else {
                            if (this[i] !== this[i + diff]) {
                                Oo.dispatchPropertyChange(this, i, this[i], this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "create", i, this[i], this[i + diff]);
                        }
                    } else if (i < oldLength) { // but i >= newLength, delete
                        if (j < minus.length) {
                            if (minus[j] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, minus[j]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, minus[j]);
                        } else {
                            if (this[i + diff] !== void 0) {
                                Oo.dispatchPropertyChange(this, i, void 0, this[i + diff]);
                            }
                            Om.dispatchMapChange(this, "delete", i, void 0, this[i + diff]);
                        }
                    } else {
                        throw new Error("assertion error");
                    }
                }
            }

            Or.dispatchRangeChange(this, plus, minus, start);
            if (diff) {
                Oo.dispatchPropertyChange(this, "length", newLength, oldLength);
            }
        },
        writable: true,
        configurable: true
    },

    splice: {
        value: function splice(start, minusLength) {
            if (start > this.length) {
                start = this.length;
            }
            var result = this.slice(start, start + minusLength);
            this.swap.call(this, start, minusLength, array_slice.call(arguments, 2));
            return result;
        },
        writable: true,
        configurable: true
    },

    // splice is the array content change utility belt.  forward all other
    // content changes to splice so we only have to write observer code in one
    // place

    reverse: {
        value: function reverse() {
            var reversed = this.slice();
            reversed.reverse();
            this.swap(0, this.length, reversed);
            return this;
        },
        writable: true,
        configurable: true
    },

    sort: {
        value: function sort() {
            var sorted = this.slice();
            array_sort.apply(sorted, arguments);
            this.swap(0, this.length, sorted);
            return this;
        },
        writable: true,
        configurable: true
    },

    set: {
        value: function set(index, value) {
            this.swap(index, index >= this.length ? 0 : 1, [value]);
            return true;
        },
        writable: true,
        configurable: true
    },

    shift: {
        value: function shift() {
            if (this.length) {
                var result = this[0];
                this.swap(0, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    pop: {
        value: function pop() {
            if (this.length) {
                var result = this[this.length - 1];
                this.swap(this.length - 1, 1);
                return result;
            }
        },
        writable: true,
        configurable: true
    },

    push: {
        value: function push(value) {
            this.swap(this.length, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    unshift: {
        value: function unshift(value) {
            this.swap(0, 0, arguments);
            return this.length;
        },
        writable: true,
        configurable: true
    },

    clear: {
        value: function clear() {
            this.swap(0, this.length);
        },
        writable: true,
        configurable: true
    }

};

var hiddenProperty = {
    value: null,
    enumerable: false,
    writable: true,
    configurable: true
};

var observableArrayOwnProperties = {
    observed: hiddenProperty,
    observedLength: hiddenProperty,

    propertyObservers: hiddenProperty,
    wrappedPropertyDescriptors: hiddenProperty,

    rangeChangeObservers: hiddenProperty,
    rangeWillChangeObservers: hiddenProperty,
    dispatchesRangeChanges: hiddenProperty,

    mapChangeObservers: hiddenProperty,
    mapWillChangeObservers: hiddenProperty,
    dispatchesMapChanges: hiddenProperty
};

// use different strategies for making arrays observable between Internet
// Explorer and other browsers.
var protoIsSupported = {}.__proto__ === Object.prototype;
var bestowObservableArrayProperties;
if (protoIsSupported) {
    var observableArrayPrototype = Object.create(Array.prototype, observableArrayProperties);
    bestowObservableArrayProperties = function (array) {
        array.__proto__ = observableArrayPrototype;
    };
} else {
    bestowObservableArrayProperties = function (array) {
        Object.defineProperties(array, observableArrayProperties);
    };
}

exports.makeArrayObservable = makeArrayObservable;
function makeArrayObservable(array) {
    if (array.observed) {
        return;
    }
    bestowObservableArrayProperties(array);
    Object.defineProperties(array, observableArrayOwnProperties);
    array.observedLength = 0;
    array.observed = true;
}

// For ObservableObject
exports.makePropertyObservable = makePropertyObservable;
function makePropertyObservable(array, index) {
    makeArrayObservable(array);
    if (~~index === index && index >= 0) { // Note: NaN !== NaN, ~~"foo" !== "foo"
        makeIndexObservable(array, index);
    }
}

// For ObservableRange
exports.makeRangeChangesObservable = makeRangeChangesObservable;
function makeRangeChangesObservable(array) {
    makeArrayObservable(array);
}

// For ObservableMap
exports.makeMapChangesObservable = makeMapChangesObservable;
function makeMapChangesObservable(array) {
    makeArrayObservable(array);
    makeIndexObservable(array, Infinity);
}

function makeIndexObservable(array, index) {
    if (index >= array.observedLength) {
        array.observedLength = index + 1;
    }
}


}],["observable-map.js","pop-observe","observable-map.js",{"./observable-array":9},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-map.js
// -----------------------------

"use strict";

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableMap;
function ObservableMap() {
    throw new Error("Can't construct. ObservableMap is a mixin.");
}

ObservableMap.prototype.observeMapChange = function (handler, name, note, capture) {
    return observeMapChange(this, handler, name, note, capture);
};

ObservableMap.prototype.observeMapWillChange = function (handler, name, note) {
    return observeMapChange(this, handler, name, note, true);
};

ObservableMap.prototype.dispatchMapChange = function (type, key, plus, minus, capture) {
    return dispatchMapChange(this, type, key, plus, minus, capture);
};

ObservableMap.prototype.dispatchMapWillChange = function (type, key, plus, minus) {
    return dispatchMapWillChange(this, type, key, plus, minus, true);
};

ObservableMap.prototype.getMapChangeObservers = function (capture) {
    return getMapChangeObservers(this, capture);
};

ObservableMap.prototype.getMapWillChangeObservers = function () {
    return getMapChangeObservers(this, true);
};

ObservableMap.observeMapChange = observeMapChange;
function observeMapChange(object, handler, name, note, capture) {
    makeMapChangesObservable(object);
    var observers = getMapChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new MapChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "MapChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapChange) {
            observer.handlerMethodName = "handleMapChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    } else {
        var methodName = "handle" + propertyName + "MapWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleMapWillChange) {
            observer.handlerMethodName = "handleMapWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch map changes to " + handler);
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableMap.observeMapWillChange = observeMapWillChange;
function observeMapWillChange(object, handler, name, note) {
    return observeMapChange(object, handler, name, note, true);
}

ObservableMap.dispatchMapChange = dispatchMapChange;
function dispatchMapChange(object, type, key, plus, minus, capture) {
    if (plus === minus) {
        return;
    }
    if (!dispatching) { // TODO && !debug?
        return startMapChangeDispatchContext(object, type, key, plus, minus, capture);
    }
    var observers = getMapChangeObservers(object, capture);
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(type, key, plus, minus);
    }
}

ObservableMap.dispatchMapWillChange = dispatchMapWillChange;
function dispatchMapWillChange(object, type, key, plus, minus) {
    return dispatchMapChange(object, type, key, plus, minus, true);
}

function startMapChangeDispatchContext(object, type, key, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchMapChange(object, type, key, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Map change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Map change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.clear();
        }
    }
}

function getMapChangeObservers(object, capture) {
    if (capture) {
        if (!object.mapWillChangeObservers) {
            object.mapWillChangeObservers = [];
        }
        return object.mapWillChangeObservers;
    } else {
        if (!object.mapChangeObservers) {
            object.mapChangeObservers = [];
        }
        return object.mapChangeObservers;
    }
}

function getMapWillChangeObservers(object) {
    return getMapChangeObservers(object, true);
}

function makeMapChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeMapChangesObservable(object);
    }
    if (object.makeMapChangesObservable) {
        object.makeMapChangesObservable();
    }
    object.dispatchesMapChanges = true;
}

function MapChangeObserver() {
    this.init();
}

MapChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

MapChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " map changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

MapChangeObserver.prototype.dispatch = function (type, key, plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, key, type, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, key, type, this.object);
    } else {
        throw new Error(
            "Can't dispatch map change for " + JSON.stringify(this.name) + " to " + handler +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

var Oa = require("./observable-array");

}],["observable-object.js","pop-observe","observable-object.js",{"./observable-array":9},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-object.js
// --------------------------------

/*jshint node: true*/
"use strict";

// XXX Note: exceptions thrown from handlers and handler cancelers may
// interfere with dispatching to subsequent handlers of any change in progress.
// It is unlikely that plans are recoverable once an exception interferes with
// change dispatch. The internal records should not be corrupt, but observers
// might miss an intermediate property change.

var owns = Object.prototype.hasOwnProperty;

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

// Reusable property descriptor
var hiddenValueProperty = {
    value: null,
    writable: true,
    enumerable: false,
    configurable: true
};

module.exports = ObservableObject;
function ObservableObject() {
    throw new Error("Can't construct. ObservableObject is a mixin.");
}

ObservableObject.prototype.observePropertyChange = function (name, handler, note, capture) {
    return observePropertyChange(this, name, handler, note, capture);
};

ObservableObject.prototype.observePropertyWillChange = function (name, handler, note) {
    return observePropertyWillChange(this, name, handler, note);
};

ObservableObject.prototype.dispatchPropertyChange = function (name, plus, minus, capture) {
    return dispatchPropertyChange(this, name, plus, minus, capture);
};

ObservableObject.prototype.dispatchPropertyWillChange = function (name, plus, minus) {
    return dispatchPropertyWillChange(this, name, plus, minus);
};

ObservableObject.prototype.getPropertyChangeObservers = function (name, capture) {
    return getPropertyChangeObservers(this, name, capture);
};

ObservableObject.prototype.getPropertyWillChangeObservers = function (name) {
    return getPropertyWillChangeObservers(this, name);
};

ObservableObject.prototype.makePropertyObservable = function (name) {
    return makePropertyObservable(this, name);
};

ObservableObject.prototype.preventPropertyObserver = function (name) {
    return preventPropertyObserver(this, name);
};

ObservableObject.prototype.PropertyChangeObserver = PropertyChangeObserver;

// Constructor interface with polymorphic delegation if available

ObservableObject.observePropertyChange = function (object, name, handler, note, capture) {
    if (object.observePropertyChange) {
        return object.observePropertyChange(name, handler, note, capture);
    } else {
        return observePropertyChange(object, name, handler, note, capture);
    }
};

ObservableObject.observePropertyWillChange = function (object, name, handler, note) {
    if (object.observePropertyWillChange) {
        return object.observePropertyWillChange(name, handler, note);
    } else {
        return observePropertyWillChange(object, name, handler, note);
    }
};

ObservableObject.dispatchPropertyChange = function (object, name, plus, minus, capture) {
    if (object.dispatchPropertyChange) {
        return object.dispatchPropertyChange(name, plus, minus, capture);
    } else {
        return dispatchPropertyChange(object, name, plus, minus, capture);
    }
};

ObservableObject.dispatchPropertyWillChange = function (object, name, plus, minus) {
    if (object.dispatchPropertyWillChange) {
        return object.dispatchPropertyWillChange(name, plus, minus);
    } else {
        return dispatchPropertyWillChange(object, name, plus, minus);
    }
};

ObservableObject.makePropertyObservable = function (object, name) {
    if (object.makePropertyObservable) {
        return object.makePropertyObservable(name);
    } else {
        return makePropertyObservable(object, name);
    }
};

ObservableObject.preventPropertyObserver = function (object, name) {
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
};

// Implementation

function observePropertyChange(object, name, handler, note, capture) {
    ObservableObject.makePropertyObservable(object, name);
    var observers = getPropertyChangeObservers(object, name, capture);

    var observer;
    if (observerFreeList.length) { // TODO && !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new PropertyChangeObserver();
    }

    observer.object = object;
    observer.propertyName = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;
    observer.value = object[name];

    // Precompute dispatch method names.

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var specificChangeMethodName = "handle" + propertyName + "PropertyChange";
        var genericChangeMethodName = "handlePropertyChange";
        if (handler[specificChangeMethodName]) {
            observer.handlerMethodName = specificChangeMethodName;
        } else if (handler[genericChangeMethodName]) {
            observer.handlerMethodName = genericChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    } else {
        var specificWillChangeMethodName = "handle" + propertyName + "PropertyWillChange";
        var genericWillChangeMethodName = "handlePropertyWillChange";
        if (handler[specificWillChangeMethodName]) {
            observer.handlerMethodName = specificWillChangeMethodName;
        } else if (handler[genericWillChangeMethodName]) {
            observer.handlerMethodName = genericWillChangeMethodName;
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " property changes on " + object);
        }
    }

    observers.push(observer);

    // TODO issue warnings if the number of handler records exceeds some
    // concerning quantity as a harbinger of a memory leak.
    // TODO Note that if this is garbage collected without ever being called,
    // it probably indicates a programming error.
    return observer;
}

function observePropertyWillChange(object, name, handler, note) {
    return observePropertyChange(object, name, handler, note, true);
}

function dispatchPropertyChange(object, name, plus, minus, capture) {
    if (!dispatching) { // TODO && !debug?
        return startPropertyChangeDispatchContext(object, name, plus, minus, capture);
    }
    var observers = getPropertyChangeObservers(object, name, capture).slice();
    for (var index = 0; index < observers.length; index++) {
        var observer = observers[index];
        observer.dispatch(plus, minus);
    }
}

function dispatchPropertyWillChange(object, name, plus, minus) {
    dispatchPropertyChange(object, name, plus, minus, true);
}

function startPropertyChangeDispatchContext(object, name, plus, minus, capture) {
    dispatching = true;
    try {
        dispatchPropertyChange(object, name, plus, minus, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Property change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Property change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            observerToFreeList.length = 0;
        }
    }
}

function getPropertyChangeObservers(object, name, capture) {
    if (!object.propertyObservers) {
        hiddenValueProperty.value = Object.create(null);
        Object.defineProperty(object, "propertyObservers", hiddenValueProperty);
    }
    var observersByKey = object.propertyObservers;
    var phase = capture ? "WillChange" : "Change";
    var key = name + phase;
    if (!Object.prototype.hasOwnProperty.call(observersByKey, key)) {
        observersByKey[key] = [];
    }
    return observersByKey[key];
}

function getPropertyWillChangeObservers(object, name) {
    return getPropertyChangeObservers(object, name, true);
}

function PropertyChangeObserver() {
    this.init();
    // Object.seal(this); // Maybe one day, this won't deoptimize.
}

PropertyChangeObserver.prototype.init = function () {
    this.object = null;
    this.propertyName = null;
    // Peer observers, from which to pluck itself upon cancelation.
    this.observers = null;
    // On which to dispatch property change notifications.
    this.handler = null;
    // Precomputed handler method name for change dispatch
    this.handlerMethodName = null;
    // Returned by the last property change notification, which must be
    // canceled before the next change notification, or when this observer is
    // finally canceled.
    this.childObserver = null;
    // For the discretionary use of the user, perhaps to track why this
    // observer has been created, or whether this observer should be
    // serialized.
    this.note = null;
    // Whether this observer dispatches before a change occurs, or after
    this.capture = null;
    // The last known value
    this.value = null;
};

PropertyChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.propertyName) + " on " + this.object +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

PropertyChangeObserver.prototype.dispatch = function (plus, minus) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    if (minus === void 0) {
        minus = this.value;
    }
    this.value = plus;

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }
    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, this.propertyName, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, this.propertyName, this.object);
    } else {
        throw new Error(
            "Can't dispatch " + JSON.stringify(handlerMethodName) + " property change on " + object +
            " because there is no handler method"
        );
    }

    this.childObserver = childObserver;
    return this;
};

function makePropertyObservable(object, name) {
    if (Array.isArray(object)) {
        return Oa.makePropertyObservable(object, name);
    }

    var wrappedDescriptor = wrapPropertyDescriptor(object, name);

    if (!wrappedDescriptor) {
        return;
    }

    var thunk;
    // in both of these new descriptor variants, we reuse the wrapped
    // descriptor to either store the current value or apply getters
    // and setters. this is handy since we can reuse the wrapped
    // descriptor if we uninstall the observer. We even preserve the
    // assignment semantics, where we get the value from up the
    // prototype chain, and set as an owned property.
    if ("value" in wrappedDescriptor) {
        thunk = makeValuePropertyThunk(name, wrappedDescriptor);
    } else { // "get" or "set", but not necessarily both
        thunk = makeGetSetPropertyThunk(name, wrappedDescriptor);
    }

    Object.defineProperty(object, name, thunk);
}

/**
 * Prevents a thunk from being installed on a property, assuming that the
 * underlying type will dispatch the change manually, or intends the property
 * to stick on all instances.
 */
function preventPropertyObserver(object, name) {
    var wrappedDescriptor = wrapPropertyDescriptor(object, name);
    Object.defineProperty(object, name, wrappedDescriptor);
}

function wrapPropertyDescriptor(object, name) {
    // Arrays are special. We do not support direct setting of properties
    // on an array. instead, call .set(index, value). This is observable.
    // "length" property is observable for all mutating methods because
    // our overrides explicitly dispatch that change.
    if (Array.isArray(object)) {
        return;
    }

    if (!Object.isExtensible(object, name)) {
        return;
    }

    var wrappedDescriptor = getPropertyDescriptor(object, name);
    var wrappedPrototype = wrappedDescriptor.prototype;

    var existingWrappedDescriptors = wrappedPrototype.wrappedPropertyDescriptors;
    if (existingWrappedDescriptors && owns.call(existingWrappedDescriptors, name)) {
        return;
    }

    var wrappedPropertyDescriptors = object.wrappedPropertyDescriptors;
    if (!wrappedPropertyDescriptors) {
        wrappedPropertyDescriptors = {};
        hiddenValueProperty.value = wrappedPropertyDescriptors;
        Object.defineProperty(object, "wrappedPropertyDescriptors", hiddenValueProperty);
    }

    if (owns.call(wrappedPropertyDescriptors, name)) {
        // If we have already recorded a wrapped property descriptor,
        // we have already installed the observer, so short-here.
        return;
    }

    if (!wrappedDescriptor.configurable) {
        return;
    }

    // Memoize the descriptor so we know not to install another layer. We
    // could use it to uninstall the observer, but we do not to avoid GC
    // thrashing.
    wrappedPropertyDescriptors[name] = wrappedDescriptor;

    // Give up *after* storing the wrapped property descriptor so it
    // can be restored by uninstall. Unwritable properties are
    // silently not overriden. Since success is indistinguishable from
    // failure, we let it pass but don't waste time on intercepting
    // get/set.
    if (!wrappedDescriptor.writable && !wrappedDescriptor.set) {
        return;
    }

    // If there is no setter, it is not mutable, and observing is moot.
    // Manual dispatch may still apply.
    if (wrappedDescriptor.get && !wrappedDescriptor.set) {
        return;
    }

    return wrappedDescriptor;
}

function getPropertyDescriptor(object, name) {
    // walk up the prototype chain to find a property descriptor for the
    // property name.
    var descriptor;
    var prototype = object;
    do {
        descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor) {
            break;
        }
        prototype = Object.getPrototypeOf(prototype);
    } while (prototype);
    if (descriptor) {
        descriptor.prototype = prototype;
        return descriptor;
    } else {
        // or default to an undefined value
        return {
            prototype: object,
            value: undefined,
            enumerable: false,
            writable: true,
            configurable: true
        };
    }
}

function makeValuePropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            return state[name];
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (!(name in state)) {
                // Get the initial value from up the prototype chain
                state[name] = wrappedDescriptor.value;
            }

            if (plus === state[name]) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            wrappedDescriptor.value = plus;
            state[name] = plus;

            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function makeGetSetPropertyThunk(name, wrappedDescriptor) {
    return {
        get: function () {
            if (wrappedDescriptor.get) {
                return wrappedDescriptor.get.apply(this, arguments);
            }
        },
        set: function (plus) {
            // Uses __this__ to quickly distinguish __state__ properties from
            // upward in the prototype chain.
            if (this.__state__ === void 0 || this.__state__.__this__ !== this) {
                initState(this);
                this.__state__[name] = this[name];
            }
            var state = this.__state__;

            if (state[name] === plus) {
                return plus;
            }

            // XXX plan interference hazard:
            dispatchPropertyWillChange(this, name, plus);

            // call through to actual setter
            if (wrappedDescriptor.set) {
                wrappedDescriptor.set.apply(this, arguments);
                state[name] = plus;
            }

            // use getter, if possible, to adjust the plus value if the setter
            // adjusted it, for example a setter for an array property that
            // retains the original array and replaces its content, or a setter
            // that coerces the value to an expected type.
            if (wrappedDescriptor.get) {
                plus = wrappedDescriptor.get.apply(this, arguments);
            }

            // dispatch the new value: the given value if there is
            // no getter, or the actual value if there is one
            // TODO spec
            // XXX plan interference hazard:
            dispatchPropertyChange(this, name, plus);

            return plus;
        },
        enumerable: wrappedDescriptor.enumerable,
        configurable: true
    };
}

function initState(object) {
    Object.defineProperty(object, "__state__", {
        value: {
            __this__: object
        },
        writable: true,
        enumerable: false,
        configurable: true
    });
}

var Oa = require("./observable-array");

}],["observable-range.js","pop-observe","observable-range.js",{"./observable-array":9},function (require, exports, module, __filename, __dirname){

// pop-observe/observable-range.js
// -------------------------------

/*global -WeakMap*/
"use strict";

// TODO review all error messages for consistency and helpfulness across observables

var observerFreeList = [];
var observerToFreeList = [];
var dispatching = false;

module.exports = ObservableRange;
function ObservableRange() {
    throw new Error("Can't construct. ObservableRange is a mixin.");
}

ObservableRange.prototype.observeRangeChange = function (handler, name, note, capture) {
    return observeRangeChange(this, handler, name, note, capture);
};

ObservableRange.prototype.observeRangeWillChange = function (handler, name, note) {
    return observeRangeChange(this, handler, name, note, true);
};

ObservableRange.prototype.dispatchRangeChange = function (plus, minus, index, capture) {
    return dispatchRangeChange(this, plus, minus, index, capture);
};

ObservableRange.prototype.dispatchRangeWillChange = function (plus, minus, index) {
    return dispatchRangeChange(this, plus, minus, index, true);
};

ObservableRange.prototype.getRangeChangeObservers = function (capture) {
};

ObservableRange.prototype.getRangeWillChangeObservers = function () {
    return getRangeChangeObservers(this, true);
};

ObservableRange.observeRangeChange = observeRangeChange;
function observeRangeChange(object, handler, name, note, capture) {
    makeRangeChangesObservable(object);
    var observers = getRangeChangeObservers(object, capture);

    var observer;
    if (observerFreeList.length) { // TODO !debug?
        observer = observerFreeList.pop();
    } else {
        observer = new RangeChangeObserver();
    }

    observer.object = object;
    observer.name = name;
    observer.capture = capture;
    observer.observers = observers;
    observer.handler = handler;
    observer.note = note;

    // Precompute dispatch method name

    var stringName = "" + name; // Array indicides must be coerced to string.
    var propertyName = stringName.slice(0, 1).toUpperCase() + stringName.slice(1);

    if (!capture) {
        var methodName = "handle" + propertyName + "RangeChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeChange) {
            observer.handlerMethodName = "handleRangeChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    } else {
        var methodName = "handle" + propertyName + "RangeWillChange";
        if (handler[methodName]) {
            observer.handlerMethodName = methodName;
        } else if (handler.handleRangeWillChange) {
            observer.handlerMethodName = "handleRangeWillChange";
        } else if (handler.call) {
            observer.handlerMethodName = null;
        } else {
            throw new Error("Can't arrange to dispatch " + JSON.stringify(name) + " map changes");
        }
    }

    observers.push(observer);

    // TODO issue warning if the number of handler records is worrisome
    return observer;
}

ObservableRange.observeRangeWillChange = observeRangeWillChange;
function observeRangeWillChange(object, handler, name, note) {
    return observeRangeChange(object, handler, name, note, true);
}

ObservableRange.dispatchRangeChange = dispatchRangeChange;
function dispatchRangeChange(object, plus, minus, index, capture) {
    if (!dispatching) { // TODO && !debug?
        return startRangeChangeDispatchContext(object, plus, minus, index, capture);
    }
    var observers = getRangeChangeObservers(object, capture);
    for (var observerIndex = 0; observerIndex < observers.length; observerIndex++) {
        var observer = observers[observerIndex];
        // The slicing ensures that handlers cannot interfere with another by
        // altering these arguments.
        observer.dispatch(plus.slice(), minus.slice(), index);
    }
}

ObservableRange.dispatchRangeWillChange = dispatchRangeWillChange;
function dispatchRangeWillChange(object, plus, minus, index) {
    return dispatchRangeChange(object, plus, minus, index, true);
}

function startRangeChangeDispatchContext(object, plus, minus, index, capture) {
    dispatching = true;
    try {
        dispatchRangeChange(object, plus, minus, index, capture);
    } catch (error) {
        if (typeof error === "object" && typeof error.message === "string") {
            error.message = "Range change dispatch possibly corrupted by error: " + error.message;
            throw error;
        } else {
            throw new Error("Range change dispatch possibly corrupted by error: " + error);
        }
    } finally {
        dispatching = false;
        if (observerToFreeList.length) {
            // Using push.apply instead of addEach because push will definitely
            // be much faster than the generic addEach, which also handles
            // non-array collections.
            observerFreeList.push.apply(
                observerFreeList,
                observerToFreeList
            );
            // Using clear because it is observable. The handler record array
            // is obtainable by getPropertyChangeObservers, and is observable.
            if (observerToFreeList.clear) {
                observerToFreeList.clear();
            } else {
                observerToFreeList.length = 0;
            }
        }
    }
}

function makeRangeChangesObservable(object) {
    if (Array.isArray(object)) {
        Oa.makeRangeChangesObservable(object);
    }
    if (object.makeRangeChangesObservable) {
        object.makeRangeChangesObservable();
    }
    object.dispatchesRangeChanges = true;
}

function getRangeChangeObservers(object, capture) {
    if (capture) {
        if (!object.rangeWillChangeObservers) {
            object.rangeWillChangeObservers = [];
        }
        return object.rangeWillChangeObservers;
    } else {
        if (!object.rangeChangeObservers) {
            object.rangeChangeObservers = [];
        }
        return object.rangeChangeObservers;
    }
}

/*
    if (object.preventPropertyObserver) {
        return object.preventPropertyObserver(name);
    } else {
        return preventPropertyObserver(object, name);
    }
*/

function RangeChangeObserver() {
    this.init();
}

RangeChangeObserver.prototype.init = function () {
    this.object = null;
    this.name = null;
    this.observers = null;
    this.handler = null;
    this.handlerMethodName = null;
    this.childObserver = null;
    this.note = null;
    this.capture = null;
};

RangeChangeObserver.prototype.cancel = function () {
    var observers = this.observers;
    var index = observers.indexOf(this);
    // Unfortunately, if this observer was reused, this would not be sufficient
    // to detect a duplicate cancel. Do not cancel more than once.
    if (index < 0) {
        throw new Error(
            "Can't cancel observer for " +
            JSON.stringify(this.name) + " range changes" +
            " because it has already been canceled"
        );
    }
    var childObserver = this.childObserver;
    observers.splice(index, 1);
    this.init();
    // If this observer is canceled while dispatching a change
    // notification for the same property...
    // 1. We cannot put the handler record onto the free list because
    // it may have been captured in the array of records to which
    // the change notification would be sent. We must mark it as
    // canceled by nulling out the handler property so the dispatcher
    // passes over it.
    // 2. We also cannot put the handler record onto the free list
    // until all change dispatches have been completed because it could
    // conceivably be reused, confusing the current dispatcher.
    if (dispatching) {
        // All handlers added to this list will be moved over to the
        // actual free list when there are no longer any property
        // change dispatchers on the stack.
        observerToFreeList.push(this);
    } else {
        observerFreeList.push(this);
    }
    if (childObserver) {
        // Calling user code on our stack.
        // Done in tail position to avoid a plan interference hazard.
        childObserver.cancel();
    }
};

RangeChangeObserver.prototype.dispatch = function (plus, minus, index) {
    var handler = this.handler;
    // A null handler implies that an observer was canceled during the dispatch
    // of a change. The observer is pending addition to the free list.
    if (!handler) {
        return;
    }

    var childObserver = this.childObserver;
    this.childObserver = null;
    // XXX plan interference hazards calling cancel and handler methods:
    if (childObserver) {
        childObserver.cancel();
    }

    var handlerMethodName = this.handlerMethodName;
    if (handlerMethodName && typeof handler[handlerMethodName] === "function") {
        childObserver = handler[handlerMethodName](plus, minus, index, this.object);
    } else if (handler.call) {
        childObserver = handler.call(void 0, plus, minus, index, this.object);
    } else {
        throw new Error(
            "Can't dispatch range change to " + handler
        );
    }

    this.childObserver = childObserver;

    return this;
};

var Oa = require("./observable-array");

}],["pop-swap.js","pop-swap","pop-swap.js",{"./swap":14},function (require, exports, module, __filename, __dirname){

// pop-swap/pop-swap.js
// --------------------

"use strict";

var swap = require("./swap");

module.exports = polymorphicSwap;
function polymorphicSwap(array, start, minusLength, plus) {
    if (typeof array.swap === "function") {
        array.swap(start, minusLength, plus);
    } else {
        swap(array, start, minusLength, plus);
    }
}


}],["swap.js","pop-swap","swap.js",{},function (require, exports, module, __filename, __dirname){

// pop-swap/swap.js
// ----------------

"use strict";

// Copyright (C) 2014 Montage Studio
// https://github.com/montagejs/collections/blob/7c674d49c04955f01bbd2839f90936e15aceea2f/operators/swap.js

var array_slice = Array.prototype.slice;

module.exports = swap;
function swap(array, start, minusLength, plus) {
    // Unrolled implementation into JavaScript for a couple reasons.
    // Calling splice can cause large stack sizes for large swaps. Also,
    // splice cannot handle array holes.
    if (plus) {
        if (!Array.isArray(plus)) {
            plus = array_slice.call(plus);
        }
    } else {
        plus = Array.empty;
    }

    if (start < 0) {
        start = array.length + start;
    } else if (start > array.length) {
        array.length = start;
    }

    if (start + minusLength > array.length) {
        // Truncate minus length if it extends beyond the length
        minusLength = array.length - start;
    } else if (minusLength < 0) {
        // It is the JavaScript way.
        minusLength = 0;
    }

    var diff = plus.length - minusLength;
    var oldLength = array.length;
    var newLength = array.length + diff;

    if (diff > 0) {
        // Head Tail Plus Minus
        // H H H H M M T T T T
        // H H H H P P P P T T T T
        //         ^ start
        //         ^-^ minus.length
        //           ^ --> diff
        //         ^-----^ plus.length
        //             ^------^ tail before
        //                 ^------^ tail after
        //                   ^ start iteration
        //                       ^ start iteration offset
        //             ^ end iteration
        //                 ^ end iteration offset
        //             ^ start + minus.length
        //                     ^ length
        //                   ^ length - 1
        for (var index = oldLength - 1; index >= start + minusLength; index--) {
            var offset = index + diff;
            if (index in array) {
                array[offset] = array[index];
            } else {
                // Oddly, PhantomJS complains about deleting array
                // properties, unless you assign undefined first.
                array[offset] = void 0;
                delete array[offset];
            }
        }
    }
    for (var index = 0; index < plus.length; index++) {
        if (index in plus) {
            array[start + index] = plus[index];
        } else {
            array[start + index] = void 0;
            delete array[start + index];
        }
    }
    if (diff < 0) {
        // Head Tail Plus Minus
        // H H H H M M M M T T T T
        // H H H H P P T T T T
        //         ^ start
        //         ^-----^ length
        //         ^-^ plus.length
        //             ^ start iteration
        //                 ^ offset start iteration
        //                     ^ end
        //                         ^ offset end
        //             ^ start + minus.length - plus.length
        //             ^ start - diff
        //                 ^------^ tail before
        //             ^------^ tail after
        //                     ^ length - diff
        //                     ^ newLength
        for (var index = start + plus.length; index < oldLength - diff; index++) {
            var offset = index - diff;
            if (offset in array) {
                array[index] = array[offset];
            } else {
                array[index] = void 0;
                delete array[index];
            }
        }
    }
    array.length = newLength;
}


}],["index.js","tengwar.html","index.js",{"koerper":7,"gutentag/scope":6,"./main.html":16},function (require, exports, module, __filename, __dirname){

// tengwar.html/index.js
// ---------------------

"use strict";

var Document = require("koerper");
var Scope = require("gutentag/scope");
var Main = require("./main.html");

var scope = new Scope();
var document = new Document(window.document.body);
var essay = new Main(document.documentElement, scope);

}],["main.html","tengwar.html","main.html",{"./main":17,"./tengwar-view.html":22,"./tengwar-explainer.html":20,"./tengwar-chooser.html":18},function (require, exports, module, __filename, __dirname){

// tengwar.html/main.html
// ----------------------

"use strict";
var $SUPER = require("./main");
module.exports = TengwarhtmlMain;
function TengwarhtmlMain(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "body-box");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "output-box");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
            // TENGWAR-EXPLAINER explanation
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // TENGWAR-EXPLAINER
                node = {tagName: "tengwar-explainer"};
                node.component = $THIS$0;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "explanation";
                component = new $TENGWAR_EXPLAINER(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("explanation", component);
            if (component.setAttribute) {
                component.setAttribute("id", "explanation_swy3ox");
            }
            if (scope.componentsFor["explanation"]) {
                scope.componentsFor["explanation"].setAttribute("for", "explanation_swy3ox")
            }
            // /TENGWAR-EXPLAINER explanation
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "divider");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "input-box");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
            // DIV null
            node = document.createElement("DIV");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("class", "content-box");
            }
            if (component.setAttribute) {
                component.setAttribute("style", null);
            }
            // /DIV null
            parents[parents.length] = parent; parent = node;
            // DIV
                // TEXTAREA latin
                node = document.createElement("TEXTAREA");
                parent.appendChild(node);
                component = node.actualNode;
                scope.hookup("latin", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "latin_31bhgw");
                }
                if (scope.componentsFor["latin"]) {
                    scope.componentsFor["latin"].setAttribute("for", "latin_31bhgw")
                }
                if (component.setAttribute) {
                    component.setAttribute("spellcheck", "false");
                }
                // /TEXTAREA latin
                parents[parents.length] = parent; parent = node;
                // TEXTAREA
                node = parent; parent = parents[parents.length - 1]; parents.length--;
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // DIV null
        node = document.createElement("DIV");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "chooser-box");
        }
        // /DIV null
        parents[parents.length] = parent; parent = node;
        // DIV
            // TENGWAR-CHOOSER chooser
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // TENGWAR-CHOOSER
                node = {tagName: "tengwar-chooser"};
                node.component = $THIS$1;
                callee = scope.nest();
                callee.argument = node;
                callee.id = "chooser";
                component = new $TENGWAR_CHOOSER(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("chooser", component);
            if (component.setAttribute) {
                component.setAttribute("id", "chooser_d8iq5x");
            }
            if (scope.componentsFor["chooser"]) {
                scope.componentsFor["chooser"].setAttribute("for", "chooser_d8iq5x")
            }
            // /TENGWAR-CHOOSER chooser
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = TengwarhtmlMain
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $TENGWAR_VIEW = require("./tengwar-view.html");
var $TENGWAR_EXPLAINER = require("./tengwar-explainer.html");
var $TENGWAR_CHOOSER = require("./tengwar-chooser.html");
var $THIS$0 = function TengwarhtmlMain$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};
var $THIS$1 = function TengwarhtmlMain$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
};

}],["main.js","tengwar.html","main.js",{"pop-observe":8},function (require, exports, module, __filename, __dirname){

// tengwar.html/main.js
// --------------------

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


}],["tengwar-chooser.html","tengwar.html","tengwar-chooser.html",{"./tengwar-chooser":19},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-chooser.html
// ---------------------------------

"use strict";
var $SUPER = require("./tengwar-chooser");
module.exports = TengwarhtmlTengwarchooser;
function TengwarhtmlTengwarchooser(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // SELECT select
    node = document.createElement("SELECT");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("select", component);
    if (component.setAttribute) {
        component.setAttribute("id", "select_u22kz8");
    }
    if (scope.componentsFor["select"]) {
        scope.componentsFor["select"].setAttribute("for", "select_u22kz8")
    }
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarChooser");
    }
    // /SELECT select
    parents[parents.length] = parent; parent = node;
    // SELECT
        // OPTGROUP null
        node = document.createElement("OPTGROUP");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("label", "General Use");
        }
        // /OPTGROUP null
        parents[parents.length] = parent; parent = node;
        // OPTGROUP
            // OPTION null
            node = document.createElement("OPTION");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("value", "general-use:english:parmaite");
            }
            // /OPTION null
            parents[parents.length] = parent; parent = node;
            // OPTION
                parent.appendChild(document.createTextNode("English"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            // OPTION null
            node = document.createElement("OPTION");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("value", "general-use:sindarin:parmaite");
            }
            // /OPTION null
            parents[parents.length] = parent; parent = node;
            // OPTION
                parent.appendChild(document.createTextNode("Sindarin"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            // OPTION null
            node = document.createElement("OPTION");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("value", "general-use:black-speech:annatar");
            }
            // /OPTION null
            parents[parents.length] = parent; parent = node;
            // OPTION
                parent.appendChild(document.createTextNode("Black Speech"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // OPTGROUP null
        node = document.createElement("OPTGROUP");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("label", "Classical");
        }
        // /OPTGROUP null
        parents[parents.length] = parent; parent = node;
        // OPTGROUP
            // OPTION null
            node = document.createElement("OPTION");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("value", "classical:quenya:parmaite");
            }
            // /OPTION null
            parents[parents.length] = parent; parent = node;
            // OPTION
                parent.appendChild(document.createTextNode("Quenya"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // OPTGROUP null
        node = document.createElement("OPTGROUP");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("label", "Mode of Beleriand");
        }
        // /OPTGROUP null
        parents[parents.length] = parent; parent = node;
        // OPTGROUP
            // OPTION null
            node = document.createElement("OPTION");
            parent.appendChild(node);
            component = node.actualNode;
            if (component.setAttribute) {
                component.setAttribute("value", "beleriand:sindarin:parmaite");
            }
            // /OPTION null
            parents[parents.length] = parent; parent = node;
            // OPTION
                parent.appendChild(document.createTextNode("Sindarin in the mode of Beleriand"));
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = TengwarhtmlTengwarchooser
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};

}],["tengwar-chooser.js","tengwar.html","tengwar-chooser.js",{},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-chooser.js
// -------------------------------

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

}],["tengwar-explainer.html","tengwar.html","tengwar-explainer.html",{"./tengwar-explainer":21,"gutentag/html.html":0,"gutentag/repeat.html":2,"gutentag/reveal.html":4},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-explainer.html
// -----------------------------------

"use strict";
var $SUPER = require("./tengwar-explainer");
module.exports = TengwarhtmlTengwarexplainer;
function TengwarhtmlTengwarexplainer(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // REPEAT sections
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "sections";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("sections", component);
        if (component.setAttribute) {
            component.setAttribute("id", "sections_66xbvi");
        }
        if (scope.componentsFor["sections"]) {
            scope.componentsFor["sections"].setAttribute("for", "sections_66xbvi")
        }
        // /REPEAT sections
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = TengwarhtmlTengwarexplainer
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $CONTENT = require("gutentag/html.html");
var $REPEAT = require("gutentag/repeat.html");
var $REVEAL = require("gutentag/reveal.html");
var $THIS$0 = function TengwarhtmlTengwarexplainer$0(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-section");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // REPEAT paragraphs
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0$1;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "paragraphs";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("paragraphs", component);
        if (component.setAttribute) {
            component.setAttribute("id", "paragraphs_5bfrt3");
        }
        if (scope.componentsFor["paragraphs"]) {
            scope.componentsFor["paragraphs"].setAttribute("for", "paragraphs_5bfrt3")
        }
        // /REPEAT paragraphs
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1 = function TengwarhtmlTengwarexplainer$0$1(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-paragraph");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // REPEAT lines
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0$1$2;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "lines";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("lines", component);
        if (component.setAttribute) {
            component.setAttribute("id", "lines_ttyc74");
        }
        if (scope.componentsFor["lines"]) {
            scope.componentsFor["lines"].setAttribute("for", "lines_ttyc74")
        }
        // /REPEAT lines
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1$2 = function TengwarhtmlTengwarexplainer$0$1$2(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-line");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
        // REPEAT words
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // REPEAT
            node = {tagName: "repeat"};
            node.component = $THIS$0$1$2$3;
            callee = scope.nest();
            callee.argument = node;
            callee.id = "words";
            component = new $REPEAT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("words", component);
        if (component.setAttribute) {
            component.setAttribute("id", "words_na5upc");
        }
        if (scope.componentsFor["words"]) {
            scope.componentsFor["words"].setAttribute("for", "words_na5upc")
        }
        // /REPEAT words
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    // REVEAL lineBreak
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // REVEAL
        node = {tagName: "reveal"};
        node.component = $THIS$0$1$2$6;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "lineBreak";
        component = new $REVEAL(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("lineBreak", component);
    if (component.setAttribute) {
        component.setAttribute("id", "lineBreak_7x11ra");
    }
    if (scope.componentsFor["lineBreak"]) {
        scope.componentsFor["lineBreak"].setAttribute("for", "lineBreak_7x11ra")
    }
    // /REVEAL lineBreak
};
var $THIS$0$1$2$3 = function TengwarhtmlTengwarexplainer$0$1$2$3(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // REPEAT columns
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // REPEAT
        node = {tagName: "repeat"};
        node.component = $THIS$0$1$2$3$4;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "columns";
        component = new $REPEAT(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("columns", component);
    if (component.setAttribute) {
        component.setAttribute("id", "columns_7n4a4e");
    }
    if (scope.componentsFor["columns"]) {
        scope.componentsFor["columns"].setAttribute("for", "columns_7n4a4e")
    }
    // /REPEAT columns
    // REVEAL wordBreak
    node = document.createBody();
    parent.appendChild(node);
    parents[parents.length] = parent; parent = node;
    // REVEAL
        node = {tagName: "reveal"};
        node.component = $THIS$0$1$2$3$5;
        callee = scope.nest();
        callee.argument = node;
        callee.id = "wordBreak";
        component = new $REVEAL(parent, callee);
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    scope.hookup("wordBreak", component);
    if (component.setAttribute) {
        component.setAttribute("id", "wordBreak_g907xs");
    }
    if (scope.componentsFor["wordBreak"]) {
        scope.componentsFor["wordBreak"].setAttribute("for", "wordBreak_g907xs")
    }
    // /REVEAL wordBreak
};
var $THIS$0$1$2$3$4 = function TengwarhtmlTengwarexplainer$0$1$2$3$4(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // SPAN null
    node = document.createElement("SPAN");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-column");
    }
    // /SPAN null
    parents[parents.length] = parent; parent = node;
    // SPAN
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "TengwarExplainer-slot TengwarExplainer-character");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // SPAN tengwarContainer
            node = document.createElement("SPAN");
            parent.appendChild(node);
            component = node.actualNode;
            scope.hookup("tengwarContainer", component);
            if (component.setAttribute) {
                component.setAttribute("id", "tengwarContainer_5i6tjc");
            }
            if (scope.componentsFor["tengwarContainer"]) {
                scope.componentsFor["tengwarContainer"].setAttribute("for", "tengwarContainer_5i6tjc")
            }
            // /SPAN tengwarContainer
            parents[parents.length] = parent; parent = node;
            // SPAN
                // CONTENT tengwar
                node = document.createBody();
                parent.appendChild(node);
                parents[parents.length] = parent; parent = node;
                // CONTENT
                    node = {tagName: "content"};
                    node.innerHTML = "";
                    callee = scope.nest();
                    callee.argument = node;
                    callee.id = "tengwar";
                    component = new $CONTENT(parent, callee);
                node = parent; parent = parents[parents.length - 1]; parents.length--;
                scope.hookup("tengwar", component);
                if (component.setAttribute) {
                    component.setAttribute("id", "tengwar_zgxtm1");
                }
                if (scope.componentsFor["tengwar"]) {
                    scope.componentsFor["tengwar"].setAttribute("for", "tengwar_zgxtm1")
                }
                // /CONTENT tengwar
            node = parent; parent = parents[parents.length - 1]; parents.length--;
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "TengwarExplainer-slot");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // CONTENT above
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "above";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("above", component);
            if (component.setAttribute) {
                component.setAttribute("id", "above_i5pg0n");
            }
            if (scope.componentsFor["above"]) {
                scope.componentsFor["above"].setAttribute("for", "above_i5pg0n")
            }
            // /CONTENT above
            // CONTENT tildeAbove
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "tildeAbove";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("tildeAbove", component);
            if (component.setAttribute) {
                component.setAttribute("id", "tildeAbove_fi34zy");
            }
            if (scope.componentsFor["tildeAbove"]) {
                scope.componentsFor["tildeAbove"].setAttribute("for", "tildeAbove_fi34zy")
            }
            // /CONTENT tildeAbove
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "TengwarExplainer-slot");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // CONTENT tengwa
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "tengwa";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("tengwa", component);
            if (component.setAttribute) {
                component.setAttribute("id", "tengwa_wd51wh");
            }
            if (scope.componentsFor["tengwa"]) {
                scope.componentsFor["tengwa"].setAttribute("for", "tengwa_wd51wh")
            }
            // /CONTENT tengwa
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        // SPAN null
        node = document.createElement("SPAN");
        parent.appendChild(node);
        component = node.actualNode;
        if (component.setAttribute) {
            component.setAttribute("class", "TengwarExplainer-slot");
        }
        // /SPAN null
        parents[parents.length] = parent; parent = node;
        // SPAN
            // CONTENT tildeBelow
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "tildeBelow";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("tildeBelow", component);
            if (component.setAttribute) {
                component.setAttribute("id", "tildeBelow_jc2jn1");
            }
            if (scope.componentsFor["tildeBelow"]) {
                scope.componentsFor["tildeBelow"].setAttribute("for", "tildeBelow_jc2jn1")
            }
            // /CONTENT tildeBelow
            // CONTENT below
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "below";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("below", component);
            if (component.setAttribute) {
                component.setAttribute("id", "below_lqrncw");
            }
            if (scope.componentsFor["below"]) {
                scope.componentsFor["below"].setAttribute("for", "below_lqrncw")
            }
            // /CONTENT below
            // CONTENT following
            node = document.createBody();
            parent.appendChild(node);
            parents[parents.length] = parent; parent = node;
            // CONTENT
                node = {tagName: "content"};
                node.innerHTML = "";
                callee = scope.nest();
                callee.argument = node;
                callee.id = "following";
                component = new $CONTENT(parent, callee);
            node = parent; parent = parents[parents.length - 1]; parents.length--;
            scope.hookup("following", component);
            if (component.setAttribute) {
                component.setAttribute("id", "following_kbjla5");
            }
            if (scope.componentsFor["following"]) {
                scope.componentsFor["following"].setAttribute("for", "following_kbjla5")
            }
            // /CONTENT following
        node = parent; parent = parents[parents.length - 1]; parents.length--;
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1$2$3$5 = function TengwarhtmlTengwarexplainer$0$1$2$3$5(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-wordBreak");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};
var $THIS$0$1$2$6 = function TengwarhtmlTengwarexplainer$0$1$2$6(body, caller) {
    var document = body.ownerDocument;
    var scope = this.scope = caller;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV null
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    if (component.setAttribute) {
        component.setAttribute("class", "TengwarExplainer-lineBreak");
    }
    // /DIV null
    parents[parents.length] = parent; parent = node;
    // DIV
    node = parent; parent = parents[parents.length - 1]; parents.length--;
};

}],["tengwar-explainer.js","tengwar.html","tengwar-explainer.js",{"tengwar/modes":32,"tengwar/fonts":30},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-explainer.js
// ---------------------------------

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

}],["tengwar-view.html","tengwar.html","tengwar-view.html",{"./tengwar-view":23,"gutentag/html.html":0},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-view.html
// ------------------------------

"use strict";
var $SUPER = require("./tengwar-view");
module.exports = TengwarhtmlTengwarview;
function TengwarhtmlTengwarview(body, caller) {
    $SUPER.apply(this, arguments);
    var document = body.ownerDocument;
    var scope = this.scope = caller.root.nestComponents();
    scope.caller = caller;
    scope.this = this;
    var parent = body, parents = [], node, component, callee, argument;
    // DIV container
    node = document.createElement("DIV");
    parent.appendChild(node);
    component = node.actualNode;
    scope.hookup("container", component);
    if (component.setAttribute) {
        component.setAttribute("id", "container_egbylg");
    }
    if (scope.componentsFor["container"]) {
        scope.componentsFor["container"].setAttribute("for", "container_egbylg")
    }
    // /DIV container
    parents[parents.length] = parent; parent = node;
    // DIV
        // CONTENT text
        node = document.createBody();
        parent.appendChild(node);
        parents[parents.length] = parent; parent = node;
        // CONTENT
            node = {tagName: "content"};
            node.innerHTML = "";
            callee = scope.nest();
            callee.argument = node;
            callee.id = "text";
            component = new $CONTENT(parent, callee);
        node = parent; parent = parents[parents.length - 1]; parents.length--;
        scope.hookup("text", component);
        if (component.setAttribute) {
            component.setAttribute("id", "text_wgxe3w");
        }
        if (scope.componentsFor["text"]) {
            scope.componentsFor["text"].setAttribute("for", "text_wgxe3w")
        }
        // /CONTENT text
    node = parent; parent = parents[parents.length - 1]; parents.length--;
    this.scope.hookup("this", this);
}
var $THIS = TengwarhtmlTengwarview
$THIS.prototype = Object.create($SUPER.prototype);
$THIS.prototype.constructor = $THIS;
$THIS.prototype.exports = {};
var $CONTENT = require("gutentag/html.html");

}],["tengwar-view.js","tengwar.html","tengwar-view.js",{"tengwar/modes":32,"tengwar/fonts":30},function (require, exports, module, __filename, __dirname){

// tengwar.html/tengwar-view.js
// ----------------------------

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

}],["alphabet.js","tengwar","alphabet.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/alphabet.js
// -------------------


exports.tengwar = [
    ["tinco", "parma", "calma", "quesse"],
    ["ando", "umbar", "anga", "ungwe"],
    ["thule", "formen", "harma", "hwesta"],
    ["anto", "ampa", "anca", "unque"],
    ["numen", "malta", "noldo", "nwalme"],
    ["ore", "vala", "anna", "wilya"],
    ["romen", "arda", "lambe", "alda"],
    ["silme", "silme-nuquerna", "esse", "esse-nuquerna"],
    ["hyarmen", "hwesta-sindarinwa", "yanta", "ure"],
    ["halla", "short-carrier", "long-carrier", "round-carrier"],
    ["tinco-extended", "parma-extended", "calma-extended", "quesse-extended"],
    ["ando-extended", "umbar-extended", "anga-extended", "ungwe-extended"]
];

exports.tehtarAbove = [
    "a", "e", "i", "o", "u",
    "á", "é", "í", "ó", "ú",
    "w"
];

exports.tehtarBelow = [
    "y", "s", "o-below", "i-below"
];

exports.tehtarFollowing = [
    "s-final", "s-inverse", "s-extended", "s-flourish"
];

exports.barsAndTildes = [
    "tilde-above",
    "tilde-below",
    "tilde-high-above",
    "tilde-far-below",
    "bar-above",
    "bar-below",
    "bar-high-above",
    "bar-far-below"
];

exports.tehtar = [].concat(
    exports.tehtarAbove,
    exports.tehtarBelow,
    exports.tehtarFollowing,
    exports.barsAndTildes
);

exports.aliases = {
    "vilya": "wilya",
    "aha": "harma",
    "gasdil": "halla"
};


}],["beleriand.js","tengwar","beleriand.js",{"./tengwar-parmaite":39,"./parser":36,"./notation":34,"./document-parser":29,"./normalize":33,"./punctuation":37,"./numbers":35},function (require, exports, module, __filename, __dirname){

// tengwar/beleriand.js
// --------------------


// TODO parse following "w"

var TengwarParmaite = require("./tengwar-parmaite");
var Parser = require("./parser");
var Notation = require("./notation");
var makeDocumentParser = require("./document-parser");
var normalize = require("./normalize");
var punctuation = require("./punctuation");
var parseNumber = require("./numbers");

exports.name = "Mode of Beleriand";

var defaults = {};
exports.makeOptions = makeOptions;
function makeOptions(options) {
    options = options || defaults;
    return {
        font: options.font || TengwarParmaite,
        block: options.block,
        plain: options.plain,
        duodecimal: options.duodecimal
    };
}

exports.transcribe = transcribe;
function transcribe(text, options) {
    options = makeOptions(options);
    var font = options.font;
    return font.transcribe(parse(text, options), options);
}

exports.encode = encode;
function encode(text, options) {
    options = makeOptions(options);
    return Notation.encode(parse(text, options), options);
}

var parse = exports.parse = makeDocumentParser(parseNormalWord, makeOptions);

function parseNormalWord(callback, options) {
    return normalize(parseWord(callback, options));
}

function parseWord(callback, options, columns) {
    columns = columns || [];
    return parseColumn(function (column) {
        if (column) {
            return parseWord(
                callback,
                options,
                columns.concat([column])
            );
        } else {
            return function (character) {
                if (/\d/.test(character)) {
                    return parseNumber(function (number) {
                        return parseWord(callback, options, columns.concat(number));
                    }, options)(character);
                } else {
                    return callback(columns)(character);
                }
            };
        }
    }, options);
}

function parseColumn(callback, options) {
    return parseTengwa(function (column) {
        if (column) {
            return parseFollowingS(callback, column);
        } else {
            return callback();
        }
    }, options);
}

function parseTengwa(callback, options) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return function (character) {
        if (character === "n") { // n
            return function (character) {
                if (character === "t" || character === "d") { // n{t,d}
                    return parseTengwa(function (column) {
                        return callback(column.addTildeAbove());
                    }, options)(character);
                } else if (character === "c" || character === "g") { // n{c,g}
                    return parseTengwa(callback, options)("ñ")(character);
                } else if (character === "n") { // nn
                    return callback(makeColumn("numen", {from : "nn"}));
                } else { // n.
                    return callback(makeColumn("ore", {from: "n"}))(character);
                }
            };
        } else if (character === "t") { // t
            return function (character) {
                if (character === "h") { // th
                    return callback(makeColumn("thule", {from: "th"}));
                } else { // t.
                    return callback(makeColumn("tinco", {from: "t"}))(character);
                }
            };
        } else if (character === "d") { // d
            return function (character) {
                if (character === "h") { // dh
                    return callback(makeColumn("anto", {from: "dh"}));
                } else { // d.
                    return callback(makeColumn("ando", {from: "d"}))(character);
                }
            };
        } else if (character === "m") { // m
            return function (character) {
                if (
                    character === "p" || character === "b" ||
                    character === "f" || character === "v"
                ) {
                    return parseTengwa(function (column) {
                        return callback(column.addTildeAbove({from: character}));
                    }, options)(character);
                } else if (character === "m") { // mm
                    return callback(makeColumn("malta", {from: "mm"}));
                } else { // m.
                    return callback(makeColumn("vala", {from: "m"}))(character);
                }
            };
        } else if (character === "p") { // p
            return callback(makeColumn("parma", {from: "p"}));
        } else if (character === "b") { // b
            return callback(makeColumn("umbar", {from: "b"}));
        } else if (character === "f") { // f
            return function (character) {
                if (Parser.isFinal(character)) { // f final
                    return callback(makeColumn("ampa", {from: "f", final: true}))(character);
                } else {
                    return callback(makeColumn("formen", {from: "f", medial: true}))(character);
                }
            };
        } else if (character === "v") { // v
            return callback(makeColumn("ampa", {from: "v"}));
        } else if (character === "ñ") { // ñ
            return function (character) {
                if (character === "c" || character === "g") {
                    return parseTengwa(function (column) {
                        if (column.tengwa === "halla") {
                            column.addError("Lenited G (halla) should not be nasalized with prefix N");
                        }
                        return callback(column.addTildeAbove({from: character}));
                    }, options)(character);
                } else { // ñ.
                    return callback(makeColumn("noldo", {from: "ñ"}))(character);
                }
            };
        } else if (character === "c") { // c
            return function (character) {
                if (character === "h") { // ch
                    return function (character) {
                        if (character === "w") { // chw
                            return callback(makeColumn("hwesta", {from: "chw"}));
                        } else { // ch.
                            return callback(makeColumn("harma", {from: "ch"}))(character);
                        }
                    };
                } else if (character === "w") { // cw
                    return callback(makeColumn("quesse", {from: "cw"}));
                } else { // c.
                    return callback(makeColumn("calma", {from: "c"}))(character);
                }
            };
        } else if (character === "g") {
            return function (character) {
                if (character === "h") { // gh
                    return function (character) {
                        if (character === "w") { // ghw
                            return callback(makeColumn("unque", {from: "ghw"}));
                        } else { // gh.
                            return callback(makeColumn("anca", {from: "gh"}))(character);
                        }
                    };
                } else if (character === "w") { // gw
                    return callback(makeColumn("ungwe", {from: "gw"}));
                } else if (character === "'") { // g'
                    return callback(makeColumn("halla", {from: "g"})); // gasdil
                } else { // g.
                    return callback(makeColumn("anga", {from: "g"}).varies())(character);
                }
            };
        } else if (character === "r") { // r
            return function (character) {
                if (character === "h") { // rh
                    return callback(makeColumn("arda", {from: "rh"}));
                } else {
                    return callback(makeColumn("romen", {from: "r"}))(character);
                }
            };
        } else if (character === "l") { // l
            return function (character) {
                if (character === "h") { // lh
                    return callback(makeColumn("alda", {from: "lh"}));
                } else {
                    return callback(makeColumn("lambe", {from: "l"}))(character);
                }
            };
        } else if (character === "s") { // s
            return callback(makeColumn("silme", {from: "s"}));
        } else if (character === "a") { // a
            return function (character) {
                if (character === "i") { // ai
                    return callback(makeColumn("round-carrier", {from: "a", diphthong: true}).addAbove("í", {from: "i"}));
                } else if (character === "u") { // au
                    return callback(makeColumn("round-carrier", {from: "a", diphthong: true}).addAbove("w", {from: "u"}));
                } else if (character === "'") { // a'
                    return callback(makeColumn("round-carrier", {from: "a"}).addAbove("i", {from: "a"}));
                } else if (character === "a") { // aa
                    return callback(makeColumn("round-carrier", {from: "a", long: true}).addAbove("e", {from: "a"}));
                } else { // a.
                    return callback(makeColumn("round-carrier", {from: "a"}).varies())(character);
                }
            };
        } else if (character === "e" || character === "ë") { // e
            return function (character) {
                if (character === "i") { // ei
                    return callback(makeColumn("yanta", {from: "e"}).addAbove("í", {from: "i"}));
                } else if (character === "e") {
                    return callback(makeColumn("yanta", {from: "e", long: true}).addAbove("e", {from: "e"}));
                } else { // e.
                    return callback(makeColumn("yanta", {from: "e"}))(character);
                }
            };
        } else if (character === "i") { // i
            return function (character) {
                if (character === "i") { // ii -> í
                    return parseColumn(callback, options)("í");
                } else {
                    return Parser.countPrimes(function (primes) {
                        if (primes === 0) {
                            return callback(makeColumn("short-carrier", {from: "i"}).varies());
                        } else if (primes === 1) {
                            return callback(makeColumn("short-carrier", {from: "i"}).addAbove("i", {from: ""}).varies());
                        } else if (primes === 2) {
                            return callback(makeColumn("long-carrier", {from: "i", long: true}).addAbove("i", {from: ""}).varies());
                        } else if (primes === 3) {
                            return callback(makeColumn("long-carrier", {from: "i", long: true}));
                        } else {
                            return callback(makeColumn("long-carrier").addAbove("i").addError("I only has four variants between short or long and dotted or not."));
                        }
                    })(character);
                }
            };
        } else if (character === "o") {
            return function (character) {
                if (character === "o") { // oo
                    return callback(makeColumn("anna", {from: "o"}).addAbove("e", {from: "o"}));
                } else {
                    return callback(makeColumn("anna", {from: "o"}))(character);
                }
            };
        } else if (character === "u") {
            return function (character) {
                if (character === "i") {
                    return callback(makeColumn("ure", {from: "u", diphthong: true}).addAbove("í", {from: "i"}));
                } else if (character === "u") {
                    return callback(makeColumn("ure", {from: "u", long: true}).addAbove("e", {from: "u"}));
                } else {
                    return callback(makeColumn("ure", {from: "u"}))(character);
                }
            };
        } else if (character === "w") { // w
            return function (character) {
                if (character === "w") { // ww
                    return callback(makeColumn("wilya", {from: "w"}).addAbove("e", {from: "w"}));
                } else { // w.
                    return callback(makeColumn("wilya", {from: "w"}))(character);
                }
            };
        } else if (character === "y") {
            return function (character) {
                if (character === "y") { // yy
                    return callback(makeColumn("silme-nuquerna", {from: "y"}).addAbove("e", {from: "y"}));
                } else { // y.
                    return callback(makeColumn("silme-nuquerna", {from: "y"}))(character);
                }
            };
        } else if (character === "á") {
            return callback(makeColumn("round-carrier", {from: "a", long: true}).addAbove("e", {from: "a"}));
        } else if (character === "é") {
            return callback(makeColumn("yanta", {from: "é"}).addAbove("e"));
        } else if (character === "í") {
            return Parser.countPrimes(function (primes) {
                if (primes === 0) {
                    return callback(makeColumn("short-carrier", {from: "i"}).addAbove("e", {from: "i"}).varies());
                } else if (primes === 1) {
                    return callback(makeColumn("long-carrier", {from: "í", long: true}).addAbove("e", {from: ""}));
                } else {
                    return callback(makeColumn("long-carrier").addAbove("e").addError("Í only has one variant."));
                }
            });
        } else if (character === "ó") {
            return callback(makeColumn("anna", {from: "ó", long: true}).addAbove("e", {from: ""}));
        } else if (character === "ú") {
            return callback(makeColumn("ure", {from :"ú", long: true}).addAbove("e", {from: ""}));
        } else if (character === "h") {
            return function (character) {
                //if (character === "m") { // TODO
                //    return callback(makeColumn("ore-nasalized"));
                if (character === "w") {
                    return callback(makeColumn("hwesta-sindarinwa", {from: "hw"}));
                } else {
                    return callback(makeColumn("hyarmen", {from: "h"}))(character);
                }
            };
        } else if (character === "z") {
            return callback(makeColumn("silme", {from: "z"}).addError("Z does not appear in the mode of Beleriand"));
        } else if (punctuation[character]) {
            return callback(makeColumn(punctuation[character], {from: character}));
        } else if (Parser.isBreak(character) || /\d/.test(character)) {
            return callback()(character);
        } else {
            return callback(makeColumn("anna", {from: character}).addError("Unexpected character: " + JSON.stringify(character)));
        }
    };
}

function parseFollowingS(callback, column) {
    return function (character) {
        if (character === "s") {
            if (column.canAddBelow("s")) {
                return callback(column.addBelow("s", {from: "s"}));
            } else {
                return Parser.countPrimes(function (primes) {
                    return function (character) {
                        if (Parser.isFinal(character)) { // end of word
                            if (column.canAddFollowing("s-final") && primes-- === 0) {
                                column.addFollowing("s-final", {from: "s"});
                            } else if (column.canAddFollowing("s-inverse") && primes -- === 0) {
                                column.addFollowing("s-inverse");
                            } else if (column.canAddFollowing("s-extended") && primes-- === 0) {
                                column.addFollowing("s-extended", {from: "s"});
                            } else if (column.canAddFollowing("s-flourish")) {
                                column.addFollowing("s-flourish", {from: "s"});
                                if (primes > 0) {
                                    column.addError(
                                        "Following S only has 3 alternate " +
                                        "flourishes."
                                    );
                                }
                            } else {
                                return callback(column)("s", {from: "s"})(character);
                            }
                            return callback(column)(character);
                        } else {
                            return callback(column)("s", {from: "s"})(character);
                        }
                    };
                });
            }
        } else {
            return callback(column)(character);
        }
    };
}


}],["classical.js","tengwar","classical.js",{"./tengwar-annatar":38,"./notation":34,"./parser":36,"./document-parser":29,"./normalize":33,"./punctuation":37,"./numbers":35},function (require, exports, module, __filename, __dirname){

// tengwar/classical.js
// --------------------


var TengwarAnnatar = require("./tengwar-annatar");
var Notation = require("./notation");
var Parser = require("./parser");
var makeDocumentParser = require("./document-parser");
var normalize = require("./normalize");
var punctuation = require("./punctuation");
var parseNumber = require("./numbers");

exports.name = "Classical Mode";

var defaults = {};
exports.makeOptions = makeOptions;
function makeOptions(options) {
    options = options || defaults;
    return {
        font: options.font || TengwarAnnatar,
        block: options.block,
        plain: options.plain,
        vilya: options.vilya,
        // false: (v: vala, w: wilya)
        // true: (v: vilya, w: ERROR)
        harma: options.harma,
        // between the original formation of the language,
        // but before the third age,
        // harma was renamed aha,
        // and meant breath-h in initial position
        classicalH: options.classicalH,
        classicalR: options.classicalR,
        // before the third age
        // affects use of "r" and "h"
        // without classic, we default to the mode from the namarie poem.
        // in the classical period, "r" was transcribed as "ore" only between
        // vowels.
        // in the third age, through the namarie poem, "r" is only "ore" before
        // consontants and at the end of words.
        swapDotSlash: options.swapDotSlash,
        // false: by default, e is a slash, i is a dot
        // true: e is a dot, i is a slash
        // TODO figure out "h"
        reverseCurls: options.reverseCurls,
        // false: by default, o is forward, u is backward
        // true: o is backward, u is forward
        iuRising: options.iuRising,
        // iuRising thirdAge: anna:y,u
        // otherwise: ure:i
        // in the third age, "iu" is a rising diphthong,
        // whereas all others are falling.  rising means
        // that they are stressed on the second sound, as
        // in "yule".  whether to use yanta or anna is
        // not attested.
        longHalla: options.longHalla,
        // TODO indicates that halla should be used before medial L and W to
        // indicate that these are pronounced with length.
        // initial hl and hw remain short.
        // TODO doubled dots for í
        // TODO triple dots for y
        // TODO simplification of a, noting non-a
        // TODO following W in this mode?
        // TODO namarië does not use double U or O curls
        // TODO namarië does not reverse esse for E tehta
        duodecimal: options.duodecimal
    };
};

exports.transcribe = transcribe;
function transcribe(text, options) {
    options = makeOptions(options);
    var font = options.font;
    return font.transcribe(parse(text, options), options);
}

exports.encode = encode;
function encode(text, options) {
    options = makeOptions(options);
    return Notation.encode(parse(text, options), options);
}

var parse = exports.parse = makeDocumentParser(parseNormalWord, makeOptions);

function parseNormalWord(callback, options) {
    return normalize(parseWord(callback, options));
}

function parseWord(callback, options, columns, previous) {
    columns = columns || [];
    return parseColumn(function (moreColumns) {
        if (!moreColumns.length) {
            return callback(columns);
        } else {
            return parseWord(
                callback,
                options,
                columns.concat(moreColumns),
                moreColumns[moreColumns.length - 1] // previous
            );
        }
    }, options, previous);
}

function parseColumn(callback, options, previous) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return parseTengwa(function (columns) {
        var previous = columns.pop();
        return parseTehta(function (next) {
            var next = columns.concat(next).filter(Boolean)
            if (next.length) {
                return callback(next);
            } else {
                return function (character) {
                    if (Parser.isBreak(character)) {
                        return callback([])(character);
                    } else if (/\d/.test(character)) {
                        return parseNumber(callback, options)(character);
                    } else if (punctuation[character]) {
                        return callback([makeColumn(punctuation[character], {from: character})]);
                    } else {
                        return callback([makeColumn("ure", {from: ""}).addError(
                            "Cannot transcribe " + JSON.stringify(character) +
                            " in Classical Mode"
                        )]);
                    }
                };
            }
        }, options, previous);
    }, options, previous);
}

var vowels = "aeiouyáéíóú";

function parseTengwa(callback, options, previous) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return function (character) {
        if (character === "n") { // n
            return function (character) {
                if (character === "n") { // nn
                    return callback([makeColumn("numen", {from: "n"}).addTildeBelow({from: "n"})]);
                } else if (character === "t") { // nt
                    return callback([makeColumn("anto", {from: "nt"})]);
                } else if (character === "d") { // nd
                    return callback([makeColumn("ando", {from: "nd"})]);
                } else if (character === "g") { // ng
                    return function (character) {
                        if (character === "w") { // ngw -> ñw
                            return callback([makeColumn("ungwe", {from: "ñgw"})]);
                        } else { // ng
                            return callback([makeColumn("anga", {from: "ñg"})])(character);
                        }
                    };
                } else if (character === "c") { // nc
                    return function (character) {
                        if (character === "w") { // ncw
                            return callback([makeColumn("unque", {from: "ñcw"})]);
                        } else { // nc
                            return callback([makeColumn("anca", {from: "ñc"})])(character);
                        }
                    };
                } else {
                    return callback([makeColumn("numen", {from: "n"})])(character);
                }
            };
        } else if (character === "m") {
            return function (character) {
                if (character === "m") { // mm
                    return callback([makeColumn("malta", {from: "m"}).addTildeBelow({from: "m"})]);
                } else if (character === "p") { // mp
                    return callback([makeColumn("ampa", {from: "mp"})]);
                } else if (character === "b") { // mb
                    return callback([makeColumn("umbar", {from: "mb"})]);
                } else {
                    return callback([makeColumn("malta", {from: "m"})])(character);
                }
            };
        } else if (character === "ñ") { // ñ
            return function (character) {
                if (character === "g") { // ñg
                    return function (character) {
                        if (character === "w") { // ñgw
                            return callback([makeColumn("ungwe", {from: "ñgw"})]);
                        } else { // ñg
                            return callback([makeColumn("anga", {from: "ñg"})])(character);
                        }
                    }
                } else if (character === "c") { // ñc
                    return function (character) {
                        if (character === "w") { // ñcw
                            return callback([makeColumn("unque", {from: "ñcw"})]);
                        } else { // ñc
                            return callback([makeColumn("anca", {from: "ñc"})]);
                        }
                    }
                } else {
                    return callback([makeColumn("noldo", {from: "ñ"})])(character);
                }
            };
        } else if (character === "t") {
            return function (character) {
                if (character === "t") { // tt
                    return function (character) {
                        if (character === "y") { // tty
                            return callback([makeColumn("tinco", {from: "t"}).addBelow("y", {from: "y"}).addTildeBelow({from: "t"})]);
                        } else { // tt
                            return callback([makeColumn("tinco", {from: "t"}).addTildeBelow({from: "t"})])(character);
                        }
                    };
                } else if (character === "y") { // ty
                    return callback([makeColumn("tinco", {from: "t"}).addBelow("y", {from: "y"})]);
                } else if (character === "h") { // th
                    return callback([makeColumn("thule", {from: "th"})]);
                } else if (character === "s") {
                    return function (character) {
                        // TODO s-inverse, s-extended, s-flourish
                        if (Parser.isFinal(character)) { // ts final
                            return callback([makeColumn("tinco", {from: "t"}).addFollowing("s", {from: "s"})])(character);
                        } else { // ts medial
                            return callback([
                                makeColumn("tinco", {from: "t"}),
                                makeColumn("silme", {from: "s"})
                            ])(character);
                        }
                    };
                } else { // t
                    return callback([makeColumn("tinco", {from: "t"})])(character);
                }
            };
        } else if (character === "p") {
            return function (character) {
                if (character === "p") {
                    return function (character) {
                        if (character === "y") { // ppy
                            return callback([makeColumn("parma", {from: "p"}).addBelow("y", {from: "y"}).addTildeBelow({from: "p"})]);
                        } else { // pp
                            return callback([makeColumn("parma", {from: "p"}).addTildeBelow({from: "p"})])(character);
                        }
                    };
                } else if (character === "y") { // py
                    return callback([makeColumn("parma", {from: "p"}).addBelow("y", {from: "y"})]);
                } else if (character === "s") { // ps
                    return function (character) {
                        if (Parser.isFinal(character)) { // ps final
                            return callback([makeColumn("parma", {from: "p"}).addFollowing("s", {from: "s"})])(character);
                        } else { // ps medial
                            return callback([
                                makeColumn("parma", {from: "p"}),
                                makeColumn("silme", {from: "s"})
                            ])(character);
                        }
                    };
                } else { // t
                    return callback([makeColumn("parma", {from: "p"})])(character);
                }
            };
        } else if (character === "c") {
            return function (character) {
                if (character === "c") {
                    return callback([makeColumn("calma", {from: "c"}).addTildeBelow({from: "c"})]);
                } else if (character === "s") {
                    return callback([makeColumn("calma", {from: "s"}).addBelow("s", {from: "s"})]);
                } else if (character === "h") {
                    return callback([makeColumn("harma", {from: "ch"})]);
                } else if (character === "w") {
                    return callback([makeColumn("quesse", {from: "chw"})]);
                } else {
                    return callback([makeColumn("calma", {from: "c"})])(character);
                }
            };
        } else if (character === "f") {
            return callback([makeColumn("formen", {from: "f"})]);
        } else if (character === "v") {
            if (options.vilya) {
                return callback([makeColumn("wilya", {from: "v", name: "vilya"})]);
            } else {
                return callback([makeColumn("vala", {from: "v", name: "vala"})]);
            }
        } else if (character === "w") {
            if (options.vilya) {
                return callback([])("u");
            } else {
                // TODO Fact-check this interpretation. It may be an error to
                // use w as a consonant depending on whether we're speaking
                // early or late classical.
                return callback([makeColumn("wilya", {from: "w", name: "vilya"})]);
            }
        } else if (character === "r") { // r
            return function (character) {
                if (character === "d") { // rd
                    return callback([makeColumn("arda", {from: "rd"})]);
                } else if (character === "h") { // rh -> hr
                    var error = "R should preceed H in the HR diagraph in Classical mode.";
                    return callback([
                        makeColumn("halla", {from: "h"}).addError(error),
                        makeColumn("romen", {from: "r"}).addError(error)
                    ]);
                } else if (options.classicalR) {
                    // pre-namarie style, ore when r between vowels
                    if (
                        previous &&
                        previous.above &&
                        !Parser.isFinal(character) &&
                        vowels.indexOf(character) !== -1
                    ) {
                        return callback([makeColumn("ore", {from: "r"})])(character);
                    } else {
                        return callback([makeColumn("romen", {from: "r"})])(character);
                    }
                } else {
                    // pre-consonant and word-final
                    if (Parser.isFinal(character) || vowels.indexOf(character) === -1) { // ore
                        return callback([makeColumn("ore", {from: "r"})])(character);
                    } else { // romen
                        return callback([makeColumn("romen", {from: "r"})])(character);
                    }
                }
            };
        } else if (character === "l") {
            return function (character) {
                if (character === "l") {
                    return function (character) {
                        if (character === "y") { // lly
                            return callback([makeColumn("lambe", {from: "l"}).addBelow("y", {from: "y"}).addTildeBelow({from: "l"})]);
                        } else { // ll
                            return callback([makeColumn("lambe", {from: "l"}).addTildeBelow({from: "y"})])(character);
                        }
                    }
                } else if (character === "y") { // ly
                    return callback([makeColumn("lambe", {from: "l"}).addBelow("y", {from: "y"})]);
                } else if (character === "h") { // lh -> hl
                    var error = "L should preceed H in the HL diagraph in Classical mode.";
                    return callback([
                        makeColumn("halla", {from: "h"}).addError(error),
                        makeColumn("lambe", {from: "l"}).addError(error)
                    ]);
                } else if (character === "d") { // ld
                    return callback([makeColumn("alda", {from: "ld"})]);
                } else if (character === "b") { // lb
                    // TODO ascertain why this is a special case and make a note.
                    return callback([makeColumn("lambe", {from: "l"}), makeColumn("umbar", {from: "b"})]);
                } else {
                    return callback([makeColumn("lambe", {from: "l"})])(character);
                }
            };
        } else if (character === "s") {
            return function (character) {
                if (character === "s") { // ss
                    return callback([makeColumn("esse", {from: "ss"})]);
                } else { // s.
                    return callback([makeColumn("silme", {from: "s"})])(character);
                }
                // Note that there is no sh phoneme in Classical Elvish languages
            };
        } else if (character === "h") {
            return function (character) {
                if (character === "l") { // hl
                    return callback([
                        makeColumn("halla", {from: "h"}),
                        makeColumn("lambe", {from: "l"})
                    ]);
                } else if (character === "r") {
                    return callback([
                        makeColumn("halla", {from: "h"}),
                        makeColumn("romen", {from: "r"})
                    ]);
                } else if (character === "w") { // hw
                    return callback([makeColumn("hwesta", {from: "hw"})]);
                } else if (character === "t") { // ht
                    // TODO find a reference and example that substantiates
                    // this interpretation. Did I invent this to make harma
                    // expressible?
                    return callback([makeColumn("harma", {from: "ht"})]);
                } else if (character === "y") { // hy
                    if (options.classicalH && !options.harma) { // oldest form
                        return callback([makeColumn("hyarmen", {from: "hy"})]);
                    } else { // post-aha, through to the third-age
                        return callback([makeColumn("hyarmen", {from: "hy"}).addBelow("y", {from: "y"})]);
                    }
                } else { // h
                    if (options.classicalH) {
                        if (options.harma) { // before harma became aha initially
                            if (previous) { // medial
                                return callback([makeColumn("halla", {from: "h"})])(character);
                            } else { // initial
                                return callback([makeColumn("harma", {from: "h"})])(character);
                            }
                        } else { // harmen renamed and resounded as aha in initial position
                            if (previous) { // medial
                                return callback([makeColumn("hyarmen", {from: "h"})])(character);
                            } else { // initial
                                return callback([makeColumn("halla", {from: "h"})])(character);
                            }
                        }
                    } else { // third age, namarië
                        return callback([makeColumn("hyarmen", {from: "h"})])(character);
                    }
                }
            };
        } else if (character === "d") {
            return callback([makeColumn("ando", {from: "d"}).addError("D cannot appear except after N, L, or R in Classical Mode")]);
        } else if (character === "b") {
            return callback([makeColumn("umbar", {from: "b"}).addError("B cannot appear except after M or L in Classical Mode")]);
        } else if (character === "g") {
            return callback([makeColumn("anga", {from: "g"}).addError("G cannot appear except after N or Ñ in Classical Mode")]);
        } else if (character === "j") {
            return callback([makeColumn("ure", {from: "j"}).addError("J cannot be transcribed in Classical Mode")]);
        } else {
            return callback([])(character);
        }
    };
}

function parseTehta(callback, options, previous) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return function (character) {
        if (character === "a") {
            return function (character) {
                if (character === "a") {
                    return parseTehta(callback, options, previous)("á");
                } else if (character === "i") {
                    return callback([previous, makeColumn("yanta", {from: "i", diphthong: true}).addAbove("a", {from: "a"})]);
                } else if (character === "u") {
                    return callback([previous, makeColumn("ure", {from: "u", diphthong: true}).addAbove("a", {from: "a"})]);
                } else if (previous && previous.canAddAbove("a")) {
                    return callback([previous.addAbove("a", {from: "a"})])(character);
                } else {
                    return callback([previous, makeColumn("short-carrier", {from: "a"}).addAbove("a", {from: ""})])(character);
                }
            };
        } else if (character === "e" || character === "ë") {
            var tehta = swapDotSlash("e", options);
            return function (character) {
                if (character === "e") {
                    return parseTehta(callback, options, previous)("é");
                } else if (character === "u") {
                    return callback([previous, makeColumn("ure", {from: "u", diphthong: true}).addAbove(tehta, {from: "e"})]);
                } else if (previous && previous.canAddAbove("e")) {
                    return callback([previous.addAbove(tehta, {from: "e"})])(character);
                } else {
                    return callback([previous, makeColumn("short-carrier", {from: "e"}).addAbove(tehta, {from: ""})])(character);
                }
            };
        } else if (character === "i") {
            var iTehta = swapDotSlash("i", options);
            return function (character) {
                if (character === "i") {
                    return parseTehta(callback, options, previous)("í");
                } else if (character === "u") {
                    if (options.iuRising) {
                        return callback([previous, makeColumn("anna", {from: "i", diphthong: true}).addAbove(reverseCurls("u", options), {from: "u"}).addBelow("y", {from: "y"})]);
                    } else {
                        return callback([previous, makeColumn("ure", {from: "u", diphthong: true}).addAbove(iTehta, {from: "i"})]);
                    }
                } else if (previous && previous.canAddAbove(iTehta)) {
                    return callback([previous.addAbove(iTehta, {from: "i"})])(character);
                } else {
                    return callback([previous, makeColumn("short-carrier", {from: "i"}).addAbove(iTehta, {from: ""})])(character);
                }
            };
        } else if (character === "o") {
            return function (character) {
                if (character === "o") {
                    return parseTehta(callback, options, previous)("ó");
                } else if (character === "i") {
                    return callback([previous, makeColumn("yanta", {from: "i", diphthong: true}).addAbove(reverseCurls("o", options), {from: "o"})]);
                } else if (previous && previous.canAddAbove("o")) {
                    return callback([previous.addAbove(reverseCurls("o", options), {from: "o"})])(character);
                } else {
                    return callback([previous, makeColumn("short-carrier", {from: "o"}).addAbove(reverseCurls("o", options), {from: ""})])(character);
                }
            };
        } else if (character === "u") {
            return function (character) {
                if (character === "u") {
                    return parseTehta(callback, options, previous)("ú");
                } else if (character === "i") {
                    return callback([previous, makeColumn("yanta", {from: "i", diphthong: true}).addAbove(reverseCurls("u", options), {from: "u"})]);
                } else if (previous && previous.canAddAbove("u")) {
                    return callback([previous.addAbove(reverseCurls("u", options), {from: "u"})])(character);
                } else {
                    return callback([previous, makeColumn("short-carrier", {from: "u"}).addAbove(reverseCurls("u", options), {from: ""})])(character);
                }
            };
        } else if (character === "y") {
            if (previous && previous.canAddBelow("y")) {
                return callback([previous.addBelow("y", {from: "y"})]);
            } else {
                var next = makeColumn("anna", {from: ""}).addBelow("y", {from: "y"});
                return parseTehta(function (moreColumns) {
                    return callback([previous].concat(moreColumns));
                }, options, next);
            }
        } else if (character === "á") {
            return callback([previous, makeColumn("long-carrier", {from: "á"}).addAbove("a", {from: ""})]);
        } else if (character === "é") {
            return callback([previous, makeColumn("long-carrier", {from: "é"}).addAbove(swapDotSlash("e", options), {from: ""})]);
        } else if (character === "í") {
            return callback([previous, makeColumn("long-carrier", {from: "í"}).addAbove(swapDotSlash("i", options), {from: ""})]);
        } else if (character === "ó") {
            if (previous && previous.canAddAbove("ó")) {
                return callback([previous.addAbove(reverseCurls("ó", options), {from: "ó"})]);
            } else {
               return callback([previous, makeColumn("long-carrier", {from: "ó"}).addAbove(reverseCurls("o", options), {from: ""})]);
            }
        } else if (character === "ú") {
            if (previous && previous.canAddAbove("ú")) {
                return callback([previous.addAbove(reverseCurls("ú", options), {from: "ú"})]);
            } else {
                return callback([previous, makeColumn("long-carrier", {from: "ú"}).addAbove(reverseCurls("u", options), {from: ""})]);
            }
        } else {
            return callback([previous])(character);
        }
    };
}

var curlReversals = {"o": "u", "u": "o", "ó": "ú", "ú": "ó"};
function reverseCurls(tehta, options) {
    if (options.reverseCurls) {
        tehta = curlReversals[tehta] || tehta;
    }
    return tehta;
}

var dotSlashSwaps = {"e": "i", "i": "e"};
function swapDotSlash(tehta, options) {
    if (options.swapDotSlash) {
        tehta = dotSlashSwaps[tehta] || tehta;
    }
    return tehta;
}

// Notes regarding "h":
//
// http://at.mansbjorkman.net/teng_quenya.htm#note_harma
// originally:
//  h represented ach-laut and was written with harma.
//  h initial transcribed as halla
//  h medial transcribed as harma
//  hy transcribed as hyarmen
// then harma became aha:
//  then h in initial position became a breath-h, still spelled with harma, but
//  renamed aha.
//  h initial transcribed as harma
//  h medial transcribed as hyarmen
//  hy transcribed as hyarmen with underposed y
// then, in the third age:
//  the h in every position became a breath-h
//  except before t, where it remained pronounced as ach-laut
//  h initial ???
//  h medial transcribed as harma
//  h transcribed as halla or hyarmen in other positions (needs clarification)
//
// ach-laut (_ch_, /x/ phonetically, {h} by tolkien)
//   original: harma in all positions
//   altered: harma initially, halla in all other positions
//   third-age: halla in all other positions
// hy (/ç/ phonetically)
//   original: hyarmen in all positions
//   altered: hyarmen with y below
//   third-age:
// h (breath h)
//   original: halla in all positions
//   altered: hyarmen medially
//   third-age:
//
// harma:
//   original: ach-laut found in all positions
//   altered: breath h initially (renamed aha), ach-laut medial
//   third-age: ach-laut before t, breath h all other places
// hyarmen:
//   original: represented {hy}, palatalized h, in all positions
//   altered: breath h medial, palatalized with y below
//   third-age: same
// halla:
//   original: breath-h, presuming existed only initially
//   altered: breath h initial
//   third-age: only used for hl and hr
//
// hr: halla romen
// hl: halla lambe
// ht: harma
// hy:
//   original: hyarmen
//   altered:
//     initial: ERROR
//     medial: hyarmen lower-y
//   third age: hyarmen lower-y
// ch: harma
// h initial:
//   original: halla
//   altered: XXX
//   third-age: harma
// h medial: hyarmen


}],["column.js","tengwar","column.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/column.js
// -----------------


module.exports = makeColumn;
function makeColumn(font, tengwa, tengwaNote) {
    return new Column(font, tengwa, tengwaNote);
};

var Column = function (font, tengwa, tengwaNote) {
    this.font = font;
    this.above = void 0;
    this.tildeAbove = void 0;
    this.tengwa = tengwa;
    this.tildeBelow = void 0;
    this.below = void 0;
    this.following = void 0;
    this.error = void 0;

    this.aboveNote = void 0;
    this.tildeAboveNote = void 0;
    this.tengwaNote = tengwaNote;
    this.tildeBelowNote = void 0;
    this.belowNote = void 0;
    this.followingNote = void 0;

    this.hasVariant = false;
};

Column.prototype.canAddAbove = function (tehta, reversed) {
    return (
        !this.above && !!this.font.tehtaForTengwa(this.tengwa, tehta)
    ) || ( // flip it
        !reversed && !this.below && this.reversed().canAddAbove(tehta, true)
    );
};

Column.prototype.addAbove = function (above, aboveNote) {
    if (!this.font.tehtaForTengwa(this.tengwa, above)) {
        this.reverse();
    }
    this.above = above;
    this.aboveNote = aboveNote;
    return this;
};

Column.prototype.canAddBelow = function (tehta, reversed) {
    return (
        !this.below && !!this.font.tehtaForTengwa(this.tengwa, tehta)
    ) || ( // flip it
        !reversed && !this.above && this.reversed().canAddBelow(tehta, true)
    );
};

Column.prototype.addBelow = function (below, belowNote) {
    if (!this.font.tehtaForTengwa(this.tengwa, below)) {
        this.reverse();
    }
    this.below = below;
    this.belowNote = belowNote;
    return this;
};

Column.prototype.addTildeAbove = function (tildeAboveNote) {
    this.tildeAbove = true;
    this.tildeAboveNote = tildeAboveNote;
    return this;
};

Column.prototype.addTildeBelow = function (tildeBelowNote) {
    this.tildeBelow = true;
    this.tildeBelowNote = tildeBelowNote;
    return this;
};

Column.prototype.canAddFollowing = function (following) {
    return !this.following && !!this.font.tehtaForTengwa(this.tengwa, following);
};

Column.prototype.addFollowing = function (following, followingNote) {
    this.following = following;
    this.followingNote = followingNote;
    return this;
};

Column.prototype.reversed = function () {
    return this.clone().reverse();
};

Column.prototype.clone = function () {
    var column = new Column(this.font, this.tengwa);
    if (this.above) column.addAbove(this.above, this.aboveNote);
    if (this.below) column.addBelow(this.below, this.belowNote);
    if (this.following) column.addFollowing(this.following, this.followingNote);
    if (this.tildeBelow) column.addTildeBelow(this.tildeBelowNote);
    if (this.tildeAbove) column.addTildeAbove(this.tildeAboveNote);
    return column;
};

var reversed = {
    "silme": "silme-nuquerna",
    "esse": "esse-nuquerna",
    "silme-nuquerna": "silme",
    "esse-nuquerna": "esse"
};

Column.prototype.reverse = function () {
    this.tengwa = reversed[this.tengwa] || this.tengwa;
    return this;
};

Column.prototype.addError = function (error) {
    this.errors = this.errors || [];
    this.errors.push(error);
    return this;
};

Column.prototype.varies = function () {
    this.hasVariant = true;
    return this;
};


}],["dan-smith.js","tengwar","dan-smith.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/dan-smith.js
// --------------------


exports.tengwar = {
    // 1
    "tinco": "1", // t
    "parma": "q", // p
    "calma": "a", // c
    "quesse": "z", // qu
    // 2
    "ando" : "2", // nd
    "umbar": "w", // mb
    "anga" : "s", // ng
    "ungwe": "x", // ngw
    // 3
    "thule" : "3", // th
    "formen": "e", // ph / f
    "harma" : "d", // h / ch
    "hwesta": "c", // hw / chw
    // 4
    "anto" : "4", // nt
    "ampa" : "r", // mp
    "anca" : "f", // nc
    "unque": "v", // nqu
    // 5
    "numen" : "5", // n
    "malta" : "t", // m
    "noldo" : "g", // ng
    "nwalme": "b", // ngw / nw
    // 6
    "ore"  : "6", // r
    "vala" : "y", // v
    "anna" : "h", // -
    "wilya": "n", // w / v
    // 7
    "romen": "7", // medial r
    "arda" : "u", // rd / rh
    "lambe": "j", // l
    "alda" : "m", // ld / lh
    // 8
    "silme":          "8", // s
    "silme-nuquerna": "i", // s
    "esse":           "k", // z
    "esse-nuquerna":  ",", // z
    // 9
    "hyarmen":           "9", // hyarmen
    "hwesta-sindarinwa": "o", // hwesta sindarinwa
    "yanta":             "l", // yanta
    "ure":               ".", // ure
    // 10
    "halla": "½", // halla
    "short-carrier": "`",
    "long-carrier": "~",
    "round-carrier": "]",
    // I
    "tinco-extended": "!",
    "parma-extended": "Q",
    "calma-extended": "A",
    "quesse-extended": "Z",
    "ando-extended": "@",
    "umbar-extended": "W",
    "anga-extended": "S",
    "ungwe-extended": "X",
    // punctuation
    "comma": "=",
    "full-stop": "-",
    "exclamation-point": "Á",
    "question-mark": "À",
    "open-paren": "=", // alt "&#140;",
    "close-paren": "=", // alt "&#156;",
    "flourish-left": "Ğ",
    "flourish-right": "ğ",
    // numbers
    "0":  "ð",
    "1":  "ñ",
    "2":  "ò",
    "3":  "ó",
    "4":  "ô",
    "5":  "õ",
    "6":  "ö",
    "7":  "÷",
    "8":  "ø",
    "9":  "ù",
    "10": "ú",
    "11": "û"
};

exports.tehtar = {
    "a": "#EDC",
    "e": "$RFV",
    "i": "%TGB",
    "o": "^YHN",
    "u": [
        "&",
        "U",
        "J",
        "M",
        "Ā", // backward hooks, from the alt font to the custom font
        "ā",
        "Ă",
        "ă"
    ],
    //"á": "",
    "ó": [
        "Ą",
        "ą",
        "Ć",
        "ć"
    ],
    "ú": [
        "Ĉ",
        "ĉ",
        "Ċ",
        "ċ"
    ],
    "í": [
        "Ô",
        "Õ",
        "Ö",
        "×"
    ],
    "w": "èéêë", // TODO custom hooks for tengwar parmaite from the alternate font
    "y": "ÌÍÎÏ´",
    "o-below": [
        "ä",
        "å",
        "æ",
        "ç",
        "|"
    ],
    "i-below": [
        "È",
        "É",
        "Ê",
        "Ë",
        "L"
    ],
    "s": {
        "special": true,
        "calma": "|",
        "quesse": "|",
        "short-carrier": "}"
    },
    "s-final": {
        "special": true,
        "tinco": "+",
        "ando": "+",
        "numen": "+",
        "lambe": "_"
    },
    "s-inverse": {
        "special": true,
        "tinco": "¡"
    },
    "s-extended": {
        "special": true,
        "tinco": "Ç"
    },
    "s-flourish": {
        "special": true,
        "tinco": "£",
        "lambe": "¥"
    },
    "tilde-above": "Pp",
    "tilde-below": [
        ":",
        ";",
        "°"
    ],
    "tilde-high-above": ")0",
    "tilde-far-below": "?/",
    "bar-above": "{[",
    "bar-below": [
        '"',
        "'",
        "ç" // cedilla
    ],
    "bar-high-above": "ìî",
    "bar-far-below": "íï"
};


}],["document-parser.js","tengwar","document-parser.js",{"./parser":36},function (require, exports, module, __filename, __dirname){

// tengwar/document-parser.js
// --------------------------


var Parser = require("./parser");

// produces a document parser from a word parser in an arbitrary mode
module.exports = makeDocumentParser;
function makeDocumentParser(parseWord, makeOptions) {
    var parseLine = Parser.makeDelimitedParser(parseWord, parseSomeSpaces);
    var parseParagraph = Parser.makeDelimitedParser(parseLine, parseNewlineSpace);
    var parseSection = Parser.makeDelimitedParser(parseParagraph, parseNewlineSpace);
    var parseDocument = Parser.makeDelimitedParser(parseSection, parseNewlineSpaces);
    return Parser.makeParser(function (callback, options) {
        options = makeOptions(options);
        var state = parseDocument(callback, options);
        return state;
    });
}

var parseSpace = Parser.makeExpect(" ");
var parseAnySpaces = Parser.makeParseAny(parseSpace);
var parseSomeSpaces = Parser.makeParseSome(parseSpace);
var parseNewline = Parser.makeExpect("\n");
var parseNewlines = Parser.makeParseSome(parseNewline);

function parseNewlineSpace(callback) {
    return parseAnySpaces(function () {
        return parseNewline(function () {
            return parseAnySpaces(callback);
        });
    });
}

function parseNewlineSpaces(callback) {
    return parseAnySpaces(function () {
        return parseNewlines(function () {
            return parseAnySpaces(callback);
        });
    });
}

}],["fonts.js","tengwar","fonts.js",{"./tengwar-parmaite":39,"./tengwar-annatar":38},function (require, exports, module, __filename, __dirname){

// tengwar/fonts.js
// ----------------

module.exports = {
    "parmaite": require("./tengwar-parmaite"),
    "annatar": require("./tengwar-annatar")
};

}],["general-use.js","tengwar","general-use.js",{"./tengwar-annatar":38,"./notation":34,"./parser":36,"./document-parser":29,"./normalize":33,"./punctuation":37,"./numbers":35},function (require, exports, module, __filename, __dirname){

// tengwar/general-use.js
// ----------------------


var TengwarAnnatar = require("./tengwar-annatar");
var Notation = require("./notation");
var Parser = require("./parser");
var makeDocumentParser = require("./document-parser");
var normalize = require("./normalize");
var punctuation = require("./punctuation");
var parseNumber = require("./numbers");

exports.name = "General Use Mode";

var defaults = {};
exports.makeOptions = makeOptions;
function makeOptions(options) {
    options = options || defaults;
    // legacy
    if (options.blackSpeech) {
        options.language = "blackSpeech";
    }
    if (options.language === "blackSpeech") {
        options.language = "black-speech";
    }
    return {
        font: options.font || TengwarAnnatar,
        block: options.block,
        plain: options.plain,
        doubleNasalsWithTildeBelow: options.doubleNasalsWithTildeBelow,
        // Any tengwa can be doubled by placing a tilde above, and any tengwa
        // can be prefixed with the nasal from the same series by putting a
        // tilde below.  Doubled nasals have the special distinction that
        // either of these rules might apply so the tilde can go either above
        // or below.
        // false: by default, place a tilde above doubled nasals.
        // true: place the tilde below doubled nasals.
        reverseCurls: options.reverseCurls || options.language === "black-speech",
        // false: by default, o is forward, u is backward
        // true: o is backward, u is forward
        swapDotSlash: options.swapDotSlash,
        // false: by default, e is a slash, i is a dot
        // true: e is a dot, i is a slash
        medialOre: options.medialOre || options.language === "black-speech",
        // false: by default, ore only appears in final position
        // true: ore also appears before consonants, as in the ring inscription
        language: options.language,
        // by default, no change
        // "english": final e implicitly silent
        // "black speech": sh is calma-extended, gh is ungwe-extended, as in
        // the ring inscription
        // not "black-speech": sh is harma, gh is unque
        noAchLaut: options.noAchLaut,
        // false: "ch" is interpreted as ach-laut, "cc" as "ch" as in "chew"
        // true: "ch" is interpreted as "ch" as in chew
        sHook: options.sHook,
        // false: "is" is silme with I tehta
        // true: "is" is short carrier with S hook and I tehta
        tsdz: options.tsdz,
        // false: "ts" and "dz" are rendered as separate characters
        // true: "ts" is IPA "c" and "dz" is IPA "dʒ"
        duodecimal: options.duodecimal
        // false: numbers are decimal by default
        // true: numbers are duodecimal by default
    };
}

exports.transcribe = transcribe;
function transcribe(text, options) {
    options = makeOptions(options);
    var font = options.font;
    return font.transcribe(parse(text, options), options);
}

exports.encode = encode;
function encode(text, options) {
    options = makeOptions(options);
    return Notation.encode(parse(text, options), options);
}

var parse = exports.parse = makeDocumentParser(parseNormalWord, makeOptions);

function parseNormalWord(callback, options) {
    return normalize(parseWord(callback, options));
}

function parseWord(callback, options) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return scanWord(function (word, rewind) {
        if (options.language === "english") {
            if (word === "of") {
                return function (character) {
                    if (Parser.isBreak(character)) {
                        return scanWord(function (word, rewind) {
                            if (word === "the") {
                                return callback([
                                    makeOfThe(makeColumn)
                                ]);
                            } else if (word === "the'") {
                                return callback([
                                    makeOf(makeColumn),
                                    makeThePrime(makeColumn)
                                ]);
                            } else if (word === "the''") {
                                return callback([
                                    makeOf(makeColumn),
                                    makeThePrime(makeColumn)
                                ]);
                            } else {
                                return rewind(callback([
                                    makeOf(makeColumn)
                                ]));
                            }
                        });
                    } else {
                        return callback([makeOf(makeColumn)])(character);
                    }
                }
            } else if (word === "of'") {
                return scanWord(function (word, rewind) {
                    if (word === "the") {
                        return callback([
                            makeOfPrime(makeColumn),
                            makeThe(makeColumn)
                        ]);
                    } else if (word === "the'") {
                        return callback([
                            makeOfPrime(makeColumn),
                            makeThePrime(makeColumn)
                        ]);
                    } else if (word === "the''") {
                        return callback([
                            makeOfPrime(makeColumn),
                            makeThePrimePrime(makeColumn)
                        ]);
                    } else {
                        return rewind(callback([
                            makeOfPrime(makeColumn)
                        ]));
                    }
                });
            } else if (word === "the") {
                return callback([
                    makeThe(makeColumn)
                ]);
            } else if (word === "the'") {
                return callback([
                    makeThePrime(makeColumn)
                ]);
            } else if (word === "the''") {
                return callback([
                    makeThePrimePrime(makeColumn)
                ]);
            } else if (word === "of'the") {
                return callback([
                    makeOf(makeColumn),
                ])("t")("h")("e");
            } else if (word === "of'the'") {
                return callback([
                    makeOfPrime(makeColumn)
                ])("t")("h")("e")("'");
            } else if (word === "and") {
                return callback([
                    makeAnd(makeColumn)
                ]);
            } else if (word === "and'") {
                return callback([
                    makeAndPrime(makeColumn)
                ]);
            } else if (word === "and''") {
                return callback([
                    makeAndPrimePrime(makeColumn)
                ]);
            } else if (word === "we") {
                return callback([
                    makeColumn("vala", {from: "w"}),
                    makeColumn("short-carrier", {from: ""})
                        .addAbove("e", {from: "e"})
                        .varies()
                ]);
            } else if (word === "we'") { // Unattested, my invention - kriskowal
                return callback([
                    makeColumn("vala", {from: "w", diphthong: true})
                        .addBelow("y", {from: "ē"})
                ]);
            }
        }
        if (book[word]) {
            return callback(Notation.decodeWord(book[word], makeColumn), {
                from: word
            });
        } else {
            return callback(parseWordPiecewise(word, word.length, options), word);
        }
    }, options);
}

var book = {
    "iant": "yanta;tinco:a,tilde-above",
    "iaur": "yanta;vala:a;ore",
    "baranduiniant": "umbar;romen:a;ando:a,tilde-above;anna:u;yanta;anto:a,tilde-above",
    "ioreth": "yanta;romen:o;thule:e",
    "noldo": "nwalme;lambe:o;ando;short-carrier:o",
    "noldor": "nwalme;lambe:o;ando;ore:o"
};

// TODO Fix bug where "of", "the", and "and" decompose with following
// punctuation.
function scanWord(callback, options, word, rewind) {
    word = word || "";
    rewind = rewind || function (state) {
        return state;
    };
    return function (character) {
        if (Parser.isBreak(character)) {
            return callback(word, rewind)(character);
        } else {
            return scanWord(callback, options, word + character, function (state) {
                return rewind(state)(character);
            });
        }
    };
}

var parseWordPiecewise = Parser.makeParser(function (callback, length, options) {
    return parseWordTail(callback, length, options, []);
});

function parseWordTail(callback, length, options, columns, previous) {
    return parseColumn(function (moreColumns) {
        if (!moreColumns.length) {
            return callback(columns);
        } else {
            return parseWordTail(
                callback,
                length,
                options,
                columns.concat(moreColumns),
                moreColumns[moreColumns.length - 1] // previous
            );
        }
    }, length, options, previous);
}

function makeOf(makeColumn) {
    return makeColumn("umbar-extended", {from: "of"})
        .varies();
}

function makeOfPrime(makeColumn) {
    return makeOf(makeColumn)
        .addAbove("o", {from: "o", silent: true})
        .varies(); // TODO is this supposed to be u above?
}

function makeOfPrimePrime(makeColumn) {
    return makeColumn("formen", {from: "f"})
        .addAbove("o", {from: "o"});
}

function makeThe(makeColumn) {
    return makeColumn("ando-extended", {from: "the"})
        .varies();
}

function makeThePrime(makeColumn) {
    return makeThe(makeColumn).addBelow("i-below", {from: ""})
        .varies();
}

function makeThePrimePrime(makeColumn) {
    return makeColumn("thule", {from: "th"}).addBelow("i-below", {from: "e", silent: true});
}

function makeOfThe(makeColumn) {
    return makeColumn("umbar-extended", {from: "of the"})
        .addTildeBelow({from: ""});
}

function makeAnd(makeColumn) {
    return makeColumn("ando", {from: "and"})
        .addTildeAbove({from: ""});
}

function makeAndPrime(makeColumn) {
    return makeAnd(makeColumn)
        .addBelow("i-below", {from: ""})
        .varies();
}

function makeAndPrimePrime(makeColumn) {
    return makeColumn("ando", {from: "d"})
        .addTildeAbove("n", {from: "n"})
        .addAbove("a", {from: "a"});
}

function parseColumn(callback, length, options, previous) {
    var font = options.font;
    var makeColumn = font.makeColumn;

    return parseTehta(function (tehta, tehtaFrom) {
        return parseTengwa(function (column, tehta, tehtaFrom) {
            if (column) {
                if (tehta) {
                    if (options.reverseCurls) {
                        tehta = reverseCurls[tehta] || tehta;
                    }
                    if (options.swapDotSlash) {
                        tehta = swapDotSlash[tehta] || tehta;
                    }
                    if (column.tengwa === "silme" && tehta && options.sHook) {
                        return callback([
                            makeColumn("short-carrier", {from: ""})
                            .addAbove(tehta, {from: tehtaFrom})
                            .addBelow("s", {from: "s"})
                        ]);
                    } else if (options.language === "english" && shorterVowels[tehta]) {
                        // doubled vowels are composed from individual letters,
                        // not long forms.
                        return callback([
                            makeColumn("long-carrier", {from: shorterVowels[tehta]})
                                .addAbove(shorterVowels[tehta], {from: shorterVowels[tehta]}),
                            column
                        ]);
                    } else if (canAddAboveTengwa(tehta) && column.canAddAbove(tehta)) {
                        column.addAbove(tehta, {from: tehtaFrom});
                        return parseTengwaAnnotations(function (column) {
                            return callback([column]);
                        }, column, length, options);
                    } else {
                        // some tengwar inherently lack space above them
                        // and cannot be reversed to make room.
                        // some long tehtar cannot be placed on top of
                        // a tengwa.
                        // put the previous tehta over the appropriate carrier
                        // then follow up with this tengwa.
                        return parseTengwaAnnotations(function (column) {
                            return callback([makeCarrier(tehta, tehtaFrom, options), column]);
                        }, column, length, options);
                    }
                } else {
                    return parseTengwaAnnotations(function (column) {
                        return callback([column]);
                    }, column, length, options);
                }
            } else if (tehta) {
                if (options.reverseCurls) {
                    tehta = reverseCurls[tehta] || tehta;
                }
                if (options.swapDotSlash) {
                    tehta = swapDotSlash[tehta] || tehta;
                }
                return parseTengwaAnnotations(function (carrier) {
                    return callback([carrier]);
                }, makeCarrier(tehta, tehtaFrom, options), length, options);
            } else {
                return function (character) {
                    if (Parser.isBreak(character)) {
                        return callback([]);
                    } else if (/\d/.test(character)) {
                        return parseNumber(callback, options)(character);
                    } else if (punctuation[character]) {
                        return callback([makeColumn(punctuation[character], {from: character})]);
                    } else {
                        return callback([
                            makeColumn("ure", {from: character})
                            .addError(
                                "Cannot transcribe " +
                                JSON.stringify(character) +
                                " in General Use Mode"
                            )
                        ]);
                    }
                };
            }
        }, options, tehta, tehtaFrom);
    }, options);

}

function makeCarrier(tehta, tehtaFrom, options) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    if (tehta === "á") {
        return makeColumn("wilya", {from: "a"})
            .addAbove("a", {from: "a"});
    } else if (shorterVowels[tehta]) {
        return makeColumn("long-carrier", {from: tehtaFrom})
            .addAbove(shorterVowels[tehta], {from: ""});
    } else {
        return makeColumn("short-carrier", {from: tehtaFrom})
            .addAbove(tehta, {from: ""});
    }
}

function parseTehta(callback, options) {
    return function (character) {
        var firstCharacter = character;
        if (character === "ë" && options.language !== "english") {
            character = "e";
        }
        if (character === "") {
            return callback();
        } else if (lengthenableVowels.indexOf(character) !== -1) {
            return function (nextCharacter) {
                if (nextCharacter === character) {
                    return callback(longerVowels[character], longerVowels[character]);
                } else {
                    return callback(character, character)(nextCharacter);
                }
            };
        } else if (nonLengthenableVowels.indexOf(character) !== -1) {
            return callback(character, character);
        } else {
            return callback()(character);
        }
    };
}

var lengthenableVowels = "aeiou";
var longerVowels = {"a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú"};
var nonLengthenableVowels = "aeióú";
var tehtarThatCanBeAddedAbove = "aeiouóú";
var vowels = "aeëiouáéíóú";
var shorterVowels = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u"};
var reverseCurls = {"o": "u", "u": "o", "ó": "ú", "ú": "ó"};
var swapDotSlash = {"i": "e", "e": "i"};

function canAddAboveTengwa(tehta) {
    return tehtarThatCanBeAddedAbove.indexOf(tehta) !== -1;
}

function parseTengwa(callback, options, tehta, tehtaFrom) {
    var font = options.font;
    var makeColumn = font.makeColumn;
    return function (character) {
        if (character === "n") {
            return function (character) {
                if (character === "n") { // nn
                    if (options.doubleNasalsWithTildeBelow) {
                        return callback(
                            makeColumn("numen", {from: "n"})
                                .addTildeBelow({from: "n"}),
                            tehta,
                            tehtaFrom
                        );
                    } else {
                        return callback(
                            makeColumn("numen", {from: "n"})
                                .addTildeAbove({from: "n"}),
                            tehta,
                            tehtaFrom
                        );
                    }
                } else if (character === "t") { // nt
                    return function (character) {
                        if (character === "h") { // nth
                            return callback(
                                makeColumn("thule", {from: "th"})
                                    .addTildeAbove({from: "n"}),
                                tehta,
                                tehtaFrom
                            );
                        } else { // nt.
                            return callback(
                                makeColumn("tinco", {from: "t"})
                                    .addTildeAbove({from: "n"}),
                                tehta,
                                tehtaFrom
                            )(character);
                        }
                    };
                } else if (character === "d") { // nd
                    return callback(makeColumn("ando", {from: "d"}).addTildeAbove({from: "n"}), tehta, tehtaFrom);
                } else if (character === "c") { // nc -> ñc
                    return callback(makeColumn("quesse", {from: "c"}).addTildeAbove({from: "ñ"}), tehta, tehtaFrom);
                } else if (character === "g") { // ng -> ñg
                    return callback(makeColumn("ungwe", {from: "g"}).addTildeAbove({from: "ñ"}), tehta, tehtaFrom);
                } else if (character === "j") { // nj
                    return callback(makeColumn("anca", {from: "j"}).addTildeAbove({from: "n"}), tehta, tehtaFrom);
                } else if (character === "f") { // nf -> nv
                    return callback(makeColumn("numen", {from: "n"}), tehta, tehtaFrom)("v");
                } else  if (character === "w") { // nw -> ñw
                    return function (character) {
                        if (character === "a") { // nwa
                            return function (character) { // nwal
                                if (character === "l") {
                                    return callback(makeColumn("nwalme", {from: "n"}).addAbove("w", {from: "w"}), tehta, tehtaFrom)("a")(character);
                                } else { // nwa.
                                    return callback(makeColumn("numen", {from: "n"}).addAbove("w", {from: "w"}), tehta, tehtaFrom)("a")(character);
                                }
                            };
                        } else if (character === "nw'") { // nw' prime -> ñw
                            return callback(makeColumn("nwalme", {from: "ñ"}).addAbove("w", {from: "w"}), tehta, tehtaFrom);
                        } else { // nw.
                            return callback(makeColumn("numen", {from: "n"}).addAbove("w", {from: "w"}), tehta, tehtaFrom)(character);
                        }
                    };
                } else { // n.
                    return callback(makeColumn("numen", {from: "n"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "m") { // m
            return function (character) {
                if (character === "m") { // mm
                    if (options.doubleNasalsWithTildeBelow) {
                        return callback(makeColumn("malta", {from: "m"}).addTildeBelow({from: "m"}), tehta, tehtaFrom);
                    } else {
                        return callback(makeColumn("malta", {from: "m"}).addTildeAbove({from: "m"}), tehta, tehtaFrom);
                    }
                } else if (character === "p") { // mp
                    // mph is simplified to mf using the normalizer (deprecated TODO)
                    return callback(makeColumn("parma", {from: "p"}).addTildeAbove({from: "m"}), tehta, tehtaFrom);
                } else if (character === "b") { // mb
                    // mbh is simplified to mf using the normalizer (deprecated TODO)
                    return callback(makeColumn("umbar", {from: "b"}).addTildeAbove({from: "m"}), tehta, tehtaFrom);
                } else if (character === "f") { // mf
                    return callback(makeColumn("formen", {from: "f"}).addTildeAbove({from: "m"}), tehta, tehtaFrom);
                } else if (character === "v") { // mv
                    return callback(makeColumn("ampa", {from: "v"}).addTildeAbove({from: "m"}), tehta, tehtaFrom);
                } else { // m.
                    return callback(makeColumn("malta", {from: "m"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "ñ") { // ñ
            return function (character) {
                // ññ does not exist to the best of my knowledge
                // ñw is handled naturally by following w
                if (character === "c") { // ñc
                    return callback(makeColumn("quesse", {from: "c"}).addTildeAbove({from: "ñ"}), tehta, tehtaFrom);
                } else if (character === "g") { // ñg
                    return callback(makeColumn("ungwe", {from: "g"}).addTildeAbove({from: "ñ"}), tehta, tehtaFrom);
                } else { // ñ.
                    return callback(makeColumn("nwalme", {from: "ñ"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "t") { // t
            return function (character) {
                if (character === "t") { // tt
                    return callback(makeColumn("tinco", {from: "t"}).addTildeBelow({from: "t"}), tehta, tehtaFrom);
                } else if (character === "h") { // th
                    return callback(makeColumn("thule", {from: "th"}), tehta, tehtaFrom);
                } else if (character === "c") { // tc
                    return function (character) {
                        if (character === "h") { // tch -> tinco calma
                            return callback(makeColumn("tinco", {from: "t"}), tehta, tehtaFrom)("c")("h")("'");
                        } else {
                            return callback(makeColumn("tinco", {from: "t"}), tehta, tehtaFrom)("c")(character);
                        }
                    };
                } else if (character === "s" && options.tsdz) { // ts
                    return callback(makeColumn("calma", {from: "ts"}), tehta, tehtaFrom);
                } else { // t.
                    return callback(makeColumn("tinco", {from: "t"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "p") { // p
            return function (character) {
                // ph is simplified to f by the normalizer (deprecated)
                if (character === "p") { // pp
                    return callback(makeColumn("parma", {from: "p"}).addTildeBelow({from: "p"}), tehta, tehtaFrom);
                } else if (character === "h") { // ph
                    return callback(makeColumn("formen", {from: "ph"}), tehta, tehtaFrom);
                } else { // p.
                    return callback(makeColumn("parma", {from: "p"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "c") { // c
            return function (character) {
                // cw should be handled either by following-w or a subsequent
                // vala
                if (character === "c") { // ch as in charm
                    return callback(makeColumn("calma", {from: "cc"}), tehta, tehtaFrom);
                } else if (character === "h") { // ch, ach-laut, as in bach
                    return Parser.countPrimes(function (primes) {
                        if (options.noAchLaut && !primes) {
                            return callback(makeColumn("calma", {from: "ch"}), tehta, tehtaFrom); // ch as in charm
                        } else {
                            return callback(makeColumn("hwesta", {from: "ch"}), tehta, tehtaFrom); // ch as in bach
                        }
                    });
                } else { // c.
                    return callback(makeColumn("quesse", {from: "c"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "d") {
            return function (character) {
                if (character === "d") { // dd
                    return callback(makeColumn("ando", {from: "d"}).addTildeBelow({from: "d"}), tehta, tehtaFrom);
                } else if (character === "j") { // dj
                    return callback(makeColumn("anga", {from: "dj"}), tehta, tehtaFrom);
                } else if (character === "z" && options.tsdz) { // dz
                    // TODO annotate dz to indicate that options.tsdz affects this cluster
                    return callback(makeColumn("anga", {from: "dz"}), tehta, tehtaFrom);
                } else if (character === "h") { // dh
                    return callback(makeColumn("anto", {from: "dh"}), tehta, tehtaFrom);
                } else { // d.
                    return callback(makeColumn("ando", {from: "d"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "b") { // b
            return function (character) {
                // bh is simplified to v by the normalizer (deprecated)
                if (character === "b") { // bb
                    return callback(makeColumn("umbar", {from: "b"}).addTildeBelow({from: "b"}), tehta, tehtaFrom);
                } else if (character === "bh") { // bh
                    return callback(makeColumn("ampa", {from: "bh (v)"}), tehta, tehtaFrom);
                } else { // b.
                    return callback(makeColumn("umbar", {from: "b"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "g") { // g
            return function (character) {
                if (character === "g") { // gg
                    return callback(makeColumn("ungwe", {from: "g"}).addTildeBelow({from: "g"}), tehta, tehtaFrom);
                } else if (character === "h") { // gh
                    if (options.language === "black-speech") {
                        return callback(makeColumn("ungwe-extended", {from: "gh"}), tehta, tehtaFrom);
                    } else {
                        return callback(makeColumn("unque", {from: "gh"}), tehta, tehtaFrom);
                    }
                } else { // g.
                    return callback(makeColumn("ungwe", {from: "g"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "f") { // f
            return function (character) {
                if (character === "f") { // ff
                    return callback(makeColumn("formen", {from: "f"}).addTildeBelow({from: "f"}), tehta, tehtaFrom);
                } else { // f.
                    return callback(makeColumn("formen", {from: "f"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "v") { // v
            return callback(makeColumn("ampa", {from: "v"}), tehta, tehtaFrom);
        } else if (character === "j") { // j
            return callback(makeColumn("anca", {from: "j"}), tehta, tehtaFrom);
        } else if (character === "s") { // s
            return function (character) {
                if (character === "s") { // ss
                    return Parser.countPrimes(function (primes) {
                        var tengwa = primes > 0 ? "silme-nuquerna" : "silme";
                        var tengwaFrom = primes > 0 ? "s′" : "s";
                        var column = makeColumn(tengwa, {from: tengwaFrom}).addTildeBelow({from: "s"});
                        if (primes === 0) {
                            column.varies();
                        }
                        if (primes > 1) {
                            column.addError("Silme does not have this many alternate forms.");
                        }
                        return callback(column, tehta, tehtaFrom);
                    });
                } else if (character === "h") { // sh
                    if (options.language === "black-speech") {
                        return callback(makeColumn("calma-extended", {from: "sh"}), tehta, tehtaFrom);
                    } else {
                        return callback(makeColumn("harma", {from: "sh"}), tehta, tehtaFrom);
                    }
                } else { // s.
                    return Parser.countPrimes(function (primes) {
                        var tengwa = primes > 0 ? "silme-nuquerna" : "silme";
                        var tengwaFrom = primes > 0 ? "s′" : "s";
                        var column = makeColumn(tengwa, {from: tengwaFrom});
                        if (primes === 0) {
                            column.varies();
                        }
                        if (primes > 1) {
                            column.addError("Silme does not have this many alternate forms.");
                        }
                        return callback(column, tehta, tehtaFrom);
                    })(character);
                }
            };
        } else if (character === "z") { // z
            return function (character) {
                if (character === "z") { // zz
                    return Parser.countPrimes(function (primes) {
                        var tengwa = primes > 0 ? "esse-nuquerna" : "esse";
                        var column = makeColumn(tengwa, {from: "z"}).addTildeBelow({from: "z"});
                        if (primes === 0) {
                            column.varies();
                        }
                        if (primes > 1) {
                            column.addError("Esse does not have this many alternate forms.");
                        }
                        return callback(column, tehta, tehtaFrom);
                    });
                } else { // z.
                    return Parser.countPrimes(function (primes) {
                        var tengwa = primes > 0 ? "esse-nuquerna" : "esse";
                        var column = makeColumn(tengwa, {from: "z"});
                        if (primes === 0) {
                            column.varies();
                        }
                        if (primes > 1) {
                            column.addError("Silme does not have this many alternate forms.");
                        }
                        return callback(column, tehta, tehtaFrom);
                    })(character);
                }
            };
        } else if (character === "h") { // h
            return function (character) {
                if (character === "w") { // hw
                    return callback(makeColumn("hwesta-sindarinwa", {from: "hw"}), tehta, tehtaFrom);
                } else { // h.
                    return callback(makeColumn("hyarmen", {from: "h"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "r") { // r
            return function (character) {
                if (character === "r") { // rr
                    return callback(makeColumn("romen", {from: "r"}).addTildeBelow({from: "r"}), tehta, tehtaFrom);
                } else if (character === "h") { // rh
                    return callback(makeColumn("arda", {from: "rh"}), tehta, tehtaFrom);
                } else if (
                    Parser.isFinal(character) || (
                        options.medialOre &&
                        vowels.indexOf(character) === -1
                    )
                ) { // r final (optionally r before consonant)
                    return callback(makeColumn("ore", {from: "r", final: true}), tehta, tehtaFrom)(character);
                } else { // r.
                    return callback(makeColumn("romen", {from: "r"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "l") {
            return function (character) {
                if (character === "l") { // ll
                    return callback(makeColumn("lambe", {from: "l"}).addTildeBelow({from: "l"}), tehta, tehtaFrom);
                } else if (character === "h") { // lh
                    return callback(makeColumn("alda", {from: "lh"}), tehta, tehtaFrom);
                } else { // l.
                    return callback(makeColumn("lambe", {from: "l"}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "i") { // i
            return callback(makeColumn("anna", {from: "i", diphthong: true}), tehta, tehtaFrom);
        } else if (character === "u") { // u
            return callback(makeColumn("vala", {from: "u", diphthong: true}), tehta, tehtaFrom);
        } else if (character === "w") { // w
            return function (character) {
                if (character === "h") { // wh
                    return callback(makeColumn("hwesta-sindarinwa", {from: "wh"}), tehta, tehtaFrom);
                } else { // w.
                    return callback(makeColumn("vala", {from: "w", dipththong: true}), tehta, tehtaFrom)(character);
                }
            };
        } else if (character === "e" && (!tehta || tehta === "a")) { // ae or e after consonants
            return callback(makeColumn("yanta", {from: "e", diphthong: true}), tehta, tehtaFrom);
        } else if (character === "ë") { // if "ë" makes it this far, it's a diaresis for english
            return callback(makeColumn("short-carrier", {from: ""}).addAbove("e", {from: "e"}));
        } else if (character === "y") {
            return Parser.countPrimes(function (primes) {
                if (primes === 0) {
                    return callback(makeColumn("wilya", {from: ""}).addBelow("y", {from: "y"}), tehta, tehtaFrom);
                } else if (primes === 1) {
                    return callback(makeColumn("long-carrier", {from: "y"}).addAbove("i", {from: ""}), tehta, tehtaFrom);
                } else {
                    return callback(makeColumn("ure", {from: "y"}).addError("Consonantal Y only has one variation"));
                }
            });
        } else if (shorterVowels[character]) {
            return callback(
                makeCarrier(character, character, options)
                    .addAbove(shorterVowels[character], {from: ""}),
                tehta,
                tehtaFrom
            );
        } else if (character === "'" && options.language === "english" && tehta === "e") {
            // final e' in english should be equivalent to diaresis
            return callback(
                makeColumn("short-carrier", {from: ""})
                    .addAbove("e", {from: "e"})
            );
        } else if (character === "" && options.language === "english" && tehta === "e") {
            // tehta deliberately consumed in this one case, not passed forward
            return callback(
                makeColumn("short-carrier", {from: ""})
                    .addBelow("i-below", {from: "e", silent: true})
            )(character);
        } else {
            return callback(null, tehta, tehtaFrom)(character);
        }
    };
}

exports.parseTengwaAnnotations = parseTengwaAnnotations;
function parseTengwaAnnotations(callback, column, length, options) {
    return parseFollowingAbove(function (column) {
        return parseFollowingBelow(function (column) {
            return parseFollowing(callback, column);
        }, column, length, options);
    }, column);
}

// add a following-w above the current character if the next character is W and
// there is room for it.
function parseFollowingAbove(callback, column) {
    if (column.canAddAbove("w", "w")) {
        return function (character) {
            if (character === "w") {
                return callback(column.addAbove("w", {from: "e"}));
            } else {
                return callback(column)(character);
            }
        };
    } else {
        return callback(column);
    }
}

function parseFollowingBelow(callback, column, length, options) {
    return function (character) {
        if (character === "ë" && options.language !== "english") {
            character = "e";
        }
        if (character === "y" && column.canAddBelow("y")) {
            return callback(column.addBelow("y", {from: "y"}));
        } else if (character === "e" && column.canAddBelow("i-below")) {
            return Parser.countPrimes(function (primes) {
                return function (character) {
                    if (Parser.isFinal(character) && options.language === "english" && length > 2) {
                        if (primes === 0) {
                            return callback(
                                column.addBelow("i-below", {from: "e", silent: true})
                                    .varies()
                            )(character);
                        } else {
                            if (primes > 1) {
                                column.addError("Following E has only one variation.");
                            }
                            return callback(column)("e")(character);
                        }
                    } else {
                        if (primes === 0) {
                            return callback(column.varies())("e")(character);
                        } else {
                            if (primes > 1) {
                                column.addError("Following E has only one variation.");
                            }
                            return callback(column.addBelow("i-below", {from: "e", eilent: true}))(character);
                        }
                    }
                };
            });
        } else {
            return callback(column)(character);
        }
    };
}

function parseFollowing(callback, column) {
    return function (character) {
        if (character === "s") {
            if (column.canAddBelow("s")) {
                return Parser.countPrimes(function (primes, rewind) {
                    if (primes === 0) {
                        return callback(column.addBelow("s", {from: "s"}).varies());
                    } else if (primes) {
                        if (primes > 1) {
                            column.addError("Only one alternate form for following S.");
                        }
                        return rewind(callback(column)("s"));
                    }
                });
            } else {
                return Parser.countPrimes(function (primes, rewind) {
                    return function (character) {
                        if (Parser.isFinal(character)) { // end of word
                            if (column.canAddFollowing("s-final") && primes-- === 0) {
                                column.addFollowing("s-final", {from: "s"});
                            } else if (column.canAddFollowing("s-inverse") && primes -- === 0) {
                                column.addFollowing("s-inverse", {from: "s"});
                                if (column.canAddFollowing("s-final")) {
                                    column.varies();
                                }
                            } else if (column.canAddFollowing("s-extended") && primes-- === 0) {
                                column.addFollowing("s-extended", {from: "s"});
                                if (column.canAddFollowing("s-inverse")) {
                                    column.varies();
                                }
                            } else if (column.canAddFollowing("s-flourish") && primes-- === 0) {
                                column.addFollowing("s-flourish", {from: "s"});
                                if (column.canAddFollowing("s-extended")) {
                                    column.varies();
                                }
                            } else {
                                // rewind primes for subsequent alterations
                                var state = callback(column)("s");
                                while (primes-- > 0) {
                                    state = state("'");
                                }
                                return state;
                            }
                            return callback(column)(character);
                        } else {
                            return rewind(callback(column)("s"))(character);
                        }
                    };
                });
            }
        } else {
            return callback(column)(character);
        }
    };
}


}],["modes.js","tengwar","modes.js",{"./general-use":31,"./classical":26,"./beleriand":25},function (require, exports, module, __filename, __dirname){

// tengwar/modes.js
// ----------------

module.exports = {
    "general-use": require("./general-use"),
    "classical": require("./classical"),
    "beleriand": require("./beleriand")
};

}],["normalize.js","tengwar","normalize.js",{"./parser":36,"./trie":41,"./trie-parser":40},function (require, exports, module, __filename, __dirname){

// tengwar/normalize.js
// --------------------

// TODO remove this since it canvases over the origin of certain clusters

//  This module adapts streams of characters sent to one parser into a
//  simplified normal form piped to another.  Internally, a stream is
//  represented as a function that accepts the next character and returns a new
//  stream.
//
//      stream("a")("b")("c") -> stream
//
//  The input ends with an empty character.
//
//       stream("") -> stream
//
//  Functions that return streams and produce a syntax node accept a
//  callback that like a stream is required to return the initial stream state.
//
//       parseAbc(function (result) {
//           console.log(result);
//           return expectEof();
//       })("a")("b")("c")("")
//

var Parser = require("./parser");
var makeTrie = require("./trie");
var makeParserFromTrie = require("./trie-parser");
var array_ = Array.prototype;

//  The `normalize` function accepts a stream and returns a stream.  The
//  character sequence sent to the returned stream will be converted to a
//  normal form, where each character is lower-case and various clusters of
//  characters will be converted to a "normal" phonetic form so the subsequent
//  parser only has to deal with one input for each phonetic output.
//
//      normalize(parseWord(callback))("Q")("u")("x")
//
//  In this example, the callback would receive "cwcs", the normal form of
//  "Qux".
//
module.exports = normalize;
function normalize(callback) {
    return toLowerCase(simplify(callback));
};

// This is a parser adapter that always returns the same state, but internally
// tracks the state of the wrapped parser.  Each time the adapter receives a
// character, it converts it to lower case and uses that character to advance
// the state.
function toLowerCase(callback) {
    return function passthrough(character) {
        callback = callback(character.toLowerCase());
        return passthrough;
    };
}

// the keys of this table are characters and clusters of characters that must
// be simplified to the corresponding values before pumping them into an
// adapted parser.  The adapted parser therefore only needs to handle the
// normal phonetic form of the cluster.
var table = {
    "k": "c",
    "x": "cs",
    "q": "cw",
    "qu": "cw",
    "p": "p",
    "ph": "f",
    "b": "b",
    "bh": "v",
    "â": "á",
    "ê": "é",
    "î": "í",
    "ô": "ó",
    "û": "ú"
};

// This generates a data structure that can be walked by a parser, where each
// node corresponds to having parsed a certain prefix and follows to each
// common suffix.  If the parser is standing at a particular node of the trie
// and receives a character that does not match any of the subsequent subtrees,
// it "produces" the corresponding value at that node.
var trie = makeTrie(table);

var simplify = makeParserFromTrie(
    trie,
    function makeProducer(string) {
        // producing string involves advancing the state by individual
        // characters.
        return function (callback) {
            return Array.prototype.reduce.call(string, function (callback, character) {
                return callback(character);
            }, callback);
        };
    },
    function callback(callback) {
        // after a match has been emitted, loop back for another
        return simplify(callback);
    },
    function fallback(callback) {
        // if we reach a character that is not accounted for in the table, pass
        // it through without alternation, then start scanning for matches
        // again
        return function (character) {
            return simplify(callback(character));
        };
    }
);


}],["notation.js","tengwar","notation.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/notation.js
// -------------------


exports.encode = encode;
function encode(sections) {
    return sections.map(function (section) {
        return section.map(function (paragraph) {
            return paragraph.map(function (line) {
                return line.map(function (word) {
                    return word.map(function (column) {
                        var parts = [];
                        if (column.above)
                            parts.push(column.above);
                        if (column.below)
                            parts.push(column.below);
                        if (column.following)
                            parts.push(column.following);
                        if (column.tildeAbove)
                            parts.push("tilde-above");
                        if (column.tildeBelow)
                            parts.push("tilde-below");
                        if (parts.length) {
                            return column.tengwa + ":" + parts.join(",");
                        } else {
                            return column.tengwa;
                        }
                    }).join(";");
                }).join(" ");;
            }).join("\n");
        }).join("\n\n");
    }).join("\n\n\n");
}

exports.decode = decode;
function decode(encoding, makeColumn) {
    return encoding.split("\n\n\n").map(function (section) {
        return section.split("\n\n").map(function (paragraph) {
            return paragraph.split("\n").map(function (line) {
                return line.split(" ").map(function (word) {
                    return decodeWord(word, makeColumn);
                });
            });
        });
    });
}

exports.decodeWord = decodeWord;
function decodeWord(word, makeColumn) {
    return word.split(";").map(function (column) {
        var parts = column.split(":");
        var tengwa = parts.shift();
        var tehtar = parts.length ? parts.shift().split(",") : [];
        var result = makeColumn(tengwa);
        tehtar.forEach(function (tehta) {
            if (tehta === "tilde-above") {
                result.addTildeAbove();
            } else if (tehta === "tilde-below") {
                result.addTildeBelow();
            } else if (tehta === "y") {
                result.addBelow("y");
            } else if (
                tehta === "s" ||
                tehta === "s-inverse" ||
                tehta === "s-extended" ||
                tehta === "s-flourish"
            ) {
                if (
                    tehta === "s" &&
                    (tengwa === "calma" || tengwa === "quesse")
                ) {
                    result.addBelow(tehta, "s");
                } else {
                    result.addFollowing(tehta, "s");
                }
            } else {
                result.addAbove(tehta, "s");
            }
        });
        return result;
    });
}


}],["numbers.js","tengwar","numbers.js",{"./parser":36},function (require, exports, module, __filename, __dirname){

// tengwar/numbers.js
// ------------------


var Parser = require("./parser");

var array_ = Array.prototype;

module.exports = parseNumber;
function parseNumber(callback, options) {
    return parseDigits(function (digits) {
        if (digits) {
            return parseConvert(callback, digits.join(""), options);
        } else {
            return callback();
        }
    });
}

var digits = "0123456789";
var parseDigit = function (callback) {
    return function (character) {
        if (character !== "" && digits.indexOf(character) !== -1) {
            return callback(character);
        } else {
            return callback()(character);
        }
    };
};

function parseConvert(callback, number, options) {
    return Parser.countPrimes(function (primes) {
        return callback(convert(number, primes, options));
    });
}

function convert(string, alt, options) {
    var error;
    var radix;
    var duodecimal = options.duodecimal;
    var font = options.font;
    var makeColumn = font.makeColumn;
    if (alt == 0) {
        radix = duodecimal ? 12 : 10;
    } else {
        radix = duodecimal ? 10 : 12;
        error = alt > 1;
    }
    var number = parseInt(string, 10);
    var string = number.toString(radix).split("");
    return string.map(function (character) {
        var column = makeColumn(""+parseInt(character, 12));
        if (error) {
            column.addError("Numbers can only be parsed in either decimal or dudecimal.");
        }
        return column;
    });
}

var parseDigits = Parser.makeParseSome(parseDigit);


}],["parser.js","tengwar","parser.js",{"./punctuation":37},function (require, exports, module, __filename, __dirname){

// tengwar/parser.js
// -----------------


var punctuation = require("./punctuation");

// builds a string parser from a streaming character parser
exports.makeParser = makeParser;
function makeParser(production, errorHandler) {
    var errorHandler = errorHandler || function (error, text) {
        throw new Error(error + " while parsing " + JSON.stringify(text));
    };
    return function (text /*, ...args*/) {
        // the parser is a monadic state machine.
        // each state is represented by a function that accepts
        // a character.  parse functions accept a callback (for forwarding the
        // result) and return a state.
        text = text.trim();
        var result;
        var state = production.apply(null, [function (_result) {
            result = _result;
            return expectEof(function (error) {
                return errorHandler(error, text);
            });
        }].concat(Array.prototype.slice.call(arguments, 1)));
        // drive the state machine
        Array.prototype.forEach.call(text, function (letter, i) {
            state = state(letter);
        });
        // break break break
        while (!result) {
            state = state(""); // EOF
        }
        return result;
    };
}

function expectEof(errback) {
    return function (character) {
        if (character !== "") {
            errback("Unexpected " + JSON.stringify(character));
        }
        return function noop() {
            return noop;
        };
    };
}

exports.makeExpect = makeExpect;
function makeExpect(expected) {
    return function (callback) {
        return function (character) {
            if (character === expected) {
                return callback(character);
            } else {
                return callback()(character);
            }
        };
    };
}

exports.makeParseSome = makeParseSome;
function makeParseSome(parseOne) {
    var parseSome = function (callback) {
        return parseOne(function (one) {
            if (one != null) {
                return parseRemaining(callback, [one]);
            } else {
                return callback([]);
            }
        });
    };
    var parseRemaining = makeParseAny(parseOne);
    return parseSome;
}

exports.makeParseAny = makeParseAny;
function makeParseAny(parseOne) {
    return function parseRemaining(callback, any) {
        any = any || [];
        return parseOne(function (one) {
            if (one != null) {
                return parseRemaining(callback, any.concat([one]));
            } else {
                return callback(any);
            }
        });
    };
}

exports.makeDelimitedParser = makeDelimitedParser;
function makeDelimitedParser(parsePrevious, parseDelimiter) {
    return function parseSelf(callback, options, terms) {
        terms = terms || [];
        return parsePrevious(function (term) {
            if (!term.length) {
                return callback(terms);
            } else {
                terms = terms.concat([term]);
                return parseDelimiter(function (delimiter) {
                    if (delimiter) {
                        return parseSelf(callback, options, terms);
                    } else {
                        return callback(terms);
                    }
                });
            }
        }, options);
    }
}

// used by parsers to determine whether the cursor is on a word break
exports.isBreak = isBreak;
function isBreak(character) {
    return character === " " || character === "\n" || character === "";
}

exports.isFinal = isFinal;
function isFinal(character) {
    return isBreak(character) || punctuation[character];
}

// used by multiple modes
exports.countPrimes = countPrimes;
function countPrimes(callback, primes, rewind) {
    primes = primes || 0;
    rewind = rewind || function (state) {
        return state;
    };
    return function (character) {
        if (character === "'") {
            return countPrimes(callback, primes + 1, function (state) {
                return rewind(state)("'");
            });
        } else {
            return callback(primes, rewind)(character);
        }
    };
}


}],["punctuation.js","tengwar","punctuation.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/punctuation.js
// ----------------------


module.exports = {
    "-": "comma",
    ",": "comma",
    ":": "comma",
    ";": "full-stop",
    ".": "full-stop",
    "!": "exclamation-point",
    "?": "question-mark",
    "(": "open-paren",
    ")": "close-paren",
    ">": "flourish-left",
    "<": "flourish-right"
};


}],["tengwar-annatar.js","tengwar","tengwar-annatar.js",{"./alphabet":24,"./dan-smith":28,"./column":27},function (require, exports, module, __filename, __dirname){

// tengwar/tengwar-annatar.js
// --------------------------


var Alphabet = require("./alphabet");
var Bindings = require("./dan-smith");
var makeFontColumn = require("./column");

var tengwar = exports.tengwar = Bindings.tengwar;
var tehtar = exports.tehtar = Bindings.tehtar;

var positions = exports.positions = {

    "tinco": {
        "o": 3,
        "w": 3,
        "others": 2
    },
    "parma": {
        "o": 3,
        "w": 3,
        "others": 2
    },
    "calma": {
        "o": 3,
        "w": 3,
        "u": 3,
        "o-below": 1,
        "others": 2
    },
    "quesse": {
        "o": 3,
        "w": 3,
        "o-below": 1,
        "others": 2
    },

    "ando": {
        "wide": true,
        "e": 1,
        "o": 2,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "umbar": {
        "wide": true,
        "e": 1,
        "o": 2,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "anga": {
        "wide": true,
        "e": 1,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "ungwe": {
        "wide": true,
        "e": 1,
        "o": 1,
        "ó": 1,
        "ú": 1,
        "others": 0
    },

    "thule": {
        "others": 3
    },
    "formen": 3,
    "harma": {
        "e": 0,
        "o": 3,
        "u": 7,
        "ó": 2,
        "ú": 2,
        "w": 0,
        "others": 1
    },
    "hwesta": {
        "e": 0,
        "o": 3,
        "u": 7,
        "w": 0,
        "others": 1
    },

    "anto": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "ampa": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "anca": {
        "wide": true,
        "u": 7,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "unque": {
        "wide": true,
        "u": 7,
        "others": 0
    },

    "numen": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "malta": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "noldo": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "nwalme": {
        "wide": true,
        "ó": 1,
        "ú": 1,
        "others": 0
    },

    "ore": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "others": 1
    },
    "vala": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "others": 1
    },
    "anna": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 2,
        "ú": 2,
        "others": 1
    },
    "wilya": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "others": 1
    },

    "romen": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 2,
        "ú": 2,
        "y": 3,
        "o-below": null,
        "i-below": 3,
        "others": 1
    },
    "arda": {
        "a": 1,
        "e": 3,
        "i": 1,
        "o": 3,
        "u": 3,
        "í": 1,
        "ó": 2,
        "ú": 2,
        "y": 3,
        "o-below": null,
        "i-below": 3,
        "others": 0
    },
    "lambe": {
        "wide": true,
        "e": 1,
        "y": 4,
        "ó": 1,
        "ú": 1,
        "o-below": null,
        "i-below": 4,
        "others": 0
    },
    "alda": {
        "wide": true,
        "o-below": null,
        "others": 1
    },

    "silme": {
        "y": 3,
        "o-below": 2,
        "i-below": 2,
        "others": null
    },
    "silme-nuquerna": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 1
    },
    "esse": {
        "y": null,
        "others": null
    },
    "esse-nuquerna": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "others": 1
    },

    "hyarmen": 3,
    "hwesta-sindarinwa": {
        "o": 2,
        "u": 2,
        "ó": 1,
        "ú": 2,
        "others": 0
    },
    "yanta": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 2,
        "ú": 2,
        "others": 1
    },
    "ure": {
        "e": 3,
        "o": 3,
        "u": 3,
        "ó": 3,
        "ú": 3,
        "others": 1
    },

    // should not occur:
    "halla": {
        "i-below": 3,
        "others": null
    },
    "short-carrier": 3,
    "long-carrier": {
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 3
    },
    "round-carrier": 3,

    "tinco-extended": 3,
    "parma-extended": 3,
    "calma-extended": {
        "o": 3,
        "u": 7,
        "ó": 2,
        "ú": 2,
        "others": 1
    },
    "quesse-extended": {
        "o": 0,
        "u": 7,
        "others": 1
    },

    "ando-extended": {
        "wide": true,
        "e": 1,
        "o": 2,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "umbar-extended": {
        "wide": true,
        "e": 1,
        "o": 2,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "anga-extended": {
        "wide": true,
        "e": 1,
        "ó": 1,
        "ú": 1,
        "others": 0
    },
    "ungwe-extended": {
        "wide": true,
        "e": 1,
        "o": 1,
        "ó": 1,
        "ú": 1,
        "others": 0
    }
};

exports.transcribe = transcribe;
function transcribe(sections, options) {
    options = options || {};
    var block = options.block || false;
    var beginParagraph = block ? "<p>" : "";
    var delimitParagraph = "<br>";
    var endParagraph = block ? "</p>" : "";
    return sections.map(function (section) {
        return section.map(function (paragraph) {
            return beginParagraph + paragraph.map(function (line) {
                return line.map(function (word) {
                    return word.map(function (column) {
                        return transcribeColumn(column, options);
                    }).join("");
                }).join(" ");;
            }).join(delimitParagraph + "\n") + endParagraph;
        }).join("\n\n");
    }).join("\n\n\n");
}

exports.transcribeColumn = transcribeColumn;
function transcribeColumn(column, options) {
    options = options || {};
    var plain = options.plain || false;
    var tengwa = column.tengwa || "anna";
    var tehtar = [];
    if (column.above) tehtar.push(column.above);
    if (column.below) tehtar.push(column.below);
    if (column.tildeBelow) tehtar.push("tilde-below");
    if (column.tildeAbove) tehtar.push("tilde-above");
    if (column.following) tehtar.push(column.following);
    var html = tengwar[tengwa] + tehtar.map(function (tehta) {
        return tehtaForTengwa(tengwa, tehta);
    }).join("");
    if (column.errors && !plain) {
        html = "<abbr class=\"error\" title=\"" + column.errors.join("\n").replace(/"/g, "&quot;") + "\">" + html + "</abbr>";
    }
    return html;
}

exports.tehtaForTengwa = tehtaForTengwa;
function tehtaForTengwa(tengwa, tehta) {
    var tehtaKey = tehtaKeyForTengwa(tengwa, tehta);
    if (tehtaKey == null)
        return null;
    return (
        tehtar[tehta][tengwa] ||
        tehtar[tehta][tehtaKey] ||
        ""
    );
}

function tehtaKeyForTengwa(tengwa, tehta) {
    if (!tehtar[tehta])
        return null;
    if (tehtar[tehta].special)
        return tehtar[tehta][tengwa] || null;
    if (Alphabet.barsAndTildes.indexOf(tehta) !== -1) {
        if (tengwa === "lambe" || tengwa === "alda" && tehtar[tehta].length >= 2)
            return 2;
        return positions[tengwa].wide ? 0 : 1;
    }
    if (positions[tengwa] == null)
        return null;
    if (positions[tengwa][tehta] === null)
        return null;
    if (positions[tengwa][tehta] != null)
        return positions[tengwa][tehta];
    if (positions[tengwa].others != null)
        return positions[tengwa].others;
    return positions[tengwa];
}

exports.makeColumn = makeColumn;
function makeColumn(tengwa, tengwarFrom) {
    return makeFontColumn(exports, tengwa, tengwarFrom);
}


}],["tengwar-parmaite.js","tengwar","tengwar-parmaite.js",{"./alphabet":24,"./dan-smith":28,"./column":27},function (require, exports, module, __filename, __dirname){

// tengwar/tengwar-parmaite.js
// ---------------------------


var Alphabet = require("./alphabet");
var Bindings = require("./dan-smith");
var makeFontColumn = require("./column");

var tengwar = exports.tengwar = Bindings.tengwar;
var tehtar = exports.tehtar = Bindings.tehtar;

var positions = exports.positions = {

    "tinco": 2,
    "parma": 2,
    "calma": {
        "y": 1,
        "o-below": 1,
        "others": 2
    },
    "quesse": {
        "y": 1,
        "o-below": 1,
        "others": 2
    },

    "ando": {
        "wide": true,
        "others": 0
    },
    "umbar": {
        "wide": true,
        "others": 0
    },
    "anga": {
        "wide": true,
        "others": 0
    },
    "ungwe": {
        "wide": true,
        "others": 0
    },

    "thule": {
        "a": 3,
        "w": 3,
        "others": 2
    },
    "formen": {
        "a": 3,
        "w": 3,
        "í": 3,
        "others": 2
    },
    "harma": {
        "a": 0,
        "e": 0,
        "i": 1,
        "o": 1,
        "u": 1,
        "w": 0,
        "í": 0,
        "others": 1
    },
    "hwesta": {
        "a": 0,
        "e": 0,
        "i": 1,
        "o": 1,
        "u": 1,
        "w": 0,
        "others": 1
    },

    "anto": {
        "wide": true,
        "others": 0
    },
    "ampa": {
        "wide": true,
        "others": 0
    },
    "anca": {
        "wide": true,
        "others": 0
    },
    "unque": {
        "wide": true,
        "others": 0
    },

    "numen": {
        "wide": true,
        "others": 0
    },
    "malta": {
        "wide": true,
        "others": 0
    },
    "noldo": {
        "wide": true,
        "others": 0
    },
    "nwalme": {
        "wide": true,
        "others": 0
    },

    "ore": {
        "a": 1,
        "e": 2,
        "i": 1,
        "o": 2,
        "u": 3,
        "others": 1
    },
    "vala": {
        "a": 1,
        "e": 2,
        "i": 2,
        "o": 2,
        "w": 1,
        "y": 1,
        "í": 2,
        "i-below": 1,
        "others": 3
    },
    "anna": {
        "a": 1,
        "w": 3,
        "others": 2
    },
    "wilya": {
        "i": 2,
        "í": 2,
        "others": 1
    },

    "romen": {
        "a": 1,
        "e": 1,
        "i": 2,
        "o": 1,
        "u": 1,
        "y": 3,
        "o-below": null,
        "i-below": 3,
        "others": 1
    },
    "arda": {
        "a": 1,
        "e": 1,
        "i": 2,
        "o": 1,
        "u": 1,
        "w": 1,
        "í": 2,
        "y": 3,
        "o-below": null,
        "i-below": 3,
        "others": 0
    },
    "lambe": {
        "wide": true,
        "e": 1,
        "y": 4,
        "w": 0,
        "o-below": null,
        "i-below": 4,
        "others": 0
    },
    "alda": {
        "wide": true,
        "w": 0,
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 1
    },

    "silme": {
        "y": 2,
        "o-below": 2,
        "i-below": 2,
        "others": null
    },
    "silme-nuquerna": {
        "e": 2,
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 1
    },
    "esse": {
        "others": null
    },
    "esse-nuquerna": {
        "e": 2,
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 1
    },

    "hyarmen": {
        "y": 1,
        "o-below": 1,
        "i-below": 1,
        "others": 3
    },
    "hwesta-sindarinwa": {
        "w": 1,
        "y": 1,
        "o-below": 1,
        "i-below": 1,
        "others": 0
    },
    "yanta": {
        "a": 1,
        "others": 2
    },
    "ure": {
        "a": 1,
        "others": 2
    },

    "halla": {
        "i-below": 3,
        "o-below": 3,
        "others": null
    },
    "short-carrier": {
        "y": null,
        "others": 3
    },
    "long-carrier": {
        "y": null,
        "o-below": null,
        "i-below": null,
        "others": 3
    },
    "round-carrier": 2,

    "tinco-extended": {
        "a": 3,
        "w": 3,
        "y": 3,
        "í": 3,
        "o-below": 3,
        "others": 2
    },
    "parma-extended": {
        "a": 3,
        "w": 3,
        "y": 3,
        "í": 3,
        "o-below": 3,
        "others": 2
    },
    "calma-extended": {
        "i": 1,
        "w": 1,
        "y": 0,
        "í": 0,
        "i-below": 1,
        "o-below": 1,
        "others": 0
    },
    "quesse-extended": {
        "i": 1,
        "w": 1,
        "y": 0,
        "í": 0,
        "i-below": 1,
        "o-below": 1,
        "others": 0
    },

    "ando-extended": {
        "wide": true,
        "others": 0
    },
    "umbar-extended": {
        "wide": true,
        "others": 0
    },
    "anga-extended": {
        "wide": true,
        "others": 0
    },
    "ungwe-extended": {
        "wide": true,
        "others": 0
    }

};

exports.transcribe = transcribe;
function transcribe(sections, options) {
    options = options || {};
    var block = options.block || false;
    var beginParagraph = block ? "<p>" : "";
    var delimitParagraph = "<br>";
    var endParagraph = block ? "</p>" : "";
    return sections.map(function (section) {
        return section.map(function (paragraph) {
            return beginParagraph + paragraph.map(function (line) {
                return line.map(function (word) {
                    return word.map(function (column) {
                        return transcribeColumn(column, options);
                    }).join("");
                }).join(" ");;
            }).join(delimitParagraph + "\n") + endParagraph;
        }).join("\n\n");
    }).join("\n\n\n");
}

exports.transcribeColumn = transcribeColumn;
function transcribeColumn(column, options) {
    options = options || {};
    var plain = options.plain || false;
    var tengwa = column.tengwa || "anna";
    var tehtar = [];
    if (column.above) tehtar.push(column.above);
    if (column.below) tehtar.push(column.below);
    if (column.tildeBelow) tehtar.push("tilde-below");
    if (column.tildeAbove) tehtar.push("tilde-above");
    if (column.following) tehtar.push(column.following);
    var html = tengwar[tengwa] + tehtar.map(function (tehta) {
        return tehtaForTengwa(tengwa, tehta);
    }).join("");
    if (column.errors && !plain) {
        html = "<abbr class=\"error\" title=\"" + column.errors.join("\n").replace(/"/g, "&quot;") + "\">" + html + "</abbr>";
    }
    return html;
}

exports.tehtaForTengwa = tehtaForTengwa;
function tehtaForTengwa(tengwa, tehta) {
    var tehtaKey = tehtaKeyForTengwa(tengwa, tehta);
    if (tehtaKey == null)
        return null;
    return (
        tehtar[tehta][tengwa] ||
        tehtar[tehta][tehtaKey] ||
        null
    );
}

var longVowels = "áéóú";
function tehtaKeyForTengwa(tengwa, tehta) {
    if (!tehtar[tehta])
        return null;
    if (longVowels.indexOf(tehta) !== -1)
        return null;
    if (tehtar[tehta].special)
        return tehtar[tehta][tengwa] || null;
    if (Alphabet.barsAndTildes.indexOf(tehta) !== -1) {
        if (tengwa === "lambe" || tengwa === "alda" && tehtar[tehta].length >= 2)
            return 2;
        return positions[tengwa].wide ? 0 : 1;
    }
    if (positions[tengwa] == null)
        return null;
    if (positions[tengwa][tehta] === null)
        return null;
    if (positions[tengwa][tehta] != null)
        return positions[tengwa][tehta];
    if (positions[tengwa].others != null)
        return positions[tengwa].others;
    return positions[tengwa];
}

exports.makeColumn = makeColumn;
function makeColumn(tengwa, tengwarFrom) {
    return makeFontColumn(exports, tengwa, tengwarFrom);
}


}],["trie-parser.js","tengwar","trie-parser.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/trie-parser.js
// ----------------------


module.exports = makeParserFromTrie;
function makeParserFromTrie(trie, makeProducer, callback, fallback) {
    var children = {};
    var characters = Object.keys(trie.children);
    characters.forEach(function (character) {
        children[character] = makeParserFromTrie(
            trie.children[character],
            makeProducer,
            callback,
            fallback
        );
    });
    var producer;
    if (trie.value) {
        producer = makeProducer(trie.value);
    }
    return characters.reduceRight(function (next, expected) {
        return function (state) {
            return function (character) {
                if (character === expected) {
                    return callback(children[character](state));
                } else {
                    return next(state)(character);
                }
            };
        };
    }, function (state) {
        if (producer) {
            return callback(producer(state));
        } else {
            return fallback(state);
        }
    });
}


}],["trie.js","tengwar","trie.js",{},function (require, exports, module, __filename, __dirname){

// tengwar/trie.js
// ---------------


module.exports = makeTrie;
function makeTrie(table) {
    var strings = Object.keys(table);
    var trie = {value: void 0, children: {}};
    var tables = {};
    strings.forEach(function (string) {
        if (string.length === 0) {
            trie.value = table[string];
        } else {
            var character = string[0];
            if (!tables[character]) {
                tables[character] = {};
            }
            var tail = string.slice(1);
            tables[character][tail] = table[string];
        }
    });
    var characters = Object.keys(tables);
    characters.forEach(function (character) {
        trie.children[character] = makeTrie(tables[character]);
    });
    return trie;
}


}],["dom.js","wizdom","dom.js",{},function (require, exports, module, __filename, __dirname){

// wizdom/dom.js
// -------------

"use strict";

module.exports = Document;
function Document(namespace) {
    this.doctype = null;
    this.documentElement = null;
    this.namespaceURI = namespace || "";
}

Document.prototype.nodeType = 9;
Document.prototype.Node = Node;
Document.prototype.Element = Element;
Document.prototype.TextNode = TextNode;
Document.prototype.Comment = Comment;
Document.prototype.Attr = Attr;
Document.prototype.NamedNodeMap = NamedNodeMap;

Document.prototype.createTextNode = function (text) {
    return new this.TextNode(this, text);
};

Document.prototype.createComment = function (text) {
    return new this.Comment(this, text);
};

Document.prototype.createElement = function (type, namespace) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createElementNS = function (namespace, type) {
    return new this.Element(this, type, namespace || this.namespaceURI);
};

Document.prototype.createAttribute = function (name, namespace) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

Document.prototype.createAttributeNS = function (namespace, name) {
    return new this.Attr(this, name, namespace || this.namespaceURI);
};

function Node(document) {
    this.ownerDocument = document;
    this.parentNode = null;
    this.firstChild = null;
    this.lastChild = null;
    this.previousSibling = null;
    this.nextSibling = null;
}

Node.prototype.appendChild = function appendChild(childNode) {
    return this.insertBefore(childNode, null);
};

Node.prototype.insertBefore = function insertBefore(childNode, nextSibling) {
    if (!childNode) {
        throw new Error("Can't insert null child");
    }
    if (childNode.ownerDocument !== this.ownerDocument) {
        throw new Error("Can't insert child from foreign document");
    }
    if (childNode.parentNode) {
        childNode.parentNode.removeChild(childNode);
    }
    var previousSibling;
    if (nextSibling) {
        previousSibling = nextSibling.previousSibling;
    } else {
        previousSibling = this.lastChild;
    }
    if (previousSibling) {
        previousSibling.nextSibling = childNode;
    }
    if (nextSibling) {
        nextSibling.previousSibling = childNode;
    }
    childNode.nextSibling = nextSibling;
    childNode.previousSibling = previousSibling;
    childNode.parentNode = this;
    if (!nextSibling) {
        this.lastChild = childNode;
    }
    if (!previousSibling) {
        this.firstChild = childNode;
    }
};

Node.prototype.removeChild = function removeChild(childNode) {
    if (!childNode) {
        throw new Error("Can't remove null child");
    }
    var parentNode = childNode.parentNode;
    if (parentNode !== this) {
        throw new Error("Can't remove node that is not a child of parent");
    }
    if (childNode === parentNode.firstChild) {
        parentNode.firstChild = childNode.nextSibling;
    }
    if (childNode === parentNode.lastChild) {
        parentNode.lastChild = childNode.previousSibling;
    }
    if (childNode.previousSibling) {
        childNode.previousSibling.nextSibling = childNode.nextSibling;
    }
    if (childNode.nextSibling) {
        childNode.nextSibling.previousSibling = childNode.previousSibling;
    }
    childNode.previousSibling = null;
    childNode.parentNode = null;
    childNode.nextSibling = null;
    return childNode;
};

function TextNode(document, text) {
    Node.call(this, document);
    this.data = text;
}

TextNode.prototype = Object.create(Node.prototype);
TextNode.prototype.constructor = TextNode;
TextNode.prototype.nodeType = 3;

function Comment(document, text) {
    Node.call(this, document);
    this.data = text;
}

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeType = 8;

function Element(document, type, namespace) {
    Node.call(this, document);
    this.tagName = type;
    this.namespaceURI = namespace;
    this.attributes = new this.ownerDocument.NamedNodeMap();
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeType = 1;

Element.prototype.hasAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return !!attr;
};

Element.prototype.getAttribute = function (name, namespace) {
    var attr = this.attributes.getNamedItem(name, namespace);
    return attr ? attr.value : null;
};

Element.prototype.setAttribute = function (name, value, namespace) {
    var attr = this.ownerDocument.createAttribute(name, namespace);
    attr.value = value;
    this.attributes.setNamedItem(attr, namespace);
};

Element.prototype.removeAttribute = function (name, namespace) {
    this.attributes.removeNamedItem(name, namespace);
};

Element.prototype.hasAttributeNS = function (namespace, name) {
    return this.hasAttribute(name, namespace);
};

Element.prototype.getAttributeNS = function (namespace, name) {
    return this.getAttribute(name, namespace);
};

Element.prototype.setAttributeNS = function (namespace, name, value) {
    this.setAttribute(name, value, namespace);
};

Element.prototype.removeAttributeNS = function (namespace, name) {
    this.removeAttribute(name, namespace);
};

function Attr(ownerDocument, name, namespace) {
    this.ownerDocument = ownerDocument;
    this.name = name;
    this.value = null;
    this.namespaceURI = namespace;
}

Attr.prototype.nodeType = 2;

function NamedNodeMap() {
    this.length = 0;
}

NamedNodeMap.prototype.getNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    return this[key];
};

NamedNodeMap.prototype.setNamedItem = function (attr) {
    var namespace = attr.namespaceURI || "";
    var name = attr.name;
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var previousAttr = this[key];
    if (!previousAttr) {
        this[this.length] = attr;
        this.length++;
        previousAttr = null;
    }
    this[key] = attr;
    return previousAttr;
};

NamedNodeMap.prototype.removeNamedItem = function (name, namespace) {
    namespace = namespace || "";
    var key = encodeURIComponent(namespace) + ":" + encodeURIComponent(name);
    var attr = this[key];
    if (!attr) {
        throw new Error("Not found");
    }
    var index = Array.prototype.indexOf.call(this, attr);
    delete this[key];
    delete this[index];
    this.length--;
};

NamedNodeMap.prototype.item = function (index) {
    return this[index];
};

NamedNodeMap.prototype.getNamedItemNS = function (namespace, name) {
    return this.getNamedItem(name, namespace);
};

NamedNodeMap.prototype.setNamedItemNS = function (attr) {
    return this.setNamedItem(attr);
};

NamedNodeMap.prototype.removeNamedItemNS = function (namespace, name) {
    return this.removeNamedItem(name, namespace);
};

}]])("tengwar.html/index.js")
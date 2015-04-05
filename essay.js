"use strict";

var Document = require("koerper");
var Scope = require("gutentag/scope");
var Main = require("./main.html");

var scope = new Scope();
var document = new Document(window.document.body);
var essay = new Main(document.documentElement, scope);

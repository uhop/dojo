define("dojo/_base",[
"dojo/_base/lang",
"dojo/_base/array",
"dojo/_base/declare",
"dojo/_base/connect",
"./has!config-promiseOnly?dojo/_base/promise:dojo/_base/Deferred",
"dojo/_base/json",
"dojo/_base/Color",
dojo.isBrowser? "dojo/_base/browser" : "dojo/_base/lang"], function(){
	return dojo;
});

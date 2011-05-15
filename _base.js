define("dojo/_base",[
"dojo/_base/lang",
"dojo/_base/array",
"dojo/_base/declare",
"dojo/_base/connect",
"dojo/Deferred", // Keep compatible Deferred for now
"dojo/_base/json",
"dojo/_base/Color",
dojo.isBrowser? "dojo/_base/browser" : "dojo/_base/lang"], function(){
	return dojo;
});

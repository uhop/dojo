define([
	"./_base/kernel",
	"./when",
], function(dojo, when){
	dojo.promise = { when: when };

	dojo.promise.Promise = function(canceller){};
	dojo.promise.Promise.prototype.then = function(resolvedCallback, rejectCallback, progressCallback){};

	dojo.promise.CancelError = (function(){
		var klass = function(message){
			Error.apply(this, arguments);
			this.message = message || "The deferred was cancelled.";
		};
		var proto = klass.prototype = new Error;
		proto.constructor = klass;
		proto.name = "CancelError";
		return klass;
	})();

	return dojo.promise;
});

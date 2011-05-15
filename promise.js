define(["./main"], function(dojo){
	// module:
	//		dojo/promise
	// summary:
	//		This module defines dojo.Deferred and base dojo.promise.* classes.

	dojo.promise = {};
	// Base Promise class, who's prototype can be extended to provide utility methods.
	dojo.promise.Promise = function(/*Function?*/canceller){};
	dojo.promise.Promise.prototype.then = function(resolvedCallback, rejectCallback, progressCallback){};

	// Make a proper subclass of Error
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

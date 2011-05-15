dojo.promise.TimeoutError = extendError("TimeoutError", "The deferred timed out because it took too long to resolve.");
function extendError(name, defaultMessage){
	var klass = function(message){
		Error.apply(this, arguments);
		this.message = message || defaultMessage;
	};
	var proto = klass.prototype = new Error;
	proto.constructor = klass;
	proto.name = name;
	return klass;
}


var timeout;
// Define that the deferred will time out at a certain point, unless it's been fulfilled.
this.timeout = function(ms){
	// summary:
	//		Define that the deferred will time out at a certain point, unless it's been fulfilled.
	//		The deferred will be rejected with a TimeoutError.
	if(ms === undefined || timeout !== undefined){
		return timeout;
	}

	timeout = ms;
	setTimeout(function(){
		if(!fulfilled){
			if(promise.cancel){
				promise.cancel(new dojo.DeferredTimeoutError);
			}else{
				reject(new dojo.DeferredTimeoutError);
			}
		}
	}, ms);
	return promise;
};

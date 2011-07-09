define([
	"./_base/kernel",
	"./promise",
	"./promise/Deferred"
], function(dojo, pmod, Deferred){
	// Provide a Dojo <= 1.4 compatible implementation of Deferreds, based
	// on dojo.promise.Deferred.
	dojo.Deferred = function(canceller){
		this.fired = -1;
		this.results = [null, null];

		var compatibleDeferred = this;
		// Create the internal deferred with a compatible canceller.
		var deferred = new Deferred(function(){
			if(canceller){
				var err = canceller(compatibleDeferred);
				if(!(err instanceof Error)){
					var res = err;
					var msg = "Deferred Cancelled";
					if(err && err.toString){
						msg += ": " + err.toString();
					}
					err = new Error(msg);
					err.dojoType = "cancel";
					err.cancelResult = res;
				}else if(err instanceof pmod.CancelError){
					err.dojoType = "cancel";
				}
				return err;
			}
		});
		// Transform the promise of the internal deferred to handle returned Error instances,
		// mutate state, etc. This gives us a compatible promise.
		var compatiblePromise = transform(this, deferred.promise);

		// promise and then() reference the original (non-backwards compatible) promise
		this.promise = deferred.promise;
		this.then = deferred.then;
		// Expose methods to fulfill the deferred.
		this.progress = deferred.progress;
		this.resolve = deferred.resolve;
		this.reject = deferred.reject;

		// Implement cancel behavior where the result may also be cancelled.
		this.cancel = function(){
			if(this.fired === -1){
				deferred.cancel();
			}else if(this.fired === 0 && this.results[0] instanceof dojo.Deferred){
				this.results[0].cancel();
			}
		};
		// Unbound callback method
		this.callback = function(value){
			if(this === compatibleDeferred){
				deferred.resolve(value);
			}else{
				throw new Error("callback() called on the wrong deferred");
			}
		};
		// Unbound errback method
		this.errback = function(error){
			if(this === compatibleDeferred){
				deferred.reject(error);
			}else{
				throw new Error("errback() called on the wrong deferred");
			}
		};
		this.addCallbacks = function(callback, errback){
			// Chain the callback/errback to the current compatiblePromise
			var chainPromise = chain(this, compatiblePromise, callback, errback);
			// And transform the new promise into a new compatiblePromise
			compatiblePromise = transform(this, chainPromise);
			return this;
		};
		this.addCallback = function(callback){
			return this.addCallbacks(dojo.hitch.apply(dojo, arguments));
		};
		this.addErrback = function(errback){
			return this.addCallbacks(null, dojo.hitch.apply(dojo, arguments));
		};
		this.addBoth = function(callback){
			var enclosed = dojo.hitch.apply(dojo, arguments);
			return this.addCallbacks(enclosed, enclosed);
		};
	};
	// Make sure we're a proper subclass of dojo/promise/Deferred
	dojo.Deferred.prototype = new Deferred;
	dojo.Deferred.prototype.constructor = dojo.Deferred;

	// Sets up the callbacks to be invoked in the future, with their return values mutating
	// the state of the deferred.
	function chain(deferred, compatiblePromise, resolvedCallback, errorCallback){
		var chainDeferred = new Deferred(compatiblePromise.cancel);
		compatiblePromise.then(resback, resback);
		return chainDeferred;

		function resback(){
			// Retrieve result and state from the deferred we're chaining.
			// Deferred state is mutable, but the compatiblePromise is not.
			var result = deferred.results[deferred.fired];
			var isError = deferred.fired == 1;

			var func = (isError ? errorCallback : resolvedCallback);
			if(func){
				try{
					var newResult = func(result);
					if(newResult && typeof newResult.then === "function"){
						newResult.then(chainDeferred.resolve, chainDeferred.reject);
						return;
					}

					// Handle mutation
					if(newResult !== undefined){
						isError = newResult instanceof Error;
						result = newResult;
					}
				}catch(e){
					isError = true;
					result = e;
				}
			}

			if(isError){
				chainDeferred.reject(result);
			}else{
				chainDeferred.resolve(result);
			}
		}
	}

	// Implement compatible handling of return values, whilst not breaking progress updates
	function transform(deferred, compatiblePromise){
		var transformDeferred = new Deferred(compatiblePromise.cancel);
		compatiblePromise.then(
				function(value){
					if(value instanceof Error){
						throw value;
					}
					deferred.fired = 0;
					deferred.results[0] = value;
					deferred.results[1] = null;
					transformDeferred.resolve(value);
				},
				null,
				function(progress){
					transformDeferred.progress(progress);
				}
		).then(null, function(error){
			if(!(error instanceof Error)){
				error = new Error(error);
			}
			deferred.fired = 1;
			deferred.results[0] = null;
			deferred.results[1] = error;
			transformDeferred.reject(error);
		});
		return transformDeferred.promise;
	}

	return dojo.Deferred;
});

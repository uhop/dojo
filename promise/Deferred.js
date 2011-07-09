define([
	"../_base/kernel",
	"../promise",
	"../has!config-detectUnhandledPromises?./promise/detectUnhandled"
], function(dojo, pmod, detectUnhandled){
	var freeze = Object.freeze || function(){};
	var undef;
	
	pmod.Deferred = function(canceller){
		var result, fulfilled, isError, waiting = [], handled;
		var deferred = this;
		var promise = this.promise = new pmod.Promise;

		detectUnhandled && detectUnhandled.register(deferred);

		// calling resolve will resolve the promise
		this.resolve = function(value){
			notifyAll(value);
			return handled;
		};

		// calling error will indicate that the promise failed
		var reject = this.reject = function(error, ignoreUnhandled){
			isError = true;
			notifyAll(error);
			if(!ignoreUnhandled && !handled && detectUnhandled){
				detectUnhandled.schedule(deferred, error);
			}
			return handled;
		};

		// call progress to provide updates on the completion of the promise
		this.progress = function(update){
			for(var i = 0, p; i < waiting.length; i++){ // `waiting` can be appended to whilst executing progress callbacks.
				p = waiting[i].progress;
				p && p(update);
			}
		};

		// provide the implementation of the promise
		this.then = promise.then = function(resolvedCallback, rejectCallback, progressCallback){
			var returnDeferred = new pmod.Deferred(promise.cancel);
			var listener = {
				resolved: resolvedCallback,
				error: rejectCallback,
				progress: progressCallback,
				deferred: returnDeferred
			};
			// Enqueue listener if we're fulfilled but still calling our own callbacks, else call immediately.
			// This behavior is undefined in the specification but is the behavior from Dojo 1.5 onwards.
			if(fulfilled && !waiting){
				notify(listener);
			}else{
				waiting.push(listener);
			}
			return returnDeferred.promise;
		};

		if(canceller){
			this.cancel = promise.cancel = function(reason){
				if(!fulfilled){
					var error = canceller(reason);
					if(error === undef){
						error = new pmod.CancelError;
					}
					if(!fulfilled){
						reject(error);
					}
				}
			};
		}

		freeze(promise);

		function notifyAll(value){
			if(fulfilled){
				throw new Error("This deferred has already been resolved");
			}
			result = value;
			fulfilled = true;
			for(var i = 0; i < waiting.length; i++){ // `waiting` can be appended to whilst executing notifying listeners.
				notify(waiting[i]);	
			}
			// If we have no listeners, and are detecting unhandled errors, add deferred to its own dependencies
			if(isError && detectUnhandled && !waiting.length){
				detectUnhandled.dependsOn(deferred, deferred);
			}
			// We're no longer processing listeners, clear the list so they can be garbage collected.
			waiting = null;
		}

		function notify(listener){
			var func = (isError ? listener.error : listener.resolved);
			if(func){
				if(!handled){
					handled = true;
					detectUnhandled && detectUnhandled.handled(deferred);
				}
				try{
					var newResult = func(result);
					if(newResult && typeof newResult.then === "function"){
						newResult.then(listener.deferred.resolve, listener.deferred.reject);
						return;
					}
					listener.deferred.resolve(newResult);
				}catch(e){
					listener.deferred.reject(e);
				}
			}else{
				if(isError){
					if(listener.deferred.reject(result, true)){
						handled = true;
					}else if(detectUnhandled){
						detectUnhandled.dependsOn(deferred, listener.deferred);
					}
				}else{
					listener.deferred.resolve(result);
				}
			}
		}
	};

	// Deferred is a subclass of Promise
	pmod.Deferred.prototype = new pmod.Promise;
	pmod.Deferred.prototype.constructor = pmod.Deferred;

	return dojo.Deferred = pmod.Deferred;
});

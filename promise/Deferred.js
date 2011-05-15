define(["../_base/kernel", "../promise", "../has!config-detectUnhandledPromises?./promise/detectUnhandled"], function(dojo, _promise_, detectUnhandled){
	var freeze = Object.freeze || function(){};
	
	// A deferred provides an API for creating and resolving a promise.
	_promise_.Deferred = function(/*Function?*/canceller){
	// summary:
	//		Deferreds provide a generic means for encapsulating an asynchronous
	//		operation and notifying users of the completion and result of the operation.
	// description:
	//		The dojo.Deferred API is based on the concept of promises that provide a
	//		generic interface into the eventual completion of an asynchronous action.
	//		The motivation for promises fundamentally is about creating a
	//		separation of concerns that allows one to achieve the same type of
	//		call patterns and logical data flow in asynchronous code as can be
	//		achieved in synchronous code. Promises allows one
	//		to be able to call a function purely with arguments needed for
	//		execution, without conflating the call with concerns of whether it is
	//		sync or async. One shouldn't need to alter a call's arguments if the
	//		implementation switches from sync to async (or vice versa). By having
	//		async functions return promises, the concerns of making the call are
	//		separated from the concerns of asynchronous interaction (which are
	//		handled by the promise).
	//
	//		The dojo.Deferred is a type of promise that provides methods for fulfilling the
	//		promise with a successful result or an error. The most important method for
	//		working with Dojo's promises is the then() method, which follows the
	//		CommonJS proposed promise API. An example of using a Dojo promise:
	//
	//		|	var resultingPromise = someAsyncOperation.then(function(result){
	//		|		... handle result ...
	//		|	},
	//		|	function(error){
	//		|		... handle error ...
	//		|	});
	//
	//		The .then() call returns a new promise that represents the result of the
	//		execution of the callback. The callbacks will never affect the original promises value.
	//
	//		Callbacks are allowed to return promises themselves, so
	//		you can build complicated sequences of events with ease.
	//
	//		The creator of the Deferred may specify a canceller.  The canceller
	//		is a function that will be called if Deferred.cancel is called
	//		before the Deferred fires. You can use this to implement clean
	//		aborting of an XMLHttpRequest, etc. Note that cancel will fire the
	//		deferred with a CancelledError (unless your canceller returns
	//		another kind of error), so the errbacks should be prepared to
	//		handle that error for cancellable Deferreds.
	// example:
	//	|	var deferred = new dojo.Deferred();
	//	|	setTimeout(function(){ deferred.resolve({success: true}); }, 1000);
	//	|	return deferred;
	// example:
	//		Deferred objects are often used when making code asynchronous. It
	//		may be easiest to write functions in a synchronous manner and then
	//		split code using a deferred to trigger a response to a long-lived
	//		operation. For example, instead of register a callback function to
	//		denote when a rendering operation completes, the function can
	//		simply return a deferred:
	//
	//		|	// callback style:
	//		|	function renderLotsOfData(data, callback){
	//		|		var success = false
	//		|		try{
	//		|			for(var x in data){
	//		|				renderDataitem(data[x]);
	//		|			}
	//		|			success = true;
	//		|		}catch(e){ }
	//		|		if(callback){
	//		|			callback(success);
	//		|		}
	//		|	}
	//
	//		|	// using callback style
	//		|	renderLotsOfData(someDataObj, function(success){
	//		|		// handles success or failure
	//		|		if(!success){
	//		|			promptUserToRecover();
	//		|		}
	//		|	});
	//		|	// NOTE: no way to add another callback here!!
	// example:
	//		Using a Deferred doesn't simplify the sending code any, but it
	//		provides a standard interface for callers and senders alike,
	//		providing both with a simple way to service multiple callbacks for
	//		an operation and freeing both sides from worrying about details
	//		such as "did this get called already?". With Deferreds, new
	//		callbacks can be added at any time.
	//
	//		|	// Deferred style:
	//		|	function renderLotsOfData(data){
	//		|		var d = new dojo.Deferred();
	//		|		try{
	//		|			for(var x in data){
	//		|				renderDataitem(data[x]);
	//		|			}
	//		|			d.resolve(true);
	//		|		}catch(e){
	//		|			d.reject(new Error("rendering failed"));
	//		|		}
	//		|		return d;
	//		|	}
	//
	//		|	// using Deferred style
	//		|	renderLotsOfData(someDataObj).then(null, function(){
	//		|		promptUserToRecover();
	//		|	});
	//		|	// NOTE: then returns the Deferred again, so we could chain
	//		|	// adding callbacks or save the deferred for later should we
	//		|	// need to be notified again.
	// example:
	//		In this example, renderLotsOfData is synchronous and so both
	//		versions are pretty artificial. Putting the data display on a
	//		timeout helps show why Deferreds rock:
	//
	//		|	// Deferred style and async func
	//		|	function renderLotsOfData(data){
	//		|		var d = new dojo.Deferred();
	//		|		setTimeout(function(){
	//		|			try{
	//		|				for(var x in data){
	//		|					renderDataitem(data[x]);
	//		|				}
	//		|				d.resolve(true);
	//		|			}catch(e){
	//		|				d.reject(new Error("rendering failed"));
	//		|			}
	//		|		}, 100);
	//		|		return d;
	//		|	}
	//
	//		|	// using Deferred style
	//		|	renderLotsOfData(someDataObj).then(null, function(){
	//		|		promptUserToRecover();
	//		|	});
	//
	//		Note that the caller doesn't have to change his code at all to
	//		handle the asynchronous case.
		var result, fulfilled, isError, waiting = [], handled;
		var deferred = this;
		var promise = this.promise = new _promise_.Promise;

		detectUnhandled && detectUnhandled.register(deferred);

		// calling resolve will resolve the promise
		this.resolve = function(value){
			// summary:
			//		Fulfills the Deferred instance successfully with the provided value
			notifyAll(value);
			return handled;
		};

		// calling error will indicate that the promise failed
		var reject = this.reject = function(error, ignoreUnhandled){
			// summary:
			//		Fulfills the Deferred instance as an error with the provided error
			isError = true;
			notifyAll(error);
			if(!ignoreUnhandled && !handled && detectUnhandled){
				detectUnhandled.schedule(deferred, error);
			}
			return handled;
		};

		// call progress to provide updates on the progress on the completion of the promise
		this.progress = function(update){
			// summary
			//		Send progress events to all listeners
			// Note: `waiting` can be appended to whilst executing progress callbacks.
			for(var i = 0; i < waiting.length; i++){
				var progress = waiting[i].progress;
				progress && progress(update);
			}
		};

		// provide the implementation of the promise
		this.then = promise.then = function(resolvedCallback, rejectCallback, progressCallback){
			// summary:
			//		Adds a fulfilledHandler, errorHandler, and progressHandler to be called for
			//		completion of a promise. The fulfilledHandler is called when the promise
			//		is fulfilled. The errorHandler is called when a promise fails. The
			//		progressHandler is called for progress events. All arguments are optional
			//		and non-function values are ignored. The progressHandler is not only an
			//		optional argument, but progress events are purely optional. Promise
			//		providers are not required to ever create progress events.
			//
			//		This function will return a new promise that is fulfilled when the given
			//		fulfilledHandler or errorHandler callback is finished. This allows promise
			//		operations to be chained together. The value returned from the callback
			//		handler is the fulfillment value for the returned promise. If the callback
			//		throws an error, the returned promise will be moved to failed state.
			//
			// example:
			//		An example of using a CommonJS compliant promise:
			//		|	asyncComputeTheAnswerToEverything().
			//		|		then(addTwo).
			//		|		then(printResult, onError);
			//		|	>44
			//
			var returnDeferred = new _promise_.Deferred(promise.cancel);
			var listener = {
				resolved: resolvedCallback,
				error: rejectCallback,
				progress: progressCallback,
				deferred: returnDeferred
			};
			// Enqueue listener if we're fulfilled but still calling our own callbacks, else call immediately.
			// This behavior is undefined in the specification but is the behavior from Dojo 1.5 and 1.6.
			if(fulfilled && !waiting){
				notify(listener);
			}else{
				waiting.push(listener);
			}
			return returnDeferred.promise;
		};

		if(canceller){
			this.cancel = promise.cancel = function(reason){
				// summary:
				//		Cancels the asynchronous operation
				if(!fulfilled){
					var error = canceller(reason);
					if(error === undefined){
						error = new _promise_.CancelError;
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
			// Note: `waiting` can be appended to whilst executing notifying listeners.
			for(var i = 0; i < waiting.length; i++){
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
	_promise_.Deferred.prototype = new _promise_.Promise;
	_promise_.Deferred.prototype.constructor = _promise_.Deferred;
	
	return dojo.Deferred = _promise_.Deferred;
});
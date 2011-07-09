define([
	"../promise",
	"./Deferred"
], function(pmod, Deferred){
	var canceller = function(){};
	
	return pmod.whenPromise = function(promiseOrValue, resolvedCallback, rejectCallback, progressCallback){
		if(promiseOrValue && typeof promiseOrValue.then === "function"){
			return promiseOrValue.then(resolvedCallback, rejectCallback, progressCallback);
		}else{
			var deferred = new Deferred(canceller);
			deferred.resolve(promiseOrValue);
			return deferred.then(resolvedCallback, rejectCallback, progressCallback);
		}
	};
});

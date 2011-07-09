define([
	"./_base/kernel"
], function(dojo){
	return dojo.when = function(promiseOrValue, resolvedCallback, rejectCallback, progressCallback){
		if(promiseOrValue && typeof promiseOrValue.then === "function"){
			return promiseOrValue.then(resolvedCallback, rejectCallback, progressCallback);
		}else{
			return resolvedCallback(promiseOrValue);
		}
	};
});

define([
	"./_base/kernel",
	"../promise",
	"./Deferred",
	"./whenPromise",
	"./resolved"
], function(dojo, pmod, Deferred, when, resolved){
	return pmod.all = function(array){
		if(!dojo.isArray(array)){
			array = dojo._toArray(arguments);
		}

		var waiting = array.length;
		if(waiting === 0){
			return resolved([]);
		}

		var promises, results = [];
		var fulfilled;
		var deferred = new Deferred(function(){
			dojo.forEach(promises, function(promise){ promise.cancel && promise.cancel(); });
			promises = results = null;
		});
		promises = dojo.map(array, function(promise, index){
			return when(promise,
					function(value){
						if(!fulfilled){
							results[index] = value;
							waiting--;
							if(waiting === 0){
								fulfilled = true;
								deferred.resolve(results);
							}
						}
					},
					function(error){
						if(!fulfilled){
							fulfilled = true;
							deferred.reject(error);
						}
					});
		});

		array = null;
		return deferred.promise;
	};
});

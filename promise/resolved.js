define([
	"../promise",
	"./Deferred"
], function(pmod, Deferred){
	return pmod.resolved = function(value){
		var deferred = new Deferred;
		deferred.resolve(value);
		return deferred.promise;
	};
});

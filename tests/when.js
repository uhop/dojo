define(["doh", "../Deferred", "../when"], function(doh, Deferred, when){
	doh.register("tests.when", [
		function whenForPromise(t){
			var deferred = new Deferred;
			var expected = {};
			deferred.resolve(expected);
			when(deferred, function(value){
				t.is(expected, value);
			}, function(){
				t.t(false, "Shouldn't call error handler");
			}, function(){
				t.t(false, "Shouldn't call progress handler");
			});
		},

		function whenForRejectedPromise(t){
			var deferred = new Deferred;
			var expected = new Error;
			deferred.reject(expected);
			when(deferred, function(){
				t.t(false, "Shouldn't call success handler");
			}, function(value){
				t.is(expected, value);
			}, function(){
				t.t(false, "Shouldn't call progress handler");
			});
		},

		function whenForPromiseWithProgress(t){
			var deferred = new Deferred;
			var expected = {}, expectedProgress = {};
			var receivedProgress;
			when(deferred, function(value){
				t.is(expectedProgress, receivedProgress);
				t.is(expected, value);
			}, function(){
				t.t(false, "Shouldn't call error handler");
			}, function(value){
				receivedProgress = value;
			});
			deferred.progress(expectedProgress);
			deferred.resolve(expected);
		},

		function whenForNonPromise(t){
			var expected = new Error;
			when(expected, function(value){
				t.is(expected, value);
			}, function(){
				t.t(false, "Shouldn't call error handler");
			}, function(){
				t.t(false, "Shouldn't call progress handler");
			});
		}
	]);
});
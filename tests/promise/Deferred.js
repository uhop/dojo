define(["doh", "../../promise/Deferred"], function(doh, Deferred){
	doh.register("tests.promise.Deferred", [
		function simpleThen(t){
			var td = new doh.Deferred();
			delay().then(function(){
				td.callback(true);
			});
			return td;
		},
		
		function thenChaining(t){
			var td = new doh.Deferred();
			var p = delay();
			var p2 = p.then(function(){
				return 1;
			});
			p3 = p2.then(function(){
				return 2;
			});
			p3.then(function(){
				p2.then(function(v){
					t.assertEqual(v, 1);
					p3.then(function(v){
						t.assertEqual(v, 2);
						td.callback(true);
					});
				});
			});
			return td;
		},
		
		function cancelThenDerivative(t){
			var def = new Deferred();
			var def2 = def.then();
			try{
				def2.cancel();
				t.t(true); // Didn't throw an error
			}catch(e){
				t.t(false);
			}
		},
		
		function cancelPromiseValue(t){
			var cancelledDef;
			var def = new Deferred(function(_def){ cancelledDef = _def; });
			def.promise.cancel();
			t.is(def, cancelledDef);
		},
		
		function backAndForthProcessThen(t){
			var def = new Deferred;
			var retval = "fail";

			def.then(null, function(){
				return "ignore error and throw this good string";
			}).then(function(){
				throw "error1";
			}).then(null, function(){
				return "ignore second error and make it good again";
			}).then(function(){
				retval = "succeed";
			});

			def.reject("");

			t.assertEqual("succeed", retval);
		},
		
		function returnErrorObjectThen(t){
			var def = new Deferred();
			var retval = "fail";

			def.then(function(){
				return new Error("returning an error should NOT work same as throwing");
			}).then(function(){
				retval = "succeed";
			});

			def.resolve();

			t.assertEqual("succeed", retval);
		}
	]);
});
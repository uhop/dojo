define(["doh", "../Deferred"], function(doh, Deferred){
	doh.register("tests.Deferred-1.4", [
		function callback(t){
			var nd = new Deferred();
			var cnt = 0;
			nd.addCallback(function(res){
				doh.debug("debug from Deferred callback");
				return res;
			});
			nd.addCallback(function(res){
				cnt+=res;
				return cnt;
			});
			nd.callback(5);
			t.assertEqual(cnt, 5);
		},

		function callback_extra_args(t){
			var nd = new Deferred();
			var cnt = 0;
			nd.addCallback(dojo.global, function(base, res){ cnt+=base; cnt+=res; return cnt; }, 30);
			nd.callback(5);
			t.assertEqual(cnt, 35);
		},

		function errback(t){
			var nd = new Deferred();
			var cnt = 0;
			nd.addErrback(function(val){
				return ++cnt;
			});
			nd.errback();
			t.assertEqual(cnt, 1);
		},

		function callbackTwice(t){
			var nd = new Deferred();
			var cnt = 0;
			nd.addCallback(function(res){
				return ++cnt;
			});
			nd.callback();
			t.assertEqual(cnt, 1);
			var thrown = false;
			try{
				nd.callback();
			}catch(e){
				thrown = true;
			}
			t.assertTrue(thrown);
		},

		function addBoth(t){
			var nd = new Deferred();
			var cnt = 0;
			nd.addBoth(function(res){
				return ++cnt;
			});
			nd.callback();
			t.assertEqual(cnt, 1);
		},

		function callbackNested(t){
			var nd = new Deferred();
			var nestedReturn = "yellow";
			nd.addCallback(function(res){
				nd.addCallback(function(res2){
					nestedReturn = res2;
				});
				return "blue";
			});
			nd.callback("red");
			t.assertEqual("blue", nestedReturn);
		},

		function cancel(t){
			var passedDeferred;
			var nd = new Deferred(function(dfd){ passedDeferred = dfd; });
			nd.cancel();
			t.is(passedDeferred, nd);
		},

		function cancelFinished(t){
			var cancelled = false;
			var nd = new Deferred(function(){ cancelled = true; });
			nd.callback("done");
			nd.cancel();
			t.f(cancelled);
		},

		function cancelChain(t){
			var cancelled = false;
			var nd = new Deferred;
			nd.callback(new Deferred(function(){ cancelled = true; }));
			nd.cancel();
			t.t(cancelled);
		},

		function cancelSilently(t){
			var nd = new Deferred;
			nd.cancel();
			t.t(nd.silentlyCancelled);
		},

		function errorResult(t){
			var def = new Deferred();
			var result = new Error("rejected");
			def.errback(result);
			t.is(def.fired, 1);
			t.is(def.results[1], result);
		},

		function backAndForthProcess(t){
			var def = new Deferred();
			var retval = "fail";

			def.addErrback(function(){
				return "ignore error and throw this good string";
			}).addCallback(function(){
				throw new Error("error1");
			}).addErrback(function(){
				return "ignore second error and make it good again";
			}).addCallback(function(){
				return retval = "succeed";
			});

			def.errback("");

			t.assertEqual(retval, "succeed");
			t.is(def.fired, 0);
			t.is(def.results[0], retval, "def.results[0]");
		},

		function returnErrorObject(t){
			var def = new Deferred();
			var retval = "fail";

			def.addCallback(function(){
				return new Error("returning an error should work same as throwing");
			}).addErrback(function(){
				retval = "succeed";
			});

			def.callback();

			t.assertEqual("succeed", retval);
		}
	]);

	doh.register("tests.Deferred-mixed-with-promise", [
		function errbackWithPromise(t){
			var def = new Deferred();
			var retval;

			def.addCallbacks(function(){}, function(err){
				return err;
			});
			def.promise.then(
					function(){ retval = "fail"; },
					function(){ retval = "succeed"; });
			def.errback(new Error);

			t.assertEqual("succeed", retval);
		}
	]);
});

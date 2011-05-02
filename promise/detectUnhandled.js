define(function(){
	// Each deferred will track the deferreds of its listeners inside `UnhandledDeferreds`.
	// When a deferred is handled, it'll remove itself. Thus, we can calculate the dependency tree
	// all the way down. If there are no deferreds in the tree then the error has been handled.
	var UnhandledDeferreds = {};
	// Count deferreds to generate unique IDs.
	var DeferredCount = 0;
	var timeout = dojo.config["promise-detectUnhandled"];

	return {
		register: function(deferred){
			deferred["-id-"] = "" + DeferredCount++;
		},

		dependsOn: function(deferred, dependency){
			var id = deferred["-id-"], dependencyId = dependency["-id-"];
			UnhandledDeferreds[dependencyId] = [];
			if(!UnhandledDeferreds[id]){
				UnhandledDeferreds[id] = [];
			}
			UnhandledDeferreds[id].push(dependencyId);
		},

		handled: function(deferred){
			delete UnhandledDeferreds[deferred["-id"]];
		},

		schedule: function(deferred, error){
			var id = deferred["-id-"];
			setTimeout(function(){
				var dependencies = UnhandledDeferreds[id] || [];
				// Keep adding to the dependencies.
				for(var i = 0; i < dependencies.length; i++){
					if(dependencies[i] !== id){
						var nested = UnhandledDeferreds[dependencies[i]];
						if(nested){
							dependencies.push.apply(dependencies, nested);
						}
					}
				}
				// Throw the error if there are dependencies, and none of the dependencies have been handled
				if(dependencies.length && dependencies.every(function(id){ return id in UnhandledDeferreds; })){
					throw error;
				}
			}, timeout);
		}
	};
});

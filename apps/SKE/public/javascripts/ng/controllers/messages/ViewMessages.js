

app.controller("ViewMessages", ['messages', function(messages){
	var view = this;
	var jsTime;
	view.allMessages = [];
	view.user = {
		jive_id: window.parent._jive_current_user.ID
	}
	
	view.all = function(u){
		messages.getAll(u).success(function(resp){
			view.allMessages = resp.messages;
			console.log(resp);
			setTimeout(function(){ gadgets.window.adjustHeight(); gadgets.window.adjustWidth(); }, 500);
		}).error(function(err){
			alert("Error getting 'messages' from factory");
			console.log(err);
		});
	}
	view.acknowledge = function(m){
		var data = {
			jive_id: window.parent._jive_current_user.ID,
			message: m.id
		}
		messages.acknowledge(data).success(function(resp){
			view.all(view.user);
		}).error(function(err){
			alert("Error!");
			console.log(err);
		});
	}

	// on page load
	view.all(view.user);

}]);
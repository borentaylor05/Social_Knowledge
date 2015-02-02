

app.controller("UnreadMessages", ['$http', '$sce', '$scope', function($http, $sce, $scope){
	// required to return clean json object
	$http.defaults.transformResponse = function(data, headers){ return util.fix(data); };
	var msgs = this;
	msgs.spaces = [];
	msgs.overlay = msgs.userInitiated = msgs.sending = false;

	msgs.getUnreadMessages = function(){
		$http.get(url.current+"/messages?user="+window.parent._jive_current_user.ID).success(function(resp){
			resp = JSON.parse(resp);
			msgs.unread = resp.messages;
			console.log(msgs.unread);
			msgs.checkUnread();
		}).error(function(err){
			alert("Error!");
			console.log(err);
		});
	}
	msgs.acknowledge = function(msg_id){
		var data = {
			user: window.parent._jive_current_user.ID,
			message: msg_id
		}
		$http.post(util.rails_env.current+"/message/acknowledge", data).success(function(resp){
			resp = JSON.parse(resp);
			msgs.unread = resp.messages;
			msgs.checkUnread();
		}).error(function(err){
			alert("Error!");
			console.log(err);
		});
	}
	msgs.openMessages = function(){
		msgs.getUnreadMessages();
		msgs.setOverlay(true);
	}
	msgs.checkUnread = function(){
		if(msgs.unread.length > 0)
			msgs.setOverlay(true);
	}
	msgs.checkInit = function(callback){
		$http.get(util.rails_env.current+"/user/check?user="+window.parent._jive_current_user.ID).success(function(resp){
			resp = JSON.parse(resp);
			console.log(resp);
			if(resp.status == 0){
				msgs.userInitiated = true;
				msgs.user = resp.user;
				msgs.client = resp.client;
			}
			else
				msgs.userInitiated = false;
			callback(resp);
		}).error(function(err){
			alert("Error!");
			console.log(err);
		});
	}
	
	msgs.goToSender = function(jive_id){
		$http.get("/api/core/v3/people/"+jive_id).success(function(resp){
			resp = JSON.parse(resp);
			 var win = window.open(resp.resources.html.ref, '_blank');
			 win.focus();
		});
	}
	msgs.setSending = function(sending){
		msgs.sending = sending;
	}


	msgs.setOverlay = function(status){
		msgs.overlay = status;
	}

	// on page load
	msgs.checkInit(function(resp){
		if(resp.status == 0){
			msgs.getUnreadMessages();
			msgs.getSpaces();
		}
		else{
			util.createUser(function(){});
		}
		setTimeout(function(){ resizeMe() }, 500);
	});
	setTimeout(function(){ resizeMe() }, 500);

}]);

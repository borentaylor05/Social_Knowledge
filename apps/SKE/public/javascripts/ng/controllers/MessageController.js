
MessageApp.controller("MessageController", ['$scope', '$sce', '$http', function($scope, $sce, $http){
	$http.defaults.transformResponse = function(data, headers){ return util.fix(data); };
	var msgs = this;
	msgs.welcome = "HELLO WORLD";
	msgs.sgs = []; 
	msgs.selectedGroups = [];
	msgs.recipients = [];
	msgs.doneSelecting = false;

	var isNextPage = function(resp){
		if(resp.list.length < 100 || !resp.links || !resp.links.next)
			return false;
		else
			return true;
	}
	var notPresent = function(id){
		if(msgs.recipients.indexOf(id) < 0 ){
			return true;
		}
		else
			return false;
	}

	var getSecGroupPeople = function(group, start, remove){
		if(start < 0)
			return;
		else{
			$http.get("/api/core/v3/securityGroups/"+group.id+"/members?count=100&startIndex="+start).success(function(resp){
				resp = JSON.parse(resp);
				for(var i = 0 ; i < resp.list.length ; i++){
					var person = resp.list[i];
					if(notPresent(person.id))
						msgs.recipients.push(person.id);
					if(remove)
						util.remove(msgs.recipients, person.id);
				}
				console.log(msgs.recipients);
				if(isNextPage(resp))
					start += 100;
				else
					start = -1;
				getSecGroupPeople(group, start, remove);
			}).error(function(err){
				alert("Error!");
				console.log(err);
			});
		}
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
	msgs.getSpaces = function(){
		switch(msgs.client.name){
			case "all":
				helper("/api/core/v3/securityGroups", 0);
			break;
		}
	}
	var helper = function(url, start){
		if(start < 0)
			return;
		else{
			$http.get(url+"?count=100&startIndex="+start).success(function(resp){
				resp = JSON.parse(resp);
				console.log(resp);
				var expectedNumber = 100;
				for(var i = 0 ; i < resp.list.length ; i++){
					var space = {
						name: resp.list[i].name,
						id: resp.list[i].id 
					}
					msgs.sgs.push(space);
				}
				if(isNextPage(resp))
					start += 100;
				else
					start = -1;
				helper(url, start);
				util.adjustHeight();
			}).error(function(err){
				start = -1; //search for spaces is complete
				helper(url, start);
				util.adjustHeight();
			//	alert("ERROR");
			//	console.log(err);
			});
		}
	}
	// if unchecked, removes from selected
	msgs.alreadyAdded = function(group){
		if(msgs.selectedGroups.indexOf(group) < 0)
			return false;
		else
			return true;
	}
	msgs.pushSelected = function(sg){
		msgs.selectedGroups = util.pushOrRemove(msgs.selectedGroups, sg); 
		util.adjustHeight();
	}
	msgs.removeGroup = function(sg, data){
		msgs.selectedGroups = util.pushOrRemove(msgs.selectedGroups, sg);
		msgs.alreadyAdded(sg);
		getSecGroupPeople(sg, 0, true);
		angular.forEach(msgs.sgs, function (secGroup) {
            secGroup.selected = false;
        });
	}
	msgs.getPeople = function(){
		var group, i;
		msgs.doneSelecting = true;
		for(i = 0 ; i < msgs.selectedGroups.length ; i++){
			group = msgs.selectedGroups[i];
			getSecGroupPeople(group, 0);
		}
	}
	msgs.setDoneSelecting = function(status){
		msgs.doneSelecting = status;
	}

	// on page load
	msgs.checkInit(function(resp){
		if(resp.status == 0){
		//	msgs.getUnreadMessages();
			msgs.getSpaces();
		}
	});
}]);
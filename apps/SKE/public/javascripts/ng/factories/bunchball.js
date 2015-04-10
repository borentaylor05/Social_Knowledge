
app.factory("bunchball", ['$http', function($http){
	var bb = {};
	user = window.parent._jive_current_user.username;
	bb.leaders = function(){
		return $http.get(util.rails_env.current+"/api/gamification/leaderboard?user="+user);
	}

	bb.missions = function(){
		return $http.get(util.rails_env.current+"/api/gamification/missions?user="+user);	
	}

	return bb;
}]);
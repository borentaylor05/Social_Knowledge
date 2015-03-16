
app.factory("maintainers", ['$http', function($http){
	var m = this;

	m.createCommentMaintainer = function(comment){
		console.log(comment.id)
		return $http.post(util.rails_env.current+"/maintainers/comment/new", { com: comment.id, user: util.currentUser })
	}

	return m;
}]);
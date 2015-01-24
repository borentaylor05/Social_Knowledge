var app = angular.module("FX", []);

app.directive("pub", function(){
	return function(scope, el, attrs){
		el.bind("click", function(){
			imgs = el.parent().parent().find('img');
			for(var i = 0 ; i < imgs.length ; i++){
				var img = angular.element(imgs[i]);
				img.removeClass("active");
			}
			el.addClass("active");
		});
	}
});

app.controller("Fairfax", ['$http', '$scope', function($http, $scope){
	var fx = this;
	fx.pubSelected = false;
	fx.view = "main";
	fx.header = "Welcome to Fairfax";
	fx.sideMenu = "care";
	fx.people = [];
	
	fx.select = function(tags){
		osapi.jive.core.get({
	        "href": "/search/people?filter=search("+tags+")",
	        "v": "v3"
	    }).execute(function(data){
	    	data = user.responseCheck(data);
	    	fx.people = data.list;
	    	$scope.$apply(fx.people);
	    });
	}

	fx.go = function(view){
		navigation.go(view);
	}
	
}]);
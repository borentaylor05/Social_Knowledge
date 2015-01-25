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
	fx.rates = [];
	fx.geos = [];
	fx.mastheads = [];
	
	fx.select = function(pub){
		fx.selected = getPubTitle(pub);
		fx.pubSelected = true;
		osapi.jive.core.get({
	        "href": "/search/contents?filter=tag("+pub+")",
	        "v": "v3"
	    }).execute(function(resp){
	    	console.log(resp)
	    	resp = user.responseCheck(resp);
	    	divvyUp(resp.list)
	    	util.adjustHeight();
	    });
	}

	fx.go = function(view){
		navigation.go(view);
	}
	
	var divvyUp = function(docs, callback){
		var tags;
		if(docs){
			for (var i = docs.length - 1; i >= 0; i--) {
				tags = docs[i].tags;
				if(tags.indexOf("fx-rates") >= 0)
					fx.rates.push(docs[i]);
				else if(tags.indexOf("fx-geos"))
					fx.geos.push(docs[i]);
				else if(tags.indexOf("fx-mastheads"))
					fx.mastheads.push(docs[i]);
			};
			$scope.$apply(fx.geos);
			$scope.$apply(fx.rates);
			$scope.$apply(fx.mastheads);
		}
	}
	var getPubTitle = function(pub){
		switch(pub){
			case "dompost":
				return "Dominion Post";
			break;
			case "manawatu-standard":
				return "Manawatu Standard";
			break;
			case "marlborough":
				return "Marlborough Express";
			break;
			case "nelson-mail":
				return "Neloson Mail";
			break;
			case "the-press":
				return "The Press";
			break;
			case "southland-times":
				return "Southland Times";
			break;
			case "smh":
				return "Sydeney Morning Herald";
			break;
			case "taranaki":
				return "Taranaki NZ";
			break;
			case "timaru-times":
				return "Timaru Times";
			break;
			case "waikato-times":
				return "Waikato Times";
			break;
		}
	}

}]);
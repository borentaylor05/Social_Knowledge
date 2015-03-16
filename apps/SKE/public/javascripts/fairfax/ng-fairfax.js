
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

app.directive("searchPlusDropdown", function(){
	return{
		restrict: "E",
		scope: {
			model: "=",
			data: "=",
			clickAction: "&"
		},
		template: 	'<div class="input-group">'+
						'<span class="input-group-btn btn btn-xs btn-success">'+
							'<i class="fa fa-search fa-2x"></i>'+
						'</span>'+
						'<input type="text" class="form-control" ng-model="model" placeholder="publication name">'+
						'<ul class="dropdown results" ng-show="model.length > 0">'+
							'<li ng-click="clickAction({param: d})" ng-repeat="d in data | filter:model">'+
								'<p> {{ d }} </p>'+
							'</li>'+
						'</ul>'+
					'</div>',
		link: function(scope,el,attrs){
			$(".dropdown, .input-group").css("z-index", "9999");
			scope.$watch('model', function(){
				if(scope.model.length > 0){
					$(".sub-overlay").removeClass("hide");
					$(".sub-overlay").on("click touch", function(e){
						e.preventDefault();
						scope.model = "";
						scope.$apply(scope.model);
					});
				}
			});
		}
	}
});

app.directive("timer", function(){
	return {
		restrict: "E",
		link: function(scope, el, attrs){
			var now = new Date(),
			    day = now.getDate(),
			    month = now.getMonth(),
			    year = now.getFullYear();

			var time = attrs.deadline.split(":"),
				hour = time[0],
				minute = time[1];

			var days, hours, minutes, seconds;
			setInterval(function () {
			    // find the amount of "seconds" between now and target
			    var target_date = new Date(year, month, day, hour, minute).getTime();
			    var current_date = new Date().getTime();
			    var seconds_left = (target_date - current_date) / 1000;
			 
			    // do some time calculations
			    days = parseInt(seconds_left / 86400);
			    seconds_left = seconds_left % 86400;
			     
			    hours = parseInt(seconds_left / 3600);
			    seconds_left = seconds_left % 3600;
			     
			    minutes = parseInt(seconds_left / 60);
			    seconds = parseInt(seconds_left % 60);
			     
			    // format countdown string + set tag value
			    el.html(hours + "h-"+ minutes + "m"); 

			    if(minutes == parseInt(attrs.alertAt) && seconds == 0 && hours == 0)
			    	alert("Deadline for "+attrs.pub+" is in "+attrs.alertAt+" minutes!"); 
			    if(minutes < 0){
			    	el.html("DL passed")
			    	el.css({ "background-color":"red", "color":"white" })
			    }
			    if(parseInt(hours) <= 0){
			    	el.css({ "background-color":"red", "color":"white" })
			    }
			 
			}, 1000);
		}
	}
});

app.factory("classifications", ['$http', function($http){
	var classifications = {};

	classifications.getByCat = function(cat){
		return $http.get(util.rails_env.current+"/fx/classifications?cat="+cat);
	}
	classifications.categories = function(){
		return $http.get(util.rails_env.current+"/fx/classifications/categories");
	}
	classifications.search = function(term){
		return $http.get(util.rails_env.current+"/fx/classifications?search="+term);	
	}

	return classifications;
}]);

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.controller("Fairfax", ['$http', '$scope', '$sce', 'classifications', function($http, $scope, $sce, classifications){
	var fx = this;
	fx.pubSelected = fx.deadlines = fx.showClass = fx.showNew = fx.postingComment = false;
	fx.currentDoc = "";
	fx.pubNameSearch = "";
	fx.rates = [],
		fx.geos = [],
		fx.cats = [],
		fx.comments = [],
		fx.marketing = [],
		fx.allDeadlines = [],
		fx.classifications = [];

	fx.getComments = function(docID){
		osapi.jive.core.get({
	        "href": "/contents/"+docID+"/comments",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp.list = resp.list.reverse();
	    	fx.testComments = resp.list;
	    	fx.currentDoc = docID;
	    	$scope.$apply(fx.testComments);
	    });
	}
	fx.setShowNew = function(){
		fx.showNew = true;
	}
	fx.setCurrentDoc = function(id){
		fx.currentDoc = id;
	}
	fx.newComment = function(body){
		fx.postingComment = true;
		var data = {
			"content": { "type": "text/html", "text": body },
			"type": "comment"
		}
		osapi.jive.core.post({
			"href": "/contents/"+fx.currentDoc+"/comments",
			"v": "v3",
			"body": data
		}).execute(function(resp){
			$("#clear").val("");
			fx.showNew = false;
			fx.getComments(fx.currentDoc);
			fx.postingComment = false;
		});
	}	

	fx.getBlockQuote = function(html){
		var start, end, length, startString, startLength;
		startString = '<blockquote class="jive-quote"';
		startLength = startString.length;
		start = html.indexOf(startString);
		end = html.indexOf("</blockquote>", start);
		length = end - start;
		return $sce.trustAsHtml(html.substring(start+startLength+1, end));
	}
	fx.getDeadlines = function(pub){
		fx.dlSelected = pub;
		$http.get(util.rails_env.current+"/fairfax/deadlines/publication?pub="+pub).success(function(resp){
			fx.allDeadlines = JSON.parse(resp).deadlines;
			fx.filter = null;
		});
	}
	fx.getByCat = function(cat){
		classifications.getByCat(cat.id).success(function(resp){
			resp = JSON.parse(resp);
			console.log(resp);
			if(status == 0)
				fx.classifications = resp.c;
		}).error(function(err){
			alert("Error getting class titles from factory.");
			console.log(err);
		});
	}
	fx.getCats = function(){
		fx.showClass = true;
		classifications.categories().success(function(resp){
			resp = JSON.parse(resp);
			if(resp.status == 0)
				fx.cats = resp.cats;
		}).error(function(err){
			alert("ERror getting cats from factory");
			console.log(err);
		});
	}
	fx.searchClass = function(term){
		fx.error = false;
		classifications.search(term).success(function(resp){
			resp = JSON.parse(resp);
			console.log(resp);
			if(status == 0)
				fx.classifications = resp.c;
			if(fx.classifications.length == 0)
				fx.error = "No results found"
		}).error(function(err){
			alert("ERror getting cats from factory");
			console.log(err);
		});
	}
	fx.clearDeadlines = function(){
		fx.allDeadlines = [];
	}
	fx.clearClass = function(){
		fx.classifications = [];
		fx.searchTerm = null;
	}
	fx.select = function(pub){
		console.log(pub);
		fx.reset(pub);
		osapi.jive.core.get({
	        "href": "/contents?filter=tag("+pub+")",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = util.responseCheck(resp);
	    	divvyUp(resp.list)
	    	util.adjustHeight();
	    });
	}
	fx.getTweets = function(){
		$http.get(util.rails_env.current+"/tweets/multiple-users").success(function(resp){
			fx.tweets = resp.tweets;
		});
	}
	fx.getPeople = function(){
		osapi.jive.core.get({
	        "href": "/people?count=10",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = util.responseCheck(resp);
	    	fx.people = resp.list;
	    	$scope.$apply(fx.people);
	    });
	}
	fx.getPubs = function(dl){
		fx.deadlines = dl;
		$http.get(util.rails_env.current+"/fairfax/publications").success(function(resp){
			if(typeof resp == "string")
				fx.pubs = JSON.parse(resp).pubs;
			else
				fx.pubs = resp.pubs;
		});
	}
	fx.setDeadlines = function(status){
		fx.deadlines = status;
	}
	fx.setShowClass = function(status){
		fx.showClass = status;
	}
	fx.goHome = function(){
		navigation.go(navigation.home());
	}
	fx.go = function(view){
		navigation.go(view);
	}
	fx.reset = function(pub){
		fx.pubNameSearch = "";
		$(".sub-overlay").addClass("hide");
		fx.selected = getPubTitle(pub);
		if(!fx.selected)
			fx.selected = pub;
		fx.pubSelected = true;
		fx.rates = [];
		fx.geos = [];
		fx.marketing = [];
	}
	fx.checkDeadlines = function(){
		if(fx.deadlines)
			fx.deadlines = false;
	}
	fx.hideResults = function(){
		fx.pubSelected = false;
	}
	var divvyUp = function(docs, callback){
		var tags;
		if(docs){
			for (var i = docs.length - 1; i >= 0; i--) {
				tags = docs[i].tags;
				if(tags.indexOf("fx-rates") >= 0)
					fx.rates.push(docs[i]);
				else if(tags.indexOf("fx-geos") >= 0)
					fx.geos.push(docs[i]);
				else if(tags.indexOf("fx-marketing") >= 0)
					fx.marketing.push(docs[i]);
			};
			console.log(fx.geos);
			$scope.$apply(fx.geos);
			$scope.$apply(fx.rates);
			$scope.$apply(fx.marketing);
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
				return "Nelson Mail";
			break;
			case "the-press":
				return "The Press";
			break;
			case "southland-times":
				return "Southland Times";
			break;
			case "smh":
				return "Sydney Morning Herald";
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
	
	// on page load
	fx.getPeople();
}]);






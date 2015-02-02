
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
			    el.html(hours + "h-"+ minutes + "m-" + seconds + "s"); 

			    if(minutes == parseInt(attrs.alertAt) && seconds == 0 && hours == 0)
			    	alert("Deadline for "+attrs.pub+" is in "+attrs.alertAt+" minutes!"); 
			    if(minutes < 0)
			    	el.html("DL passed")
			    if(parseInt(hours) == 0 && parseInt(minutes) >= 0){
			    	el.css({ "background-color":"red", "color":"white" })
			    }
			 
			}, 1000);
		}
	}
});

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.controller("Fairfax", ['$http', '$scope', '$sce', function($http, $scope, $sce){
	var fx = this;
	fx.pubSelected = fx.deadlines = false;
	fx.view = "main";
	fx.header = "Welcome to Fairfax";
	fx.sideMenu = "care";
	fx.rates = [];
	fx.geos = [];
	fx.marketing = [];
	fx.allDeadlines = [];

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
			console.log(resp);
			fx.allDeadlines = resp.deadlines;
			fx.filter = null;
		});
	}
	fx.clearDeadlines = function(){
		fx.allDeadlines = [];
	}
	fx.select = function(pub){
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
	    	console.log(fx.people);
	    	$scope.$apply(fx.people);
	    });
	}
	fx.getPubs = function(){
		fx.deadlines = true;
		$http.get(util.rails_env.current+"/fairfax/publications").success(function(resp){
			fx.pubs = resp.pubs;
		});
	}
	fx.setDeadlines = function(status){
		fx.deadlines = status;
	}
	fx.go = function(view){
		navigation.go(view);
	}
	fx.reset = function(pub){
		fx.selected = getPubTitle(pub);
		fx.pubSelected = true;
		fx.rates = [];
		fx.geos = [];
		fx.marketing = [];
	}
	fx.checkDeadlines = function(){
		if(fx.deadlines)
			fx.deadlines = false;
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
	
	// on page load
	fx.getPeople();

}]);
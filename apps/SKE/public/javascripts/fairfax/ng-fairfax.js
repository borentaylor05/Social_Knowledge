
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
			clickAction: "&",
			isCare: "@"
		},
		template: 	'<div class="input-group">'+
						'<span class="input-group-btn btn btn-xs btn-success">'+
							'<i class="fa fa-search fa-2x"></i>'+
						'</span>'+
						'<input type="text" class="form-control" ng-model="model" placeholder="publication name">'+
						'<ul class="dropdown results" ng-show="model.length > 0">'+
							'<li ng-click="clickAction({param: d, care: isCare})" ng-repeat="d in data | filter:model">'+
								'<p> {{ d.name }} </p>'+
							'</li>'+
						'</ul>'+
					'</div>',
		link: function(scope,el,attrs){
			$(".dropdown, .input-group").css("z-index", "9999");
			scope.$watch('model', function(){
				if(scope.model.length > 0){
					$("#sub-overlay-unique").removeClass("hide");
					$("#sub-overlay-unique").on("click touch", function(e){
						e.preventDefault();
						scope.model = "";
						scope.$apply(scope.model);
					});
				}
				else
					$("#sub-overlay-unique").addClass("hide");
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

app.controller("Fairfax", ['$http', '$scope', '$sce', 'classifications', 'suburbs', 'redeliveries', function($http, $scope, $sce, classifications, suburbs, redeliveries){
	var fx = this;
	fx.pubSelected = fx.deadlines = fx.showClass = fx.showNew = fx.postingComment = fx.showDocOverlay = fx.inited = false;
	fx.loading = {
		otherPubs: false,
		subs: false,
		cpts: false
	};
	fx.currentDoc = "";
	fx.pubNameSearch = "";
	fx.rates = [],
		fx.geos = [],
		fx.cats = [],
		fx.cpts = [],
		fx.redPubs = [],
		fx.subPubs = [],
		fx.sameSub = [],
		fx.comments = [],		
		fx.marketing = [],
		fx.tagPrefix = "",
		fx.allDeadlines = [],
		fx.currentSuburb = {},
		fx.selectedRedPub = {},
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
	fx.getPublication = function(id){
		$http.get(util.rails_env.current+"/fx/api/publication/"+id).success(function(resp){
			resp = util.fixResp(resp);
			fx.selected = resp.publication;
			fx.pricing = resp.pricing;
			if(resp.ses)
				fx.ses = resp.ses;
			else
				fx.ses = null;
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
			if(status == 0)
				fx.classifications = resp.c;
		}).error(function(err){
			alert("Error getting class titles from factory.");
		//	console.log(err);
		});
	}
	fx.getCats = function(){
		fx.showClass = true;
		classifications.categories().success(function(resp){
			resp = JSON.parse(resp);
			if(resp.status == 0)
				fx.cats = resp.cats;
		}).error(function(err){
			alert("Error getting categories from factory");
		//	console.log(err);
		});
	}
	fx.searchClass = function(term){
		fx.error = false;
		classifications.search(term).success(function(resp){
			resp = JSON.parse(resp);
			if(status == 0)
				fx.classifications = resp.c;
			if(fx.classifications.length == 0)
				fx.error = "No results found"
		}).error(function(err){
			alert("ERror getting cats from factory");
			//console.log(err);
		});
	}
	fx.clearDeadlines = function(){
		fx.allDeadlines = [];
	}
	fx.clearClass = function(){
		fx.classifications = [];
		fx.searchTerm = null;
	}
	fx.getSubPubs = function(sub){
		fx.currentSuburb = sub;
		suburbs.getSubPublications(sub.id).success(function(resp){
			if(typeof resp == "string")
				resp = JSON.parse(resp);
			fx.sameSub = resp.publications;
		});
	}
	fx.select = function(pub, care){
		fx.otherPubs = [];
		fx.sameSub = [];
		fx.inited = true;
		fx.selected = pub;
		fx.showSubName = null;
		fx.loading.cpts = fx.loading.subs = true;
		fx.tagPrefix = pub.name.split(" ").join("-").toLowerCase();
		if(!care){
			fx.getSuburbs(pub.id);
			fx.getCPTs(pub.id);
		}
		else
			fx.getPublication(pub.id);
		fx.reset(pub);
		fx.getCategories();
	}
	fx.getCategories = function(){
		var cats = ['system', 'process', 'billing', 'geos', 'marketing', 'rates'];
		for(var i = 0; i < cats.length ; i++){
			fx.getDocs(cats[i]);
			fx.getGeneral(cats[i]);
		}
	}
	fx.getDocs = function(category){
		osapi.jive.core.get({
	        "href": "/contents?filter=tag("+fx.tagPrefix+"-"+category+")",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = util.responseCheck(resp);
	    	// you don't know which will finish first, so merge the arrays if length > 0
	    	if(fx[category].length == 0)
	    		fx[category] = resp.list;
	    	else
	    		fx[category].merge(resp.list)
	    	console.log("For "+category, fx[category])
	    	util.adjustHeight();
	    });
	}
	fx.getGeneral = function(category){
		osapi.jive.core.get({
	        "href": "/contents?filter=tag(nz-care-all-"+category+")",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = util.responseCheck(resp);
	    	// you don't know which will finish first, so merge the arrays if length > 0
	    	if(fx[category].length == 0)
	    		fx[category] = resp.list;
	    	else
	    		fx[category].merge(resp.list)
	    	console.log("For "+category, fx[category])
	    	util.adjustHeight();
	    });
	}
	fx.getLeaders = function(lob){
		$http.get(util.rails_env.current+"/api/gamification/leaderboard?user="+window._jive_current_user.id).success(function(resp){
			resp = util.fixResp(resp);
			fx.leaders = resp.leaders;
		});
	}
	fx.getTopThree = function(){
		$http.get(util.rails_env.current+"/api/gamification/"+window._jive_current_user.id+"/top-three").success(function(resp){
			if(resp.status == 0){
				fx.top_three = resp.missions;
			}
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
	// gets publications for deadlines
	fx.getPubs = function(dl){
		fx.deadlines = dl;
		$http.get(util.rails_env.current+"/fairfax/publications").success(function(resp){
			if(typeof resp == "string")
				fx.pubs = JSON.parse(resp).pubs;
			else
				fx.pubs = resp.pubs;
		});
	}
	// gets publications for suburbs
	fx.getSuburbPublications = function(){
		fx.loading.otherPubs = true;
		suburbs.getPublications().success(function(resp){
			fx.subPubs = resp.pubs;
			fx.loading.otherPubs = false;
		});
	}
	fx.getSuburbs = function(pub_id){
		suburbs.get(pub_id).success(function(resp){
			resp = util.fixResp(resp);
			fx.selected = resp.publication;
			fx.suburbs = resp.suburbs;
			fx.loading.subs = false;
		});
	}
	fx.getCPTs = function(pub_id){
		suburbs.getCPTs(pub_id).success(function(resp){
			resp = util.fixResp(resp);
			fx.cpts = resp.cpts;
			fx.loading.cpts = false;
		});
	}
	fx.suburbSearch = function(name){
		suburbs.search(name).success(function(resp){
			resp = util.fixResp(resp);
			fx.suburbs = resp.matches;
			fx.selected = {};
			fx.sameSub = [];
			fx.showSubName = name+" (suburb)"
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
		// fx.selected = pub;
		// if(!fx.selected)
		// 	fx.selected = pub;
		// fx.pubSelected = true;
		// fx.rates = [];
		// fx.geos = [];
		// fx.marketing = [];
	}
	fx.checkDeadlines = function(){
		if(fx.deadlines)
			fx.deadlines = false;
	}
	fx.hideResults = function(){
		fx.suburbs = [];
		fx.pubSelected = false;
	}
	fx.getRedPubs = function(){
		fx.showSearchOverlay = true;
		fx.overlayView = 'redelivery';
		fx.currentRedWindow = 'pubs';
		redeliveries.publications().success(function(resp){
			resp = util.fixResp(resp);
			fx.redPubs = resp.publications;
		});
	}
	fx.getRedelivery = function(red){
		redeliveries.getRedelivery(red.id).success(function(resp){
		//	console.log(resp);
		});
	}
	fx.setRedWindow = function(view){
		fx.currentRedWindow = view;
	}
	fx.getPubRedeliveries = function(pub){
		fx.currentRedWindow = 'reds';
		fx.selectedRedPub = pub;
		redeliveries.getPubRedeliveries(pub.id).success(function(resp){
			resp = util.fixResp(resp);
			fx.redeliveries = resp.redeliveries;
		});
	}
	fx.searchRed = function(term){
		redeliveries.search(term).success(function(resp){
			resp = util.fixResp(resp);
			fx.redeliveries = resp.matches;
			fx.currentRedWindow = 'reds';
		});
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
	// url = doc.resources.html
	var getDocNum = function(doc){
		var parts = doc.resources.html.split("/");
		return parts[parts.length-1];
	}
	
	// on page load
	fx.getTopThree();
	// fx.getPeople();
//	setTimeout(function(){ fx.getLeaders() }, 2000);
}]);






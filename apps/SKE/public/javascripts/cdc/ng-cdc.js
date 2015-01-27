var cdcApp = angular.module("CDC", ['ngSanitize']);

cdcApp.directive("opendoc", function(){
	return function(scope, element, attrs){
		element.bind("click", function(){
			$(".doc-container").empty();
			$(".overlay").removeClass("hide");
			util.get_doc_html(util.fixDocNum(attrs.opendoc), function(id){
				util.adjustHeight();
				$(".main").click(function(e){
					e.preventdefault();
					$(".overlay").addClass("hide");
					$(".main").unbind("click"); // remove handler so you can reopen overlay
				});
			});
		});
	};
});

cdcApp.directive("overlay", function(){
	return {
		restrict: "E",
		template: '<div class="overlay hide"><i class="fa fa-close fa-3x pull-right pointer"></i><div class="doc-container"></div></div>',
		link: function(scope, element, attrs){
				element.find("i").first().css({ "color":attrs.closeColor });
				element.find("i").first().bind("click", function(){
					$(".overlay").addClass("hide");
				});
			}
	}
		
});

cdcApp.directive("elWidth", function(){
	return function(scope, el, attrs){
		el.css("width", attrs.elWidth);
	}
});


cdcApp.controller("cdcController", ['$http', '$scope', function($http, $scope){
	var cdc = this;
	cdc.topics = [];
	cdc.prs = [];
	cdc.currentTopic = {};
	cdc.currentEntry = {};

	cdc.getAllTopics = function(start, end){
		$http.get(util.rails_env.current+"/cdc/api/get-range?start="+start+"&end="+end).success(function(resp){
			cdc.topics = resp.topics;
		});
	}
	cdc.searchTopics = function(term){
		$http.get(util.rails_env.current+"/cdc/api/search?search="+term).success(function(resp){
			cdc.topics = resp.topics;
		});
	}
	cdc.getTopic = function(topic){
		if(cdc.currentTopic == topic)
			cdc.currentTopic = {};
		else{
			cdc.currentTopic = topic;
			$http.get(util.rails_env.current+"/cdc/api/topic?id="+topic.id).success(function(resp){
				cdc.topicInfo = resp.topic;
			});
		}
	}
	cdc.getEntries = function(){
		$http.get(util.rails_env.current+"/cdc/address-book").success(function(resp){
			cdc.entries = resp.entries;
		});
	}
	cdc.getEntry = function(entry){
		if(cdc.currentEntry == entry)
			cdc.currentEntry = {};
		else{
			cdc.currentEntry = entry;
			$http.get(util.rails_env.current+"/cdc/address-book/entry?id="+entry.id).success(function(resp){
				cdc.entryInfo = resp.entry;
			});
		}
	}
	cdc.prSearch = function(pr){
		osapi.jive.core.get({
	        "href": "search/contents?filter=search("+pr+")",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = user.responseCheck(resp);
	    	cdc.prs = resp.list;
	    });
	}
	cdc.isCurrentTopic = function(topic){
		if(topic == cdc.currentTopic)
			return true;
		else
			return false;
	}
	cdc.isCurrentEntry = function(entry){
		if(entry == cdc.currentEntry)
			return true;
		else
			return false;
	}

	cdc.close = function(input){
		switch(input){
			case "ab":
				$scope.ab = null;
			break;
			case "atoz":
				cdc.topics = [];
			break;
			case 'pr':
				cdc.pr = [];
			break;
		}
	}

	// on page load
	cdc.getEntries();

}]);





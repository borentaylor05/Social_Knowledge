
var app = angular.module("App", ['ngSanitize']);

app.filter('capitalize', function() {
	return function(input, all) {
		return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
	}
});

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.filter('parseUrlFilter', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return function (text, target, otherProp) {
        return text.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>');
    };
});

app.directive("opendoc", function(){
	return {
		scope: {
			getComments: "&"
		},
		link: function(scope, element, attrs){
			element.bind("click", function(){
				$(".doc-container, .coms").empty();
				$(".overlay, .sub-overlay").removeClass("hide");
				util.get_doc_html(util.fixDocNum(attrs.opendoc), function(id){
					util.adjustHeight();
					scope.getComments({doc: id});
				});
			});
		}
	} 
});

app.directive("checkWidth", function(){
	return function(scope, el, attrs){
		if(window.parent.location.href.indexOf("localhost") < 0){
			el.css({
				"margin-left": "-80px",
				"width": "116%"
			});
		}
	}
});

app.directive("loader", function(){
	return {
		restrict: "E",
		scope: {
			loading: "=", // boolean that determines whether to show spinner
			size: "@"
		},
		template: '<i ng-show="loading" class="fa fa-circle-o-notch fa-spin"></i>',
		link: function(scope, el, attrs){
			console.log("Loading", scope.loading);
			el.css("font-size", scope.size);
		}
	}
});

app.directive("loaderCurrent", function(){
	return {
		restrict: "E",
		scope: {
			loading: "=", // boolean that determines whether to show spinner
			size: "@",
			showIf: "="
		},
		template: '<i ng-show="showIf && loading" class="fa fa-circle-o-notch fa-spin"></i>',
		link: function(scope, el, attrs){
			el.css("font-size", scope.size);
		}
	}
});

app.directive("unreadMessages", function(){
	var blank = "_blank";
	return{
		restrict: "E",
		template: '<div ng-controller="UnreadMessages as msgs" >'+
		'<div class="msg-overlay container" ng-if="msgs.overlay">'+
			'<button type="button" class="btn btn-danger pull-right" ng-click="msgs.setOverlay(false)">'+
  				'<i class="fa fa-close"></i>'+
			'</button>'+
			'<h2> You have {{ msgs.unread.length }} unread {{ msgs.unread.length > 1 ? "announcements" : "announcement" }} </h2>'+
			'<div ng-if="msgs.unread.length == 0" class="alert alert-success">'+
				'<h3>No Unread Announcements</h3>'+
				'<p>To view old messages go to: Create -> View Announcements </p>'+
				'<my-image route="view_messages.png"></my-image>'+
			'</div>'+
			'<div class="row container" ng-repeat="m in msgs.unread">'+
				'<h4>'+
					'{{ m.sender.name ? "Sender Name: " : "Sender ID: " }}'+
					'<a target="_blank" ng-href="/people/{{m.sender.employee_id}}"> {{ m.sender.name ? m.sender.name : m.sender.employee_id }} </a>'+
				'</h4>'+
				'<div class="msg-body"> '+
					'<p ng-bind-html="m.text | unsafe"></p>'+
					'<button class="btn btn-xs btn-success" ng-click="msgs.acknowledge(m)">Acknowledge</button>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'</div>'
	}
});

app.directive("myImage", function($compile){
	var base = "//localhost:8080/gadgets/proxy?container=default&gadget=http://localhost:8090/osapp/SKE/app.xml&debug=1&nocache=1&html_tag_context=img&url=http://localhost:8090/osapp/SKE/images/";
	var makeTemplate = function(route){
		return '<img class="screenshot" src="'+base+route+'">';
	}
	var linker = function(scope, el, attrs){
		el.html(makeTemplate(scope.route)).show();
		console.log(makeTemplate(scope.route));
		$compile(el.contents())(scope);
	}
	return {
		restrict: "E",
		scope: {
			route: "@"
		},
		link: linker
	}
});

app.directive("overlayTwo", function($http){
	return {
		restrict: "E",
		scope: {
			comments: "=",
			showNew: "=",
			setShowNew: "&",
			newComment: "&",
			loading: "="
		},
		template:   '<div class="sub-overlay hide"></div>'+
					'<div class="overlay hide">'+
					//	'<i class="fa fa-close fa-3x pull-right pointer"></i>'+
						'<div class="row" >'+
							'<div class="col-xs-9 doc-container">'+
							'</div>'+
							'<div class="col-xs-3 com-container">'+
							'<div class="text-center"><h4>Comments</h4>'+
							'<button class="btn btn-xs btn-info" ng-hide="showNew" ng-click="setShowNew()">New Comment</button></div>'+
							'<div class="text-center" id="nc" ng-if="showNew"><textarea placeholder="type comment here..." ng-model="data.body" class="form-control" id="clear"></textarea><button class="btn btn-success btn-xs" ng-click="newComment({body: data.body})">Submit</button><i ng-if="loading" class="fa fa-circle-o-notch fa-spin loader-xs"></i></div>'+
							'<div ng-repeat="c in comments" class="comment">'+
								'<h5>By <a target="_blank" ng-href="{{c.author.resources.html.ref}}">{{c.author.displayName}}</a></h5>'+
								'<div class="date">at {{ c.publishedTime }} {{ c.publishedCalendarDate }} </div>'+
								'<div class="body" ng-bind-html="c.content.text | unsafe">  </div>'+
							'</div>'+
							'</div>'+
						'</div>'+
					'</div>',
		link: function(scope, element, attrs){
				$(".sub-overlay").on("click touch", function(e){
					$(this).addClass("hide");
					$(".overlay").addClass("hide");
				});
			}
	}
		
});

app.directive("overlay", function(){
	return {
		restrict: "E",
		template: '<div class="sub-overlay hide"></div><div class="overlay hide"><i class="fa fa-close fa-3x pull-right pointer"></i><div class="doc-container"></div></div>',
		link: function(scope, element, attrs){
				element.find("i").first().css({ "color":attrs.closeColor });
				element.find("i").first().bind("click", function(){
					$(".overlay, .sub-overlay").addClass("hide");
				});
				$(".sub-overlay").on("click touch", function(e){
					$(this).addClass("hide");
					$(".overlay").addClass("hide");
				});
			}
	}
		
});

app.directive("jsTime", function(){
	return function(scope, el, attrs){
		var d = new Date(parseInt(attrs.jsTime));
		el.html("Acknowledged "+d);
	}
});

app.factory("messages", ['$http', function($http){
	var messages = {};

	messages.getAll = function(u){
		return $http.get(util.rails_env.current+"/messages/all?user="+u.jive_id);
	}
	messages.acknowledge = function(data){
		return $http.post(util.rails_env.current+"/message/acknowledge", data);
	}

	return messages;
}]);




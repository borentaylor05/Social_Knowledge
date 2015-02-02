
var app = angular.module("App", ['ngSanitize']);

app.filter('capitalize', function() {
	return function(input, all) {
		return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
	}
});

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.directive("opendoc", function(){
	return function(scope, element, attrs){
		element.bind("click", function(){
			$(".doc-container").empty();
			$(".overlay").removeClass("hide");
			util.get_doc_html(util.fixDocNum(attrs.opendoc), function(id){
				util.adjustHeight();
			/*	$(".main").click(function(){
					$(".overlay").addClass("hide");
					$(".main").unbind("click"); // remove handler so you can reopen overlay
				});
			*/
			});
		});
	};
});

app.directive("overlay", function(){
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

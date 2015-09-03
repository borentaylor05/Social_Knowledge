var app = angular.module("App", []);

app.directive("skeheader", function(){
	return {
		restrict: "E",
		template: templates.skeheader
	}
});

app.directive("mngside", function(){
  return {
    restrict: "E",
    transclude: true,
    template: templates.manage_sidebar,
    link: function(){
      navigation.init(gadgets.views.getParams(), function(){
        navigation.makeLinks(); 
      });
    }
  }
});

app.directive("overlayclose", function(){
	return {
		restrict: "E",
		template: "<a style='cursor:pointer;' ><i class='fa fa-close fa-4x pull-right'></i></a> ",
		link: function(scope, element, attrs){
			element.bind("click", function(e){
				e.preventDefault();
				$(".overlay").addClass("hide");
			});
		}
	}
});

app.directive("opendoc", function(){
	return function(scope, element, attrs){
		element.bind("click", function(){
			$(".overlay").removeClass("hide");
			util.get_doc_html(util.fixDocNum(attrs.opendoc), function(id){
				util.adjustHeight();
			});
		});
	};
});

app.directive("showInput", function($compile, $parse){
  var reply = '<button class="btn btn-sm btn-success">Reply to This Comment</button>',
    comment = '<button class="btn btn-sm btn-primary">Comment on this Doc</button>';

  var getTemplate = function(type){
    if(type == 'update')
      return false;
    else
      return type == "issue" ? reply : comment;
  }

  return {
        scope: { fxn: '&' },
        link: function(scope, element, attrs) {
            element.html(getTemplate(attrs.showInput)).show();
            $compile(element.contents())(scope);
            element.bind("click touch", function(e){
              e.preventDefault();
              scope.fxn(); 
            });
        },
    }
});

app.filter('capitalize', function() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
  }
});

app.controller('PostsController', ['$http', '$scope', function($http, $scope) {
  var posts = this;
  posts.commenting = false;
  posts.current = {};
  var client = gadgets.views.getParams().my.extendedProperties.client;
  $http.get(util.rails_env.current+"/posts?client="+client).success(function(data){
  	posts.all = data;
  	console.log(data);
  });

  posts.btnClass = "btn btn-sm btn-info";
  posts.iconClass = "fa fa-github";
  posts.btnText = "Resolve";

  posts.resolve = function(post){
    posts.btnClass = "btn btn-sm btn-success";
    posts.iconClass = "fa fa-check-square";
    posts.btnText = "Resolved";
    posts.undo = true;
    gadget_helper.post(util.rails_env.current+"/issue/resolve", {id: post.post_id, resolved_by: gadgets.views.getParams().my.id}, function(data){
      console.log(data);
    }); 
  }

  posts.comment = function(post) {
    if(posts.cur == post)
      posts.cur = {};
    else
      posts.cur = post;
    posts.commenting = true;
    $scope.$apply(posts.commenting)
  }

  posts.unresolve = function(post){
    posts.btnClass = "btn btn-sm btn-info";
    posts.iconClass = "fa fa-github";
    posts.btnText = "Resolve";
    posts.undo = false;
    gadget_helper.post(util.rails_env.current+"/issue/unresolve", {id: post.post_id}, function(data){
      console.log(data);
    }); 
  }

  posts.getClass = function(type){
  	switch(type){
    	case "content":
    		return "fa fa-file-text-o";
    	break;
    	case "update":
    		return "fa fa-quote-left";
    	break;
      case "issue":
        return "fa fa-bullhorn";
      break;
    }
  }
  posts.isLink = function(type){
  	if(type === "update")
  		return false;
  	else
  		return true;
  }
  posts.isIssue = function(type){
  	if(type === "issue")
  		return true;
  	else
  		return false;
  }
}]);

app.controller('RequestController', ['$http', function($http) {
  var request = this;
  request.revision = false;
  request.newContent = false;
  request.currentType = "";

  request.setType = function(type){
    switch(type){
      case "revision":
        request.currentType = "Revise Existing Content";
        request.newContent = false;
        request.revision = true;
      break;
      case "new":
        request.currentType = "Create New Content";
        request.revision = false;
        request.newContent = true;
      break;
    }
  }

  request.submitRequest = function(){
    if(request.revision){
      var req = {
        type: "revision",
        docNum: $("#docNum").val(),
        summary: $("#summary").val(),
        client: gadgets.views.getParams().my.extendedProperties.client
      }
      gadget_helper.post(util.rails_env.current+"/request/revision", req, function(data){
        console.log(data);
      });
    }
    else if(request.newContent){
      var req = {
        type: "new",
        docTitle: $("#docTitle").val(),
        summary: $("#summary").val(),
        client: gadgets.views.getParams().my.extendedProperties.client
      }
      gadget_helper.post(util.rails_env.current+"/request/new-content", req, function(data){
        console.log(data);
      });
    }
  }

}]);

app.controller('QueueController', ['$http', function($http) {
  var q = this;
  q.currentType = "all"
  var client = gadgets.views.getParams().my.extendedProperties.client;
  $http.get(util.rails_env.current+"/requests?client="+client).success(function(data){
    q.all = data;
    console.log(q.all);
  });

  q.setCurrentType = function(type){
    q.currentType = type;
  }

  q.isCorrectType = function(request){
    if(q.currentType === "all"){
      return true;
    }
    else if(q.currentType === request.request_type){
      return true;
    }
    else
      return false;
  }

}]);


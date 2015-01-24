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

app.controller("Publish", ['$http', function($http){
    $http.defaults.transformResponse = function(data, headers){ return util.fix(data); };
    $http.get("/api/core/v3/contents/1048").success(function(data){
        data = JSON.parse(data);
        console.log(data);
        data.parent = "http://localhost:8080/api/core/v3/places/1002";
        $http.put("http://localhost:8080/api/core/v3/contents/1048", data).success(function(data){
            data = JSON.parse(data);
            console.log(data);
        });
    });
}]);
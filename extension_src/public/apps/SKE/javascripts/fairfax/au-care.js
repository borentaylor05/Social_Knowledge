
function toggle(v){
	v = !v;
}

app.controller("AuCare", function($scope){
	var au = this;
	au.currentView = "";
	au.genDocs = "";
	au.tagPrefix = "au-care-all"; // initialize pub to all
	au.categories = ['marketing'];
	au.showBPP = false;

	au.globalCatsRow1 = templates.auCare.globalCatsRow1;
	au.globalCatsRow2 = templates.auCare.globalCatsRow2;
	au.generalDocsRow1 = templates.auCare.generalDocsRow1;
	au.generalDocsRow2 = templates.auCare.generalDocsRow2;
	au.generalDocsRow3 = templates.auCare.generalDocsRow3;

	au.shouldShowView = function(view){
		if(view == 'careView' && au.currentView == 'careView')
			return true;
		else if(view == 'genDocs' && au.currentView == 'careView' && au.genDocs)
			return true;
		return false;
	};

	au.setCurrentView = function(view){
		au.currentView = view;
		util.adjustHeight();
	};
	au.setGenDocs = function(pub){
		au.genDocs = pub;
		if(pub === 'age' || pub === 'smh')
			toggle(au.showBPP);
		else
			au.showBPP = false;
		au.select(pub);
		util.adjustHeight();
	};
	au.go = function(view){
		navigation.go(view);
	};
	au.select = function(pub){
		au.resetDocs(function(){
			au.tagPrefix = "au-care-"+pub;
			au.getCategories();
		});		
	};
	au.getCategories = function(){
		for(var i = 0 ; i < au.categories.length ; i++){
			au.getDocs(au.categories[i]);
		}
	};
	au.getDocs = function(category){
		osapi.jive.core.get({
	        "href": "/contents?filter=tag("+au.tagPrefix+"-"+category+")&count=50&sort=dateCreatedDesc",
	        "v": "v3"
	    }).execute(function(resp){
	    	resp = util.responseCheck(resp);
	    	// you don't know which will finish first, so merge the arrays if length > 0
	    	if(au[category] && au[category].length > 0){
	    		au[category].push.apply(au[category], resp.list);	    		
	    	}
	    	else{
	    		au[category] = resp.list;
	    	}
	    	console.log("For: "+au.tagPrefix+"-"+category, au[category]);
	    	$scope.$apply(au[category]);
	    	util.adjustHeight();
	    });
	};
	au.resetDocs = function(cb){
		for(var i = 0 ; i < au.categories.length ; i++){
			au[au.categories[i]] = [];
		}
		cb();
	};

	au.getCategories();

});
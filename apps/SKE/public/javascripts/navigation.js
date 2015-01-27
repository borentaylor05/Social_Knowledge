var navigation = {
	user: {},
	history: [],
	init: function(params, callback){
		var hash = this.getHash();
		this.user = params.my;
		if(typeof params.history !== 'undefined')
			this.history = params.history;
		$(window.parent).bind("hashchange", function(e){
			var newHash = navigation.getHash();
			if(navigation.views.valid(newHash))
				navigation.go(newHash);
			else{
				navigation.setHash(navigation.currentView());
			}
		});
		if(this.views.valid(hash)){
			this.go(hash);
		}
		else{
			this.setHash(this.currentView());
		}
		this.loadNavigation(this.user);
		callback();
	},
	getHash: function(){
		if(window.parent.location.hash.length > 0)
			return window.parent.location.hash.slice(1);
		else 
			return false;
	},
	setHash: function(hash){
		window.parent.location.hash = hash;
	},
	followHash: function(user){
		var hash = this.getHash();
		if(hash && hash.length > 0 && this.isAuthorized(this.user)){
			this.go(hash);
		}
	},
	makeLinks: function(){
		$(".link").each(function(){
			$(this).on("click touch", function(e){
				e.preventDefault();
				var view = $(this).attr("data-view");
				if(view.length > 0){
					navigation.go(view);
				}
			});
		});
	},
	loadNavigation: function(user){
		$(".navList").append(this.navListItem("Home", this.home()));
		if(user.extendedProperties.siteManager){
			$(".navList").append(this.navListItem("Create Post", "new-post"));
			$(".navList").append(this.navListItem("Manage Docs", "manage-docs"));
			$(".navList").append(this.navListItem("Manage Users", "manage-users"));
			$(".navList").append(this.navListItem("Test", "test"));
			$(".navList").append(this.navListItem("Request", "request"));
			$(".navList").append(this.navListItem("Request Queue", "request-queue"));
			$(".navList").append(this.navListItem("Publish", "publish"));
		}
		switch(user.extendedProperties.client){
			case "all":
				//alert("Works too");
			break;
		}
		// insert breadcrumbs
		for(var i = 0 ; i < this.history.length ; i++){
			var crumb = this.history[i];
			var fxn = "navigation.go('"+crumb+"');";
			$(".breadcrumb").append("<li><a onclick="+fxn+" href='#'>"+crumb+"</a></li>");
		}
	},
	navListItem: function(text, view, c, id){
		if(view == this.currentView())
			c = "link active "+c;
		else
			c = "link "+c;
		return "<li><a data-view='"+view+"' href='#' class='"+c+"' id='"+id+"'>"+text+"</li>";
	},
	currentView: function(){
		return this.history[this.history.length-1];
	},
	home: function(){
		if(this.user.extendedProperties.siteManager && this.user.extendedProperties.client == "all"){
			return "manager-home";
		}
	},
	go: function(view){
		this.setHash("");
		if($.inArray(view, this.history) < 0)
			this.history.push(view);
		else{
			this.history.splice(this.history.indexOf(view) + 1);
		}
	//	console.log(this.history);
		gadgets.views.requestNavigateTo(view, {my: this.user, history: this.history});
	},
	isAuthorized: function(user){
		return true;
	},
	views: {
		valid: function(view){
			if(navigation.views.hasOwnProperty(view) && view.length > 0 && navigation.currentView() != view )
				return true;
			else
				return false;
		},
		"manager-home": {
			auth: ['all']
		},
		"manage-docs": { 
			auth: ['all']
		},
		"manage-users": {
			auth: ['all']
		},
		"fx-home":{
			auth: ['all']
		},
		"nz-sales-home":{
			auth: ['all']
		},
		"cdc-home":{
			auth: ['all']
		},
		"test":{
			auth: ['all']
		}
	}
}
var navigation = {
	user: {},
	history: [],
	init: function(params, callback){
		this.user = params.my;
		if(typeof params.history !== 'undefined')
			this.history = params.history;
		this.loadNavigation(this.user);
		callback();
	},
	makeLinks: function(){
		$("a").each(function(){
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
		}
		switch(user.extendedProperties.client){
			case "all":
				//alert("Works too");
			break;
		}
		// insert breadcrumbs
		for(var i = 0 ; i < this.history.length ; i++){
			var crumb = this.history[i];
			$(".breadcrumb").append("<li><a href='#' data-view='"+crumb+"'>"+crumb+"</a></li>");
		}
	},
	navListItem: function(text, view, c, id){
		console.log(this.currentView());
		if(view == this.currentView())
			c = "active";
		return "<li><a data-view='"+view+"' href='#' class='"+c+"' id='"+id+"'>"+text+"</li>";
	},
	currentView: function(){
		return this.history[this.history.length-1];
	},
	home: function(){
		if(this.user.extendedProperties.siteManager){
			return "manager-home";
		}
	},
	go: function(view){
		if($.inArray(view, this.history) < 0)
			this.history.push(view);
		else{
			console.log(this.history.splice(this.history.indexOf(view) + 1));
		}
		console.log(this.history);
		gadgets.views.requestNavigateTo(view, {my: this.user, history: this.history});
	}
}
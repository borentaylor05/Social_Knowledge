var util = {
	isEmpty: function(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }
    	return true;
	},
	fix: function(data){
		return data.replace(/^throw [^;]*;/, '');
	},
	fixDocNum: function(doc_id){
		if(doc_id.indexOf("DOC") >= 0)
			return doc_id.substring(4);
		else
			return doc_id;
	},
	adjustHeight: function(){
		setTimeout(function(){
			gadgets.window.adjustHeight()
		}, 1000);
	},
	responseCheck: function(data){
		if(typeof data !== 'undefined' && typeof data.content !== 'undefined' && data.type !== "document")
			data = data.content;
		return data;
	},
	capitaliseFirstLetter: function(string){
	    return string.charAt(0).toUpperCase() + string.slice(1);
	},
	truncate: function(string, length){
		if(string.length > length)
			return string.substring(0, length)+"...";
		else
			return string;
	},
	getRelevant: function(list, type){
		var relevant = [];
		for(var i = 0 ; i < list.length ; i++){
			if(list[i].type === type)
				relevant.push(list[i]);
		}
		return relevant;
	},
	rails_env: {
		local: "http://localhost:3000",
		remote: "https://lit-inlet-2632.herokuapp.com",
		current: "https://lit-inlet-2632.herokuapp.com",
		setCurrent: function(env){
			this.current = env;
		}
	},
	clearAndAlert: function(div, type, text){
		div.empty();
		div.append("<div class='alert alert-"+type+"'>"+text+"</div>");
	},
	nav_fix: function(){
		$(".jive-link-anchor-small").each(function(){
			$(this).on("click touch",function(e){
				$(".navigation").css("top", "40px");
			});
		});
		$(".jive-rendered-content").prepend("<span id='top'></span>");
		this.link_fix();
	},
	link_fix: function(){
		$(".jive-link-wiki-small").each(function(){
			$(this).on("click touch",function(e){
				e.preventDefault();
				$(".navigation").css("top", "40px");
				var doc = wwc.get_doc_from_link($(this).attr("href"));
				var id = "#"+doc.split("#")[1];
				console.log(id);
				window.location.href = id;
			});
		});
	},
	pushOrRemove: function(array, item){
		var index = array.indexOf(item);
		if (index > -1) {
    		array.splice(index, 1);
		}
		else{
			array.push(item);
		}
		return array;
	},
	remove: function(array, item){
		var index = array.indexOf(item);
		if (index > -1) {
    		return array.splice(index, 1);
		}
	},
	get_doc_html: function(docNum, callback){
		if(docNum.indexOf("DOC") >= 0)
			docNum = docNum.substring(4);
		console.log(docNum);
		osapi.jive.corev3.contents.get({
		     entityDescriptor: "102,"+docNum
		 }).execute(function(data){
		 	if(data.status === 403){
		 		var error = "<h4 class='access-error'>"+
						"Oops it looks like you don't have permission to view this document..."+
						"<p>"+
							"If you believe this is a mistake, please reach out to your community specialist, "+
							"<a class='jiveTT-hover-user jive-link-profile-small' data-containerid='-1' data-containertype='-1' data-objectid='2019' data-objecttype='3' href='https://weightwatchers.jiveon.com/people/ericareyes%40teletech.com' aria-describedby='jive-note-user-body'>Erica Degourville-Reyes</a>"+
						"</p>"+
					"</h4>";
		 		$(".spinner").addClass("hide");
		 		$(".navigation").append('<i id="close" class="fa fa-close fa-3x"></i><h2>Unauthorized</h2>');
		 		wwc.close_doc();
		 		$(".doc-container").append(error);
		 		return;
		 	}
			if(data.hasOwnProperty('list') && data.list.length > 0){
				var thisDoc = data.list[0];
				$(".doc-container").html(thisDoc.content.text);
				$(".doc-container").prepend('<h1 class="header">'+thisDoc.subject+'<span class="original tiny"><a target="_blank" href="/docs/'+thisDoc.id+'">Click here to see original document.</a></span></h1>');
				$(".doc-container").append("</br>");
				util.nav_fix();
			//	wwc.link_fix();
				gadgets.window.adjustHeight();
				callback(thisDoc.contentID);
			}
			gadgets.window.adjustHeight();
		});
	},
	getUrlParams: function(sParam){
		var sPageURL = window.parent.location.search.substring(1);
	    var sURLVariables = sPageURL.split('&');
	    for (var i = 0; i < sURLVariables.length; i++) 
	    {
	        var sParameterName = sURLVariables[i].split('=');
	        if (sParameterName[0] == sParam) 
	        {
	            return sParameterName[1];
	        }
	    }
	},
	showFeatureBtn: function(jive_user_id, api_id){
		$("div.overlay > button#featureMe").remove();
		osapi.jive.core.get({
	        "href": "/people/"+jive_user_id+"/extprops",
	        "v": "v3"
	    }).execute(function(response){
	    	if(response.content.siteManager == "true"){
	    		osapi.jive.core.get({
			        "href": "/contents/"+api_id+"/extprops",
			        "v": "v3"
			    }).execute(function(props){
			    	if( typeof props.content.featured == "undefined" || props.content.featured == "false")
	    				$("div.overlay").prepend('<button id="featureMe" class="btn btn-md btn-warning"><i class="fa fa-star"></i>&nbsp <span>Feature This Document</span></button>');
			    	else
			    		$("div.overlay").prepend('<button id="featureMe" class="btn btn-md btn-success"><i class="fa fa-check"></i>&nbsp <span>Featured</span></button>');
			    	$("#featureMe").on("click touch", function(e){
						if($(this).hasClass("btn-warning")){
							$(this).removeClass("btn-warning").addClass("btn-success");
							$(this).children().first().removeClass("fa-start").addClass("fa-check");
							$(this).children().last().text("Featured");
							doc.setExtendedProperties(api_id, {featured: true});
						}
						else{
							$(this).removeClass("btn-success").addClass("btn-warning");
							$(this).children().first().removeClass("fa-check").addClass("fa-star");
							$(this).children().last().text("Feature This Document");
							doc.setExtendedProperties(api_id, {featured: false});
						}
						doc.reload();
					});
			    });
	    	}
	    });
	}
}
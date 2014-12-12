var user = {
	
	getAll: function(i){
		if(i < 0) return;
		osapi.jive.core.get({
	        "href": "/people?count=100&startIndex="+i.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	if(typeof response.content !== 'undefined'){
	    		var list = response.content.list;
	    	}
	    	else if(typeof response.list !== 'undefined'){
	    		var list = response.list;
	    	}
	    	else{
	    		alert("Something went wrong in the HTTP request.");
	    		user.getAll(-1);
	    	}
	        if(list.length > 0){
	        	var jiveUsers = [];
	        	for(var j = 0 ; j < list.length ; j++){
	        		var userStuff = {
	        			employee_id: list[j].jive.username,
	        			jive_user_id: list[j].id
	        		}
	        		jiveUsers.push(userStuff);
	        	} 
	        	console.log(jiveUsers);
	        	// make post request here
	        	users.getAll(i + 100);
	        }
	        else{
	        	users.getAll(-1);
	        }
	    });
	},
	get: function(jive_user_id, callback){
		osapi.jive.core.get({
	        "href": "/people/"+jive_user_id,
	        "v": "v3"
	    }).execute(function(response){
	    	// consecutive requests return different objects
	    	data = user.responseCheck(response);
	    	user.getExtendedProperties(data.id, function(extprops){
	    		user.getData(data, extprops, function(userData){
	    			callback(userData);
	    		});
	    	});
	    });	
	},
	extendedProperties: {},
	setExtendedProperties: function(jive_user_id, propObj){
		this.initCurrentUser(jive_user_id, function(ep){
			for (var key in propObj) {
			  if (propObj.hasOwnProperty(key) && propObj[key].length > 0) {
			    ep[key] = propObj[key];
			  }
			}
			if(!util.isEmpty(propObj)){
				osapi.jive.corev3.people.get({  
				    id: jive_user_id.toString() 
				}).execute(function (currentUser) {   
				   currentUser.createExtProps(ep).execute(function (resp) {
				   	//console.log(resp);
				    // responds with resp.content(Object).<props>
				    user.initCurrentUser(jive_user_id, function(){}) // reset user.extendedProperties
				   }); 
				}); 
			}
			else{
				alert("You must include a property to set.");
			}
		});
		
	},
	deleteExtendedProperty: function(jive_user_id, obj, key){
		delete obj[key];
		this.setExtendedProperties(jive_user_id, obj); 
	},
	getExtendedProperties: function(jive_user_id, callback){
		osapi.jive.corev3.people.get({  
		    id: jive_user_id.toString(),  
		}).execute(function (currentUser) {  
	        currentUser.getExtProps().execute(function (resp) {  
	            user.extendedProperties = resp.content;  
	            callback(resp.content);
	        });
		});
	},
	saveExtendedProperties: function(jive_user_id, className){
		var c = 0;
		var props = {};
		var key = "";
		$(className).each(function(){
			if(c % 2 === 0)
				key = $(this).val();
			else{
				props[key] = $(this).val();
			}
			c++;
		});
		this.setExtendedProperties(jive_user_id, props);
		$("#saveEdit").addClass("hide");
		$(".modal-body").empty().append("<div class='alert alert-success'>Properties Saved! Sometimes it can take ~1 minute for the changes to take effect.</div> ")
	},
	initCurrentUser: function(jive_user_id, callback){
		osapi.jive.corev3.people.get({  
		    id: jive_user_id.toString(),  
		}).execute(function (currentUser) {  
	        currentUser.getExtProps().execute(function (resp) {  
	            user.extendedProperties = resp.content; 
	            callback(resp.content);
	        });
		});
	},
	search: function(name){
		$(".personRow, .personError").remove();
		osapi.jive.core.get({
	        "href": "/search/people?filter=search("+name+")",
	        "v": "v3"
	    }).execute(function(data){
	    	data = user.responseCheck(data);
	    	if(data.list.length > 0)
	    		user.makeList(data.list, function(){});
	    	else{
	    		$("#peopleList").append("<div style='margin-top:20px;' class='text-center personError'><strong>The search did not match any user...</strong></div>");
	    	}
	    	user.attachHandlers();
	    });
	},
	makeList: function(people, callback){
    	for(var i = 0 ; i < people.length ; i++){
    		$("#peopleList").append(user.row(people[i]));
    	}
    	gadgets.window.adjustHeight();
    	callback();
	},
	listAll: function(startIndex, callback){
		osapi.jive.core.get({
	        "href": "/people?count=30&startIndex="+startIndex.toString(),
	        "v": "v3"
	    }).execute(function(data){
	    	data = user.responseCheck(data);
	    	var people = data.list;
	    	user.makeList(people, callback);
	    });
	},
	responseCheck: function(data){
		if(typeof data.content !== 'undefined')
			data = data.content;
		return data;
	},
	listByClient: function(client){
		$(".personRow, .personError").remove();
		if(client === "everyone")
			this.listAll(0, function(){});
		else{
			osapi.jive.core.get({
		        "href": "/extprops/client/"+client,
		        "v": "v3"
		    }).execute(function(data){
		    	data = user.responseCheck(data);
		    	if(data.list.length > 0){
		    		var people = util.getRelevant(data.list, "person");
		    		user.makeList(people, function(){});
		    	}
		    	else{
		    		$("#peopleList").append("<div style='margin-top:20px;' class='text-center personError'><strong>There are no people for that client...</strong></div>");
		    	}
		    	user.attachHandlers();
		    });
		}
	},
	row: function(person){
		var row = '<div class="row personRow text-center">'+
					'<div class="col-xs-1"><span>'+person.id+'</span></div>'+
					'<div class="col-xs-2"><span>'+person.jive.username+'</span></div>'+
					'<div class="col-xs-2"><span>'+person.displayName+'</span></div>'+
					'<div class="col-xs-3"><span>'+person.emails[0].value+'</span></div>'+
					'<div class="col-xs-2"><button data-id="'+person.id+'" class="btn btn-primary btn-sm profileBtn">Profile</button></div>'+
					'<div class="col-xs-2"><button data-id="'+person.id+'" class="btn btn-default btn-sm editBtn" data-toggle="modal" data-target="#myModal">Edit</button></div>'+
				  '</div>';
		return row;
	},
	epRow: function(){
		var row = '<div class="row">'+
		        		'<div class="col-xs-5"><input type="text" class="form-control ep"></div>'+
		        		'<div class="col-xs-5"><input type="text" class="form-control ep"></div>'+
		        	'</div>';
		return row;
	},
	extendedPropertiesList: function(ep){
		var list = '<h4>Extended Properties <span class="tiny"><strong>(Do not change these unless you know what you are doing!)</strong></span></h4>'+
        '<form id="extpropsForm">'+
        	'<div class="row">'+
        		'<div class="col-xs-5"><strong>Key</strong></div>'+
        		'<div class="col-xs-5"><strong>Value</strong></div>'+
        	'</div><div id="epList">';
        	for(var key in ep){
        		list += '<div class="row">'+
			        		'<div class="col-xs-5"><input type="text" class="form-control ep" value="'+key+'"></div>'+
			        		'<div class="col-xs-5"><input type="text" class="form-control ep" value="'+ep[key]+'"></div>'+
			        	'</div>';
        	}

        	list += '</div><div class="row">'+
			        		'<div class="col-xs-3"><button id="addEP" class="btn btn-sm btn-info"><i class="fa fa-plus"></i>&nbspAdd EP</button></div>'+
			        	'</div>';
        list += '</form>';
        return list;
	},
	modalDisplay: function(jive_user_id){
		this.get(jive_user_id, function(userData){
			$(".modal-title").text("Edit "+userData.name);
			$(".modal-body").empty();
			$(".modal-body").append(user.extendedPropertiesList(userData.extendedProperties));
			$("#addEP").on("click touch", function(e){
				e.preventDefault();
				$("#epList").append(user.epRow());
			});
		});
	},
	getData: function(user, extendedProperties, callback){
		var data = {
			name: user.displayName,
			email: user.emails[0].value,
			id: user.id,
			username: user.jive.username,
			extendedProperties: extendedProperties,
			avatar: user.thumbnailUrl
		};
		callback(data);
	},
	// call this function after any dynamically added elements
	attachHandlers: function(){ 
		$("button.editBtn").each(function(){
			$(this).on("click touch", function(e){
				$("#saveEdit").removeClass("hide");
				e.preventDefault();
				user.modalDisplay($(this).attr("data-id"));
				$("#saveEdit").attr("data-id", $(this).attr("data-id"));
			});
		});
	}
}




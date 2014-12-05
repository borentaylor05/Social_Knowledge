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
	    		users.getAll(-1);
	    	}
	        if(list.length > 0){
	        	var jiveUsers = [];
	        	for(var j = 0 ; j < list.length ; j++){
	        		var user = {
	        			employee_id: list[j].jive.username,
	        			jive_user_id: list[j].id
	        		}
	        		jiveUsers.push(user);
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
	extendedProperties: {},
	setExtendedProperties: function(jive_user_id, propObj){
		this.initCurrentUser(jive_user_id, function(ep){
			for (var key in propObj) {
			  if (propObj.hasOwnProperty(key)) {
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
	initCurrentUser: function(jive_user_id, callback){
		osapi.jive.corev3.people.get({  
		    id: jive_user_id.toString(),  
		}).execute(function (currentUser) {  
	        currentUser.getExtProps().execute(function (resp) {  
	            user.extendedProperties = resp.content;  
	            callback(resp.content);
	        });
		});
	}
}
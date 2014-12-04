var users = {
	
	getAll: function(i){
		if(i < 0) return;
		osapi.jive.core.get({
	        "href": "/people?count=25&startIndex="+i.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	if(typeof response.content !== 'undefined')
	    		var list = response.content.list;
	    	else if(typeof response.list !== 'undefined')
	    		var list = response.list;
	    	else
	    		users.getAll(-1);
	        if(list.length > 0){
	        	console.log(response);  
	        	users.getAll(i + 25);
	        }
	        else{
	        	users.getAll(-1);
	        }
	    });
	}
}
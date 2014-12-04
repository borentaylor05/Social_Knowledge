var users = {
	
	getAll: function(i){
		if(i < 0) return;
		osapi.jive.core.get({
	        "href": "/people?count=25&startIndex="+i.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	console.log(response);
	        if(response.content.list.length > 0 || response.list.length){
	        	users.getAll(i + 25);
	        	console.log(response);  
	        }
	        else{
	        	users.getAll(-1);
	        }
	    });
	}
}
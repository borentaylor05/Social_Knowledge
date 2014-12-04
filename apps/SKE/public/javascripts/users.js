var users = {
	
	getAll: function(i){
		if(i < 0) return;
		osapi.jive.core.get({
	        "href": "/people?count=100&startIndex="+i.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	console.log(typeof response);
	        if(!response.error && response.content.list.length > 0){
	        	users.getAll(i + 100);
	        	console.log(response);  
	        }
	        else{
	        	users.getAll(-1);
	        }
	    });
	}
}
var util = {
	isEmpty: function(obj) {
	    for(var prop in obj) {
	        if(obj.hasOwnProperty(prop))
	            return false;
	    }
    	return true;
	},
	responseCheck: function(data){
		if(typeof data !== 'undefined' && typeof data.content !== 'undefined' && data.type !== "document")
			data = data.content;
		return data;
	},
	truncate: function(string, length){
		if(string.length > length)
			return string.substring(0, length)+"...";
		else
			return string;
	}
}
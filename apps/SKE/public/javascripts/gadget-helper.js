var gadget_helper = {
	post: function(url, data, callback){
		var params = {};
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
  		params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues(data);
  		gadgets.io.makeRequest(url, callback, params);
	},
	get: function(url, params, callback){
		params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
  		gadgets.io.makeRequest(url, callback, params);
	}
}
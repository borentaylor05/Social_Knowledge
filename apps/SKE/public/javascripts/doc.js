var doc = {
	getAll: function(i){
		if(i < 0) return;
		osapi.jive.core.get({
	        "href": "/contents?count=100&startIndex="+i.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	console.log(response);
	    	response = util.responseCheck(response);
	    	console.log(response);
	    	if(typeof response === "undefined" ){
	    		alert("Something went wrong in the HTTP request.");
	    		doc.getAll(-1);
	    	}
	        if(response.list.length > 0){
	        	var docs = [];
	        	for(var j = 0 ; j < response.list.length ; j++){
	        		console.log(response.list[j]);
	        		var doc = {
	        			doc_id: response.list[j].id,
	        			api_id: response.list[j].contentID,
	        			subject: response.list[j].subject,
	        			views: response.list[j].viewCount
	        		}
	        		docs.push(doc);
	        	} 
	        	// make post request here
	        	users.getAll(i + 100);
	        }
	        else{
	        	users.getAll(-1);
	        }
	    });
	},
	get: function(api_id, callback){
		osapi.jive.core.get({
	        "href": "/contents/"+api_id,
	        "v": "v3"
	    }).execute(function(response){
	    	// consecutive requests return different objects
	    	data = util.responseCheck(response);
	    	doc.getExtendedProperties(data.contentID, function(extprops){
	    		doc.getData(data, extprops, function(userData){
	    			callback(userData);
	    		});
	    	});
	    });	
	},
	getData: function(docObj, extendedProperties, callback){
		var d = {
			title: docObj.subject,
			api_id: docObj.contentID,
			doc_id: docObj.id,
			extendedProperties: extendedProperties,
			tags: docObj.tags,
			views: docObj.viewCount
		}
		callback(d);
	},
	modalDisplay: function(api_id){
		this.get(api_id, function(docObj){
			$(".modal-title").text("Edit "+docObj.title);
			$(".modal-body").empty();
			$(".modal-body").append(doc.extendedPropertiesList(docObj.extendedProperties));
			$("#addEP").on("click touch", function(e){
				e.preventDefault();
				$("#epList").append(doc.epRow());
			});
		});
	},
	saveExtendedProperties: function(api_id, className){
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
		this.setExtendedProperties(api_id, props);
		$("#saveEdit").addClass("hide");
		$(".modal-body").empty().append("<div class='alert alert-success'>Properties Saved! Sometimes it can take ~1 minute for the changes to take effect.</div> ")
	},
	epRow: function(){
		var row = '<div class="row">'+
		        		'<div class="col-xs-5"><input type="text" class="form-control ep"></div>'+
		        		'<div class="col-xs-5"><input type="text" class="form-control ep"></div>'+
		        	'</div>';
		return row;
	},
	list: function(startIndex){
		osapi.jive.core.get({
	        "href": "/contents?count=30&startIndex="+startIndex.toString(),
	        "v": "v3"
	    }).execute(function(response){
	    	response = util.responseCheck(response);
	        if(response.list.length > 0){
	        	doc.makeList(response.list, function(){});
	        }
	    });
	},
	search: function(content){
		$(".docRow, .docError").remove();
		osapi.jive.core.get({
	        "href": "/search/contents?filter=search("+content+")",
	        "v": "v3"
	    }).execute(function(data){
	    	console.log(data);
	    	data = util.responseCheck(data);
	    	if(data.list.length > 0)
	    		doc.makeList(data.list, function(){});
	    	else{
	    		$("#docList").append("<div style='margin-top:20px;' class='text-center docError'><strong>The search did not match any document...</strong></div>");
	    	}
	    	user.attachHandlers();
	    });
	},
	makeList: function(docs, callback){
    	for(var j = 0 ; j < docs.length ; j++){
			var d = {
    			doc_id: docs[j].id,
    			api_id: docs[j].contentID,
    			subject: docs[j].subject,
    			views: docs[j].viewCount,
    		}
    		this.row(d);
    	} 
    	gadgets.window.adjustHeight();
    	callback();
	},
	row: function(docObj){
		this.getExtendedProperties(docObj.api_id, function(props){
			docObj.extendedProperties = props;
			if(props.featured === "true")
				var fBtn = '<div class="col-xs-2"><button id="'+docObj.api_id+'" data-id="'+docObj.api_id+'" class="btn btn-success btn-sm feature yes"><i class="fa fa-check"></i>&nbsp&nbspFeatured</button></div>';
			else 
				var fBtn = '<div class="col-xs-2"><button id="'+docObj.api_id+'" data-id="'+docObj.api_id+'" class="btn btn-warning btn-sm feature"><i class="fa fa-star"></i>&nbsp&nbspFeature</button></div>';
			var row = '<div class="row docRow text-left">'+
					'<div class="col-xs-3"><span>'+util.truncate(docObj.subject, 25)+'</span></div>'+
					'<div class="col-xs-1"><span>'+docObj.doc_id+'</span></div>'+
					'<div class="col-xs-1"><span>'+docObj.api_id+'</span></div>'+
					'<div class="col-xs-1"><span>'+docObj.views+'</span></div>'+
					fBtn+
					'<div id="view'+docObj.api_id+'" class="col-xs-2"><button data-id="'+docObj.api_id+'" class="btn btn-primary btn-sm viewdocObj">View</button></div>'+
					'<div id="edit'+docObj.api_id+'" class="col-xs-2"><button data-id="'+docObj.api_id+'" class="btn btn-default btn-sm editDoc" data-toggle="modal" data-target="#myModal">Edit</button></div>'+
				  '</div>';

			$("#docList").append(row);
			$("#"+docObj.api_id.toString()).on("click touch", function(e){
				e.preventDefault();
				doc.fixFeatureBtn($(this));
			});
			$("#edit"+docObj.api_id.toString()).on("click touch", function(e){
				e.preventDefault();
				$("#saveEdit").attr("data-id", $(this).attr("id").substring(4));
				doc.modalDisplay($(this).attr("id").substring(4));
			});	
		});
		
	},
	setExtendedProperties: function(api_id, propObj){
		this.getExtendedProperties(api_id, function(ep){
			for (var key in propObj) {
			    ep[key] = propObj[key];
			}
			if(!util.isEmpty(propObj)){
				osapi.jive.corev3.documents.get({
			        id: api_id
			    }).execute(function (curDoc) { 
				   curDoc.createExtProps(ep).execute(function (resp) {
				   //	console.log("SET",resp);
				    // responds with resp.content(Object).<props>
				   }); 
				}); 
			}
			else{
				alert("You must include a property to set.");
			}	
		});	
	},
	getExtendedProperties: function(id, callback){
		osapi.jive.core.get({
	        "href": "/contents/"+id.toString()+"/extprops",
	        "v": "v3"
	    }).execute(function(response){
	    	callback(response.content);
	    });
	},
	attachHandlers: function(){
		$(".feature").each(function(){
			$(this).on("click touch", function(e){
				e.preventDefault();
				doc.fixFeatureBtn($(this));
			})
		});
	},
	fixFeatureBtn: function(btn){
		if(btn.hasClass("yes")){
			btn.removeClass("btn-success yes").addClass("btn-warning");
			var icon = btn.children().first();
			$(icon).removeClass("fa-check").addClass("fa-star");
			this.setExtendedProperties($(btn).attr("id"), { featured: false });
		}
		else{
			btn.removeClass("btn-warning").addClass("btn-success yes");
			var icon = btn.children().first();
			$(icon).removeClass("fa-star").addClass("fa-check");
			this.setExtendedProperties($(btn).attr("id"), { featured: true });
		}		
	},
	featuredBtn: function(props){
		console.log(props);
		//props = util.responseCheck(props);
		if(props.featured)
			btn.addClass("yes");
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
	}
}





var templates = {
	auCare: {
		globalCatsRow1: [			
			{  
				title: "Fairfax Overview",
				docs: [
					{ title: "Fairfax Media Culture and Values", number: "NA" },
					{ title: "The Dominion Post Daily Content", number: "NA" }
				]
			},
			{  
				title: "Mastheads Overview",
				docs: [
					{ title: "Cybersell: Searching For a Booking", number: "NA" },
					{ title: "Classification Usage - User Guide", number: "NA" }				
				]
			}
		],
		globalCatsRow2: [
			{  
				title: "Customer Service Skills",
				docs: [
					{ title: "Death and Funeral Services - Verses", number: "NA" },
					{ title: "ALL FFX Announcements", number: "NA" },
					{ title: "In Memoriam Sample Wording and Phrases", number: "NA" },
					{ title: "Family Notices - User Guide", number: "NA" }
				]
			},
			{  
				title: "Sales Skills",
				docs: [
					{ title: "Dominion Post Daily Sections", number: "NA" },
					{ title: "Standard Ad Sizes as of 29/5/15", number: "NA" },
					{ title: "Headline Bank", number: "NA" },
					{ title: "Forms and Templates: Email Auto Responses", number: "NA" },
					{ title: "Forms and Templates: Booking Summary", number: "NA" },
				]
			}
		],
		generalDocsRow1: [
			{  
				title: "Billing",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			},
			{  
				title: "Complaints Management",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			},
			{  
				title: "Customer Maintenance",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			}
		],
		generalDocsRow2: [
			// {  
			// 	title: "Geos / Mastheads",
			// 	docs: [
			// 		{ title: "Document Name", number: "NA" },
			// 		{ title: "Document Name", number: "NA" }					
			// 	]
			// },
			{  
				title: "Subscription Maintenance",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			},
			{  
				title: "Trading Room",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			}
		],
		generalDocsRow3: [
			// {  
			// 	title: "Email Templates",
			// 	docs: [
			// 		{ title: "Document Name", number: "NA" },
			// 		{ title: "Document Name", number: "NA" }					
			// 	]
			// },
			{  
				title: "Retention",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			},
			{  
				title: "Top Call Drivers",
				docs: [
					{ title: "Document Name", number: "NA" },
					{ title: "Document Name", number: "NA" }					
				]
			}
		]
	},
	jive: {
		comment: {
			"content": {
				"type": "text/html", 
				"text": "<body><p>This is a comment</p></body>"
			},
			"parent": "",
			"type": "comment"
		}
	},
	docHolder: '<div class="overlayHolder row">'+
			'<div class="col-xs-9 docHolder">'+
				'<h1 class="title">  </h1>'+
			'</div>'+
			'<div class="col-xs-3 commentHolder">'+
			'</div>'+
		'</div>',
	modal: '<div class="modal-header">'+
	        '<h3 class="modal-title">Im a modal!</h3>'+
	    '</div>'+
	    '<div class="modal-body">'+
	        '<h4>Extended Properties <span class="tiny"><strong>(Do not change these unless you know what you are doing!)</strong></span></h4>'+
        '<form id="extpropsForm">'+
        	'<div class="row">'+
        		'<div class="col-xs-5"><strong>Key</strong></div>'+
        		'<div class="col-xs-5"><strong>Value</strong></div>'+
        	'</div><div id="epList">'+
        	'<div class="row">'+
			        		'<div class="col-xs-5"><input type="text" class="form-control ep" value=""></div>'+
			        		'<div class="col-xs-5"><input type="text" class="form-control ep" value=""></div>'+
			        	'</div>'+
	    '</div>'+
	    '</div><div class="row">'+
			        		'<div class="col-xs-3"><button id="addEP" class="btn btn-sm btn-info"><i class="fa fa-plus"></i>&nbspAdd EP</button></div>'+
			        	'</div>'+
			'</form>'+
	    '<div class="modal-footer">'+
	        '<button class="btn btn-primary" ng-click="u.ok()">OK</button>'+
	        '<button class="btn btn-warning" ng-click="u.cancel()">Cancel</button>'+
	    '</div>',

	skeheader: '<div class="container clearfix navContainer">'+
					'<div class="navbar-header ">'+
					  '<a class="navbar-brand" href="#">SKE Management</a>'+
					'</div>'+
				'</div>',

	manage_sidebar: '<div id="sidebar-wrapper">'+
				        '<ul class="sidebar-nav">'+
				            '<li class="sidebar-brand">'+
				                '<a href="#">'+
				                    'Actions'+
				                '</a>'+
				            '</li>'+
				            '<ul class="navList">'+
							'</ul>'+
				        '</ul>'+
				    '</div>',

    care_sidebar: '<div id="sidebar-wrapper">'+
				        '<ul class="sidebar-nav">'+
				            '<li class="sidebar-brand">'+
				                '<a href="#">'+
				                    'General'+
				                '</a>'+
				            '</li>'+
				            '<ul class="">'+
				            	'<li>Products</li>'+
				            	'<li>Geos</li>'+
				            	'<li>Mastheads</li>'+
				            	'<li>Systems</li>'+
				            	'<li>Processes</li>'+
				            	'<li>Packages Inc Benefits</li>'+
							'</ul>'+
							'<li class="sidebar-brand">'+
				                '<a href="#">'+
				                    'Special'+
				                '</a>'+
				            '</li>'+
				            '<ul class="">'+
				            	'<li>Billing</li>'+
				            	'<li>Membership</li>'+
				            	'<li>Subs Sales</li>'+
				            	'<li>Retention / Saves</li>'+
							'</ul>'+
				        '</ul>'+
				    '</div>'
};
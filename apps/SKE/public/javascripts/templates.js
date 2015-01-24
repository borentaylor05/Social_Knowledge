var templates = {
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
}
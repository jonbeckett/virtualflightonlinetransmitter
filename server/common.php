<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function page_header($title){

	$page_title = strpos($title,"VirtualFlight.Online") > -1 ? $title : $title." - VirtualFlight.Online";

	$html = "<!doctype html>"
		."<html lang=\"en\">\n"
		."<head>\n"
  		 	."<meta charset=\"utf-8\">\n"
  			."<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n"
	  		."<title>".$page_title."</title>\n"
  			."<link rel=\"shortcut icon\" type=\"image/jpg\" href=\"virtualflightonline.jpg\"/>\n"
			."<script src=\"https://code.jquery.com/jquery-3.6.0.min.js\" crossorigin=\"anonymous\"></script>\n"
		        ."<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We\" crossorigin=\"anonymous\" />\n"
		        ."<script src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js\" integrity=\"sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj\" crossorigin=\"anonymous\"></script>\n"
  		        ."<!-- <script async src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9526818083576145\" crossorigin=\"anonymous\"></script> -->\n"
		        ."<link href=\"style.css\" rel=\"stylesheet\" />\n"
  		        	.( ( strpos($_SERVER['REQUEST_URI'],"who") > -1 ) ? "<link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.9.1/dist/leaflet.css\" integrity=\"sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=\" crossorigin=\"anonymous\"/>\n" : "" )
  			.( ( strpos($_SERVER['REQUEST_URI'],"who") > -1 ) ? "<script src=\"https://unpkg.com/leaflet@1.9.1/dist/leaflet.js\" integrity=\"sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s=\" crossorigin=\"anonymous\"></script>\n" : "" )
  			.( ( strpos($_SERVER['REQUEST_URI'],"who") > -1 ) ? "<script src=\"who.js?t=".time()." crossorigin=\"anonymous\"></script>\n" : "" )
			.( ( strpos($_SERVER['REQUEST_URI'],"who") > -1 ) ? "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css\" integrity=\"sha512-xh6O\/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n" : "")
			.( ( strpos($_SERVER['REQUEST_URI'],"who") > -1 ) ? "<script src=\"https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js\"></script>\n" : "")

		."</head>\n"
		."<body>\n"
			."<div class=\"container\">\n"
				."<header class=\"d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom\">\n"
				."<a href=\"/\" class=\"d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none\">\n"
					."<img src=\"/virtualflightonline.jpg\" width=\"48\" height=\"48\" alt=\"Virtual Flight Online\" class=\"bi me-2\" />\n"
					."<span class=\"fs-4\">VirtualFlight.Online</span>\n"
				."</a>\n"
				."<ul class=\"nav nav-pills\">\n"
					."<li class=\"nav-item\"><a href=\"https://virtualflight.online\" class=\"nav-link\" aria-current=\"page\">Home</a></li>\n"
					."<li class=\"nav-item\"><a href=\"https://codex.virtualflight.online\" class=\"nav-link\" aria-current=\"page\">Codex</a></li>\n"
				    ."<li class=\"nav-item\"><a href=\"https://discord.com/servers/virtualflight-online-750398586851688499\" class=\"nav-link\" aria-current=\"page\">Discord</a></li>\n"
				    ."<li class=\"nav-item\"><a href=\"https://www.facebook.com/groups/virtualflight.online\" class=\"nav-link\" aria-current=\"page\">Facebook</a></li>\n"
				    ."<li class=\"nav-item\"><a href=\"https://va.virtualflight.online\" class=\"nav-link\" aria-current=\"page\">Airline</a></li>\n"
				    ."<li class=\"nav-item\"><a href=\"https://www.patreon.com/virtualflightonline\" class=\"nav-link\" aria-current=\"page\">Patreon</a></li>\n"
			    ."</ul>\n"
				."</header>\n"
			."</div>\n"
			."<div class=\"container\">\n"
			."<div class=\"row\">\n"
				."<header>\n"
					."<h1 class=\"display-1\">".$title."</h1>\n"
				."</header>\n";
	return $html;
}

function page_footer(){

	$html = "</div> <!-- row -->\n"
		."<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-75PLWFT397\"></script>\n"
		."<script>\n"
  		."window.dataLayer = window.dataLayer || [];\n"
  		."function gtag(){dataLayer.push(arguments);}\n"
  		."gtag('js', new Date());\n"
		."gtag('config', 'G-75PLWFT397');\n"
		."</script>\n"
		."<footer class=\"text-center text-lg-start text-muted mt-4\">\n"
			."<div class=\"text-center p-4\">\n"
				."&copy; 2022 <a class=\"text-reset fw-bold\" href=\"https://virtualflight.online/\">VirtualFlight.Online</a>\n"
    				."<br /><small>Note that all facilities operated by VirtualFlight.Online require a minimum age of 16 years or older.</small>\n"
			."</div>\n"
		."</footer>\n"
		."</div> <!-- container -->\n"
    		."</body>\n"
		."</html>\n";

	return $html;
}

?>
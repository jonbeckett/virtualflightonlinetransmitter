<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Virtual Flight Online - Radar Display</title>
    <link rel="shortcut icon" type="image/jpg" href="img/vfo_logo_300x300.jpg"/>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossorigin="anonymous"></script>
    <link href="css/style.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css" integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin="anonymous"/>
    <script src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js" integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js"></script>
    <link rel="stylesheet" href="css/radar.css?t=<?php echo(time());?>" />
    <script src="js/radar.js?t=<?php echo(time());?>" crossorigin="anonymous"></script>
    <link rel="icon" href="img/vfo_logo_300x300.jpg" />
</head>
<body>
    <div class="radar-container">
        <div class="radar-info">
            <div class="radar-stats">
                <div>Aircraft Online: <span id="aircraft-count">0</span></div>
                <div>Last Update: <span id="last-update">--:--:--</span></div>
                <div>Smooth Movement: <span id="smooth-status">Enabled</span></div>
                <hr style="border-color: #00ff00; margin: 10px 0;">
		<div><a target="_blank" href="https://virtualflight.online" title="Visit VirtualFlight.Online homepage"><i class="fas fa-home"></i> Home</a></div>
                <div><a target="_blank" href="https://virtualflightonline.substack.com" title="Subscribe to the newsletter"><i class="fas fa-newspaper"></i> Newsletter</a></div>
		<div><a target="_blank" href="https://forums.virtualflight.online" title="Join the conversation in the forums"><i class="fas fa-comment"></i> Forums</a></div>
                <div><a target="_blank" href="https://bit.ly/virtualflightonlinediscord" title="Join group flights on the Discord server"><i class="fa-brands fa-discord"></i> Discord</a></div>
		<div><a target="_blank" href="https://facebook.com/groups/virtualflightonline" title="Join the conversation in the Facebook group"><i class="fa-brands fa-facebook"></i> Facebook</a></div>
		<div><a target="_blank" href="https://airline.virtualflight.online" title="Join the Airline"><i class="fas fa-plane"></i> Airline</a></div>
		<div><a target="_blank" href="https://transmitter.virtualflight.online" title="Start using Transmitter"><i class="fas fa-satellite-dish"></i> Transmitter</a></div>
                <div><a target="_blank" href="https://patreon.com/virtualflightonline" title="Support us at Patreon"><i class="fa-brands fa-patreon"></i> Patreon</a> < Support us!</div>
            </div>
        </div>
        
        <div class="refresh-indicator" id="refresh-indicator">
            Initializing...
        </div>
        
        <div id="radar-map"></div>
    </div>
</body>
</html>

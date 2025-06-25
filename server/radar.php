<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Virtual Flight Online - Radar Display</title>
    <link rel="shortcut icon" type="image/jpg" href="virtualflightonline.jpg"/>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossorigin="anonymous"></script>
    <link href="style.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css" integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin="anonymous"/>
    <script src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js" integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js"></script>
    <script src="radar.js?t=<?php echo(time());?>" crossorigin="anonymous"></script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #001122;
            color: #00ff00;
            font-family: 'Courier New', monospace;
        }
        
        .radar-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, #002244 0%, #001122 100%);
        }
        
        #radar-map {
            width: 100%;
            height: 100%;
            background: transparent;
        }
        
        .radar-info {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 20, 40, 0.9);
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #00ff00;
            z-index: 1000;
            min-width: 250px;
        }
        
        .radar-info h3 {
            color: #00ff00;
            margin: 0 0 10px 0;
            font-size: 18px;
            text-align: center;
        }
        
        .radar-stats {
            font-size: 12px;
            line-height: 1.4;
        }
        
        .aircraft-icon {
            color: #00ff00 !important;
            filter: drop-shadow(0 0 3px #00ff00);
            font-size: 20px !important;
        }
        
        .aircraft-label {
            z-index: 1000;
            pointer-events: auto; /* Enable pointer events for dragging */
        }
        
        .draggable-label {
            cursor: move;
        }
        
        .draggable-label:hover {
            opacity: 0.9;
        }
        
        .aircraft-label div {
            transition: opacity 0.3s ease;
        }
        
        .heading-line {
            stroke: #ffff00;
            stroke-width: 2;
            opacity: 0.8;
        }
        
        .leaflet-popup-content-wrapper {
            background: rgba(0, 20, 40, 0.95);
            color: #00ff00;
            border: 1px solid #00ff00;
        }
        
        .leaflet-popup-content {
            color: #00ff00;
            font-family: 'Courier New', monospace;
        }
        
        .leaflet-popup-tip {
            background: rgba(0, 20, 40, 0.95);
            border: 1px solid #00ff00;
        }
        
        .leaflet-control-zoom a {
            background-color: rgba(0, 20, 40, 0.9);
            color: #00ff00;
            border: 1px solid #00ff00;
        }
        
        .leaflet-control-zoom a:hover {
            background-color: rgba(0, 40, 80, 0.9);
        }
        
        .refresh-indicator {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 20, 40, 0.9);
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #00ff00;
            z-index: 1000;
            font-size: 12px;
        }
        
        .refresh-active {
            color: #ffff00;
        }
        
        .map-tiles {
            filter: invert(1) hue-rotate(180deg) saturate(0.3) brightness(0.7);
        }
    </style>
</head>
<body>
    <div class="radar-container">
        <div class="radar-info">
            <h3>🛩️ RADAR DISPLAY</h3>
            <div class="radar-stats">
                <div>Aircraft Online: <span id="aircraft-count">0</span></div>
                <div>Update Rate: 5 seconds</div>
                <div>Last Update: <span id="last-update">--:--:--</span></div>
                <hr style="border-color: #00ff00; margin: 10px 0;">
                <div><a href="status.php" style="color: #00ff00; text-decoration: none;">← Back to List View</a></div>
            </div>
        </div>
        
        <div class="refresh-indicator" id="refresh-indicator">
            Initializing...
        </div>
        
        <div id="radar-map"></div>
    </div>
</body>
</html>

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
    <link rel="icon" href="https://transmitter.virtualflight.online/vfo_logo_300x300.jpg" />
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

	.radar-stats A {
	    color: #557799 !important;
	}

	.radar-stats A:hover {
	    color: #00ff00 !important;
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
        
        /* Custom Draggable Toolbar Styles */
        .radar-toolbar {
            position: absolute;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 8px;
            z-index: 1001;
            display: flex;
            flex-direction: column;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
            backdrop-filter: blur(10px);
            user-select: none;
            transition: all 0.3s ease;
            animation: toolbarSlideIn 0.5s ease-out;
            width: auto;
            min-width: 56px;
            box-sizing: border-box;
        }
        
        @keyframes toolbarSlideIn {
            from {
                transform: translateY(-50%) translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateY(-50%) translateX(0);
                opacity: 1;
            }
        }
        
        .radar-toolbar:hover {
            box-shadow: 0 6px 20px rgba(0, 255, 0, 0.4);
            border-color: #00ffff;
        }
        
        /* Prevent toolbar from changing size during drag */
        .radar-toolbar.dragging {
            transition: none !important;
            transform: none !important;
            right: auto !important;
        }
        
        .toolbar-drag-handle {
            background: rgba(0, 40, 80, 0.8);
            border: 1px solid #00ff00;
            border-radius: 4px;
            padding: 6px 8px;
            cursor: grab;
            text-align: center;
            color: #00ff00;
            font-size: 10px;
            margin-bottom: 4px;
            transition: all 0.2s ease;
            flex-shrink: 0;
            user-select: none;
            min-height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toolbar-drag-handle:hover {
            background: rgba(0, 60, 120, 0.9);
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
        }
        
        .toolbar-drag-handle:active {
            cursor: grabbing;
        }
        
        .toolbar-btn {
            background: rgba(0, 40, 80, 0.8);
            border: 1px solid #00ff00;
            border-radius: 4px;
            color: #00ff00;
            padding: 8px 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 16px;
            min-width: 40px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toolbar-btn:hover {
            background: rgba(0, 60, 120, 0.9);
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
            transform: translateY(-1px);
        }
        
        .toolbar-btn:active {
            transform: translateY(0);
            box-shadow: 0 0 4px rgba(0, 255, 0, 0.3);
        }
        
        .toolbar-btn i {
            pointer-events: none;
        }
        
        .toolbar-separator {
            height: 1px;
            background: rgba(0, 255, 0, 0.3);
            margin: 4px 0;
        }
        
        /* Layer change notification */
        .layer-notification {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff00;
            border-radius: 8px;
            padding: 12px 20px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        /* Aircraft List Styles */
        .aircraft-list-container {
            position: absolute;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff00;
            border-radius: 8px;
            z-index: 1500;
            display: none;
            min-width: 600px;
            max-width: 800px;
            box-shadow: 0 6px 20px rgba(0, 255, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        
        .aircraft-list-header {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: rgba(0, 40, 80, 0.9);
            border-bottom: 1px solid #00ff00;
            border-radius: 6px 6px 0 0;
        }
        
        .aircraft-list-drag-handle {
            cursor: grab;
            color: #00ff00;
            margin-right: 8px;
            font-size: 12px;
        }
        
        .aircraft-list-drag-handle:active {
            cursor: grabbing;
        }
        
        .aircraft-list-title {
            flex-grow: 1;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            font-size: 14px;
        }
        
        .aircraft-list-close {
            background: none;
            border: none;
            color: #00ff00;
            cursor: pointer;
            font-size: 14px;
            padding: 4px;
            border-radius: 3px;
            transition: background 0.2s ease;
        }
        
        .aircraft-list-close:hover {
            background: rgba(255, 0, 0, 0.3);
        }
        
        .aircraft-list-table-container {
            max-height: 400px;
            overflow-y: auto;
            padding: 8px;
        }
        
        .aircraft-list-table {
            width: 100%;
            border-collapse: collapse;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
        
        .aircraft-list-table th {
            background: rgba(0, 40, 80, 0.8);
            border: 1px solid #00ff00;
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .aircraft-list-table td {
            border: 1px solid rgba(0, 255, 0, 0.3);
            padding: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .aircraft-row {
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .aircraft-row:hover {
            background: rgba(0, 60, 120, 0.5);
        }
        
        .aircraft-row:active {
            background: rgba(0, 80, 160, 0.7);
        }
        
        .callsign-cell {
            font-weight: bold;
            color: #00ffff;
        }
        
        .number-cell {
            text-align: right;
            font-family: 'Courier New', monospace;
        }
        
        .no-aircraft-cell {
            text-align: center;
            font-style: italic;
            color: #ffff00;
            padding: 20px;
        }
        
        /* Aircraft highlight animation */
        @keyframes aircraftHighlight {
            0%, 100% { 
                transform: scale(1);
                filter: drop-shadow(0 0 3px #00ff00);
            }
            50% { 
                transform: scale(1.3);
                filter: drop-shadow(0 0 15px #ffff00);
            }
        }
        
        /* Hide default Leaflet zoom controls */
        .leaflet-control-zoom {
            display: none !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .radar-toolbar {
                right: 10px;
                top: 60px;
                transform: none;
            }
            
            .toolbar-btn {
                min-width: 36px;
                min-height: 36px;
                font-size: 14px;
            }
            
            .aircraft-list-container {
                left: 10px;
                right: 10px;
                transform: none;
                min-width: auto;
                max-width: none;
                width: calc(100% - 20px);
            }
            
            .aircraft-list-table {
                font-size: 10px;
            }
            
            .aircraft-list-table th,
            .aircraft-list-table td {
                padding: 4px 3px;
            }
        }
        
        /* Smooth Movement Button States */
        .toolbar-btn.smooth-enabled {
            background: rgba(0, 255, 100, 0.8) !important;
        }
        
        .toolbar-btn.smooth-enabled:hover {
            background: rgba(0, 255, 120, 0.9) !important;
        }
        
        .toolbar-btn.smooth-disabled {
            background: rgba(0, 40, 80, 0.8) !important;
        }
        
        .toolbar-btn.smooth-disabled:hover {
            background: rgba(0, 60, 120, 0.9) !important;
        }
    </style>
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

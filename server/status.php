<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Virtual Flight Online - Aircraft Status</title>
    <link rel="shortcut icon" type="image/jpg" href="virtualflightonline.jpg"/>
    
    <!-- Bootstrap CSS (Updated to latest) -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome (Updated) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Leaflet CSS (Updated) -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    
    <!-- Custom CSS -->
    <link href="style.css" rel="stylesheet" />
    <link rel="icon" href="https://transmitter.virtualflight.online/vfo_logo_300x300.jpg" />
    <style>
        /* Enhanced styling for better UX */
        .status-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
            border-radius: 0 0 15px 15px;
        }
        
        .status-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            overflow: hidden;
        }
        
        .status-card-header {
            background: #f8f9fa;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #dee2e6;
            font-weight: 600;
        }
        
        .status-card-body {
            padding: 1.5rem;
        }
        
        .aircraft-table {
            font-size: 0.9rem;
        }
        
        .aircraft-table th {
            background: #f8f9fa;
            border-top: none;
            font-weight: 600;
            cursor: pointer;
        }
        
        .aircraft-table th:hover {
            background: #e9ecef;
        }
        
        .callsign-link {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 600;
        }
        
        .callsign-link:hover {
            color: #0a58ca;
            text-decoration: underline;
        }
        
        .refresh-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: #e7f3ff;
            border: 1px solid #b8daff;
            border-radius: 0.375rem;
            font-size: 0.9rem;
        }
        
        .refresh-indicator.updating {
            background: #fff3cd;
            border-color: #ffecb5;
        }
        
        .refresh-indicator .spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .map-container {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .table-container {
            max-height: 600px;
            overflow-y: auto;
            border-radius: 8px;
        }
        
        @media (max-width: 768px) {
            .status-header h1 {
                font-size: 2rem;
            }
            
            .aircraft-table {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body class="bg-light">
    <header class="status-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="display-4 mb-0">
                        <i class="fas fa-globe-americas me-3"></i>
                        Who is Online?
                    </h1>
                    <p class="lead mb-0 mt-2">Live tracking of online pilots</p>
                </div>
                <div class="col-md-4 text-md-end">
                    <div class="refresh-indicator" id="refresh-indicator">
                        <i class="fas fa-sync-alt spinner" id="refresh-spinner"></i>
                        <span id="refresh-text">Loading...</span>
                    </div>
                    <div class="mt-2">
                        <small class="text-light">Last update: <span id="last-update">--</span></small>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="container">
        
        <!-- Map Section -->
        <div class="status-card">
            <div class="status-card-header">
                <h5 class="mb-0">
                    <i class="fas fa-map-marked-alt me-2"></i>
                    Live Map View
                </h5>
            </div>
            <div class="status-card-body p-0">
                <div class="map-container">
                    <div id="map" style="width:100%;height:500px;"></div>
                </div>
            </div>
        </div>

        <!-- Aircraft List Section -->
        <div class="status-card">
            <div class="status-card-header">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2"></i>
                    Aircraft List
                </h5>
            </div>
            <div class="status-card-body">
                <!-- Aircraft Table -->
                <div class="table-container">
                    <table class="table table-hover table-striped aircraft-table" id="aircraft_table">
                        <thead>
                            <tr>
                                <th class="text-center" title="Aircraft Status">
                                    <i class="fas fa-info-circle"></i>
                                </th>
                                <th data-sort="callsign" title="Click to sort by Callsign">
                                    Callsign <i class="fas fa-sort"></i>
                                </th>
                                <th data-sort="pilot_name" title="Click to sort by Pilot Name">
                                    Pilot <i class="fas fa-sort"></i>
                                </th>
                                <th data-sort="aircraft_type" title="Click to sort by Aircraft Type">
                                    Aircraft <i class="fas fa-sort"></i>
                                </th>
                                <th data-sort="group_name" title="Click to sort by Group">
                                    Group <i class="fas fa-sort"></i>
                                </th>
                                <th data-sort="msfs_server" title="Click to sort by Server">
                                    Server <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="altitude" title="Click to sort by Altitude">
                                    ALT <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="heading" title="Click to sort by Heading">
                                    HDG <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="airspeed" title="Click to sort by Airspeed">
                                    IAS <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="groundspeed" title="Click to sort by Groundspeed">
                                    GS <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-center" data-sort="touchdown_velocity" title="Click to sort by Landing Rate">
                                    LLR (ft/min) <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-center" data-sort="time_online" title="Click to sort by Time Online">
                                    Online <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-center" data-sort="version" title="Click to sort by Version">
                                    Version <i class="fas fa-sort"></i>
                                </th>
                            </tr>
                        </thead>
                        <tbody id="aircraft-tbody">
                            <!-- Aircraft rows will be inserted here -->
                        </tbody>
                    </table>
                </div>
                
                <div class="mt-3 d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <span id="aircraft_count">0</span> aircraft listed. Auto-refresh every 30 seconds.
                    </small>
                    <div>
                        <small class="text-muted me-3">
                            Moving: <span id="moving-count">0</span>
                        </small>
                        <small class="text-muted">
                            Servers: <span id="server-count">0</span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4 mb-4">
            <div class="col">
                <div class="d-flex gap-2 flex-wrap">
		    <button class="btn btn-outline-success ms-auto" onclick="refreshData()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
        </div>

        <div class="row mt-4 mb-4">
            <div class="col">
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <a href="https://virtualflight.online" class="btn btn-outline-secondary">
                        <i class="fas fa-home"></i> Home
                    </a>
                    <a href="https://virtualflightonline.substack.com" class="btn btn-outline-secondary">
                        <i class="fas fa-newspaper"></i> Newsletter
                    </a>
                    <a href="https://forums.virtualflight.online" class="btn btn-outline-secondary">
                        <i class="fas fa-comment"></i> Forums
                    </a>
                    <a href="https://bit.ly/virtualflightonlinediscord" class="btn btn-outline-secondary">
                        <i class="fa-brands fa-discord"></i> Discord
                    </a>
                    <a href="https://facebook.com/groups/virtualflightonline" class="btn btn-outline-secondary">
                        <i class="fa-brands fa-facebook"></i> Facebook
                    </a>
                    <a href="https://airline.virtualflight.online" class="btn btn-outline-secondary">
                        <i class="fas fa-plane"></i> Airline
                    </a>
                    <a href="https://transmitter.virtualflight.online" class="btn btn-outline-secondary">
                        <i class="fas fa-satellite-dish"></i> Transmitter
                    </a>

                </div>
            </div>
        </div>
    </div>
    
    <!-- jQuery (Updated) -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    
    <!-- Bootstrap JS (Updated) -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Leaflet JS (Updated) -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js"></script>
    
    <!-- Enhanced Status JS -->
    <script src="status_improved.js?t=<?php echo time(); ?>"></script>
</body>
</html>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Virtual Flight Online - Aircraft Status</title>
    <link rel="shortcut icon" type="image/jpg" href="virtualflightonline.jpg"/>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    
    <!-- Custom CSS -->
    <link href="style.css" rel="stylesheet" />
    
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
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .aircraft-table th:hover {
            background: #e9ecef;
            cursor: pointer;
        }
        
        .aircraft-table .table-hover tbody tr:hover {
            background-color: rgba(0, 123, 255, 0.1);
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
        
        .status-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .status-online {
            background: #d1e7dd;
            color: #0f5132;
        }
        
        .status-moving {
            background: #fff3cd;
            color: #664d03;
        }
        
        .stats-container {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        
        .stat-item {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
            flex: 1;
            min-width: 150px;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0d6efd;
        }
        
        .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
            margin-top: 0.25rem;
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
        
        .filter-controls {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        
        .btn-group-toggle .btn {
            border-radius: 0.375rem !important;
            margin: 0 0.25rem;
        }
        
        @media (max-width: 768px) {
            .status-header h1 {
                font-size: 2rem;
            }
            
            .stats-container {
                justify-content: center;
            }
            
            .aircraft-table {
                font-size: 0.8rem;
            }
            
            .table-container {
                max-height: 400px;
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
                        Aircraft Status
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
        <!-- Statistics Section -->
        <div class="stats-container">
            <div class="stat-item">
                <div class="stat-value" id="total-aircraft">0</div>
                <div class="stat-label">Total Aircraft</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="moving-aircraft">0</div>
                <div class="stat-label">Moving Aircraft</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="unique-servers">0</div>
                <div class="stat-label">Active Servers</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="unique-groups">0</div>
                <div class="stat-label">Groups Online</div>
            </div>
        </div>

        <!-- Navigation -->
        <div class="row mb-4">
            <div class="col">
                <div class="d-flex gap-2 flex-wrap">
                    <a href="radar.php" class="btn btn-primary">
                        <i class="fas fa-radar-dish"></i> Advanced Radar
                    </a>
                    <a href="index.html" class="btn btn-outline-secondary">
                        <i class="fas fa-home"></i> Home
                    </a>
                    <a href="test_aircraft.php" class="btn btn-outline-info">
                        <i class="fas fa-vial"></i> Test Tools
                    </a>
                    <button class="btn btn-outline-success" onclick="refreshData()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
        </div>

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
            <div class="status-card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">
                    <i class="fas fa-list me-2"></i>
                    Aircraft List
                </h5>
                <div class="btn-group btn-group-sm" role="group">
                    <input type="radio" class="btn-check" name="view-mode" id="view-all" autocomplete="off" checked>
                    <label class="btn btn-outline-primary" for="view-all">All</label>
                    
                    <input type="radio" class="btn-check" name="view-mode" id="view-moving" autocomplete="off">
                    <label class="btn btn-outline-primary" for="view-moving">Moving Only</label>
                    
                    <input type="radio" class="btn-check" name="view-mode" id="view-stationary" autocomplete="off">
                    <label class="btn btn-outline-primary" for="view-stationary">Stationary</label>
                </div>
            </div>
            <div class="status-card-body">
                <!-- Filter Controls -->
                <div class="filter-controls">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label for="filter-callsign" class="form-label">Filter by Callsign</label>
                            <input type="text" class="form-control" id="filter-callsign" placeholder="Enter callsign...">
                        </div>
                        <div class="col-md-3">
                            <label for="filter-server" class="form-label">Filter by Server</label>
                            <select class="form-select" id="filter-server">
                                <option value="">All Servers</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-group" class="form-label">Filter by Group</label>
                            <select class="form-select" id="filter-group">
                                <option value="">All Groups</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="filter-aircraft" class="form-label">Filter by Aircraft</label>
                            <input type="text" class="form-control" id="filter-aircraft" placeholder="Aircraft type...">
                        </div>
                    </div>
                </div>

                <!-- Aircraft Table -->
                <div class="table-container">
                    <table class="table table-hover table-striped aircraft-table" id="aircraft_table">
                        <thead>
                            <tr>
                                <th class="text-center" data-sort="status" title="Aircraft Status">
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
                                    Altitude <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="heading" title="Click to sort by Heading">
                                    Heading <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="airspeed" title="Click to sort by Airspeed">
                                    IAS <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-end" data-sort="groundspeed" title="Click to sort by Groundspeed">
                                    GS <i class="fas fa-sort"></i>
                                </th>
                                <th class="text-center" data-sort="touchdown_velocity" title="Click to sort by Landing Rate">
                                    LLR <i class="fas fa-sort"></i>
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
                
                <div class="mt-3 text-muted">
                    <small>
                        Showing <span id="filtered-count">0</span> of <span id="total-count">0</span> aircraft.
                        Auto-refresh every 30 seconds.
                    </small>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js"></script>
    
    <!-- Enhanced Status JS -->
    <script src="status_enhanced.js?t=<?php echo time(); ?>"></script>
</body>
</html>

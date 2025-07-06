class RadarDisplay {
    constructor() {
        this.map = null;
        this.aircraftMarkers = new Map();
        this.headingLines = new Map();
        this.labelLayers = new Map(); // New: for aircraft labels
        this.labelLines = new Map(); // New: for label connecting lines
        this.labelPixelPositions = new Map(); // Store pixel offsets instead of geo offsets
        this.updateInterval = 5000; // 5 seconds
        this.radarDataUrl = 'radar_data.php';
        this.defaultPixelOffset = [60, 80]; // Fixed pixel offset for new labels
        this.isInitialLoad = true; // Track if this is the first load for auto-positioning
        
        // Aircraft list management
        this.aircraftListVisible = false;
        this.aircraftListTable = null;
        
        // Grid management
        this.gridVisible = false;
        this.gridLayer = null;
        
        // Smooth movement system
        this.aircraftPositions = new Map(); // Store aircraft movement data
        this.smoothMovementEnabled = false; // Start disabled
        this.interpolationInterval = 100; // Update positions every 100ms
        this.interpolationTimer = null;
        this.lastDataUpdateTime = null;
        this.lastKnownAircraftPositions = new Map(); // Track positions to avoid unnecessary updates
        this.lastLabelContentUpdate = new Map(); // Track when label content was last updated
        
        // Measurement tool
        this.measurementActive = false;
        this.measurementStartPoint = null;
        this.measurementLine = null;
        this.measurementLabel = null;
        
        // Range ring tool
        this.rangeRingActive = false;
        this.rangeRingCenter = null;
        this.rangeRingCircle = null;
        this.rangeRingCenterMarker = null;
        this.rangeRingLabel = null;
        
        // Aircraft tracking
        this.trackedCallsign = null; // Callsign to track from URL parameter
        this.isTrackingEnabled = false; // Whether tracking is currently active
        
        // Tile layer configuration
        this.currentTileLayerIndex = 0;
        this.currentTileLayer = null;
        this.tileLayers = [
            {
                name: 'OpenStreetMap',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '© OpenStreetMap contributors',
                className: 'map-tiles',
                opacity: 0.8,
                aircraftColor: '#00ff00',
                labelBackground: 'rgba(0, 32, 0, 0.9)' // White background for light maps
            },
            {
                name: 'Satellite',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '© Esri, Maxar, Earthstar Geographics',
                className: '',
                opacity: 0.8,
                aircraftColor: '#fff',
                labelBackground: 'rgba(0, 0, 0, 0.5)' // Dark background for satellite imagery
            },
            {
                name: 'Dark Mode',
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                attribution: '© OpenStreetMap contributors © CARTO',
                className: '',
                opacity: 0.8,
                aircraftColor: '#ddd',
                labelBackground: 'rgba(0, 0, 0, 0.5)' // Very dark background for dark mode
            },
            {
                name: 'Aviation Chart',
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attribution: '© OpenStreetMap contributors © CARTO',
                className: '',
                opacity: 0.8,
                aircraftColor: '#333',
                labelBackground: 'rgba(255, 255, 255, 0.5)' // Light lavender background for aviation charts
            },
            {
                name: 'Topographic',
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attribution: '© OpenTopoMap (CC-BY-SA)',
                className: '',
                opacity: 0.8,
                aircraftColor: '#000',
                labelBackground: 'rgba(255, 255, 255, 0.8)' // Cornsilk background for topographic maps
            },
            {
                name: 'No Map',
                url: null,
                attribution: '',
                className: '',
                opacity: 0,
                aircraftColor: '#1e90ff', // Dodger blue for no map background
                labelBackground: 'rgba(240, 248, 255, 0.95)' // Alice blue background for no map
            }
        ];
        
        this.init();
    }
    
    init() {
        this.parseUrlParameters();
        this.initMap();
        this.startRadarUpdates();
    }
    
    initMap() {
        // Initialize the map
        this.map = L.map('radar-map', {
            preferCanvas: true,
            attributionControl: false,
            zoomControl: false // Disable default zoom controls
        }).setView([39.8283, -98.5795], 4); // Center on USA
        
        // Add initial tile layer
        this.loadTileLayer(this.currentTileLayerIndex);
        
        // Add custom attribution
        L.control.attribution({
            prefix: false,
            position: 'bottomright'
        }).addAttribution('Virtual Flight Online Radar').addTo(this.map);
        
        // Add zoom event listener for label visibility
        this.map.on('zoomend', () => {
            this.handleZoomChange();
        });
        
        // Add move event listener for grid updates
        this.map.on('moveend', () => {
            this.handleMapMove();
        });
        
        // Initialize measurement tool
        this.initMeasurementTool();
        
        // Initialize custom draggable toolbar
        this.initCustomToolbar();
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
        
        console.log('Radar map initialized');
    }
    
    loadTileLayer(index) {
        // Remove current tile layer if it exists
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }
        
        const layerConfig = this.tileLayers[index];
        
        // Update attribution
        const attributionControl = this.map.attributionControl;
        if (attributionControl) {
            // Clear existing attributions and add the new one
            attributionControl._attributions = {};
            attributionControl.addAttribution('Virtual Flight Online Radar');
            if (layerConfig.attribution) {
                attributionControl.addAttribution(layerConfig.attribution);
            }
        }
        
        // Add new tile layer if URL is provided
        if (layerConfig.url) {
            this.currentTileLayer = L.tileLayer(layerConfig.url, {
                attribution: layerConfig.attribution,
                className: layerConfig.className,
                opacity: layerConfig.opacity,
                maxZoom: 18
            }).addTo(this.map);
        } else {
            this.currentTileLayer = null;
        }
        
        // Update the layers button to show current layer
        this.updateLayersButton();
        
        // Update aircraft colors for the new tile layer
        this.updateAircraftColors();
    }
    
    updateLayersButton() {
        const layersBtn = document.getElementById('layers-btn');
        if (layersBtn) {
            const currentLayer = this.tileLayers[this.currentTileLayerIndex];
            layersBtn.title = `Map Layer: ${currentLayer.name} (L)`;
            
            // Update button appearance based on layer type
            switch (currentLayer.name) {
                case 'No Map':
                    layersBtn.style.background = 'rgba(255, 100, 0, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    break;
                case 'Satellite':
                    layersBtn.style.background = 'rgba(100, 150, 255, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-satellite"></i>';
                    break;
                case 'Dark Mode':
                    layersBtn.style.background = 'rgba(50, 50, 50, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-moon"></i>';
                    break;
                case 'Aviation Chart':
                    layersBtn.style.background = 'rgba(0, 150, 255, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-plane"></i>';
                    break;
                case 'Topographic':
                    layersBtn.style.background = 'rgba(139, 69, 19, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-mountain"></i>';
                    break;
                case 'Terrain':
                    layersBtn.style.background = 'rgba(34, 139, 34, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-globe-americas"></i>';
                    break;
                default:
                    layersBtn.style.background = 'rgba(0, 40, 80, 0.8)';
                    layersBtn.innerHTML = '<i class="fas fa-layer-group"></i>';
                    break;
            }
        }
    }
    
    async fetchRadarData() {
        try {
            const response = await fetch(this.radarDataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check for cache information
            const cacheInfo = response.headers.get('X-Cache-Info');
            if (cacheInfo) {
                console.log('Cache Info:', cacheInfo);
                this.updateCacheInfo(cacheInfo);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching radar data:', error);
            return [];
        }
    }
    
    updateCacheInfo(cacheInfo) {
        // Add cache info to the radar display
        const refreshIndicator = document.getElementById('refresh-indicator');
        if (refreshIndicator && cacheInfo.includes('APCu')) {
            refreshIndicator.title = cacheInfo;
        }
    }
    
    updateRefreshIndicator(status) {
        const indicator = document.getElementById('refresh-indicator');
        if (indicator) {
            indicator.textContent = status;
            indicator.className = status.includes('Updating') ? 'refresh-indicator refresh-active' : 'refresh-indicator';
        }
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const element = document.getElementById('last-update');
        if (element) {
            element.textContent = timeString;
        }
    }
    
    updateAircraftCount(count) {
        const element = document.getElementById('aircraft-count');
        if (element) {
            element.textContent = count;
        }
    }
    
    createAircraftIcon(aircraft) {
        const isMoving = aircraft.groundspeed > 10;
        const iconHtml = isMoving ? 
            '<i class="fas fa-plane aircraft-icon"></i>' : 
            '<i class="fas fa-circle aircraft-icon"></i>';
        
        // Get aircraft color for current tile layer
        const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
        const aircraftColor = currentTileLayer.aircraftColor || '#ff6b35'; // Default orange
        
        // Calculate rotation angle (heading - 90 degrees to align with north)
        let rotationAngle = aircraft.heading - 90;
        if (rotationAngle < 0) rotationAngle += 360;
        
        return L.divIcon({
            className: 'aircraft-marker',
            html: `<div style="transform: rotate(${rotationAngle}deg); color: ${aircraftColor};">${iconHtml}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }
    
    createPopupContent(aircraft) {
        const isTracked = this.trackedCallsign === aircraft.callsign.toUpperCase();
        const trackingIcon = isTracked ? '🎯' : '📍';
        const trackingText = isTracked ? 'Stop Tracking' : 'Track Aircraft';
        const trackingColor = isTracked ? '#ff6b6b' : '#4dabf7';
        
        return `
            <div style="min-width: 200px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #00ff00; display: flex; align-items: center; justify-content: space-between;">
                    <span>${aircraft.callsign}</span>
                    <span 
                        id="track-btn-${aircraft.callsign.replace(/[^a-zA-Z0-9]/g, '_')}" 
                        style="cursor: pointer; font-size: 14px; padding: 2px 6px; background-color: ${trackingColor}; color: white; border-radius: 3px; margin-left: 10px; user-select: none;"
                        title="${trackingText}"
                        onclick="window.radar.toggleTrackingFromPopup('${aircraft.callsign}')"
                    >
                        ${trackingIcon} ${isTracked ? 'Stop' : 'Track'}
                    </span>
                </div>
                <div style="color: #88ff88; margin-bottom: 8px;">
                    ${aircraft.pilot_name} - ${aircraft.group_name}
                </div>
                <table style="width: 100%; font-size: 12px;">
                    <tr><td>Aircraft:</td><td>${aircraft.aircraft_type}</td></tr>
                    <tr><td>Altitude:</td><td>${Math.round(aircraft.altitude)} ft</td></tr>
                    <tr><td>Heading:</td><td>${Math.round(aircraft.heading)}°</td></tr>
                    <tr><td>Speed:</td><td>${Math.round(aircraft.groundspeed)} kts</td></tr>
                    <tr><td>Server:</td><td>${aircraft.msfs_server}</td></tr>
                    <tr><td>Online:</td><td>${aircraft.time_online}</td></tr>
                </table>
                ${aircraft.notes ? `<div style="margin-top: 8px; font-style: italic;">${aircraft.notes}</div>` : ''}
            </div>
        `;
    }
    
    drawHeadingLine(aircraft) {
        const callsign = aircraft.callsign;
        
        // Remove existing heading line
        if (this.headingLines.has(callsign)) {
            this.map.removeLayer(this.headingLines.get(callsign));
        }
        
        // Only draw heading line for moving aircraft
        if (aircraft.groundspeed < 10) {
            return;
        }
        
        // Calculate end point of heading line - adjust distance based on zoom level
        const startLat = aircraft.latitude;
        const startLng = aircraft.longitude;
        const zoom = this.map.getZoom();
        
        // Scale distance inversely with zoom to maintain consistent visual size
        const baseDistance = 0.1; // Base distance at zoom level 1
        const distance = baseDistance / Math.pow(2, zoom - 4); // Adjust for zoom level
        const heading = aircraft.heading * Math.PI / 180; // Convert to radians
        
        const endLat = startLat + (distance * Math.cos(heading));
        const endLng = startLng + (distance * Math.sin(heading));
        
        // Get aircraft color for current tile layer and make heading line slightly different
        const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
        const baseColor = currentTileLayer.aircraftColor || '#ff6b35';
        const headingLineColor = this.getHeadingLineColor(baseColor);
        
        const headingLine = L.polyline([
            [startLat, startLng],
            [endLat, endLng]
        ], {
            color: headingLineColor,
            weight: 1, // Thinner line (was 2)
            opacity: 0.8
        });
        
        headingLine.addTo(this.map);
        this.headingLines.set(callsign, headingLine);
    }
    
    createAircraftLabel(aircraft) {
        const callsign = aircraft.callsign;
        const position = [aircraft.latitude, aircraft.longitude];
        
        // Get aircraft color for current tile layer
        const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
        const aircraftColor = currentTileLayer.aircraftColor || '#ff6b35';
        const labelBackground = currentTileLayer.labelBackground || 'rgba(0, 20, 40, 0.95)';
        const labelLineColor = aircraftColor; // Use same color as aircraft
        
        // Get pixel offset for this aircraft (either saved or default)
        let pixelOffset;
        if (this.labelPixelPositions.has(callsign)) {
            pixelOffset = this.labelPixelPositions.get(callsign);
        } else {
            // Use default pixel offset for new aircraft
            pixelOffset = [...this.defaultPixelOffset]; // Copy the array
            this.labelPixelPositions.set(callsign, pixelOffset);
        }
        
        // Convert pixel offset to geographic position based on current zoom
        const labelPosition = this.pixelOffsetToLatLng(position, pixelOffset);
        
        // Create label content with tile layer-specific styling
        const labelText = `
            <div style="
                background: ${labelBackground};
                color: ${aircraftColor};
                padding: 3px 6px;
                border: 1px solid ${aircraftColor};
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                white-space: nowrap;
                box-shadow: 0 0 8px ${aircraftColor}40;
                cursor: move;
            ">
                <div style="font-weight: bold; font-size: 11px;">${aircraft.callsign}</div>
                <div style="font-size: 9px; opacity: 0.8; margin-top: 1px;">
                    ${Math.round(aircraft.altitude)}ft • ${Math.round(aircraft.groundspeed)}kts
                </div>
            </div>
        `;
        
        // Create label marker with center anchor so line connects to middle
        const labelMarker = L.marker(labelPosition, {
            icon: L.divIcon({
                className: 'aircraft-label draggable-label',
                html: labelText,
                iconSize: [100, 35],
                iconAnchor: [50, 17.5] // Center of the label
            }),
            draggable: true
        });
        
        // Create connecting line from aircraft to center of label with dynamic color
        const labelLine = L.polyline([position, labelPosition], {
            color: labelLineColor,
            weight: 1,
            opacity: 0.7,
            dashArray: '1, 2'
        });
        
        // Group line and label - LINE FIRST so label draws over it
        const labelGroup = L.layerGroup([labelLine, labelMarker]);
        
        // Add drag event handlers to update line and save position
        labelMarker.on('drag', (e) => {
            const newLabelPos = e.target.getLatLng();
            const newLabelPosArray = [newLabelPos.lat, newLabelPos.lng];
            
            // Get current aircraft position from the aircraft marker
            const aircraftMarker = this.aircraftMarkers.get(callsign);
            let currentAircraftPos = position; // fallback to original position
            
            if (aircraftMarker) {
                const currentLatLng = aircraftMarker.getLatLng();
                currentAircraftPos = [currentLatLng.lat, currentLatLng.lng];
            }
            
            // Update the connecting line from current aircraft position to new label position
            labelLine.setLatLngs([currentAircraftPos, newLabelPosArray]);
            
            // Convert the new position to pixel offset and save it
            const newPixelOffset = this.latLngToPixelOffset(currentAircraftPos, newLabelPosArray);
            this.labelPixelPositions.set(callsign, newPixelOffset);
        });
        
        labelMarker.on('dragend', (e) => {
            console.log(`Label position saved for ${callsign}`);
        });
        
        return labelGroup;
    }

    drawAircraftLabel(aircraft) {
        const callsign = aircraft.callsign;
        const zoom = this.map.getZoom();
        
        // Remove existing label
        if (this.labelLayers.has(callsign)) {
            this.map.removeLayer(this.labelLayers.get(callsign));
        }
        
        // Only create labels at zoom level 6 and above
        if (zoom >= 6) {
            const labelGroup = this.createAircraftLabel(aircraft);
            labelGroup.addTo(this.map);
            this.labelLayers.set(callsign, labelGroup);
        }
    }
    
    // Update label position when aircraft moves (for dragged labels)
    updateLabelPosition(aircraft) {
        const callsign = aircraft.callsign;
        if (!this.labelLayers.has(callsign) || !this.labelPixelPositions.has(callsign)) {
            return;
        }
        
        const position = [aircraft.latitude, aircraft.longitude];
        const savedPixelOffset = this.labelPixelPositions.get(callsign);
        
        // Convert pixel offset to current geographic position
        const newLabelPosition = this.pixelOffsetToLatLng(position, savedPixelOffset);
        
        // Get the label group and update both line and marker
        const labelGroup = this.labelLayers.get(callsign);
        const layers = labelGroup.getLayers();
        
        if (layers.length >= 2) {
            const labelLine = layers[0]; // Line is first
            const labelMarker = layers[1]; // Marker is second
            
            // Update line coordinates
            labelLine.setLatLngs([position, newLabelPosition]);
            
            // Update marker position
            labelMarker.setLatLng(newLabelPosition);
        }
    }

    // Smooth Movement System Methods
    
    setupAircraftMovement(aircraft, currentTime) {
        const callsign = aircraft.callsign;
        const targetLat = aircraft.latitude;
        const targetLng = aircraft.longitude;
        const heading = aircraft.heading || 0;
        const groundspeed = aircraft.groundspeed || 0;
        
        if (!this.aircraftPositions.has(callsign)) {
            // New aircraft - start at target position
            this.aircraftPositions.set(callsign, {
                currentLat: targetLat,
                currentLng: targetLng,
                targetLat: targetLat,
                targetLng: targetLng,
                heading: heading,
                groundspeed: groundspeed,
                lastUpdateTime: currentTime,
                interpolationStartTime: currentTime,
                interpolationDuration: this.updateInterval // Time to reach target
            });
        } else {
            // Existing aircraft - update target and movement data
            const positionData = this.aircraftPositions.get(callsign);
            
            // Check if target position has changed significantly (more than ~100 meters)
            const distance = this.calculateDistance(
                positionData.targetLat, positionData.targetLng,
                targetLat, targetLng
            );
            
            if (distance > 0.001 || Math.abs(positionData.groundspeed - groundspeed) > 5) {
                // Update target position and movement parameters
                positionData.targetLat = targetLat;
                positionData.targetLng = targetLng;
                positionData.heading = heading;
                positionData.groundspeed = groundspeed;
                positionData.lastUpdateTime = currentTime;
                positionData.interpolationStartTime = currentTime;
                positionData.interpolationDuration = this.updateInterval;
            }
        }
    }
    
    startSmoothMovement() {
        if (this.interpolationTimer) {
            clearInterval(this.interpolationTimer);
        }
        
        this.interpolationTimer = setInterval(() => {
            this.updateSmoothMovement();
        }, this.interpolationInterval);
        
        console.log('Smooth aircraft movement started - aircraft and labels will move realistically based on heading and speed');
    }
    
    stopSmoothMovement() {
        if (this.interpolationTimer) {
            clearInterval(this.interpolationTimer);
            this.interpolationTimer = null;
        }
    }
    
    updateSmoothMovement() {
        const currentTime = Date.now();
        let hasMovingAircraft = false;
        
        for (const [callsign, positionData] of this.aircraftPositions) {
            const marker = this.aircraftMarkers.get(callsign);
            if (!marker) continue;
            
            // Calculate time since last update
            const deltaTime = currentTime - (positionData.lastMovementUpdate || currentTime);
            positionData.lastMovementUpdate = currentTime;
            
            // Choose interpolation method based on aircraft speed
            let newPosition;
            if (positionData.groundspeed > 10) {
                // Use physics-based movement for moving aircraft
                newPosition = this.interpolatePositionWithPhysics(positionData, 0, deltaTime);
                positionData.currentLat = newPosition.lat;
                positionData.currentLng = newPosition.lng;
            } else {
                // Use simple interpolation for stationary aircraft
                const elapsed = currentTime - positionData.interpolationStartTime;
                const progress = Math.min(elapsed / positionData.interpolationDuration, 1.0);
                newPosition = this.interpolatePosition(positionData, progress);
                positionData.currentLat = newPosition.lat;
                positionData.currentLng = newPosition.lng;
            }
            
            // Update marker position
            marker.setLatLng([newPosition.lat, newPosition.lng]);
            
            // Update aircraft label and connecting line position during smooth movement
            this.updateLabelForSmoothMovement(callsign, [newPosition.lat, newPosition.lng]);
            
            // Check if aircraft is still moving
            if (positionData.groundspeed > 10) {
                hasMovingAircraft = true;
            }
        }
        
        // If no aircraft are moving, we can reduce update frequency slightly
        if (!hasMovingAircraft && this.aircraftPositions.size === 0) {
            // No aircraft at all, stop smooth movement timer
            this.stopSmoothMovement();
        }
    }
    
    interpolatePosition(positionData, progress) {
        // Use easing function for smoother movement
        const easedProgress = this.easeInOutQuad(progress);
        
        // Simple linear interpolation between current and target positions
        const lat = positionData.currentLat + (positionData.targetLat - positionData.currentLat) * easedProgress;
        const lng = positionData.currentLng + (positionData.targetLng - positionData.currentLng) * easedProgress;
        
        return { lat, lng };
    }
    
    // Advanced interpolation using heading and speed for more realistic movement
    interpolatePositionWithPhysics(positionData, progress, deltaTime) {
        if (positionData.groundspeed < 10) {
            // Aircraft is stationary or moving very slowly, use simple interpolation
            return this.interpolatePosition(positionData, progress);
        }
        
        // Calculate movement based on heading and speed
        const speedKnots = positionData.groundspeed;
        const speedMetersPerSecond = speedKnots * 0.514444; // Convert knots to m/s
        const deltaTimeSeconds = deltaTime / 1000;
        
        // Convert heading to radians (heading 0 = North, clockwise)
        const headingRad = positionData.heading * Math.PI / 180;
        
        // Calculate movement in meters
        const distanceMeters = speedMetersPerSecond * deltaTimeSeconds;
        
        // Convert to latitude/longitude changes
        // 1 degree latitude ≈ 111,320 meters
        // 1 degree longitude ≈ 111,320 * cos(latitude) meters
        const deltaLat = (distanceMeters * Math.cos(headingRad)) / 111320;
        const avgLat = positionData.currentLat * Math.PI / 180;
        const deltaLng = (distanceMeters * Math.sin(headingRad)) / (111320 * Math.cos(avgLat));
        
        // Calculate new position
        let newLat = positionData.currentLat + deltaLat;
        let newLng = positionData.currentLng + deltaLng;
        
        // Ensure we don't overshoot the target position
        const distanceToTarget = this.calculateDistance(
            newLat, newLng,
            positionData.targetLat, positionData.targetLng
        );
        
        const originalDistance = this.calculateDistance(
            positionData.currentLat, positionData.currentLng,
            positionData.targetLat, positionData.targetLng
        );
        
        // If we're very close to target or would overshoot, snap to target
        if (distanceToTarget < 0.0001 || distanceToTarget > originalDistance) {
            newLat = positionData.targetLat;
            newLng = positionData.targetLng;
        }
        
        return { lat: newLat, lng: newLng };
    }
    
    updateLabelForSmoothMovement(callsign, aircraftPosition) {
        // Only update labels if they should be visible at current zoom level
        const zoom = this.map.getZoom();
        if (zoom < 6) {
            return; // Labels are not shown at zoom levels below 6
        }
        
        if (!this.labelLayers.has(callsign)) return;
        
        const labelGroup = this.labelLayers.get(callsign);
        const layers = labelGroup.getLayers();
        
        if (layers.length >= 2) {
            const labelLine = layers[0]; // Line is first
            const labelMarker = layers[1]; // Marker is second
            
            try {
                // Store the current aircraft position for this aircraft
                if (!this.lastKnownAircraftPositions) {
                    this.lastKnownAircraftPositions = new Map();
                }
                
                const lastPos = this.lastKnownAircraftPositions.get(callsign);
                const currentPos = aircraftPosition;
                
                // Only update if position has actually changed significantly to avoid unnecessary updates
                if (!lastPos || 
                    Math.abs(lastPos[0] - currentPos[0]) > 0.00005 || 
                    Math.abs(lastPos[1] - currentPos[1]) > 0.00005) {
                    
                    this.lastKnownAircraftPositions.set(callsign, [...currentPos]);
                    
                    // Check if this label has a saved pixel offset (user has dragged it)
                    if (this.labelPixelPositions.has(callsign)) {
                        // Label has been manually positioned - update label position based on pixel offset
                        const pixelOffset = this.labelPixelPositions.get(callsign);
                        const newLabelPosition = this.pixelOffsetToLatLng(aircraftPosition, pixelOffset);
                        
                        // Update label marker position
                        labelMarker.setLatLng(newLabelPosition);
                        
                        // Update connecting line to new positions
                        labelLine.setLatLngs([aircraftPosition, newLabelPosition]);
                    } else {
                        // Label is using default offset - recalculate position
                        const defaultLabelPosition = this.pixelOffsetToLatLng(aircraftPosition, this.defaultPixelOffset);
                        
                        // Update label marker position
                        labelMarker.setLatLng(defaultLabelPosition);
                        
                        // Update connecting line to new positions
                        labelLine.setLatLngs([aircraftPosition, defaultLabelPosition]);
                    }
                }
            } catch (error) {
                console.warn(`Error updating label for ${callsign}:`, error);
            }
        }
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        // Simple distance calculation for small distances
        const deltaLat = lat2 - lat1;
        const deltaLng = lng2 - lng1;
        return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    }
    
    updateAircraftDisplay(aircraftData) {
        const currentCallsigns = new Set(aircraftData.map(ac => ac.callsign));
        const currentTime = Date.now();
        
        // Store the time of this data update
        this.lastDataUpdateTime = currentTime;
        
        // Remove aircraft that are no longer online
        for (const [callsign, marker] of this.aircraftMarkers) {
            if (!currentCallsigns.has(callsign)) {
                // Remove aircraft marker
                if (this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
                this.aircraftMarkers.delete(callsign);
                
                // Remove associated heading line (clean up any existing heading lines)
                if (this.headingLines.has(callsign)) {
                    const headingLine = this.headingLines.get(callsign);
                    if (this.map.hasLayer(headingLine)) {
                        this.map.removeLayer(headingLine);
                    }
                    this.headingLines.delete(callsign);
                }
                
                // Remove associated label
                if (this.labelLayers.has(callsign)) {
                    const labelLayer = this.labelLayers.get(callsign);
                    if (this.map.hasLayer(labelLayer)) {
                        this.map.removeLayer(labelLayer);
                    }
                    this.labelLayers.delete(callsign);
                }
                
                // Remove saved label position
                if (this.labelPixelPositions.has(callsign)) {
                    this.labelPixelPositions.delete(callsign);
                }
                
                // Remove aircraft position data for smooth movement
                if (this.aircraftPositions.has(callsign)) {
                    this.aircraftPositions.delete(callsign);
                }
                
                // Remove last known position data
                if (this.lastKnownAircraftPositions.has(callsign)) {
                    this.lastKnownAircraftPositions.delete(callsign);
                }
            }
        }
        
        // Update or create aircraft markers with smooth movement
        aircraftData.forEach(aircraft => {
            const callsign = aircraft.callsign;
            const targetPosition = [aircraft.latitude, aircraft.longitude];
            
            // Always setup aircraft movement data (needed for both smooth and non-smooth modes)
            this.setupAircraftMovement(aircraft, currentTime);
            
            // Update or create aircraft marker
            if (this.aircraftMarkers.has(callsign)) {
                // Update existing marker
                const marker = this.aircraftMarkers.get(callsign);
                
                if (this.smoothMovementEnabled) {
                    // Use current interpolated position for smooth movement
                    const positionData = this.aircraftPositions.get(callsign);
                    marker.setLatLng([positionData.currentLat, positionData.currentLng]);
                } else {
                    // Jump directly to target position when smooth movement is disabled
                    marker.setLatLng(targetPosition);
                    
                    // Also update the position data to match the target
                    const positionData = this.aircraftPositions.get(callsign);
                    if (positionData) {
                        positionData.currentLat = positionData.targetLat;
                        positionData.currentLng = positionData.targetLng;
                    }
                }
                
                marker.setIcon(this.createAircraftIcon(aircraft));
                marker.getPopup().setContent(this.createPopupContent(aircraft));
                
                // Store updated aircraft data on the marker
                marker.aircraftData = aircraft;
                
                // Update label position if it was manually positioned
                this.updateLabelPosition(aircraft);
            } else {
                // Create new marker at target position
                const marker = L.marker(targetPosition, {
                    icon: this.createAircraftIcon(aircraft)
                });
                
                // Store aircraft data on the marker
                marker.aircraftData = aircraft;
                
                marker.bindPopup(this.createPopupContent(aircraft));
                
                marker.on('click', () => {
                    // Show popup at aircraft's current position without centering map
                    marker.openPopup();
                });
                
                marker.addTo(this.map);
                this.aircraftMarkers.set(callsign, marker);
            }
            
            // Handle aircraft labels - avoid recreating during smooth movement to prevent stuttering
            if (this.smoothMovementEnabled && this.labelLayers.has(callsign)) {
                // During smooth movement, only update label content, don't recreate the label
                this.updateLabelContent(callsign, aircraft);
            } else if (!this.labelLayers.has(callsign)) {
                // Label doesn't exist yet - create it
                this.drawAircraftLabel(aircraft);
            } else if (!this.smoothMovementEnabled) {
                // Not in smooth movement - safe to update/recreate labels normally
                this.drawAircraftLabel(aircraft);
                this.updateLabelContent(callsign, aircraft);
            }
        });
        
        // Start smooth movement if not already running
        if (this.smoothMovementEnabled && !this.interpolationTimer) {
            this.startSmoothMovement();
        }
        
        // Update aircraft count
        this.updateAircraftCount(aircraftData.length);
        
        // Update aircraft list if visible
        if (this.aircraftListVisible) {
            this.updateAircraftListData();
        }
        
        // Auto-position map on initial load if aircraft are present
        if (this.isInitialLoad && aircraftData.length > 0) {
            this.autoFitAircraft(aircraftData);
            this.isInitialLoad = false;
        }
        
        // Track specific aircraft if tracking is enabled
        if (this.isTrackingEnabled && this.trackedCallsign) {
            this.trackAircraft(aircraftData);
        }
        
        console.log(`Updated ${aircraftData.length} aircraft on radar`);
    }
    
    async updateRadar() {
        this.updateRefreshIndicator('Updating...');
        
        try {
            const aircraftData = await this.fetchRadarData();
            this.updateAircraftDisplay(aircraftData);
            
            // Perform periodic cleanup to remove any orphaned layers
            this.performPeriodicCleanup();
            
            this.updateLastUpdateTime();
            this.updateRefreshIndicator('Connected');
        } catch (error) {
            console.error('Radar update failed:', error);
            this.updateRefreshIndicator('Error');
        }
    }
    
    startRadarUpdates() {
        // Initial update
        this.updateRadar();
        
        // Set up periodic updates
        setInterval(() => {
            this.updateRadar();
        }, this.updateInterval);
        
        console.log(`Radar updates started (${this.updateInterval/1000}s interval)`);
    }

    handleZoomChange() {
        // Update label visibility based on zoom level
        const zoom = this.map.getZoom();
        const showLabels = zoom >= 6; // Only show labels at zoom level 6 and above
        
        for (const [callsign, labelGroup] of this.labelLayers) {
            if (showLabels) {
                if (!this.map.hasLayer(labelGroup)) {
                    labelGroup.addTo(this.map);
                }
            } else {
                if (this.map.hasLayer(labelGroup)) {
                    this.map.removeLayer(labelGroup);
                }
            }
        }
        
        // Recalculate all label positions to maintain pixel-based distances
        this.recalculateAllLabelPositions();
        
        // Update grid if visible
        if (this.gridVisible) {
            this.createGrid();
        }
        
        // Heading lines disabled
        // this.updateHeadingLinesForZoom();
    }
    
    handleMapMove() {
        // Update grid when map is panned
        if (this.gridVisible) {
            this.createGrid();
        }
    }
    
    // Recalculate all label positions after zoom change to maintain pixel distances
    recalculateAllLabelPositions() {
        for (const [callsign, marker] of this.aircraftMarkers) {
            if (this.labelPixelPositions.has(callsign) && this.labelLayers.has(callsign)) {
                const aircraftPos = marker.getLatLng();
                const aircraftPosArray = [aircraftPos.lat, aircraftPos.lng];
                const pixelOffset = this.labelPixelPositions.get(callsign);
                
                // Recalculate geographic position based on pixel offset
                const newLabelPosition = this.pixelOffsetToLatLng(aircraftPosArray, pixelOffset);
                
                // Update the actual label position
                const labelGroup = this.labelLayers.get(callsign);
                const layers = labelGroup.getLayers();
                
                if (layers.length >= 2) {
                    const labelLine = layers[0];
                    const labelMarker = layers[1];
                    
                    labelLine.setLatLngs([aircraftPosArray, newLabelPosition]);
                    labelMarker.setLatLng(newLabelPosition);
                }
            }
        }
    }
    
    updateHeadingLinesForZoom() {
        // Get current aircraft data to redraw heading lines with zoom-adjusted size
        this.fetchRadarData().then(aircraftData => {
            aircraftData.forEach(aircraft => {
                if (aircraft.groundspeed >= 10) { // Only for moving aircraft
                    this.drawHeadingLine(aircraft);
                }
            });
        }).catch(error => {
            console.error('Error updating heading lines for zoom:', error);
        });
    }

    performPeriodicCleanup() {
        // Clean up any orphaned layers that might not have been properly removed
        const activeCallsigns = new Set(this.aircraftMarkers.keys());
        
        // Clean up all heading lines (heading lines are now disabled)
        for (const [callsign, headingLine] of this.headingLines) {
            if (this.map.hasLayer(headingLine)) {
                this.map.removeLayer(headingLine);
            }
            this.headingLines.delete(callsign);
        }
        
        // Clean up labels for inactive aircraft
        for (const [callsign, labelLayer] of this.labelLayers) {
            if (!activeCallsigns.has(callsign)) {
                if (this.map.hasLayer(labelLayer)) {
                    this.map.removeLayer(labelLayer);
                }
                this.labelLayers.delete(callsign);
                // Also remove saved position
                this.labelPixelPositions.delete(callsign);
            }
        }
    }

    // Auto-fit map view to show all aircraft on initial load
    autoFitAircraft(aircraftData) {
        if (aircraftData.length === 0) {
            return;
        }
        
        if (aircraftData.length === 1) {
            // Single aircraft - center on it with a reasonable zoom
            const aircraft = aircraftData[0];
            this.map.setView([aircraft.latitude, aircraft.longitude], 8);
            console.log(`Centered map on single aircraft: ${aircraft.callsign}`);
        } else {
            // Multiple aircraft - fit bounds to show all
            const latitudes = aircraftData.map(ac => ac.latitude);
            const longitudes = aircraftData.map(ac => ac.longitude);
            
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);
            
            // Create bounds with some padding
            const bounds = L.latLngBounds(
                [minLat, minLng],
                [maxLat, maxLng]
            );
            
            // Fit the map to bounds with padding
            this.map.fitBounds(bounds, {
                padding: [50, 50], // 50px padding on all sides
                maxZoom: 10 // Don't zoom in too far
            });
            
            console.log(`Auto-fitted map to ${aircraftData.length} aircraft`);
        }
    }

    // Helper function to convert pixel offset to geographic coordinates based on current zoom
    pixelOffsetToLatLng(centerPos, pixelOffset) {
        // Get the center point in pixels
        const centerPoint = this.map.latLngToContainerPoint(centerPos);
        
        // Calculate the offset point in pixels
        const offsetPoint = L.point(
            centerPoint.x + pixelOffset[0], 
            centerPoint.y + pixelOffset[1]
        );
        
        // Convert back to geographic coordinates
        const offsetLatLng = this.map.containerPointToLatLng(offsetPoint);
        
        // Return as array
        return [offsetLatLng.lat, offsetLatLng.lng];
    }

    // Helper function to convert geographic position back to pixel offset
    latLngToPixelOffset(centerPos, labelPos) {
        const centerPoint = this.map.latLngToContainerPoint(centerPos);
        const labelPoint = this.map.latLngToContainerPoint(labelPos);
        
        return [
            labelPoint.x - centerPoint.x,
            labelPoint.y - centerPoint.y
        ];
    }
    
    createGrid() {
        if (this.gridLayer) {
            this.map.removeLayer(this.gridLayer);
        }
        
        const bounds = this.map.getBounds();
        const zoom = this.map.getZoom();
        
        // Calculate grid spacing based on zoom level
        let latSpacing, lngSpacing;
        
        if (zoom <= 3) {
            latSpacing = lngSpacing = 30; // 30 degree grid
        } else if (zoom <= 5) {
            latSpacing = lngSpacing = 10; // 10 degree grid
        } else if (zoom <= 7) {
            latSpacing = lngSpacing = 5; // 5 degree grid
        } else if (zoom <= 9) {
            latSpacing = lngSpacing = 1; // 1 degree grid
        } else if (zoom <= 11) {
            latSpacing = lngSpacing = 0.5; // 30 minute grid
        } else {
            latSpacing = lngSpacing = 0.1; // 6 minute grid
        }
        
        const gridLines = [];
        const gridLabels = [];
        
        // Calculate bounds with some padding
        const minLat = Math.floor(bounds.getSouth() / latSpacing) * latSpacing;
        const maxLat = Math.ceil(bounds.getNorth() / latSpacing) * latSpacing;
        const minLng = Math.floor(bounds.getWest() / lngSpacing) * lngSpacing;
        const maxLng = Math.ceil(bounds.getEast() / lngSpacing) * lngSpacing;
        
        // Create latitude lines (horizontal)
        for (let lat = minLat; lat <= maxLat; lat += latSpacing) {
            if (lat >= -90 && lat <= 90) {
                const line = L.polyline([
                    [lat, bounds.getWest()],
                    [lat, bounds.getEast()]
                ], {
                    color: '#00ff00',
                    weight: lat % (latSpacing * 5) === 0 ? 1.5 : 0.8,
                    opacity: lat % (latSpacing * 5) === 0 ? 0.6 : 0.3,
                    dashArray: lat % (latSpacing * 5) === 0 ? null : '2, 4'
                });
                gridLines.push(line);
                
                // Add labels for major grid lines
                if (lat % (latSpacing * 5) === 0 || latSpacing >= 5) {
                    const latLabel = this.formatLatitude(lat);
                    const label = L.marker([lat, bounds.getWest()], {
                        icon: L.divIcon({
                            className: 'grid-label',
                            html: `<div style="color: #00ff00; font-size: 10px; font-family: monospace; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 2px; white-space: nowrap;">${latLabel}</div>`,
                            iconSize: [50, 20],
                            iconAnchor: [0, 10]
                        })
                    });
                    gridLabels.push(label);
                }
            }
        }
        
        // Create longitude lines (vertical)
        for (let lng = minLng; lng <= maxLng; lng += lngSpacing) {
            if (lng >= -180 && lng <= 180) {
                const line = L.polyline([
                    [bounds.getSouth(), lng],
                    [bounds.getNorth(), lng]
                ], {
                    color: '#00ff00',
                    weight: lng % (lngSpacing * 5) === 0 ? 1.5 : 0.8,
                    opacity: lng % (lngSpacing * 5) === 0 ? 0.6 : 0.3,
                    dashArray: lng % (lngSpacing * 5) === 0 ? null : '2, 4'
                });
                gridLines.push(line);
                
                // Add labels for major grid lines
                if (lng % (lngSpacing * 5) === 0 || lngSpacing >= 5) {
                    const lngLabel = this.formatLongitude(lng);
                    
                    // Place longitude labels at the very top edge of the viewport
                    const labelLat = bounds.getNorth();
                    
                    const label = L.marker([labelLat, lng], {
                        icon: L.divIcon({
                            className: 'grid-label',
                            html: `<div style="color: #00ff00; font-size: 10px; font-family: monospace; background: rgba(0,0,0,0.5); padding: 2px 4px; border-radius: 2px; white-space: nowrap;">${lngLabel}</div>`,
                            iconSize: [50, 20],
                            iconAnchor: [25, 0]
                        })
                    });
                    gridLabels.push(label);
                }
            }
        }
        
        // Combine all grid elements into a layer group
        this.gridLayer = L.layerGroup([...gridLines, ...gridLabels]);
        
        if (this.gridVisible) {
            this.gridLayer.addTo(this.map);
        }
    }
    
    formatLatitude(lat) {
        const absLat = Math.abs(lat);
        const degrees = Math.floor(absLat);
        const minutes = Math.floor((absLat - degrees) * 60);
        const hemisphere = lat >= 0 ? 'N' : 'S';
        
        if (minutes === 0) {
            return `${degrees}°${hemisphere}`;
        } else {
            return `${degrees}°${minutes.toString().padStart(2, '0')}'${hemisphere}`;
        }
    }
    
    formatLongitude(lng) {
        const absLng = Math.abs(lng);
        const degrees = Math.floor(absLng);
        const minutes = Math.floor((absLng - degrees) * 60);
        const hemisphere = lng >= 0 ? 'E' : 'W';
        
        if (minutes === 0) {
            return `${degrees}°${hemisphere}`;
        } else {
            return `${degrees}°${minutes.toString().padStart(2, '0')}'${hemisphere}`;
        }
    }
    
    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        
        if (this.gridVisible) {
            this.createGrid();
        } else {
            if (this.gridLayer) {
                this.map.removeLayer(this.gridLayer);
            }
        }
        
        this.updateGridButton();
    }
    
    updateGridButton() {
        const btn = document.getElementById('grid-btn');
        if (btn) {
            if (this.gridVisible) {
                btn.style.background = 'rgba(0, 255, 100, 0.8)';
                btn.innerHTML = '<i class="fas fa-border-all"></i>';
                btn.title = 'Hide Coordinate Grid (G)';
            } else {
                btn.style.background = 'rgba(0, 40, 80, 0.8)';
                btn.innerHTML = '<i class="fas fa-border-none"></i>';
                btn.title = 'Show Coordinate Grid (G)';
            }
        }
    }
    
    initCustomToolbar() {
        // Create toolbar container
        const toolbar = document.createElement('div');
        toolbar.className = 'radar-toolbar';
        toolbar.id = 'radar-toolbar';
        
        // Create toolbar buttons
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'toolbar-btn';
        zoomInBtn.innerHTML = '<i class="fas fa-plus"></i>';
        zoomInBtn.title = 'Zoom In (+)';
        zoomInBtn.addEventListener('click', () => {
            this.map.zoomIn();
        });
        
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'toolbar-btn';
        zoomOutBtn.innerHTML = '<i class="fas fa-minus"></i>';
        zoomOutBtn.title = 'Zoom Out (-)';
        zoomOutBtn.addEventListener('click', () => {
            this.map.zoomOut();
        });
        
        const homeBtn = document.createElement('button');
        homeBtn.className = 'toolbar-btn';
        homeBtn.innerHTML = '<i class="fas fa-home"></i>';
        homeBtn.title = 'Reset View (H)';
        homeBtn.addEventListener('click', () => {
            this.map.setView([20, 0], 3);
        });
        
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'toolbar-btn';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.title = 'Toggle Fullscreen (Shift+F)';
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        const layersBtn = document.createElement('button');
        layersBtn.className = 'toolbar-btn';
        layersBtn.innerHTML = '<i class="fas fa-layer-group"></i>';
        layersBtn.title = 'Cycle Map Layers (L)';
        layersBtn.id = 'layers-btn';
        layersBtn.addEventListener('click', () => {
            this.cycleTileLayer();
        });
        
        const centerBtn = document.createElement('button');
        centerBtn.className = 'toolbar-btn';
        centerBtn.innerHTML = '<i class="fas fa-crosshairs"></i>';
        centerBtn.title = 'Center on Aircraft (C)';
        centerBtn.addEventListener('click', () => {
            this.centerOnAircraft();
        });
        
        const aircraftListBtn = document.createElement('button');
        aircraftListBtn.className = 'toolbar-btn';
        aircraftListBtn.innerHTML = '<i class="fas fa-list"></i>';
        aircraftListBtn.title = 'Toggle Aircraft List (A)';
        aircraftListBtn.id = 'aircraft-list-btn';
        aircraftListBtn.addEventListener('click', () => {
            this.toggleAircraftList();
        });
        
        const gridBtn = document.createElement('button');
        gridBtn.className = 'toolbar-btn';
        gridBtn.innerHTML = '<i class="fas fa-border-none"></i>';
        gridBtn.title = 'Toggle Coordinate Grid (G)';
        gridBtn.id = 'grid-btn';
        gridBtn.addEventListener('click', () => {
            this.toggleGrid();
        });
        
        const smoothBtn = document.createElement('button');
        smoothBtn.className = 'toolbar-btn';
        smoothBtn.innerHTML = '<i class="fas fa-running"></i>';
        smoothBtn.title = 'Toggle Smooth Movement (S)';
        smoothBtn.id = 'smooth-btn';
        
        // Store direct reference to the button
        this.smoothButton = smoothBtn;
        
        smoothBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSmoothMovement();
        });
        
        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'toolbar-drag-handle';
        dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
        dragHandle.title = 'Drag to move toolbar';
        
        // Append elements to toolbar
        toolbar.appendChild(dragHandle);
        toolbar.appendChild(zoomInBtn);
        toolbar.appendChild(zoomOutBtn);
        
        // Add separator
        const separator1 = document.createElement('div');
        separator1.className = 'toolbar-separator';
        toolbar.appendChild(separator1);
        
        toolbar.appendChild(homeBtn);
        toolbar.appendChild(centerBtn);
        toolbar.appendChild(aircraftListBtn);
        toolbar.appendChild(gridBtn);
        toolbar.appendChild(smoothBtn);
        
        // Add separator
        const separator2 = document.createElement('div');
        separator2.className = 'toolbar-separator';
        toolbar.appendChild(separator2);
        
        toolbar.appendChild(layersBtn);
        toolbar.appendChild(fullscreenBtn);
        
        // Add toolbar to the radar container
        document.querySelector('.radar-container').appendChild(toolbar);
        
        // Make toolbar draggable
        this.makeDraggable(toolbar, dragHandle);
        
        // Initialize button appearances
        this.updateLayersButton();
        this.updateGridButton();
        this.updateSmoothButton();
    }
    
    makeDraggable(element, handle) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        
        const startDrag = (event) => {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            
            // Get the current computed position
            const rect = element.getBoundingClientRect();
            
            // Convert from right/transform positioning to left/top positioning
            element.style.right = 'auto';
            element.style.transform = 'none';
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.position = 'absolute';
            
            // Store the current position as initial for dragging calculations
            initialX = rect.left;
            initialY = rect.top;
            
            element.classList.add('dragging');
            element.style.cursor = 'grabbing';
            handle.style.cursor = 'grabbing';
            
            // Prevent default to avoid text selection
            event.preventDefault();
        };
        
        const handleDrag = (event) => {
            if (!isDragging) return;
            
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            // Keep toolbar within viewport bounds
            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            
            const constrainedX = Math.max(0, Math.min(maxX, newX));
            const constrainedY = Math.max(0, Math.min(maxY, newY));
            
            element.style.left = constrainedX + 'px';
            element.style.top = constrainedY + 'px';
        };
        
        const endDrag = () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
                element.style.cursor = 'default';
                handle.style.cursor = 'grab';
            }
        };
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        
        // Touch events for mobile
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDrag(touch);
        });
        
        document.addEventListener('mousemove', handleDrag);
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleDrag(touch);
            }
        });
        
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts if not typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case '+':
                case '=':
                    this.map.zoomIn();
                    e.preventDefault();
                    break;
                case '-':
                    this.map.zoomOut();
                    e.preventDefault();
                    break;
                case 'h':
                case 'H':
                    this.map.setView([39.8283, -98.5795], 4);
                    e.preventDefault();
                    break;
                case 'c':
                case 'C':
                    this.centerOnAircraft();
                    e.preventDefault();
                    break;
                case 'l':
                case 'L':
                    this.cycleTileLayer();
                    e.preventDefault();
                    break;
                case 'a':
                case 'A':
                    this.toggleAircraftList();
                    e.preventDefault();
                    break;
                case 'g':
                case 'G':
                    this.toggleGrid();
                    e.preventDefault();
                    break;
                case 's':
                case 'S':
                    this.toggleSmoothMovement();
                    e.preventDefault();
                    break;
                case 'f':
                case 'F':
                    if (e.shiftKey) {
                        this.toggleFullscreen();
                        e.preventDefault();
                    }
                    break;
            }
        });
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.log('Error attempting to exit fullscreen:', err);
            });
        }
    }
    
    cycleTileLayer() {
        // Cycle to the next tile layer
        this.currentTileLayerIndex = (this.currentTileLayerIndex + 1) % this.tileLayers.length;
        this.loadTileLayer(this.currentTileLayerIndex);
        
        // Show notification of layer change
        this.showLayerNotification();
    }
    
    showLayerNotification() {
        const currentLayer = this.tileLayers[this.currentTileLayerIndex];
        
        // Create or update notification
        let notification = document.getElementById('layer-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'layer-notification';
            notification.className = 'layer-notification';
            document.querySelector('.radar-container').appendChild(notification);
        }
        
        notification.innerHTML = `
            <div style="font-weight: bold;">Map Layer: ${currentLayer.name}</div>
            <div style="font-size: 12px; margin-top: 2px;">
                Aircraft Color: <span style="color: ${currentLayer.aircraftColor};">●</span> ${currentLayer.aircraftColor}
            </div>
            <div style="font-size: 12px; margin-top: 1px;">
                Label Background: <span style="background: ${currentLayer.labelBackground}; padding: 2px 4px; border-radius: 2px; color: ${currentLayer.aircraftColor};">ABC</span> 
            </div>
        `;
        notification.style.opacity = '1';
        
        // Auto-hide after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000);
    }
    
    centerOnAircraft() {
        // Center map on the first aircraft found, or all aircraft if multiple
        if (this.aircraftMarkers.size === 0) {
            console.log('No aircraft to center on');
            return;
        }
        
        if (this.aircraftMarkers.size === 1) {
            // Single aircraft - center on it
            const marker = this.aircraftMarkers.values().next().value;
            this.map.setView(marker.getLatLng(), Math.max(this.map.getZoom(), 8));
        } else {
            // Multiple aircraft - fit all in view
            const group = new L.featureGroup(Array.from(this.aircraftMarkers.values()));
            this.map.fitBounds(group.getBounds(), {padding: [20, 20]});
        }
    }
    
    toggleAircraftList() {
        this.aircraftListVisible = !this.aircraftListVisible;
        
        if (this.aircraftListVisible) {
            this.showAircraftList();
        } else {
            this.hideAircraftList();
        }
        
        // Update button appearance
        this.updateAircraftListButton();
    }
    
    showAircraftList() {
        if (!this.aircraftListTable) {
            this.createAircraftListTable();
        }
        
        this.aircraftListTable.style.display = 'block';
        this.updateAircraftListData();
    }
    
    hideAircraftList() {
        if (this.aircraftListTable) {
            this.aircraftListTable.style.display = 'none';
        }
    }
    
    createAircraftListTable() {
        // Create the main container
        const container = document.createElement('div');
        container.className = 'aircraft-list-container';
        container.id = 'aircraft-list-container';
        
        // Create header with drag handle
        const header = document.createElement('div');
        header.className = 'aircraft-list-header';
        
        const dragHandle = document.createElement('div');
        dragHandle.className = 'aircraft-list-drag-handle';
        dragHandle.innerHTML = '<i class="fas fa-grip-horizontal"></i>';
        
        const title = document.createElement('div');
        title.className = 'aircraft-list-title';
        title.textContent = 'Aircraft List';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'aircraft-list-close';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', () => {
            this.toggleAircraftList();
        });
        
        header.appendChild(dragHandle);
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.className = 'aircraft-list-table-container';
        
        // Create table
        const table = document.createElement('table');
        table.className = 'aircraft-list-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['', 'Callsign', 'Pilot', 'Aircraft', 'Altitude', 'Speed'];
        headers.forEach((headerText, index) => {
            const th = document.createElement('th');
            if (index === 0) {
                // Track column header with icon
                const trackIcon = document.createElement('i');
                trackIcon.className = 'fas fa-crosshairs';
                trackIcon.title = 'Track Aircraft';
                th.appendChild(trackIcon);
                th.className = 'track-column-header';
            } else {
                th.textContent = headerText;
            }
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        tbody.id = 'aircraft-list-tbody';
        table.appendChild(tbody);
        
        tableContainer.appendChild(table);
        container.appendChild(header);
        container.appendChild(tableContainer);
        
        // Add to radar container
        document.querySelector('.radar-container').appendChild(container);
        
        // Make draggable
        this.makeDraggable(container, dragHandle);
        
        this.aircraftListTable = container;
    }
    
    updateAircraftListData() {
        if (!this.aircraftListTable || !this.aircraftListVisible) return;
        
        const tbody = document.getElementById('aircraft-list-tbody');
        if (!tbody) return;
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Use existing aircraft markers data
        if (this.aircraftMarkers.size > 0) {
            // Convert markers to array and sort by callsign
            const aircraftArray = Array.from(this.aircraftMarkers.entries()).map(([callsign, marker]) => {
                return marker.aircraftData; // Get the stored aircraft data from the marker
            }).filter(data => data) // Filter out any undefined data
              .sort((a, b) => a.callsign.localeCompare(b.callsign));
            
            aircraftArray.forEach(aircraft => {
                const row = document.createElement('tr');
                row.className = 'aircraft-row';
                row.setAttribute('data-callsign', aircraft.callsign);
                
                // Add click handler to zoom to aircraft (excluding the track icon)
                row.addEventListener('click', (e) => {
                    // Don't zoom if clicking on the track icon
                    if (!e.target.closest('.track-icon')) {
                        this.zoomToAircraft(aircraft.callsign);
                    }
                });
                
                // Track icon
                const trackCell = document.createElement('td');
                trackCell.className = 'track-cell';
                const trackIcon = document.createElement('i');
                trackIcon.className = 'fas fa-crosshairs track-icon';
                trackIcon.setAttribute('data-callsign', aircraft.callsign);
                
                // Check if this aircraft is currently being tracked
                const isTracked = this.isTrackingEnabled && this.trackedCallsign === aircraft.callsign.toUpperCase();
                if (isTracked) {
                    trackIcon.classList.add('tracking');
                    trackIcon.title = `Stop tracking ${aircraft.callsign}`;
                } else {
                    trackIcon.title = `Track ${aircraft.callsign}`;
                }
                
                trackIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent row click
                    
                    // If this aircraft is currently being tracked, stop tracking
                    if (this.isTrackingEnabled && this.trackedCallsign === aircraft.callsign.toUpperCase()) {
                        this.stopTracking();
                    } else {
                        // Start tracking this aircraft
                        this.startTrackingAircraft(aircraft.callsign);
                    }
                });
                trackCell.appendChild(trackIcon);
                row.appendChild(trackCell);
                
                // Callsign
                const callsignCell = document.createElement('td');
                callsignCell.textContent = aircraft.callsign;
                callsignCell.className = 'callsign-cell';
                row.appendChild(callsignCell);
                
                // Pilot Name
                const pilotCell = document.createElement('td');
                pilotCell.textContent = aircraft.pilot_name;
                row.appendChild(pilotCell);
                
                // Aircraft Type
                const aircraftCell = document.createElement('td');
                aircraftCell.textContent = aircraft.aircraft_type;
                row.appendChild(aircraftCell);
                
                // Altitude
                const altitudeCell = document.createElement('td');
                altitudeCell.textContent = Math.round(aircraft.altitude).toLocaleString() + ' ft';
                altitudeCell.className = 'number-cell';
                row.appendChild(altitudeCell);
                
                // Speed
                const speedCell = document.createElement('td');
                speedCell.textContent = Math.round(aircraft.groundspeed) + ' kts';
                speedCell.className = 'number-cell';
                row.appendChild(speedCell);
                
                tbody.appendChild(row);
            });
        } else {
            // No aircraft found
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6; // Updated to 6 columns (added track column)
            cell.textContent = 'No aircraft online';
            cell.className = 'no-aircraft-cell';
            row.appendChild(cell);
            tbody.appendChild(row);
        }
        
        // Update tracking icon highlights after table is populated
        this.updateTrackingIconHighlights();
    }
    
    zoomToAircraft(callsign) {
        const marker = this.aircraftMarkers.get(callsign);
        if (marker) {
            const position = marker.getLatLng();
            this.map.flyTo(position, Math.max(this.map.getZoom(), 10), {
                animate: true,
                duration: 1.5
            });
            
            // Highlight the aircraft temporarily
            marker.getElement().style.animation = 'aircraftHighlight 2s ease-in-out';
            setTimeout(() => {
                if (marker.getElement()) {
                    marker.getElement().style.animation = '';
                }
            }, 2000);
        }
    }
    
    updateAircraftListButton() {
        const btn = document.getElementById('aircraft-list-btn');
        if (btn) {
            if (this.aircraftListVisible) {
                btn.style.background = 'rgba(0, 255, 100, 0.8)';
                btn.innerHTML = '<i class="fas fa-list-check"></i>';
                btn.title = 'Hide Aircraft List (A)';
            } else {
                btn.style.background = 'rgba(0, 40, 80, 0.8)';
                btn.innerHTML = '<i class="fas fa-list"></i>';
                btn.title = 'Show Aircraft List (A)';
            }
        }
    }
    
    toggleSmoothMovement() {
        this.smoothMovementEnabled = !this.smoothMovementEnabled;
        
        // Update the button appearance
        this.updateSmoothButton();
        
        if (this.smoothMovementEnabled) {
            // Start smooth movement if there are aircraft
            if (this.aircraftMarkers.size > 0 && !this.interpolationTimer) {
                this.startSmoothMovement();
            }
        } else {
            // Stop smooth movement
            this.stopSmoothMovement();
            
            // Snap all aircraft to their target positions and ensure they update correctly
            for (const [callsign, positionData] of this.aircraftPositions) {
                const marker = this.aircraftMarkers.get(callsign);
                if (marker && positionData) {
                    // Move marker to target position
                    marker.setLatLng([positionData.targetLat, positionData.targetLng]);
                    // Update current position to match target
                    positionData.currentLat = positionData.targetLat;
                    positionData.currentLng = positionData.targetLng;
                    
                    // Update label position to match new aircraft position
                    this.updateLabelPositionForMovement(callsign, [positionData.targetLat, positionData.targetLng]);
                }
            }
        }
        
        console.log(`Smooth movement ${this.smoothMovementEnabled ? 'enabled' : 'disabled'}`);
    }
    
    updateSmoothButton() {
        const btn = document.getElementById('smooth-btn');
        const status = document.getElementById('smooth-status');
        
        if (btn) {
            // Remove any existing state classes first
            btn.classList.remove('smooth-enabled', 'smooth-disabled');
            
            if (this.smoothMovementEnabled) {
                btn.classList.add('smooth-enabled');
                btn.innerHTML = '<i class="fas fa-running"></i>';
                btn.title = 'Disable Smooth Movement (S)';
            } else {
                btn.classList.add('smooth-disabled');
                btn.innerHTML = '<i class="fas fa-walking"></i>';
                btn.title = 'Enable Smooth Movement (S)';
            }
        }
        
        if (status) {
            status.textContent = this.smoothMovementEnabled ? 'Enabled' : 'Disabled';
            status.style.color = this.smoothMovementEnabled ? '#00ff00' : '#ff6600';
        }
    }
    
    updateLabelContent(callsign, aircraft) {
        // During smooth movement, throttle label content updates to prevent stuttering
        if (this.smoothMovementEnabled) {
            const lastUpdate = this.lastLabelContentUpdate.get(callsign) || 0;
            const now = Date.now();
            
            // Only update label content every 2 seconds during smooth movement to prevent stuttering
            if (now - lastUpdate < 2000) {
                return;
            }
            this.lastLabelContentUpdate.set(callsign, now);
        }
        
        // Update label content with current aircraft data
        if (!this.labelLayers.has(callsign)) return;
        
        const labelGroup = this.labelLayers.get(callsign);
        const layers = labelGroup.getLayers();
        
        if (layers.length >= 2) {
            const labelMarker = layers[1]; // Marker is second
            
            try {
                // Get current tile layer colors
                const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
                const aircraftColor = currentTileLayer.aircraftColor || '#ff6b35';
                const labelBackground = currentTileLayer.labelBackground || 'rgba(0, 20, 40, 0.95)';
                
                // Create updated label content with dynamic colors
                const updatedLabelText = `
                    <div style="
                        background: ${labelBackground};
                        color: ${aircraftColor};
                        padding: 3px 6px;
                        border: 1px solid ${aircraftColor};
                        border-radius: 3px;
                        font-family: 'Courier New', monospace;
                        font-size: 10px;
                        white-space: nowrap;
                        box-shadow: 0 0 8px ${aircraftColor}40;
                        cursor: move;
                    ">
                        <div style="font-weight: bold; font-size: 11px;">${aircraft.callsign}</div>
                        <div style="font-size: 9px; opacity: 0.8; margin-top: 1px;">
                            ${Math.round(aircraft.altitude)}ft • ${Math.round(aircraft.groundspeed)}kts
                        </div>
                    </div>
                `;
                
                // Update the label marker's icon with new content
                const updatedIcon = L.divIcon({
                    className: 'aircraft-label draggable-label',
                    html: updatedLabelText,
                    iconSize: [100, 35],
                    iconAnchor: [50, 17.5] // Center of the label
                });
                
                labelMarker.setIcon(updatedIcon);
                
                // Also update the connecting line color to match the current tile layer
                const labelLine = layers[0]; // Line is first
                if (labelLine instanceof L.Polyline) {
                    labelLine.setStyle({
                        color: aircraftColor,
                        weight: 1,
                        opacity: 0.7,
                        dashArray: '1, 2'
                    });
                }
            } catch (error) {
                console.warn(`Error updating label content for ${callsign}:`, error);
            }
        }
    }
    
    // Measurement Tool Implementation
    
    initMeasurementTool() {
        // Add mouse event listeners for measurement tool and range rings
        this.map.on('mousedown', (e) => {
            if (e.originalEvent.button === 2) { // Right mouse button
                console.log('Right click detected, Shift key:', e.originalEvent.shiftKey);
                if (e.originalEvent.shiftKey) {
                    // Shift + right click = range ring
                    console.log('Starting range ring');
                    this.startRangeRing(e.latlng);
                } else {
                    // Right click = measurement line
                    console.log('Starting measurement');
                    this.startMeasurement(e.latlng);
                }
                e.originalEvent.preventDefault();
            }
        });
        
        this.map.on('mousemove', (e) => {
            if (this.measurementActive) {
                this.updateMeasurement(e.latlng);
            } else if (this.rangeRingActive) {
                this.updateRangeRing(e.latlng);
            }
        });
        
        this.map.on('mouseup', (e) => {
            if (e.originalEvent.button === 2) { // Right mouse button
                if (this.measurementActive) {
                    this.endMeasurement();
                } else if (this.rangeRingActive) {
                    this.endRangeRing();
                }
            }
        });
        
        // Disable context menu on right click
        this.map.getContainer().addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    startMeasurement(startLatLng) {
        this.measurementActive = true;
        this.measurementStartPoint = startLatLng;
        
               
        // Create measurement line
        this.measurementLine = L.polyline([startLatLng, startLatLng], {
            color: '#ff0000',
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5'
        }).addTo(this.map);
        
        // Create measurement label
        this.measurementLabel = L.marker(startLatLng, {
            icon: L.divIcon({
                className: 'measurement-label',
                html: '<div style="background: rgba(255, 0, 0, 0.9); color: white; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">0.0 NM<br>000°</div>',
                iconSize: [80, 40],
                iconAnchor: [40, 20]
            })
        }).addTo(this.map);
        
        console.log('Measurement started');
    }
    
    updateMeasurement(currentLatLng) {
        if (!this.measurementActive || !this.measurementStartPoint) return;
        
        // Update line
        this.measurementLine.setLatLngs([this.measurementStartPoint, currentLatLng]);
        
        // Calculate distance and bearing
        const distance = this.calculateDistanceNauticalMiles(
            this.measurementStartPoint.lat, this.measurementStartPoint.lng,
            currentLatLng.lat, currentLatLng.lng
        );
        
        const bearing = this.calculateBearing(
            this.measurementStartPoint.lat, this.measurementStartPoint.lng,
            currentLatLng.lat, currentLatLng.lng
        );
        
        // Update label position and content
        const midpoint = L.latLng(
            (this.measurementStartPoint.lat + currentLatLng.lat) / 2,
            (this.measurementStartPoint.lng + currentLatLng.lng) / 2
        );
        
        this.measurementLabel.setLatLng(midpoint);
        this.measurementLabel.setIcon(L.divIcon({
            className: 'measurement-label',
            html: `<div style="background: rgba(255, 0, 0, 0.9); color: white; padding: 4px 8px; border-radius:  4px; font-family: monospace; font-size: 12px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${distance.toFixed(1)} NM<br>${bearing.toFixed(0).padStart(3, '0')}°</div>`,
            iconSize: [80, 40],
            iconAnchor: [40, 20]
        }));
    }
    
    endMeasurement() {
        this.measurementActive = false;
        
        
        // Remove measurement elements
        if (this.measurementLine) {
            this.map.removeLayer(this.measurementLine);
            this.measurementLine = null;
        }
        
        if (this.measurementLabel) {
            this.map.removeLayer(this.measurementLabel);
            this.measurementLabel = null;
        }
        
        this.measurementStartPoint = null;
        console.log('Measurement ended');
    }
    
    calculateDistanceNauticalMiles(lat1, lng1, lat2, lng2) {
        // Haversine formula for accurate distance calculation
        const R = 3440.065; // Earth's radius in nautical miles
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    calculateBearing(lat1, lng1, lat2, lng2) {
        // Calculate bearing (direction) from point 1 to point  2
        const dLng = this.toRadians(lng2 - lng1);
        const lat1Rad = this.toRadians(lat1);
        const lat2Rad = this.toRadians(lat2);
        
        const y = Math.sin(dLng) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
        
        let bearing = this.toDegrees(Math.atan2(y, x));
        
        // Normalize to 0-360 degrees
        bearing = (bearing + 360) % 360;
        
        return bearing;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Range Ring Tool Implementation
    
    startRangeRing(centerLatLng) {
        this.rangeRingActive = true;
        this.rangeRingCenter = centerLatLng;
        
        console.log('Starting range ring at:', centerLatLng);
        
        // Create center marker (small red circle)
        this.rangeRingCenterMarker = L.circleMarker(centerLatLng, {
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.8,
            radius: 3,
            weight: 1
        }).addTo(this.map);
        
        // Create initial range ring circle (will be updated on mouse move)
        this.rangeRingCircle = L.circle(centerLatLng, {
            color: '#ff0000',
            fillColor: 'transparent',
            weight: 1,
            opacity: 0.7,
            radius: 1852 // Start with 1 NM radius in meters
        }).addTo(this.map);
        
        // Create range label
        this.rangeRingLabel = L.marker(centerLatLng, {
            icon: L.divIcon({
                className: 'range-ring-label',
                html: '<div style="background: rgba(255, 0, 0, 0.9); color: white; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 11px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">0.0 NM</div>',
                iconSize: [60, 20],
                iconAnchor: [30, 10]
            })
        }).addTo(this.map);
        
        console.log('Range ring elements created');
    }
    
    updateRangeRing(currentLatLng) {
        if (!this.rangeRingActive || !this.rangeRingCenter) return;
        
        // Calculate distance from center to current position
        const radiusNM = this.calculateDistanceNauticalMiles(
            this.rangeRingCenter.lat, this.rangeRingCenter.lng,
            currentLatLng.lat, currentLatLng.lng
        );
        
        // Convert nautical miles to meters for Leaflet circle
        const radiusMeters = radiusNM * 1852;
        
        // Update circle radius
        this.rangeRingCircle.setRadius(radiusMeters);
        
        // Position label on the edge of the circle at 45 degrees (northeast)
        const labelBearing = 45; // Fixed at northeast for consistency
        const labelDistance = radiusNM;
        const labelPosition = this.calculateDestinationPoint(
            this.rangeRingCenter.lat, this.rangeRingCenter.lng,
            labelBearing, labelDistance
        );
        
        // Update label position and content
        this.rangeRingLabel.setLatLng([labelPosition.lat, labelPosition.lng]);
        this.rangeRingLabel.setIcon(L.divIcon({
            className: 'range-ring-label',
            html: `<div style="background: rgba(255, 0, 0, 0.9); color: white; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 11px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${radiusNM.toFixed(1)} NM</div>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
        }));
    }
    
    endRangeRing() {
        this.rangeRingActive = false;
        
        console.log('Ending range ring');
        
        // Remove range ring elements
        if (this.rangeRingCircle) {
            this.map.removeLayer(this.rangeRingCircle);
            this.rangeRingCircle = null;
        }
        
        if (this.rangeRingCenterMarker) {
            this.map.removeLayer(this.rangeRingCenterMarker);
            this.rangeRingCenterMarker = null;
        }
        
        if (this.rangeRingLabel) {
            this.map.removeLayer(this.rangeRingLabel);
            this.rangeRingLabel = null;
        }
        
        this.rangeRingCenter = null;
        console.log('Range ring ended');
    }
    
    calculateDestinationPoint(lat, lng, bearing, distanceNM) {
        // Calculate a destination point given a starting point, bearing, and distance
        const R = 3440.065; // Earth radius in nautical miles
        const bearingRad = this.toRadians(bearing);
        const latRad = this.toRadians(lat);
        const distanceRatio = distanceNM / R;
        
        const destLatRad = Math.asin(
            Math.sin(latRad) * Math.cos(distanceRatio) +
            Math.cos(latRad) * Math.sin(distanceRatio) * Math.cos(bearingRad)
        );
        
        const destLngRad = this.toRadians(lng) + Math.atan2(
            Math.sin(bearingRad) * Math.sin(distanceRatio) * Math.cos(latRad),
            Math.cos(distanceRatio) - Math.sin(latRad) * Math.sin(destLatRad)
        );
        
        return {
            lat: this.toDegrees(destLatRad),
            lng: this.toDegrees(destLngRad)
        };
    }
    
    parseUrlParameters() {
        // Parse URL parameters for aircraft tracking
        const urlParams = new URLSearchParams(window.location.search);
        const callsign = urlParams.get('callsign');
        
        if (callsign) {
            // Use the startTrackingAircraft method to ensure proper tracking setup
            // Note: We delay this slightly to ensure the map is fully initialized
            setTimeout(() => {
                this.startTrackingAircraft(callsign);
            }, 100);
        }
    }
    
    showTrackingIndicator() {
        // Create a tracking indicator in the UI
        const indicator = document.createElement('div');
        indicator.id = 'tracking-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 165, 0, 0.95);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-family: monospace;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            border: 2px solid #ff8c00;
        `;
        indicator.innerHTML = `
            <i class="fas fa-crosshairs"></i> 
            Tracking: ${this.trackedCallsign}
            <button onclick="window.radar.stopTracking()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(indicator);
    }
    
    stopTracking() {
        this.isTrackingEnabled = false;
        this.trackedCallsign = null;
        
        // Remove tracking indicator
        const indicator = document.getElementById('tracking-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Update tracking icon highlights in the aircraft table
        this.updateTrackingIconHighlights();
        
        // Update all open popups to reflect the new tracking state
        this.updateAllPopups();
        
        console.log('Aircraft tracking stopped');
    }

    toggleTrackingFromPopup(callsign) {
        if (this.trackedCallsign === callsign.toUpperCase()) {
            // Currently tracking this aircraft, so stop tracking
            this.stopTracking();
        } else {
            // Start tracking this aircraft
            this.startTrackingAircraft(callsign);
        }
        
        // Update all open popups to reflect the new tracking state
        this.updateAllPopups();
    }

    updateAllPopups() {
        // Update all open popups to reflect current tracking state
        this.aircraftMarkers.forEach((marker, callsign) => {
            if (marker.isPopupOpen() && marker.aircraftData) {
                marker.getPopup().setContent(this.createPopupContent(marker.aircraftData));
            }
        });
    }

    trackAircraft(aircraftData) {
        // Find the tracked aircraft in the current data
        const trackedAircraft = aircraftData.find(aircraft => 
            aircraft.callsign.toUpperCase() === this.trackedCallsign
        );
        
        if (trackedAircraft) {
            // Get the aircraft's current position
            let aircraftPosition;
            
            if (this.smoothMovementEnabled && this.aircraftPositions.has(this.trackedCallsign)) {
                // Use smooth movement position if available
                const positionData = this.aircraftPositions.get(this.trackedCallsign);
                aircraftPosition = [positionData.currentLat, positionData.currentLng];
            } else {
                // Use actual position
                aircraftPosition = [trackedAircraft.latitude, trackedAircraft.longitude];
            }
            
            // Center map on the tracked aircraft with appropriate zoom
            const currentZoom = this.map.getZoom();
            const targetZoom = Math.max(currentZoom, 8); // Ensure minimum zoom level for tracking
            
            this.map.setView(aircraftPosition, targetZoom, {
                animate: true,
                duration: 1.0 // Smooth animation
            });
            
            // Highlight the tracked aircraft
            this.highlightTrackedAircraft(this.trackedCallsign);
            
        } else {
            // Aircraft not found, show warning but keep tracking enabled
            console.warn(`Tracked aircraft ${this.trackedCallsign} not found in current data`);
            this.updateTrackingIndicator(false);
        }
    }
    
    highlightTrackedAircraft(callsign) {
        // Remove previous highlighting from all aircraft and their labels
        this.aircraftMarkers.forEach((marker, markerCallsign) => {
            const markerElement = marker.getElement();
            if (markerElement) {
                markerElement.classList.remove('tracked-aircraft');
                // Reset to normal color for this tile layer
                const iconElement = markerElement.querySelector('.aircraft-icon');
                if (iconElement && marker.aircraftData) {
                    const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
                    const normalColor = currentTileLayer.aircraftColor || '#ff6b35';
                    iconElement.style.color = normalColor;
                    iconElement.style.filter = `drop-shadow(0 0 3px ${normalColor})`;
                }
            }
            
            // Also reset label colors to normal
            const labelGroup = this.labelLayers.get(markerCallsign);
            if (labelGroup && marker.aircraftData) {
                const currentTileLayer = this.tileLayers[this.currentTileLayerIndex];
                const normalColor = currentTileLayer.aircraftColor || '#ff6b35';
                const normalBackground = currentTileLayer.labelBackground || 'rgba(0, 20, 40, 0.95)';
                const labelLineColor = normalColor; // Use same color as aircraft
                
                labelGroup.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        // This is the label marker
                        const labelElement = layer.getElement();
                        if (labelElement) {
                            const labelDiv = labelElement.querySelector('div');
                            if (labelDiv) {
                                // Reset to normal tile layer colors including background
                                labelDiv.style.color = normalColor;
                                labelDiv.style.backgroundColor = normalBackground;
                                labelDiv.style.borderColor = normalColor;
                                labelDiv.style.boxShadow = `0 0 8px ${normalColor}40`;
                            }
                        }
                    } else if (layer instanceof L.Polyline) {
                        // This is the connecting line
                        layer.setStyle({
                            color: labelLineColor,
                            opacity: 0.7,
                            weight: 1
                        });
                    }
                });
            }
        });
        
        // Add highlighting to tracked aircraft
        const trackedMarker = this.aircraftMarkers.get(callsign);
        if (trackedMarker) {
            const markerElement = trackedMarker.getElement();
            if (markerElement) {
                markerElement.classList.add('tracked-aircraft');
                const iconElement = markerElement.querySelector('.aircraft-icon');
                if (iconElement) {
                    // Use a bright orange highlight that works with any background
                    iconElement.style.color = '#ff6600';
                    iconElement.style.filter = 'drop-shadow(0 0 8px #ff6600) drop-shadow(0 0 12px #ff6600)';
                }
            }
        }
        
        // Also highlight the tracked aircraft's label if it exists
        const trackedLabelGroup = this.labelLayers.get(callsign);
        if (trackedLabelGroup) {
            trackedLabelGroup.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    // This is the label marker
                    const labelElement = layer.getElement();
                    if (labelElement) {
                        const labelDiv = labelElement.querySelector('div');
                        if (labelDiv) {
                            // Highlight the label with orange including background
                            labelDiv.style.color = '#ff6600';
                            labelDiv.style.backgroundColor = 'rgba(255, 102, 0, 0.2)'; // Semi-transparent orange background
                            labelDiv.style.borderColor = '#ff6600';
                            labelDiv.style.boxShadow = '0 0 8px #ff660080';
                        }
                    }
                } else if (layer instanceof L.Polyline) {
                    // This is the connecting line
                    layer.setStyle({
                        color: '#ff6600',
                        opacity: 0.9,
                        weight: 2
                    });
                }
            });
        }
        
        // Update tracking indicator to show aircraft is found
        this.updateTrackingIndicator(true);
    }
    
    updateTrackingIndicator(found) {
        const indicator = document.getElementById('tracking-indicator');
        if (indicator) {
            if (found) {
                indicator.style.background = 'rgba(76, 175, 80, 0.95)';
                indicator.style.borderColor = '#4CAF50';
                indicator.innerHTML = `
                    <i class="fas fa-crosshairs"></i> 
                    Tracking: ${this.trackedCallsign} ✓
                    <button onclick="window.radar.stopTracking()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else {
                indicator.style.background = 'rgba(244, 67, 54, 0.95)';
                indicator.style.borderColor = '#f44336';
                indicator.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i> 
                    Tracking: ${this.trackedCallsign} (Not Found)
                    <button onclick="window.radar.stopTracking()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
        }
    }
    
    updateTrackingIconHighlights() {
        // Update all tracking icons in the aircraft table to reflect current tracking status
        const allTrackIcons = document.querySelectorAll('.track-icon');
        allTrackIcons.forEach(icon => {
            const callsign = icon.getAttribute('data-callsign');
            const isTracked = this.isTrackingEnabled && this.trackedCallsign === callsign.toUpperCase();
            
            if (isTracked) {
                icon.classList.add('tracking');
                icon.title = `Stop tracking ${callsign}`;
            } else {
                icon.classList.remove('tracking');
                icon.title = `Track ${callsign}`;
            }
        });
    }
    
    startTrackingAircraft(callsign) {
        // Stop any existing tracking first
        if (this.isTrackingEnabled && this.trackedCallsign) {
            console.log(`Stopping tracking for ${this.trackedCallsign} to start tracking ${callsign}`);
            this.stopTracking();
        }
        
        // Set tracking parameters for new aircraft
        this.trackedCallsign = callsign.toUpperCase().trim();
        this.isTrackingEnabled = true;
        
        console.log(`Aircraft tracking started for callsign: ${this.trackedCallsign}`);
        
        // Show tracking indicator
        this.showTrackingIndicator();
        
        // Immediately track if aircraft is currently visible
        const marker = this.aircraftMarkers.get(this.trackedCallsign);
        if (marker && marker.aircraftData) {
            // Get the aircraft's current position
            let aircraftPosition;
            
            if (this.smoothMovementEnabled && this.aircraftPositions.has(this.trackedCallsign)) {
                // Use smooth movement position if available
                const positionData = this.aircraftPositions.get(this.trackedCallsign);
                aircraftPosition = [positionData.currentLat, positionData.currentLng];
            } else {
                // Use actual position
                aircraftPosition = [marker.aircraftData.latitude, marker.aircraftData.longitude];
            }
            
            // Center map on the aircraft with appropriate zoom
            const currentZoom = this.map.getZoom();
            const targetZoom = Math.max(currentZoom, 8); // Ensure minimum zoom level for tracking
            
            this.map.setView(aircraftPosition, targetZoom, {
                animate: true,
                duration: 1.5 // Smooth animation
            });
            
            // Highlight the tracked aircraft (this will remove previous highlighting)
            this.highlightTrackedAircraft(this.trackedCallsign);
            
            // Update the tracking indicator to show found status
            this.updateTrackingIndicator(true);
        }
        
        // Update tracking icon highlights in the aircraft table
        this.updateTrackingIconHighlights();
        
        // Update all open popups to reflect the new tracking state
        this.updateAllPopups();
    }
    
    updateAircraftColors() {
        // Update all existing aircraft markers to use the new tile layer's color
        this.aircraftMarkers.forEach((marker, callsign) => {
            if (marker.aircraftData) {
                // Recreate the icon with the new color
                const newIcon = this.createAircraftIcon(marker.aircraftData);
                marker.setIcon(newIcon);
            }
        });
        
        // Update aircraft labels and their connecting lines
        this.updateLabelColors();
        
        // Reapply tracking highlighting if there's a tracked aircraft
        if (this.isTrackingEnabled && this.trackedCallsign) {
            this.highlightTrackedAircraft(this.trackedCallsign);
        }
        
        // Also update heading lines
        this.updateHeadingLineColors();
        
        console.log(`Aircraft colors updated for tile layer: ${this.tileLayers[this.currentTileLayerIndex].name}`);
    }
    
    getHeadingLineColor(aircraftColor) {
        // Create a slightly different color for heading lines based on aircraft color
        // This ensures good visibility while maintaining color coordination
        const colorMap = {
            '#ff6b35': '#ffaa00', // Orange aircraft -> Golden heading
            '#00ff41': '#66ff66', // Green aircraft -> Light green heading  
            '#40e0d0': '#00ffff', // Turquoise aircraft -> Cyan heading
            '#8a2be2': '#dda0dd', // Blue violet aircraft -> Plum heading
            '#dc143c': '#ff69b4', // Crimson aircraft -> Hot pink heading
            '#1e90ff': '#87ceeb'  // Dodger blue aircraft -> Sky blue heading
        };
        
        return colorMap[aircraftColor] || '#ffff00'; // Default to yellow if color not found
    }
    
    updateHeadingLineColors() {
        // Update all existing heading lines to use the new tile layer's colors
        this.headingLines.forEach((line, callsign) => {
            const marker = this.aircraftMarkers.get(callsign);
            if (marker && marker.aircraftData) {
                // Remove old line and redraw with new color
                this.map.removeLayer(line);
                this.drawHeadingLine(marker.aircraftData);
            }
        });
    }

    updateLabelColors() {
        // Update all existing aircraft labels and their connecting lines to use new tile layer colors
        this.labelLayers.forEach((labelGroup, callsign) => {
            const marker = this.aircraftMarkers.get(callsign);
            if (marker && marker.aircraftData) {
                // Remove old label group and recreate with new colors
                this.map.removeLayer(labelGroup);
                
                // Create new label with updated colors
                const newLabelGroup = this.createAircraftLabel(marker.aircraftData);
                newLabelGroup.addTo(this.map);
                
                // Update the stored reference
                this.labelLayers.set(callsign, newLabelGroup);
            }
        });
    }
}

// Initialize the radar display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Virtual Flight Online Radar Display');
    window.radar = new RadarDisplay();
    window.radarDisplay = window.radar; // Backwards compatibility alias
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.radar && window.radar.map) {
        window.radar.map.invalidateSize();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.radar) {
        window.radar.stopSmoothMovement();
    }
});

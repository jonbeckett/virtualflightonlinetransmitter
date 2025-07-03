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
        
        // Tile layer configuration
        this.currentTileLayerIndex = 0;
        this.currentTileLayer = null;
        this.tileLayers = [
            {
                name: 'OpenStreetMap',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '© OpenStreetMap contributors',
                className: 'map-tiles',
                opacity: 0.6
            },
            {
                name: 'Satellite',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '© Esri, Maxar, Earthstar Geographics',
                className: '',
                opacity: 0.8
            },
            {
                name: 'Dark Mode',
                url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                attribution: '© OpenStreetMap contributors © CARTO',
                className: '',
                opacity: 0.7
            },
            {
                name: 'Aviation Chart',
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                attribution: '© OpenStreetMap contributors © CARTO',
                className: '',
                opacity: 0.5
            },
            {
                name: 'Topographic',
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attribution: '© OpenTopoMap (CC-BY-SA)',
                className: '',
                opacity: 0.6
            },
            {
                name: 'No Map',
                url: null,
                attribution: '',
                className: '',
                opacity: 0
            }
        ];
        
        this.init();
    }
    
    init() {
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
        
        // Calculate rotation angle (heading - 90 degrees to align with north)
        let rotationAngle = aircraft.heading - 90;
        if (rotationAngle < 0) rotationAngle += 360;
        
        return L.divIcon({
            className: 'aircraft-marker',
            html: `<div style="transform: rotate(${rotationAngle}deg);">${iconHtml}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }
    
    createPopupContent(aircraft) {
        return `
            <div style="min-width: 200px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #00ff00;">
                    ${aircraft.callsign}
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
        
        const headingLine = L.polyline([
            [startLat, startLng],
            [endLat, endLng]
        ], {
            color: '#ffff00',
            weight: 1, // Thinner line (was 2)
            opacity: 0.8
        });
        
        headingLine.addTo(this.map);
        this.headingLines.set(callsign, headingLine);
    }
    
    createAircraftLabel(aircraft) {
        const callsign = aircraft.callsign;
        const position = [aircraft.latitude, aircraft.longitude];
        
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
        
        // Create label content with better styling
        const labelText = `
            <div style="
                background: rgba(0, 20, 40, 0.95);
                color: #00ff00;
                padding: 3px 6px;
                border: 1px solid #00ff00;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 10px;
                white-space: nowrap;
                box-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
                backdrop-filter: blur(2px);
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
        
        // Create connecting line from aircraft to center of label
        const labelLine = L.polyline([position, labelPosition], {
            color: '#00ff00',
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
            
            // Update the connecting line
            labelLine.setLatLngs([position, newLabelPosArray]);
            
            // Convert the new position to pixel offset and save it
            const newPixelOffset = this.latLngToPixelOffset(position, newLabelPosArray);
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

    updateAircraftDisplay(aircraftData) {
        const currentCallsigns = new Set(aircraftData.map(ac => ac.callsign));
        
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
            }
        }
        
        // Update or create aircraft markers
        aircraftData.forEach(aircraft => {
            const callsign = aircraft.callsign;
            const position = [aircraft.latitude, aircraft.longitude];
            
            // Skip drawing heading line (disabled)
            // this.drawHeadingLine(aircraft);
            
            // Draw aircraft label
            this.drawAircraftLabel(aircraft);
            
            // Update or create aircraft marker
            if (this.aircraftMarkers.has(callsign)) {
                // Update existing marker
                const marker = this.aircraftMarkers.get(callsign);
                marker.setLatLng(position);
                marker.setIcon(this.createAircraftIcon(aircraft));
                marker.getPopup().setContent(this.createPopupContent(aircraft));
                
                // Store updated aircraft data on the marker
                marker.aircraftData = aircraft;
                
                // Update label position if it was manually positioned
                this.updateLabelPosition(aircraft);
            } else {
                // Create new marker
                const marker = L.marker(position, {
                    icon: this.createAircraftIcon(aircraft)
                });
                
                // Store aircraft data on the marker
                marker.aircraftData = aircraft;
                
                marker.bindPopup(this.createPopupContent(aircraft));
                
                marker.on('click', () => {
                    this.map.setView(position, Math.max(this.map.getZoom(), 8));
                });
                
                marker.addTo(this.map);
                this.aircraftMarkers.set(callsign, marker);
            }
            
            // Draw or update aircraft label
            this.drawAircraftLabel(aircraft);
        });
        
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
        
        notification.textContent = `Map Layer: ${currentLayer.name}`;
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
        
        const headers = ['Callsign', 'Pilot', 'Aircraft', 'Altitude', 'Speed'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
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
                
                // Add click handler to zoom to aircraft
                row.addEventListener('click', () => {
                    this.zoomToAircraft(aircraft.callsign);
                });
                
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
            cell.colSpan = 5;
            cell.textContent = 'No aircraft online';
            cell.className = 'no-aircraft-cell';
            row.appendChild(cell);
            tbody.appendChild(row);
        }
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
}

// Initialize the radar display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Virtual Flight Online Radar Display');
    new RadarDisplay();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.radar && window.radar.map) {
        window.radar.map.invalidateSize();
    }
});

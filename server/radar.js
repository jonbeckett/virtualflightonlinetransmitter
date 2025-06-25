class RadarDisplay {
    constructor() {
        this.map = null;
        this.aircraftMarkers = new Map();
        this.headingLines = new Map();
        this.labelLayers = new Map(); // New: for aircraft labels
        this.labelLines = new Map(); // New: for label connecting lines
        this.labelPositions = new Map(); // Store custom label positions relative to aircraft
        this.updateInterval = 5000; // 5 seconds
        this.radarDataUrl = 'radar_data.php';
        
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
            attributionControl: false
        }).setView([39.8283, -98.5795], 4); // Center on USA
        
        // Add tile layer with radar-style appearance
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '',
            className: 'map-tiles',
            opacity: 0.6
        }).addTo(this.map);
        
        // Add custom attribution
        L.control.attribution({
            prefix: false,
            position: 'bottomright'
        }).addAttribution('Virtual Flight Online Radar').addTo(this.map);
        
        // Add zoom event listener for label visibility
        this.map.on('zoomend', () => {
            this.handleZoomChange();
        });
        
        console.log('Radar map initialized');
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
        
        // Check if we have a saved label position for this aircraft
        let labelOffset;
        if (this.labelPositions.has(callsign)) {
            labelOffset = this.labelPositions.get(callsign);
        } else {
            // Default position: top-right of aircraft
            const zoom = this.map.getZoom();
            const offsetMultiplier = Math.max(0.01, 0.1 / zoom);
            labelOffset = [offsetMultiplier * 1.5, offsetMultiplier * 2];
            this.labelPositions.set(callsign, labelOffset);
        }
        
        const labelPosition = [
            position[0] + labelOffset[0], 
            position[1] + labelOffset[1]
        ];
        
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
            
            // Calculate and save relative offset
            const newOffset = [
                newLabelPos.lat - position[0],
                newLabelPos.lng - position[1]
            ];
            this.labelPositions.set(callsign, newOffset);
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
        if (!this.labelLayers.has(callsign) || !this.labelPositions.has(callsign)) {
            return;
        }
        
        const position = [aircraft.latitude, aircraft.longitude];
        const savedOffset = this.labelPositions.get(callsign);
        const newLabelPosition = [
            position[0] + savedOffset[0],
            position[1] + savedOffset[1]
        ];
        
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
                if (this.labelPositions.has(callsign)) {
                    this.labelPositions.delete(callsign);
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
                
                // Update label position if it was manually positioned
                this.updateLabelPosition(aircraft);
            } else {
                // Create new marker
                const marker = L.marker(position, {
                    icon: this.createAircraftIcon(aircraft)
                });
                
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
        
        // Heading lines disabled
        // this.updateHeadingLinesForZoom();
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
                this.labelPositions.delete(callsign);
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

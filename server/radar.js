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
        
        // Heading lines disabled
        // this.updateHeadingLinesForZoom();
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

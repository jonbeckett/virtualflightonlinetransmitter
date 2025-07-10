/**
 * Enhanced Status Map for Virtual Flight Online
 * This script provides a modern, responsive map interface for displaying aircraft status
 */

class StatusMap {
    constructor() {
        this.map = null;
        this.aircraftMarkers = [];
        this.updateInterval = 30000; // 30 seconds
        this.dataUrl = 'status_json.php'; // Use the status-specific endpoint
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.loadAircraftData();
        this.startAutoRefresh();
    }
    
    initMap() {
        // Initialize the map
        this.map = L.map('map', {
            preferCanvas: true,
            attributionControl: true,
            zoomControl: true
        }).setView([39.8283, -98.5795], 4); // Center on USA
        
        // Add OpenStreetMap tile layer with better styling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            className: 'map-tiles',
            maxZoom: 18
        }).addTo(this.map);
        
        console.log('Status map initialized');
    }
    
    async loadAircraftData() {
        this.updateRefreshIndicator('Loading...');
        
        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const aircraftData = await response.json();
            this.updateAircraftDisplay(aircraftData);
            this.updateAircraftTable(aircraftData);
            this.updateStats(aircraftData);
            this.updateRefreshIndicator('Connected');
            
            // Auto-fit map to aircraft on first load
            if (!this.isInitialized && aircraftData.length > 0) {
                this.autoFitToAircraft(aircraftData);
                this.isInitialized = true;
            }
            
        } catch (error) {
            console.error('Error loading aircraft data:', error);
            this.updateRefreshIndicator('Error');
        }
    }
    
    updateAircraftDisplay(aircraftData) {
        // Clear existing markers
        this.aircraftMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.aircraftMarkers = [];
        
        // Add new markers
        aircraftData.forEach(aircraft => {
            const marker = this.createAircraftMarker(aircraft);
            marker.addTo(this.map);
            this.aircraftMarkers.push(marker);
        });
        
        console.log(`Updated ${aircraftData.length} aircraft on status map`);
    }
    
    createAircraftMarker(aircraft) {
        const isMoving = aircraft.groundspeed > 20;
        const iconHtml = isMoving ? 
            '<i class="fas fa-plane" style="color: #2563eb; font-size: 16px;"></i>' : 
            '<i class="fas fa-circle" style="color: #dc2626; font-size: 12px;"></i>';
        
        // Calculate rotation angle for moving aircraft
        let rotationAngle = 0;
        if (isMoving) {
            rotationAngle = aircraft.heading - 90;
            if (rotationAngle < 0) rotationAngle += 360;
        }
        
        const marker = L.marker([aircraft.latitude, aircraft.longitude], {
            icon: L.divIcon({
                className: 'aircraft-marker',
                html: `<div style="transform: rotate(${rotationAngle}deg);">${iconHtml}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        });
        
        // Create popup content
        const popupContent = this.createPopupContent(aircraft);
        marker.bindPopup(popupContent);
        
        return marker;
    }
    
    createPopupContent(aircraft) {
        const movingIcon = aircraft.groundspeed > 20 ? '✈️' : '🔴';
        const inviteIcon = aircraft.notes && aircraft.notes.includes('#invite') ? ' 👋' : '';
        
        return `
            <div style="min-width: 200px; font-family: Arial, sans-serif;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">
                    ${movingIcon} ${aircraft.callsign}${inviteIcon}
                </div>
                <div style="color: #6b7280; margin-bottom: 8px; font-size: 14px;">
                    ${aircraft.pilot_name} - ${aircraft.group_name}
                </div>
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Aircraft:</td><td style="font-weight: 500;">${aircraft.aircraft_type}</td></tr>
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Altitude:</td><td style="font-weight: 500;">${Math.round(aircraft.altitude)} ft</td></tr>
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Heading:</td><td style="font-weight: 500;">${Math.round(aircraft.heading)}°</td></tr>
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Speed:</td><td style="font-weight: 500;">${Math.round(aircraft.groundspeed)} kts</td></tr>
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Server:</td><td style="font-weight: 500;">${aircraft.msfs_server}</td></tr>
                    <tr><td style="color: #6b7280; padding: 2px 8px 2px 0;">Online:</td><td style="font-weight: 500;">${aircraft.time_online}</td></tr>
                </table>
                ${aircraft.notes ? `<div style="margin-top: 8px; font-style: italic; font-size: 12px; color: #6b7280;">${aircraft.notes}</div>` : ''}
            </div>
        `;
    }
    
    updateAircraftTable(aircraftData) {
        const tbody = document.getElementById('aircraft-tbody');
        if (!tbody) return;
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Add new rows
        aircraftData.forEach((aircraft, index) => {
            const row = this.createTableRow(aircraft, index);
            tbody.appendChild(row);
        });
    }
    
    createTableRow(aircraft, index) {
        const row = document.createElement('tr');
        const isMoving = aircraft.groundspeed > 20;
        const statusIcon = isMoving ? '✈️' : '🔴';
        const inviteIcon = aircraft.notes && aircraft.notes.includes('#invite') ? ' 👋' : '';
        const hasNotes = aircraft.notes && aircraft.notes.trim() !== '';
        
        row.innerHTML = `
            <td class="text-center" title="${isMoving ? 'Aircraft is moving' : 'Aircraft is stationary'}">
                ${statusIcon}
            </td>
            <td>
                <strong>
                    <a href="#" class="callsign-link text-decoration-none" 
                       data-lat="${aircraft.latitude}" 
                       data-lng="${aircraft.longitude}"
                       data-index="${index}">
                        ${aircraft.callsign}${hasNotes ? ' *' : ''}${inviteIcon}
                    </a>
                </strong>
            </td>
            <td>${aircraft.pilot_name}</td>
            <td>${aircraft.aircraft_type}</td>
            <td>${aircraft.group_name}</td>
            <td>${aircraft.msfs_server}</td>
            <td class="text-end">${Math.round(aircraft.altitude)}</td>
            <td class="text-end">${Math.round(aircraft.heading)}</td>
            <td class="text-end">${Math.round(aircraft.airspeed)}</td>
            <td class="text-end">${Math.round(aircraft.groundspeed)}</td>
            <td class="text-center">${Math.round(aircraft.touchdown_velocity)}</td>
            <td class="text-center">${aircraft.time_online}</td>
            <td class="text-center">${aircraft.version}</td>
        `;
        
        // Add click handler for callsign link
        const callsignLink = row.querySelector('.callsign-link');
        callsignLink.addEventListener('click', (e) => {
            e.preventDefault();
            const lat = parseFloat(e.target.dataset.lat);
            const lng = parseFloat(e.target.dataset.lng);
            const markerIndex = parseInt(e.target.dataset.index);
            
            // Fly to aircraft location
            this.map.flyTo([lat, lng], 10);
            
            // Open popup for this aircraft
            if (this.aircraftMarkers[markerIndex]) {
                setTimeout(() => {
                    this.aircraftMarkers[markerIndex].openPopup();
                }, 500);
            }
        });
        
        return row;
    }
    
    updateStats(aircraftData) {
        // Update aircraft count
        const countElement = document.getElementById('aircraft_count');
        if (countElement) {
            countElement.textContent = aircraftData.length;
        }
        
        // Count moving aircraft
        const movingCount = aircraftData.filter(aircraft => aircraft.groundspeed > 20).length;
        const movingElement = document.getElementById('moving-count');
        if (movingElement) {
            movingElement.textContent = movingCount;
        }
        
        // Count unique servers
        const servers = new Set(aircraftData.map(aircraft => aircraft.msfs_server));
        const serverElement = document.getElementById('server-count');
        if (serverElement) {
            serverElement.textContent = servers.size;
        }
    }
    
    autoFitToAircraft(aircraftData) {
        if (aircraftData.length === 0) return;
        
        if (aircraftData.length === 1) {
            // Single aircraft - center on it
            const aircraft = aircraftData[0];
            this.map.setView([aircraft.latitude, aircraft.longitude], 8);
        } else {
            // Multiple aircraft - fit bounds
            const group = new L.featureGroup(this.aircraftMarkers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
    
    updateRefreshIndicator(status) {
        const indicator = document.getElementById('refresh-text');
        const spinner = document.getElementById('refresh-spinner');
        
        if (indicator) {
            indicator.textContent = status;
        }
        
        if (spinner) {
            if (status === 'Loading...') {
                spinner.classList.add('fa-spin');
            } else {
                spinner.classList.remove('fa-spin');
            }
        }
        
        // Update last update time
        if (status === 'Connected') {
            const lastUpdateElement = document.getElementById('last-update');
            if (lastUpdateElement) {
                const now = new Date();
                lastUpdateElement.textContent = now.toLocaleTimeString();
            }
        }
    }
    
    startAutoRefresh() {
        // Set up periodic updates
        setInterval(() => {
            this.loadAircraftData();
        }, this.updateInterval);
        
        console.log(`Auto-refresh started (${this.updateInterval/1000}s interval)`);
    }
}

// Global refresh function for the manual refresh button
function refreshData() {
    if (window.statusMap) {
        window.statusMap.loadAircraftData();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.statusMap = new StatusMap();
});

// jQuery compatibility for table sorting (if needed)
$(document).ready(function() {
    // Table sorting functionality
    $('th[data-sort]').click(function() {
        const table = $(this).parents('table').eq(0);
        const rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
        
        this.asc = !this.asc;
        if (!this.asc) {
            rows = rows.reverse();
        }
        
        for (let i = 0; i < rows.length; i++) {
            table.append(rows[i]);
        }
        
        // Update sort indicators
        $('th[data-sort] i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        $(this).find('i').removeClass('fa-sort').addClass(this.asc ? 'fa-sort-up' : 'fa-sort-down');
    });
});

function comparer(index) {
    return function(a, b) {
        const valA = getCellValue(a, index);
        const valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB);
    };
}

function getCellValue(row, index) {
    return $(row).children('td').eq(index).text();
}

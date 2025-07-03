/**
 * Improved Status Page JavaScript
 * Enhanced version of status.js with better UX and modern features
 */

class StatusManager {
    constructor() {
        this.map = null;
        this.aircraftData = [];
        this.markers = new Map();
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.setupEventListeners();
        this.fetchAircraftData();
        this.startAutoRefresh();
    }
    
    initMap() {
        // Initialize map with better styling
        this.map = L.map('map', {
            preferCanvas: true,
            attributionControl: true,
            zoomControl: true
        }).setView([20, 0], 2);
        
        // Use OpenStreetMap tiles with better styling
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            className: 'map-tiles'
        }).addTo(this.map);
        
        console.log('Map initialized');
    }
    
    setupEventListeners() {
        // Table sorting
        $('#aircraft_table th[data-sort]').click((e) => {
            const column = $(e.currentTarget).data('sort');
            this.sortTable(column);
        });
        
        // Global refresh function
        window.refreshData = () => {
            this.fetchAircraftData();
        };
    }
    
    async fetchAircraftData() {
        this.updateRefreshIndicator('updating', 'Updating...');
        
        try {
            const response = await fetch('status_json.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.aircraftData = data;
            this.renderTable();
            this.updateMap();
            this.updateStatistics();
            this.updateLastUpdateTime();
            this.updateRefreshIndicator('success', 'Connected');
            
            console.log(`Loaded ${data.length} aircraft`);
        } catch (error) {
            console.error('Error fetching aircraft data:', error);
            this.updateRefreshIndicator('error', 'Error');
        }
    }
    
    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        this.sortData(column, this.sortDirection);
        this.renderTable();
        this.updateSortIndicators();
    }
    
    sortData(column, direction) {
        this.aircraftData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];
            
            // Handle numeric values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            // Handle string values
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
            if (direction === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
    }
    
    updateSortIndicators() {
        // Reset all sort indicators
        $('#aircraft_table th[data-sort] i.fas').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
        
        // Update current sort indicator
        if (this.sortColumn) {
            const icon = this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
            $(`#aircraft_table th[data-sort="${this.sortColumn}"] i.fas`)
                .removeClass('fa-sort').addClass(icon);
        }
    }
    
    renderTable() {
        const tbody = $('#aircraft-tbody');
        tbody.empty();
        
        if (this.aircraftData.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="13" class="text-center text-muted py-4">
                        <i class="fas fa-search me-2"></i>
                        No aircraft online
                    </td>
                </tr>
            `);
            return;
        }
        
        this.aircraftData.forEach((aircraft, index) => {
            const isMoving = aircraft.groundspeed > 20;
            const statusIcon = isMoving ? 
                '<i class="fas fa-plane text-warning" title="Moving"></i>' : 
                '<i class="fas fa-circle text-success" title="Stationary"></i>';
            
            const hasNotes = aircraft.notes && aircraft.notes.trim() !== '';
            const hasInvite = aircraft.notes && aircraft.notes.includes('#invite');
            const inviteIcon = hasInvite ? 
                ' <i class="fas fa-hand-wave text-primary" title="Invitation - fly with me!"></i>' : '';
            
            const row = $(`
                <tr>
                    <td class="text-center">${statusIcon}</td>
                    <td>
                        <a href="#" class="callsign-link" data-lat="${aircraft.latitude}" data-lng="${aircraft.longitude}">
                            <strong>${aircraft.callsign}</strong>${hasNotes ? ' *' : ''}${inviteIcon}
                        </a>
                    </td>
                    <td>${aircraft.pilot_name}</td>
                    <td>${aircraft.aircraft_type}</td>
                    <td>${aircraft.group_name}</td>
                    <td>${aircraft.msfs_server}</td>
                    <td class="text-end">${Math.round(aircraft.altitude).toLocaleString()}</td>
                    <td class="text-end">${Math.round(aircraft.heading)}°</td>
                    <td class="text-end">${Math.round(aircraft.airspeed)}</td>
                    <td class="text-end">${Math.round(aircraft.groundspeed)}</td>
                    <td class="text-center">${Math.round(aircraft.touchdown_velocity)}</td>
                    <td class="text-center">${aircraft.time_online}</td>
                    <td class="text-center">${aircraft.version}</td>
                </tr>
            `);
            
            tbody.append(row);
        });
        
        // Add click handlers for callsigns
        $('.callsign-link').click((e) => {
            e.preventDefault();
            const lat = parseFloat($(e.currentTarget).data('lat'));
            const lng = parseFloat($(e.currentTarget).data('lng'));
            this.map.closePopup();
            this.map.flyTo([lat, lng], 10);
        });
    }
    
    updateMap() {
        // Clear existing markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers.clear();
        
        // Add new markers
        this.aircraftData.forEach(aircraft => {
            const isMoving = aircraft.groundspeed > 20;
            
            let iconRotation = 0;
            if (isMoving) {
                iconRotation = aircraft.heading - 90;
                if (iconRotation < 0) iconRotation += 360;
            }
            
            const marker = L.marker([aircraft.latitude, aircraft.longitude], {
                rotationAngle: iconRotation,
                icon: L.divIcon({
                    className: 'aircraft-marker',
                    html: `<i class="fas ${isMoving ? 'fa-plane' : 'fa-circle'}" style="color:${isMoving ? '#1e40af' : '#059669'};font-size:${isMoving ? '1.2em' : '1em'};"></i>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            });
            
            // Create popup content
            const popupContent = this.createPopupContent(aircraft);
            marker.bindPopup(popupContent);
            
            // Add click handler
            marker.on('click', () => {
                this.map.closePopup();
                this.map.panTo(marker.getLatLng());
                marker.openPopup();
            });
            
            marker.addTo(this.map);
            this.markers.set(aircraft.callsign, marker);
        });
        
        // Auto-fit map if aircraft are present
        if (this.aircraftData.length > 0) {
            const group = new L.featureGroup(Array.from(this.markers.values()));
            this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }
    
    createPopupContent(aircraft) {
        return `
            <div class="aircraft-popup">
                <div class="popup-header mb-2">
                    <h6 class="mb-1 text-primary">${aircraft.callsign}</h6>
                    <small class="text-muted">${aircraft.pilot_name}, ${aircraft.group_name}</small>
                </div>
                <table class="table table-sm table-borderless mb-2">
                    <tr><td><strong>Type:</strong></td><td>${aircraft.aircraft_type}</td></tr>
                    <tr><td><strong>Altitude:</strong></td><td>${Math.round(aircraft.altitude).toLocaleString()} ft</td></tr>
                    <tr><td><strong>Heading:</strong></td><td>${Math.round(aircraft.heading)}°</td></tr>
                    <tr><td><strong>Airspeed:</strong></td><td>${Math.round(aircraft.airspeed)} kts</td></tr>
                    <tr><td><strong>Groundspeed:</strong></td><td>${Math.round(aircraft.groundspeed)} kts</td></tr>
                    <tr><td><strong>Online:</strong></td><td>${aircraft.time_online}</td></tr>
                    <tr><td><strong>Server:</strong></td><td>${aircraft.msfs_server}</td></tr>
                </table>
                ${aircraft.notes ? `<div class="popup-notes"><small><strong>Notes:</strong> ${aircraft.notes}</small></div>` : ''}
            </div>
        `;
    }
    
    updateStatistics() {
        const total = this.aircraftData.length;
        const moving = this.aircraftData.filter(ac => ac.groundspeed > 20).length;
        const servers = new Set(this.aircraftData.map(ac => ac.msfs_server)).size;
        
        $('#aircraft_count').text(total);
        $('#moving-count').text(moving);
        $('#server-count').text(servers);
    }
    
    updateRefreshIndicator(status, text) {
        const indicator = $('#refresh-indicator');
        const spinner = $('#refresh-spinner');
        const textElement = $('#refresh-text');
        
        indicator.removeClass('updating');
        spinner.removeClass('fa-spin');
        
        switch (status) {
            case 'updating':
                indicator.addClass('updating');
                spinner.addClass('fa-spin');
                break;
            case 'success':
                // Keep default styling
                break;
            case 'error':
                indicator.css('background', '#f8d7da').css('border-color', '#f5c6cb');
                break;
        }
        
        textElement.text(text);
    }
    
    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        $('#last-update').text(timeString);
    }
    
    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.fetchAircraftData();
        }, this.refreshInterval);
        
        console.log(`Auto-refresh started (${this.refreshInterval / 1000}s interval)`);
    }
    
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
}

// Initialize when document is ready
$(document).ready(() => {
    console.log('Initializing Improved Status Manager');
    window.statusManager = new StatusManager();
});

// Handle page visibility change to pause/resume auto-refresh
document.addEventListener('visibilitychange', () => {
    if (window.statusManager) {
        if (document.hidden) {
            window.statusManager.stopAutoRefresh();
        } else {
            window.statusManager.startAutoRefresh();
        }
    }
});

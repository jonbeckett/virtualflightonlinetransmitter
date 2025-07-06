/**
 * Enhanced Status Page JavaScript
 * Improved version of status.js with better UX and functionality
 */

class StatusDisplay {
    constructor() {
        this.map = null;
        this.aircraftData = [];
        this.filteredData = [];
        this.markers = new Map();
        this.refreshInterval = 30000; // 30 seconds
        this.refreshTimer = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.currentFilter = {
            callsign: '',
            server: '',
            group: '',
            aircraft: '',
            viewMode: 'all'
        };
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.setupEventListeners();
        this.fetchAircraftData();
        this.startAutoRefresh();
    }
    
    initMap() {
        // Initialize map with better default view
        this.map = L.map('map', {
            preferCanvas: true,
            attributionControl: true
        }).setView([20, 0], 2);
        
        // Use a better tile layer
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
        
        // Filter controls
        $('#filter-callsign').on('input', () => {
            this.currentFilter.callsign = $('#filter-callsign').val().toLowerCase();
            this.applyFilters();
        });
        
        $('#filter-server').change(() => {
            this.currentFilter.server = $('#filter-server').val();
            this.applyFilters();
        });
        
        $('#filter-group').change(() => {
            this.currentFilter.group = $('#filter-group').val();
            this.applyFilters();
        });
        
        $('#filter-aircraft').on('input', () => {
            this.currentFilter.aircraft = $('#filter-aircraft').val().toLowerCase();
            this.applyFilters();
        });
        
        // View mode toggles
        $('input[name="view-mode"]').change((e) => {
            this.currentFilter.viewMode = e.target.id.replace('view-', '');
            this.applyFilters();
        });
        
        // Refresh button
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
            this.updateFilterOptions();
            this.applyFilters();
            this.updateStatistics();
            this.updateMap();
            this.updateLastUpdateTime();
            this.updateRefreshIndicator('success', 'Connected');
            
            console.log(`Loaded ${data.length} aircraft`);
        } catch (error) {
            console.error('Error fetching aircraft data:', error);
            this.updateRefreshIndicator('error', 'Error');
        }
    }
    
    updateFilterOptions() {
        // Update server filter options
        const servers = [...new Set(this.aircraftData.map(ac => ac.msfs_server))].sort();
        const serverSelect = $('#filter-server');
        const currentServer = serverSelect.val();
        serverSelect.empty().append('<option value="">All Servers</option>');
        servers.forEach(server => {
            serverSelect.append(`<option value="${server}">${server}</option>`);
        });
        serverSelect.val(currentServer);
        
        // Update group filter options
        const groups = [...new Set(this.aircraftData.map(ac => ac.group_name))].sort();
        const groupSelect = $('#filter-group');
        const currentGroup = groupSelect.val();
        groupSelect.empty().append('<option value="">All Groups</option>');
        groups.forEach(group => {
            groupSelect.append(`<option value="${group}">${group}</option>`);
        });
        groupSelect.val(currentGroup);
    }
    
    applyFilters() {
        this.filteredData = this.aircraftData.filter(aircraft => {
            // Callsign filter
            if (this.currentFilter.callsign && 
                !aircraft.callsign.toLowerCase().includes(this.currentFilter.callsign)) {
                return false;
            }
            
            // Server filter
            if (this.currentFilter.server && aircraft.msfs_server !== this.currentFilter.server) {
                return false;
            }
            
            // Group filter
            if (this.currentFilter.group && aircraft.group_name !== this.currentFilter.group) {
                return false;
            }
            
            // Aircraft filter
            if (this.currentFilter.aircraft && 
                !aircraft.aircraft_type.toLowerCase().includes(this.currentFilter.aircraft)) {
                return false;
            }
            
            // View mode filter
            if (this.currentFilter.viewMode === 'moving' && aircraft.groundspeed <= 20) {
                return false;
            }
            if (this.currentFilter.viewMode === 'stationary' && aircraft.groundspeed > 20) {
                return false;
            }
            
            return true;
        });
        
        // Apply current sort
        if (this.sortColumn) {
            this.sortData(this.sortColumn, this.sortDirection);
        }
        
        this.renderTable();
        this.updateCounts();
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
        this.filteredData.sort((a, b) => {
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
        
        if (this.filteredData.length === 0) {
            tbody.append(`
                <tr>
                    <td colspan="13" class="text-center text-muted py-4">
                        <i class="fas fa-search me-2"></i>
                        No aircraft match the current filters
                    </td>
                </tr>
            `);
            return;
        }
        
        this.filteredData.forEach((aircraft, index) => {
            const isMoving = aircraft.groundspeed > 20;
            const statusIcon = isMoving ? 
                '<i class="fas fa-plane text-warning" title="Moving"></i>' : 
                '<i class="fas fa-circle text-success" title="Stationary"></i>';
            
            const hasNotes = aircraft.notes && aircraft.notes.trim() !== '';
            const hasInvite = aircraft.notes && aircraft.notes.includes('#invite');
            const inviteIcon = hasInvite ? 
                ' <i class="fas fa-hand-wave text-primary" title="Invitation - fly with me!"></i>' : '';
            
            const row = $(`
                <tr data-aircraft-index="${index}">
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
            const iconHtml = isMoving ? 
                '<i class="fas fa-plane" style="color:#1e40af;font-size:1.2em;"></i>' : 
                '<i class="fas fa-circle" style="color:#059669;font-size:1em;"></i>';
            
            let iconRotation = 0;
            if (isMoving) {
                iconRotation = aircraft.heading - 90;
                if (iconRotation < 0) iconRotation += 360;
            }
            
            const marker = L.marker([aircraft.latitude, aircraft.longitude], {
                rotationAngle: iconRotation,
                icon: L.divIcon({
                    className: 'aircraft-marker',
                    html: iconHtml,
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
                <div class="popup-header">
                    <h6 class="mb-1">${aircraft.callsign}</h6>
                    <small class="text-muted">${aircraft.pilot_name}, ${aircraft.group_name}</small>
                </div>
                <table class="table table-sm table-borderless mb-2">
                    <tr><td>Type:</td><td>${aircraft.aircraft_type}</td></tr>
                    <tr><td>Altitude:</td><td>${Math.round(aircraft.altitude).toLocaleString()} ft</td></tr>
                    <tr><td>Heading:</td><td>${Math.round(aircraft.heading)}°</td></tr>
                    <tr><td>Airspeed:</td><td>${Math.round(aircraft.airspeed)} kts</td></tr>
                    <tr><td>Groundspeed:</td><td>${Math.round(aircraft.groundspeed)} kts</td></tr>
                    <tr><td>Online:</td><td>${aircraft.time_online}</td></tr>
                    <tr><td>Server:</td><td>${aircraft.msfs_server}</td></tr>
                </table>
                ${aircraft.notes ? `<div class="popup-notes"><small><strong>Notes:</strong> ${aircraft.notes}</small></div>` : ''}
            </div>
        `;
    }
    
    updateStatistics() {
        const total = this.aircraftData.length;
        const moving = this.aircraftData.filter(ac => ac.groundspeed > 20).length;
        const servers = new Set(this.aircraftData.map(ac => ac.msfs_server)).size;
        const groups = new Set(this.aircraftData.map(ac => ac.group_name)).size;
        
        $('#total-aircraft').text(total);
        $('#moving-aircraft').text(moving);
        $('#unique-servers').text(servers);
        $('#unique-groups').text(groups);
    }
    
    updateCounts() {
        $('#filtered-count').text(this.filteredData.length);
        $('#total-count').text(this.aircraftData.length);
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
    console.log('Initializing Enhanced Status Display');
    window.statusDisplay = new StatusDisplay();
});

// Handle page visibility change to pause/resume auto-refresh
document.addEventListener('visibilitychange', () => {
    if (window.statusDisplay) {
        if (document.hidden) {
            window.statusDisplay.stopAutoRefresh();
        } else {
            window.statusDisplay.startAutoRefresh();
        }
    }
});

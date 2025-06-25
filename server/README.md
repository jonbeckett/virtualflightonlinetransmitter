# Virtual Flight Online Transmitter

A real-time aircraft tracking system for Microsoft Flight Simulator that displays aircraft positions on a web-based radar display and status pages.

## 🎯 Overview

Virtual Flight Online Transmitter is a web-based aircraft tracking system that allows multiple pilots to share their real-time position data from Microsoft Flight Simulator. The system provides:

- **Real-time radar display** with aircraft icons, labels, and interactive features
- **Aircraft status tables** with detailed flight information
- **IVAO-compatible data feeds** for integration with external flight tracking tools
- **Persistent data storage** using APCu in-memory caching
- **Professional aviation radar styling** with draggable labels

## 🚀 Features

### Radar Display (`radar.php`)
- Interactive map with aircraft icons showing heading and movement
- Draggable aircraft labels with position memory
- Zoom-based label visibility (labels appear at zoom level 6+)
- Real-time updates every 5 seconds
- Professional radar-style dark theme

### Status Pages (`status.php`)
- Tabular view of all online aircraft
- Sortable columns for all aircraft data
- Integrated mini-map with aircraft markers
- Real-time position updates

### Data Feeds
- **JSON API** (`status_json.php`, `radar_data.php`) for modern integrations
- **IVAO whazzup format** (`whazzup_ivao.php`) for compatibility with flight tracking tools
- **JSON whazzup format** (`whazzup_ivao_json.php`) for API consumers

### Administration
- **APCu cache manager** (`apcu_manager.php`) for data monitoring and cleanup
- **Automatic cleanup** - aircraft disappear after 1 minute of no updates

## 📋 Prerequisites

### Server Requirements
- **PHP 7.4+** with the following extensions:
  - `APCu` extension (for in-memory caching)
  - `JSON` extension
- **Apache/Nginx** web server
- **No database required** - uses APCu for all data storage

### Client Requirements (for pilots)
- **Microsoft Flight Simulator 2020** or **Microsoft Flight Simulator 2024**
- HTTP client capable of sending POST requests (e.g., addon, script, or external tool)

## 🛠️ Installation

### 1. Server Setup

1. **Install APCu extension:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install php-apcu
   
   # CentOS/RHEL
   sudo yum install php-pecl-apcu
   
   # Windows (via XAMPP/WAMP)
   # Enable extension=apcu in php.ini
   ```

2. **Configure APCu in php.ini:**
   ```ini
   extension=apcu
   apc.enabled=1
   apc.shm_size=128M
   apc.ttl=1800
   apc.enable_cli=1
   ```

3. **Upload project files** to your web server directory

4. **Set permissions** (Linux/Unix):
   ```bash
   chmod 755 *.php
   chmod 644 *.css *.js *.md
   ```

### 2. Configuration

1. **Edit `transmit.php`** to set your server PIN (optional):
   ```php
   $server_pin = "your_secure_pin_here"; // Leave empty to disable
   ```

2. **Verify APCu** is working by visiting:
   ```
   https://yourserver.com/path/apcu_manager.php
   ```

## 📡 How It Works

### Data Flow
1. **Aircraft transmit data** → `transmit.php` (receives position updates)
2. **Data stored in APCu** → In-memory cache with 30-minute TTL
3. **Web pages fetch data** → Various endpoints serve cached data
4. **Real-time updates** → Pages refresh every 5 seconds

### Data Structure
Each aircraft transmits the following data:
```json
{
  "Callsign": "N123AB",
  "PilotName": "John Pilot",
  "GroupName": "Virtual Airlines",
  "Server": "East USA",
  "AircraftType": "Boeing 737-800",
  "Latitude": 40.7128,
  "Longitude": -74.0060,
  "Altitude": 35000,
  "Heading": 090,
  "Airspeed": 450,
  "Groundspeed": 485,
  "TouchdownVelocity": 0,
  "Notes": "Flight remarks",
  "Version": "1.0"
}
```

### Client Integration
Pilots send POST requests to `transmit.php` with their position data:

```bash
curl -X POST https://yourserver.com/transmit.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Callsign=N123AB&PilotName=John+Pilot&Latitude=40.7128&Longitude=-74.0060&..."
```

## 🌐 API Endpoints

| Endpoint | Format | Description |
|----------|--------|-------------|
| `radar.php` | HTML | Interactive radar display |
| `status.php` | HTML | Aircraft status table |
| `radar_data.php` | JSON | Raw aircraft data for radar |
| `status_json.php` | JSON | Aircraft data for status page |
| `whazzup_ivao.php` | Text | IVAO-compatible whazzup format |
| `whazzup_ivao_json.php` | JSON | JSON version of whazzup data |
| `transmit.php` | POST | Data submission endpoint |
| `apcu_manager.php` | HTML | Cache management interface |

## 🎮 Usage

### For Pilots
1. Configure your flight simulator addon/tool to send data to `transmit.php`
2. Ensure data is sent every 5-30 seconds for real-time tracking
3. Your aircraft will appear on the radar and status pages automatically

### For Viewers
1. **Radar View**: Visit `radar.php` for an interactive map experience
2. **Status View**: Visit `status.php` for a detailed table view
3. **Drag labels** on the radar to customize aircraft label positions
4. **Click aircraft** to center the map on their position

### For Developers
- Use `status_json.php` or `radar_data.php` for JSON data
- Use `whazzup_ivao.php` for IVAO-compatible feeds
- Data updates automatically every 5 seconds

## ⚙️ Configuration Options

### Timing Settings
- **Update Interval**: 5 seconds (configurable in `radar.js`)
- **Aircraft Timeout**: 60 seconds (aircraft removed if no updates)
- **APCu TTL**: 30 minutes (data persistence)

### Display Settings
- **Label Visibility**: Zoom level 6+ (configurable in `radar.js`)
- **Map Center**: USA (configurable in `radar.js`)
- **Radar Theme**: Dark aviation style

## 🔧 Troubleshooting

### Common Issues

1. **"APCu not available" error**
   - Install and enable APCu extension
   - Restart web server after installation

2. **No aircraft appearing**
   - Check APCu is working via `apcu_manager.php`
   - Verify data is being sent to `transmit.php`
   - Check 60-second timeout hasn't expired

3. **Performance issues**
   - Increase APCu memory in php.ini
   - Monitor cache usage in `apcu_manager.php`

### Debug Tools
- `apcu_manager.php` - View cached data and statistics
- Browser developer tools - Check for JavaScript errors
- Server error logs - Check for PHP errors

## 📁 File Structure

```
server/
├── radar.php              # Interactive radar display
├── radar.js               # Radar JavaScript functionality
├── radar_data.php         # JSON data for radar
├── status.php             # Aircraft status table
├── status.js              # Status page JavaScript
├── status_json.php        # JSON data for status
├── transmit.php           # Data submission endpoint
├── whazzup_ivao.php       # IVAO whazzup format
├── whazzup_ivao_json.php  # JSON whazzup format
├── apcu_manager.php       # Cache management
├── common.php             # Shared functions
├── style.css              # Styling
└── README.md              # This file
```

## 🚦 System Status

The system provides several indicators of health:
- **Green "Connected"** - System operating normally
- **Aircraft count** - Number of currently tracked aircraft
- **Last update time** - When data was last refreshed
- **Cache statistics** - Available via APCu manager

## 📜 License

This project is provided as-is for educational and simulation purposes. Modify and distribute according to your needs.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional map providers
- Enhanced aircraft icons
- Mobile responsive design
- Additional data export formats
- Performance optimizations

---

**Virtual Flight Online Transmitter** - Real-time flight tracking for the virtual aviation community.

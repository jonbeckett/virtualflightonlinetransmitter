# Virtual Flight Online Transmitter

A real-time aircraft tracking system for Microsoft Flight Simulator that displays live flight data on an interactive web-based radar display.

## 🎯 Overview

Virtual Flight Online Transmitter enables multiple pilots to share their real-time position data from Microsoft Flight Simulator, creating a shared virtual airspace experience with:

- **Interactive radar display** with aircraft icons, draggable labels, and auto-positioning
- **Real-time status pages** with detailed flight information
- **IVAO-compatible data feeds** for integration with flight tracking tools
- **In-memory data storage** using APCu for fast performance
- **Professional aviation radar styling** with dark theme

## ✈️ Features

### Radar Display (`radar.php`)
- Live aircraft tracking with heading indicators and movement status
- Draggable aircraft labels with persistent positioning
- Auto-fit view to show all aircraft on page load
- Zoom-based label visibility (appears at zoom level 6+)
- Updates every 5 seconds with smooth animations

### Status Dashboard (`status.php`)
- Sortable table view of all online aircraft
- Real-time position updates with time online tracking
- Integrated mini-map with aircraft markers
- Aircraft count and connection status indicators

### Data APIs
- **JSON endpoints** for modern web integration
- **IVAO whazzup format** for compatibility with existing tools
- **Cache management interface** for monitoring and administration

## �️ Quick Start

### Requirements
- **PHP 7.4+** with APCu extension
- **Web server** (Apache/Nginx)
- **No database needed** - uses in-memory caching

### Installation

1. **Install APCu extension**
   ```bash
   # Ubuntu/Debian
   sudo apt install php-apcu
   
   # Enable in php.ini
   extension=apcu
   apc.enabled=1
   apc.shm_size=128M
   ```

2. **Upload files** to your web server

3. **Configure** (optional) - Set server PIN in `transmit.php`:
   ```php
   $server_pin = "your_secure_pin"; // Leave empty to disable
   ```

4. **Verify setup** by visiting `apcu_manager.php`

## 📡 How It Works

### Data Flow
```
Aircraft → transmit.php → APCu Cache → Web Pages → Users
```

1. **Aircraft send position data** to `transmit.php` via HTTP POST
2. **Data cached in memory** with 30-minute expiration
3. **Web pages fetch cached data** for real-time display
4. **Automatic cleanup** removes inactive aircraft after 60 seconds

### Aircraft Data Structure
```json
{
  "Callsign": "N123AB",
  "PilotName": "John Pilot", 
  "GroupName": "Virtual Airlines",
  "AircraftType": "Boeing 737-800",
  "Latitude": 40.7128,
  "Longitude": -74.0060,
  "Altitude": 35000,
  "Heading": 90,
  "Airspeed": 450,
  "Groundspeed": 485,
  "Notes": "Flight remarks"
}
```

## 🌐 API Reference

| Endpoint | Type | Purpose |
|----------|------|---------|
| `radar.php` | HTML | Interactive radar map |
| `status.php` | HTML | Aircraft data table |
| `radar_data.php` | JSON | Raw aircraft positions |
| `status_json.php` | JSON | Formatted aircraft data |
| `transmit.php` | POST | Data submission |
| `whazzup_ivao.php` | Text | IVAO-compatible feed |
| `apcu_manager.php` | HTML | Cache administration |

### Sending Data
```bash
curl -X POST https://yourserver.com/transmit.php \
  -d "Callsign=N123AB&PilotName=John+Pilot&Latitude=40.7128&Longitude=-74.0060&..."
```

## 🎮 Usage Guide

### For Pilots
1. Configure your flight sim addon to send data to `transmit.php`
2. Send updates every 5-30 seconds for smooth tracking
3. Your aircraft appears automatically on radar and status pages

### For Viewers
- **Radar**: Interactive map with clickable aircraft and draggable labels
- **Status**: Detailed table view with sortable columns
- **Auto-positioning**: Map automatically centers on active aircraft

### For Developers
- Use JSON endpoints for custom integrations
- IVAO whazzup format for compatibility with existing tools
- Real-time updates with 5-second refresh intervals

## ⚙️ Configuration

### Performance Settings
```php
// In transmit.php
define('POSITION_TTL', 1800);     // 30 minutes data retention
$updateInterval = 5000;           // 5 second refresh rate
$aircraftTimeout = 60;            // Remove after 60 seconds offline
```

### Display Options
```javascript
// In radar.js
this.defaultPixelOffset = [60, 80];  // Label positioning
const showLabels = zoom >= 6;        // Label visibility threshold
maxZoom: 10                          // Auto-fit zoom limit
```

## 🔧 Troubleshooting

**APCu not available**
- Install APCu extension and restart web server
- Check `phpinfo()` for extension status

**No aircraft showing**
- Verify APCu is working via `apcu_manager.php`
- Check aircraft are sending data within 60-second timeout
- Confirm data format matches expected structure

**Performance issues**
- Increase APCu memory allocation in `php.ini`
- Monitor cache usage in APCu manager
- Check server resources during peak usage

## 📁 Project Structure

```
server/
├── radar.php           # Main radar display
├── radar.js            # Radar functionality
├── status.php          # Aircraft status table
├── transmit.php        # Data endpoint
├── *_data.php          # JSON API endpoints
├── whazzup_ivao.php    # IVAO compatibility
├── apcu_manager.php    # Administration
├── common.php          # Shared functions
└── style.css           # Styling
```

## � Key Features

- **Zero-database design** - Uses APCu in-memory cache for speed
- **Auto-positioning radar** - Automatically centers on active aircraft
- **Draggable labels** - Customize aircraft label positions
- **Real-time updates** - 5-second refresh with smooth animations
- **IVAO compatibility** - Works with existing flight tracking tools
- **Professional styling** - Aviation-themed dark radar interface

## 📜 License

Open source project for educational and simulation use. Modify and distribute freely.

---

**Virtual Flight Online Transmitter** - Bringing pilots together in virtual airspace.

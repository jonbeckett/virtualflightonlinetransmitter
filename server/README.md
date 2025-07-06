# Virtual Flight Online Transmitter

A real-time aircraft tracking system for Microsoft Flight Simulator that displays live flight data on an interactive web-based radar display with professional aviation controls.

## 🎯 Overview

Virtual Flight Online Transmitter enables multiple pilots to serve### Aircraft Tracking & Following
Follow specific aircraft automatically using URL parameters or the aircraft table:

**URL Parameter Support:** `radar.php?callsign=AIRCRAFT_CALLSIGN`

**Table Tracking:** Click the crosshairs icon (🎯) next to any aircraft in the aircraft table to start tracking

**Examples:**
- `radar.php?callsign=N123AB` - Track aircraft N123AB
- `radar.php?callsign=AAL123` - Track airline flight AAL123
- `radar.php?callsign=MYSIM` - Track aircraft with callsign MYSIM

**Features:**
- **Visual Highlighting**: Tracked aircraft glow orange with pulsing animation
- **Auto-centering**: Map continuously follows the tracked aircraft
- **Status Banner**: Shows tracking status and aircraft availability
- **Easy Access**: Click tracking icon in aircraft table or use URL parameters
- **Easy Exit**: Click the X button in the banner to stop trackinghp              # Enhanced radar display with toolbar & aircraft table
├── radar.js               # Advanced radar functionality & controls
├── status.php             # Aircraft status table dashboard
├── transmit.php           # Data submission endpoint
├── test_aircraft.php      # Test aircraft data generator
├── debug_aircraft.php     # Aircraft debugging tool
├── radar_data.php         # JSON API for radar data
├── status_json.php        # JSON API for status data
├── ivao.php               # IVAO compatibility endpoint
├── apcu_manager.php       # Cache administration interface
├── common.php             # Shared utility functions
├── style.css              # Global styling
├── index.html             # Enhanced landing page
├── index.php              # PHP landing page
└── system_test.php        # System diagnostics
```

### Key Files Explained

- **`radar.php`** - Main interactive radar with draggable toolbar, multi-layer maps, aircraft table
- **`radar.js`** - All radar functionality including controls, map management, aircraft tracking
- **`transmit.php`** - Receives POST data from flight simulators and stores in APCu cache
- **`test_aircraft.php`** - Web-based tool for generating realistic test aircraft with configurable parameters
- **`debug_aircraft.php`** - Debugging tool for testing aircraft data submission and retrieval
- **`radar_data.php`** - JSON endpoint providing real-time aircraft positions for radar
- **`apcu_manager.php`** - Administrative interface for monitoring cache and system status

## 🌟 Key Features

### Advanced Radar Interface
- **Draggable Toolbar** - Professional aviation-style controls that can be repositioned
- **Multi-Layer Maps** - 6 different map views from street maps to aviation charts
- **Aircraft Table** - Synchronized, draggable table with click-to-focus functionality
- **Smooth Movement** - Physics-based aircraft movement with realistic heading and speed interpolation
- **Measurement Tools** - Right-click drag for distance/bearing measurements and Shift+right-click for range rings
- **Aircraft Tracking** - URL parameter support to follow specific aircraft (e.g., `?callsign=ABC123`)
- **Keyboard Shortcuts** - Complete keyboard navigation for all functions
- **Touch Support** - Full mobile and tablet compatibility
- **Responsive Design** - Adapts to any screen size from mobile to large displays

### Professional Measurement Tools
- **Distance/Bearing Tool** - Right-click and drag to measure distances in nautical miles and true bearings
- **Range Ring Tool** - Shift+right-click and drag to create circular range indicators with radius labels
- **Real-time Updates** - Both tools update measurements dynamically during dragging
- **Aviation Units** - All measurements displayed in standard aviation units (NM, degrees)
- **Auto-cleanup** - Tools disappear when mouse button is released

### Smooth Aircraft Movement
- **Physics-based Interpolation** - Aircraft move realistically based on actual heading and groundspeed
- **Label Synchronization** - Aircraft labels and connecting lines move smoothly with aircraft
- **Toggle Control** - Enable/disable smooth movement with toolbar button or 'S' key
- **Performance Optimized** - Efficient updates only when aircraft actually move
- **Visual Feedback** - Clear on/off state indication in toolbar

### Aircraft Tracking & Following
- **URL Parameter Support** - Direct links to track specific aircraft (`radar.php?callsign=ABC123`)
- **Visual Highlighting** - Tracked aircraft glow orange with pulsing animation
- **Status Indicator** - Live tracking banner with aircraft found/not found status
- **Continuous Following** - Map automatically centers on tracked aircraft position
- **Easy Disable** - Click X button to stop tracking and return to normal view

### Real-Time Data Management
- **Zero-database design** - Uses APCu in-memory cache for maximum speed
- **Auto-positioning radar** - Automatically centers on active aircraft
- **Draggable labels** - Customize aircraft label positions with persistence
- **5-second updates** - Real-time refresh with smooth animations
- **Smart caching** - Efficient data storage with automatic cleanup

### Professional Aviation Features
- **IVAO compatibility** - Works with existing flight tracking infrastructure
- **Multiple data formats** - JSON APIs and legacy text formats supported
- **Scalable architecture** - Handles multiple aircraft with optimized performance
- **Dark theme styling** - Professional aviation radar appearance

### Developer-Friendly
- **RESTful APIs** - Clean JSON endpoints for integration
- **Modular design** - Separate files for different functionality
- **Extensive documentation** - Comprehensive setup and usage guides
- **Debug support** - Built-in debugging and diagnostic tools
- **Test data generation** - Realistic aircraft generator for development and testing

## 🚀 Recent Enhancements

### Version 3.0 Features
- ✅ **Smooth Aircraft Movement** with physics-based interpolation using heading and groundspeed
- ✅ **Measurement Tools** including distance/bearing and range ring tools with real-time updates
- ✅ **Aircraft Tracking** via URL parameters to follow specific aircraft automatically
- ✅ **Enhanced Visual Effects** with pulsing animations and improved aircraft highlighting
- ✅ **Label Synchronization** ensuring aircraft labels move smoothly with their aircraft
- ✅ **Professional Measurement Display** showing distances in nautical miles and bearings in degrees

### Version 2.0 Features
- ✅ **Draggable Toolbar** with zoom, home, center, fullscreen, layers, and aircraft list controls
- ✅ **Multi-Layer Map Support** with 6 different tile providers and smooth transitions
- ✅ **Interactive Aircraft Table** with drag, scroll, and click-to-focus functionality
- ✅ **Keyboard Navigation** for all radar functions and controls
- ✅ **Mobile Optimization** with touch-friendly interface and responsive design
- ✅ **Real-Time Synchronization** between map display and aircraft table
- ✅ **Professional Styling** with aviation-themed dark interface
- ✅ **Enhanced Performance** with optimized data handling and smooth animations

- **Advanced interactive radar display** with draggable toolbar, multi-layer maps, and aircraft table
- **Professional aviation controls** with zoom, centering, fullscreen, and layer management
- **Real-time aircraft tracking** with synchronized table view and map highlighting
- **IVAO-compatible data feeds** for integration with flight tracking tools
- **In-memory data storage** using APCu for fast performance
- **Mobile-responsive design** with touch-friendly controls

## ✈️ Features

### Enhanced Radar Display (`radar.php`)
- **Draggable Toolbar** with professional aviation controls:
  - Zoom In/Out buttons with smooth animation
  - Home button (auto-fit all aircraft)
  - Center button (focus on aircraft)
  - Fullscreen toggle for immersive viewing
  - Map layer cycling through 6 different views
  - Aircraft list toggle with synchronized table
  - Grid toggle for coordinate reference
  - Smooth movement toggle for realistic aircraft motion
- **Multi-Layer Map Support**:
  - OpenStreetMap (default)
  - Satellite imagery
  - Dark mode for night operations
  - Aviation chart overlay
  - Topographic terrain view
  - No map (aircraft only)
- **Professional Measurement Tools**:
  - **Distance/Bearing Measurement**: Right-click and drag to measure distances in nautical miles and true bearing angles
  - **Range Ring Tool**: Shift+right-click and drag to create circular range indicators with radius labels
  - **Real-time Updates**: Both tools update measurements dynamically as you drag
  - **Aviation Units**: All measurements in standard aviation format (NM, degrees)
  - **Auto-cleanup**: Tools disappear when mouse button is released
- **Smooth Aircraft Movement**:
  - **Physics-based Animation**: Aircraft move realistically based on heading and groundspeed
  - **Label Synchronization**: Aircraft labels and connecting lines follow smoothly
  - **Toggle Control**: Enable/disable with toolbar button or 'S' keyboard shortcut
  - **Performance Optimized**: Efficient updates only when aircraft positions change
- **Aircraft Tracking & Following**:
  - **URL Parameter Support**: Link directly to track specific aircraft (`radar.php?callsign=ABC123`)
  - **Visual Highlighting**: Tracked aircraft glow orange with pulsing animation
  - **Continuous Following**: Map automatically centers on tracked aircraft
  - **Status Banner**: Live indicator showing tracking status and aircraft availability
  - **Easy Controls**: Click X to stop tracking or use normal radar controls
- **Interactive Aircraft Table**:
  - Draggable and scrollable aircraft list
  - Real-time sync with map (5-second updates)
  - Click-to-focus on aircraft with smooth zoom
  - **Track Aircraft Icon**: One-click tracking via crosshairs icon for each aircraft
  - Displays track icon, callsign, pilot name, aircraft type, altitude, and speed
  - Responsive design for mobile devices
- **Advanced Map Features**:
  - Live aircraft tracking with heading indicators
  - Draggable aircraft labels with persistent positioning
  - Auto-fit view to show all aircraft on page load
  - Zoom-based label visibility (appears at zoom level 6+)
  - Smooth animations and marker highlighting
  - Coordinate grid overlay with aviation-standard formatting

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
| `test_aircraft.php` | HTML | Test aircraft generator |
| `ivao.php` | Text | IVAO-compatible feed |
| `apcu_manager.php` | HTML | Cache administration |

### Sending Data
```bash
curl -X POST https://yourserver.com/transmit.php \
  -d "Callsign=N123AB&PilotName=John+Pilot&Latitude=40.7128&Longitude=-74.0060&..."
```

### Test Aircraft Generator
The `test_aircraft.php` page provides a user-friendly interface to generate realistic test aircraft data:

- **Configurable aircraft count** (1-50 aircraft)
- **Geographic positioning** around a specified center point
- **Realistic data generation**:
  - Authentic airline and general aviation callsigns
  - Diverse pilot names from common name databases
  - 25 different aircraft types with appropriate performance characteristics
  - Realistic altitude ranges and airspeeds based on aircraft type
  - Random headings and positions within specified radius

**Usage**: Navigate to `test_aircraft.php`, configure parameters, and click "Generate Test Aircraft" to populate the radar with test data.

**Troubleshooting**: If test aircraft don't appear on the radar:
1. Use the debug tool (`debug_aircraft.php`) to test single aircraft submission
2. Check the browser console for error messages  
3. Verify the APCu cache status in `apcu_manager.php`
4. Check that `radar_data.php` returns the expected JSON data

## 🎮 Radar Controls & Usage

### Toolbar Controls
The draggable toolbar provides quick access to all radar functions:

| Button | Function | Keyboard |
|--------|----------|----------|
| 🔍+ | Zoom In | `+` or `=` |
| 🔍- | Zoom Out | `-` |
| 🏠 | Home (Auto-fit all aircraft) | `H` |
| 🎯 | Center on Aircraft | `C` |
| 📋 | Toggle Aircraft List | `A` |
| ⚏ | Toggle Coordinate Grid | `G` |
| 🏃 | Toggle Smooth Movement | `S` |
| 🗺️ | Cycle Map Layers | `L` |
| ⛶ | Toggle Fullscreen | `Shift+F` |

### Measurement Tools
Professional aviation measurement tools for distance and range calculations:

| Tool | Activation | Function |
|------|-----------|----------|
| **Distance/Bearing** | Right-click + Drag | Measures distance in nautical miles and true bearing in degrees |
| **Range Ring** | Shift + Right-click + Drag | Creates circular range indicator with radius in nautical miles |

**Usage Tips:**
- Both tools provide real-time updates as you drag
- Measurements use standard aviation units (NM, degrees)
- Tools automatically disappear when you release the mouse button
- Perfect for flight planning, range calculations, and navigation

### Aircraft Tracking
Follow specific aircraft automatically using URL parameters:

**Syntax:** `radar.php?callsign=AIRCRAFT_CALLSIGN`

**Examples:**
- `radar.php?callsign=N123AB` - Track aircraft N123AB
- `radar.php?callsign=AAL123` - Track airline flight AAL123
- `radar.php?callsign=MYSIM` - Track aircraft with callsign MYSIM

**Features:**
- **Visual Highlighting**: Tracked aircraft glow orange with pulsing animation
- **Auto-centering**: Map continuously follows the tracked aircraft
- **Status Banner**: Shows tracking status and aircraft availability
- **Easy Exit**: Click the X button in the banner to stop tracking

### Smooth Movement
Realistic aircraft animation based on actual flight data:

**Toggle Methods:**
- Click the 🏃 button in toolbar
- Press `S` key

**Features:**
- **Physics-based**: Aircraft move according to their actual heading and groundspeed
- **Label Sync**: Aircraft labels and connecting lines move smoothly with aircraft
- **Performance**: Optimized to update only when aircraft actually move
- **Visual State**: Button illuminates when smooth movement is active

### Map Layers
Cycle through different map views with the layers button (`L` key):
1. **OpenStreetMap** - Standard street and terrain view
2. **Satellite** - High-resolution satellite imagery  
3. **Dark Mode** - Professional dark theme for night operations
4. **Aviation Chart** - Aeronautical navigation charts
5. **Topographic** - Detailed topographic terrain view
6. **No Map** - Aircraft-only view with transparent background

### Aircraft Table
- **Toggle**: Click the 📋 button or press `A` key
- **Drag**: Click and drag the table header to reposition
- **Scroll**: Use mouse wheel or scroll bars for long aircraft lists
- **Click to Focus**: Click any aircraft row to zoom and center on that aircraft
- **Track Aircraft**: Click the crosshairs icon (🎯) next to any aircraft to start tracking it
- **Real-time Updates**: Table refreshes every 5 seconds with map data
- **Columns**: Track Icon, Callsign, Pilot Name, Aircraft Type, Altitude (ft), Speed (kts)

### Coordinate Grid
- **Toggle**: Click the ⚏ button or press `G` key
- **Aviation Format**: Shows latitude/longitude in degrees and minutes
- **Zoom Adaptive**: Grid spacing automatically adjusts based on zoom level
- **Professional Display**: Uses standard aviation coordinate formatting

### Navigation Tips
- **Auto-positioning**: Map automatically centers on all aircraft at startup
- **Smooth Zoom**: All zoom operations use smooth animations
- **Touch Support**: All controls work on mobile devices and tablets
- **Persistent Settings**: Toolbar position and table state remembered during session
- **Responsive Design**: Interface adapts to different screen sizes
- **Label Dragging**: Drag aircraft labels to custom positions (position is remembered)

### For Pilots
1. Configure your flight sim addon to send data to `transmit.php`
2. Send updates every 5-30 seconds for smooth tracking
3. Your aircraft appears automatically on radar with your callsign
4. Aircraft data updates in real-time in both map and table views
5. Share direct tracking links: `radar.php?callsign=YOUR_CALLSIGN`

### For Air Traffic Controllers
1. Use measurement tools for separation and navigation guidance
2. Track specific aircraft using URL parameters
3. Enable smooth movement for realistic aircraft behavior
4. Use coordinate grid for precise position references
5. Multiple map layers provide optimal situational awareness

### For Developers
- Use JSON endpoints for custom integrations
- IVAO whazzup format for compatibility with existing tools
- Real-time updates with 5-second refresh intervals
- Test aircraft generator for development and demonstration
- Debug mode available with `?debug=1` parameter

## ⚙️ Configuration & Customization

### Performance Settings
```php
// In transmit.php
define('POSITION_TTL', 1800);     // 30 minutes data retention
$updateInterval = 5000;           // 5 second refresh rate
$aircraftTimeout = 60;            // Remove after 60 seconds offline
```

### Radar Display Options
```javascript
// In radar.js
this.defaultPixelOffset = [60, 80];  // Aircraft label positioning
const showLabels = zoom >= 6;        // Label visibility threshold
maxZoom: 10                          // Auto-fit zoom limit
const updateInterval = 5000;         // Map refresh rate (5 seconds)
```

### Map Layer Configuration
The radar supports multiple tile providers. To add custom layers:
```javascript
// In radar.js mapLayers array
{
    name: "Custom Layer",
    url: "https://your-tile-server/{z}/{x}/{y}.png",
    attribution: "© Your Attribution"
}
```

### Toolbar Customization
```css
/* In radar.php CSS section */
.radar-toolbar {
    background: rgba(0, 0, 0, 0.8);  /* Toolbar transparency */
    border-radius: 10px;             /* Corner rounding */
    padding: 10px;                   /* Internal spacing */
}
```

### Aircraft Table Settings
```css
/* Customize table appearance */
.aircraft-table {
    max-height: 300px;               /* Table height limit */
    width: 400px;                    /* Table width */
    background: rgba(0, 0, 0, 0.9);  /* Background transparency */
}
```

## 🔧 Troubleshooting

### Common Issues

**APCu not available**
- Install APCu extension and restart web server
- Check `phpinfo()` for extension status
- Ensure `apc.enabled=1` in php.ini

**No aircraft showing on radar**
- Verify APCu is working via `apcu_manager.php`
- Check aircraft are sending data within 60-second timeout
- Confirm data format matches expected structure
- Check browser console for JavaScript errors

**Toolbar or aircraft table not working**
- Ensure JavaScript is enabled in browser
- Check browser console for errors
- Verify all CSS and JS files are loading correctly
- Test on different browsers (Chrome, Firefox, Safari, Edge supported)

**Map layers not switching**
- Check network connectivity to tile providers
- Verify external tile services are accessible
- Check browser console for tile loading errors
- Some layers may be unavailable in certain regions

**Aircraft table data misaligned**
- Verify data field names match backend (lowercase: callsign, pilot_name, etc.)
- Check `radar_data.php` JSON output format
- Ensure aircraft data includes all required fields

**Performance issues with many aircraft**
- Increase APCu memory allocation in `php.ini`
- Monitor cache usage in APCu manager
- Consider increasing refresh interval for large numbers of aircraft
- Check server resources during peak usage

**Mobile/touch interface problems**
- Ensure viewport meta tag is present in HTML
- Verify touch events are properly handled
- Test on actual mobile devices, not just desktop browser dev tools
- Check CSS media queries for mobile responsiveness

### Browser Compatibility
- **Recommended**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Required Features**: ES6 support, CSS Grid, Flexbox, Touch Events
- **Mobile**: iOS Safari 12+, Chrome Mobile 70+, Samsung Internet 10+

### Network Requirements
- **Outbound HTTPS**: Required for satellite/terrain tile providers
- **WebSocket Support**: Not required (uses standard HTTP polling)
- **CORS**: Configured for cross-origin requests if needed

### Debug Mode
Add `?debug=1` to radar.php URL to enable debug logging:
```
https://yourserver.com/radar.php?debug=1
```
This will log toolbar actions, map layer changes, and aircraft table updates to browser console.

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

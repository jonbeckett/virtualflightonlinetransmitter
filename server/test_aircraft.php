<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aircraft Test Data Generator - Virtual Flight Online</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            text-align: center;
            color: #fff;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #e0e0e0;
        }
        
        input, select, button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            box-sizing: border-box;
        }
        
        button {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        button:hover {
            background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .danger {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }
        
        .danger:hover {
            background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
        }
        
        .status {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
        
        .success {
            background: rgba(76, 175, 80, 0.8);
            border: 2px solid #4CAF50;
        }
        
        .error {
            background: rgba(244, 67, 54, 0.8);
            border: 2px solid #f44336;
        }
        
        .info {
            background: rgba(33, 150, 243, 0.8);
            border: 2px solid #2196F3;
        }
        
        .aircraft-preview {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .aircraft-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            padding: 10px;
            margin: 5px 0;
            font-family: monospace;
            font-size: 14px;
        }
        
        .controls {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .controls {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 20px;
                margin: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✈️ Aircraft Test Data Generator</h1>
        
        <form id="aircraftForm">
            <div class="form-group">
                <label for="numAircraft">Number of Aircraft (1-50):</label>
                <input type="number" id="numAircraft" name="numAircraft" min="1" max="50" value="5" required>
            </div>
            
            <div class="form-group">
                <label for="centerLat">Center Latitude:</label>
                <input type="number" id="centerLat" name="centerLat" step="0.000001" value="40.7128" required>
            </div>
            
            <div class="form-group">
                <label for="centerLon">Center Longitude:</label>
                <input type="number" id="centerLon" name="centerLon" step="0.000001" value="-74.0060" required>
            </div>
            
            <div class="form-group">
                <label for="radius">Spread Radius (nautical miles):</label>
                <input type="number" id="radius" name="radius" min="1" max="500" value="50" required>
            </div>
            
            <div class="form-group">
                <label for="minAltitude">Minimum Altitude (feet):</label>
                <input type="number" id="minAltitude" name="minAltitude" min="0" max="50000" value="1000" step="100" required>
            </div>
            
            <div class="form-group">
                <label for="maxAltitude">Maximum Altitude (feet):</label>
                <input type="number" id="maxAltitude" name="maxAltitude" min="1000" max="50000" value="40000" step="100" required>
            </div>
            
            <div class="controls">
                <button type="button" onclick="generateAircraft()">Generate Test Aircraft</button>
                <button type="button" onclick="clearAircraft()" class="danger">Clear All Aircraft</button>
            </div>
        </form>
        
        <div id="status"></div>
        <div id="preview" class="aircraft-preview" style="display: none;"></div>
    </div>

    <script>
        // Aircraft types with realistic performance characteristics
        const aircraftTypes = [
            'Boeing 737-800', 'Airbus A320', 'Boeing 777-300ER', 'Airbus A330-300',
            'Boeing 747-8F', 'Airbus A380', 'Boeing 787-9', 'Embraer E175',
            'Bombardier CRJ-900', 'ATR 72-600', 'Cessna 172', 'Piper PA-28',
            'Beechcraft King Air 350', 'Gulfstream G650', 'Learjet 75',
            'Boeing 767-300ER', 'Airbus A350-900', 'McDonnell Douglas MD-80',
            'Fokker 50', 'Saab 340', 'De Havilland Dash 8', 'Cessna Citation X',
            'Hawker 800XP', 'Pilatus PC-12', 'TBM 930'
        ];
        
        // Realistic airline callsigns and general aviation patterns
        const callsignPrefixes = [
            'AAL', 'DAL', 'UAL', 'SWA', 'JBU', 'ASA', 'SKW', 'FFT', 'RPA', 'ENY',
            'BAW', 'AFR', 'DLH', 'KLM', 'SAS', 'ACA', 'JZA', 'QFA', 'EZY', 'RYR',
            'N', 'G-', 'D-', 'F-', 'OE-', 'PH-', 'SE-', 'LN-', 'VH-', 'JA-'
        ];
        
        // First and last names for pilots
        const firstNames = [
            'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph',
            'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
            'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian',
            'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan',
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
            'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra',
            'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly',
            'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen'
        ];
        
        const lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
            'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
            'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
            'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans'
        ];
        
        function randomChoice(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        
        function randomBetween(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        function generateCallsign() {
            const prefix = randomChoice(callsignPrefixes);
            if (prefix.length === 1 || prefix.endsWith('-')) {
                // General aviation registration
                const numbers = Math.floor(Math.random() * 999) + 1;
                const suffix = prefix === 'N' ? 
                    String(numbers).padStart(3, '0') + randomChoice(['', 'A', 'B', 'C', 'X', 'Y', 'Z']) :
                    randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G']) + randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G']) + randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
                return prefix + suffix;
            } else {
                // Airline callsign
                const flightNumber = Math.floor(Math.random() * 9999) + 1;
                return prefix + flightNumber;
            }
        }
        
        function generatePilotName() {
            return randomChoice(firstNames) + ' ' + randomChoice(lastNames);
        }
        
        function generatePosition(centerLat, centerLon, radiusNM) {
            // Convert nautical miles to degrees (approximate)
            const radiusDeg = radiusNM / 60;
            
            // Generate random point within circle
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.sqrt(Math.random()) * radiusDeg;
            
            const lat = centerLat + distance * Math.cos(angle);
            const lon = centerLon + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);
            
            return {
                latitude: parseFloat(lat.toFixed(6)),
                longitude: parseFloat(lon.toFixed(6))
            };
        }
        
        function generateAirspeed(aircraftType) {
            // Realistic airspeeds based on aircraft type
            if (aircraftType.includes('747') || aircraftType.includes('777') || aircraftType.includes('787') || aircraftType.includes('A380') || aircraftType.includes('A350')) {
                return Math.floor(randomBetween(450, 550));
            } else if (aircraftType.includes('737') || aircraftType.includes('A320') || aircraftType.includes('A330')) {
                return Math.floor(randomBetween(400, 500));
            } else if (aircraftType.includes('Embraer') || aircraftType.includes('CRJ') || aircraftType.includes('ATR') || aircraftType.includes('Dash')) {
                return Math.floor(randomBetween(250, 350));
            } else if (aircraftType.includes('Cessna 172') || aircraftType.includes('Piper')) {
                return Math.floor(randomBetween(90, 140));
            } else {
                return Math.floor(randomBetween(200, 400));
            }
        }
        
        function generateGroundspeed(airspeed) {
            // Add some wind variation
            const windEffect = randomBetween(-30, 30);
            return Math.max(0, airspeed + windEffect);
        }
        
        async function generateAircraft() {
            const form = document.getElementById('aircraftForm');
            const formData = new FormData(form);
            
            const numAircraft = parseInt(formData.get('numAircraft'));
            const centerLat = parseFloat(formData.get('centerLat'));
            const centerLon = parseFloat(formData.get('centerLon'));
            const radius = parseInt(formData.get('radius'));
            const minAlt = parseInt(formData.get('minAltitude'));
            const maxAlt = parseInt(formData.get('maxAltitude'));
            
            if (minAlt >= maxAlt) {
                showStatus('error', 'Minimum altitude must be less than maximum altitude');
                return;
            }
            
            showStatus('info', `Generating ${numAircraft} test aircraft...`);
            
            const aircraft = [];
            const generatedCallsigns = new Set();
            
            for (let i = 0; i < numAircraft; i++) {
                let callsign;
                do {
                    callsign = generateCallsign();
                } while (generatedCallsigns.has(callsign));
                generatedCallsigns.add(callsign);
                
                const position = generatePosition(centerLat, centerLon, radius);
                const aircraftType = randomChoice(aircraftTypes);
                const altitude = Math.floor(randomBetween(minAlt, maxAlt) / 100) * 100; // Round to nearest 100ft
                const heading = Math.floor(Math.random() * 360);
                const airspeed = generateAirspeed(aircraftType);
                const groundspeed = generateGroundspeed(airspeed);
                
                const aircraftData = {
                    Callsign: callsign,
                    PilotName: generatePilotName(),
                    GroupName: 'Test Flight',
                    AircraftType: aircraftType,
                    Latitude: position.latitude,
                    Longitude: position.longitude,
                    Altitude: altitude,
                    Heading: heading,
                    Airspeed: airspeed,
                    Groundspeed: groundspeed,
                    Notes: 'Generated test aircraft',
                    MSFSServer: 'Test Server',
                    Version: '2.0.0.test'
                };
                
                aircraft.push(aircraftData);
            }
            
            // Show preview
            showPreview(aircraft);
            
            // Send to server
            let successCount = 0;
            let errorCount = 0;
            
            for (const aircraftData of aircraft) {
                try {
                    const response = await fetch('transmit.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams(aircraftData)
                    });
                    
                    const responseText = await response.text();
                    console.log(`Response for ${aircraftData.Callsign}:`, responseText);
                    
                    if (response.ok && responseText.includes('updated')) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error(`Failed to send ${aircraftData.Callsign}:`, response.status, responseText);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`Error sending ${aircraftData.Callsign}:`, error);
                }
            }
            
            if (errorCount === 0) {
                showStatus('success', `Successfully generated and transmitted ${successCount} test aircraft! Check the radar display.`);
                // Auto-check radar data after successful generation
                setTimeout(() => {
                    window.open('radar.php', '_blank');
                }, 2000);
            } else {
                showStatus('error', `Generated ${successCount} aircraft successfully, ${errorCount} failed. Check console for details.`);
            }
            
            // Add debug link
            document.getElementById('preview').innerHTML += `
                <div style="margin-top: 15px; text-align: center;">
                    <a href="debug_aircraft.php" target="_blank" style="color: #4CAF50; text-decoration: underline;">
                        🔍 Open Debug Tool
                    </a> | 
                    <a href="radar_data.php" target="_blank" style="color: #4CAF50; text-decoration: underline;">
                        📡 View Raw Data
                    </a> | 
                    <a href="apcu_manager.php" target="_blank" style="color: #4CAF50; text-decoration: underline;">
                        🗄️ Check Cache
                    </a>
                </div>
            `;
        }
        
        async function clearAircraft() {
            if (!confirm('Are you sure you want to clear all aircraft data from the cache?')) {
                return;
            }
            
            showStatus('info', 'Clearing all aircraft data...');
            
            try {
                const response = await fetch('apcu_manager.php?action=clear_aircraft', {
                    method: 'POST'
                });
                
                if (response.ok) {
                    showStatus('success', 'All aircraft data cleared successfully!');
                    document.getElementById('preview').style.display = 'none';
                } else {
                    showStatus('error', 'Failed to clear aircraft data. Check that apcu_manager.php supports clear_aircraft action.');
                }
            } catch (error) {
                showStatus('error', 'Error clearing aircraft data: ' + error.message);
            }
        }
        
        function showStatus(type, message) {
            const statusDiv = document.getElementById('status');
            statusDiv.className = `status ${type}`;
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';
            
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 5000);
            }
        }
        
        function showPreview(aircraft) {
            const previewDiv = document.getElementById('preview');
            previewDiv.innerHTML = '<h3>Generated Aircraft Preview:</h3>';
            
            aircraft.forEach(ac => {
                const item = document.createElement('div');
                item.className = 'aircraft-item';
                item.innerHTML = `
                    <strong>${ac.Callsign}</strong> - ${ac.PilotName}<br>
                    ${ac.AircraftType} | ${ac.Altitude}ft | ${ac.Airspeed}kts | HDG ${ac.Heading}°<br>
                    ${ac.Latitude}, ${ac.Longitude}
                `;
                previewDiv.appendChild(item);
            });
            
            previewDiv.style.display = 'block';
        }
        
        // Validate form inputs
        document.getElementById('minAltitude').addEventListener('change', function() {
            const maxAlt = document.getElementById('maxAltitude');
            if (parseInt(this.value) >= parseInt(maxAlt.value)) {
                maxAlt.value = parseInt(this.value) + 1000;
            }
        });
        
        document.getElementById('maxAltitude').addEventListener('change', function() {
            const minAlt = document.getElementById('minAltitude');
            if (parseInt(this.value) <= parseInt(minAlt.value)) {
                minAlt.value = parseInt(this.value) - 1000;
            }
        });
    </script>
</body>
</html>

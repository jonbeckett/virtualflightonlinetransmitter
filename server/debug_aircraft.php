<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Aircraft Debug</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .debug { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
        button { padding: 10px 20px; margin: 5px; }
        pre { background: #f8f8f8; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Aircraft Data Debug Tool</h1>
    
    <button onclick="testSingleAircraft()">Test Single Aircraft</button>
    <button onclick="checkRadarData()">Check Radar Data</button>
    <button onclick="checkCache()">Check APCu Cache</button>
    
    <div id="results"></div>

    <script>
        async function testSingleAircraft() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="debug">Testing single aircraft submission...</div>';
            
            const testData = {
                Callsign: 'TEST123',
                PilotName: 'Test Pilot',
                GroupName: 'Test Group',
                AircraftType: 'Boeing 737-800',
                Latitude: 40.7128,
                Longitude: -74.0060,
                Altitude: 35000,
                Heading: 90,
                Airspeed: 450,
                Groundspeed: 460,
                Notes: 'Test aircraft',
                MSFSServer: 'Test Server',
                Version: '2.0.0.test',
                debug: '1'
            };
            
            try {
                const response = await fetch('transmit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(testData)
                });
                
                const responseText = await response.text();
                results.innerHTML += `<div class="debug">
                    <strong>Response Status:</strong> ${response.status}<br>
                    <strong>Response Text:</strong> ${responseText}<br>
                    <strong>Success:</strong> ${responseText.includes('updated') ? 'YES' : 'NO'}
                </div>`;
                
                console.log('Test aircraft response:', responseText);
                
                // Now check if it appears in radar data
                setTimeout(checkRadarData, 1000);
                
            } catch (error) {
                results.innerHTML += `<div class="debug" style="color: red;">
                    <strong>Error:</strong> ${error.message}
                </div>`;
                console.error('Error:', error);
            }
        }
        
        async function checkRadarData() {
            const results = document.getElementById('results');
            results.innerHTML += '<div class="debug">Checking radar data...</div>';
            
            try {
                const response = await fetch('radar_data.php');
                const data = await response.json();
                
                results.innerHTML += `<div class="debug">
                    <strong>Radar Data Response:</strong><br>
                    <strong>Aircraft Count:</strong> ${data.length}<br>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>`;
                
            } catch (error) {
                results.innerHTML += `<div class="debug" style="color: red;">
                    <strong>Radar Data Error:</strong> ${error.message}
                </div>`;
            }
        }
        
        async function checkCache() {
            const results = document.getElementById('results');
            results.innerHTML += '<div class="debug">Opening APCu Manager in new tab...</div>';
            window.open('apcu_manager.php', '_blank');
        }
    </script>
</body>
</html>

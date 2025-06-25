<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// APCu configuration
define('APCU_PREFIX', 'vfo_');

// Check if APCu is available
if (!extension_loaded('apcu') || !apcu_enabled()) {
    http_response_code(500);
    echo json_encode(['error' => 'APCu extension not available or not enabled']);
    exit;
}

// Function to get all aircraft positions from APCu
function get_all_aircraft_positions() {
    $aircraft_data = [];
    $info = apcu_cache_info();
    
    if (isset($info['cache_list'])) {
        foreach ($info['cache_list'] as $entry) {
            $key = $entry['info'];
            
            // Look for position keys
            if (strpos($key, APCU_PREFIX . 'position_') === 0) {
                $aircraft = apcu_fetch($key);
                if ($aircraft !== false) {
                    // Calculate time online and last update
                    $time_online = gmdate('H:i:s', time() - ($aircraft['created'] ?? time()));
                    $seconds_since_last_update = time() - ($aircraft['modified'] ?? time());
                    
                    // Only include aircraft updated in the last 1 minute
                    if ($seconds_since_last_update <= 60) {
                        $aircraft_entry = [
                            'callsign' => $aircraft['Callsign'] ?? '',
                            'pilot_name' => $aircraft['PilotName'] ?? '',
                            'group_name' => $aircraft['GroupName'] ?? '',
                            'msfs_server' => $aircraft['Server'] ?? '',
                            'aircraft_type' => $aircraft['AircraftType'] ?? '',
                            'version' => $aircraft['Version'] ?? '',
                            'notes' => $aircraft['Notes'] ?? '',
                            'longitude' => (float)($aircraft['Longitude'] ?? 0),
                            'latitude' => (float)($aircraft['Latitude'] ?? 0),
                            'altitude' => (float)($aircraft['Altitude'] ?? 0),
                            'heading' => (float)($aircraft['Heading'] ?? 0),
                            'airspeed' => (float)($aircraft['Airspeed'] ?? 0),
                            'groundspeed' => (float)($aircraft['Groundspeed'] ?? 0),
                            'touchdown_velocity' => (float)($aircraft['TouchdownVelocity'] ?? 0) * 60,
                            'time_online' => $time_online,
                            'seconds_since_last_update' => $seconds_since_last_update,
                            'modified' => date('Y-m-d H:i:s', $aircraft['modified'] ?? time())
                        ];
                        
                        $aircraft_data[] = $aircraft_entry;
                    }
                }
            }
        }
    }
    
    // Sort by most recently updated
    usort($aircraft_data, function($a, $b) {
        return $a['seconds_since_last_update'] - $b['seconds_since_last_update'];
    });
    
    return $aircraft_data;
}

// Main execution
try {
    $aircraft_data = get_all_aircraft_positions();
    
    // Add cache info header
    header('X-Cache-Info: APCu only (no database)');
    
    echo json_encode($aircraft_data, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

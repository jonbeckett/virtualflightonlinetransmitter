<?php
ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  
error_reporting(E_ALL);  

// Server pin for authentication (set this to secure your endpoint)
$server_pin = ""; // Leave empty to disable pin authentication

// APCu configuration
define('APCU_PREFIX', 'vfo_');
define('POSITION_TTL', 1800); // 30 minutes TTL for position data

// Check if APCu is available
if (!extension_loaded('apcu') || !apcu_enabled()) {
    http_response_code(500);
    print "APCu extension not available or not enabled";
    exit;
}

// Function to store aircraft position in APCu
function store_aircraft_position($callsign, $aircraft_data) {
    $position_key = APCU_PREFIX . 'position_' . $callsign;
    $history_key = APCU_PREFIX . 'history_' . $callsign;
    $current_time = time();
    
    // Get existing history
    $history = apcu_fetch($history_key);
    if ($history === false) {
        $history = [];
    }
    
    // Clean up old history entries (older than 30 seconds - keeps up to 6 positions at 5s intervals)
    $history = array_filter($history, function($entry) use ($current_time) {
        return ($current_time - $entry['timestamp']) <= 30;
    });
    
    // Only add to history if enough time has passed (minimum 5 seconds between entries)
    $should_add_to_history = true;
    if (!empty($history)) {
        $last_entry = end($history);
        $time_since_last = $current_time - $last_entry['timestamp'];
        $should_add_to_history = $time_since_last >= 5; // 5-second intervals
    }
    
    if ($should_add_to_history) {
        // Add current position to history
        $history[] = [
            'Latitude' => $aircraft_data['Latitude'],
            'Longitude' => $aircraft_data['Longitude'],
            'Altitude' => $aircraft_data['Altitude'],
            'Heading' => $aircraft_data['Heading'],
            'timestamp' => $current_time
        ];
        
        // Keep last 6 positions for historical data
        if (count($history) > 6) {
            $history = array_slice($history, -6);
        }
        
        // Store updated history
        apcu_store($history_key, $history, POSITION_TTL);
    }
    
    // Store current position
    apcu_store($position_key, $aircraft_data, POSITION_TTL);
    
    // Store history
    apcu_store($history_key, $history, POSITION_TTL);
    
    return true;
}

// Function to get rate limit key
function get_rate_limit_key($callsign, $ip) {
    return APCU_PREFIX . 'rate_' . $callsign . '_' . str_replace('.', '_', $ip);
}

// Function to check rate limiting (1 second minimum between updates)
function is_rate_limited($callsign, $ip) {
    $rate_key = get_rate_limit_key($callsign, $ip);
    $last_update = apcu_fetch($rate_key);
    
    if ($last_update !== false && (time() - $last_update) < 1) {
        return true;
    }
    
    // Update rate limit timestamp
    apcu_store($rate_key, time(), 10); // 10 second TTL for rate limit
    return false;
}

// get the data from the request (which may not be populated)
$user_pin           = isset($_GET["Pin"])               ? $_GET["Pin"]               : "";
$callsign           = isset($_GET["Callsign"])          ? $_GET["Callsign"]          : "";
$aircraft_type      = isset($_GET["AircraftType"])      ? $_GET["AircraftType"]      : "";
$pilot_name         = isset($_GET["PilotName"])         ? $_GET["PilotName"]         : "";
$group_name         = isset($_GET["GroupName"])         ? $_GET["GroupName"]         : "";
$msfs_server        = isset($_GET["MSFSServer"])        ? $_GET["MSFSServer"]        : "";
$latitude           = isset($_GET["Latitude"])          ? $_GET["Latitude"]          : "0";
$longitude          = isset($_GET["Longitude"])         ? $_GET["Longitude"]         : "0";
$altitude           = isset($_GET["Altitude"])          ? $_GET["Altitude"]          : "0";
$heading            = isset($_GET["Heading"])           ? $_GET["Heading"]           : "0";
$airspeed           = isset($_GET["Airspeed"])          ? $_GET["Airspeed"]          : "0";
$groundspeed        = isset($_GET["Groundspeed"])       ? $_GET["Groundspeed"]       : "0";
$touchdown_velocity = isset($_GET["TouchdownVelocity"]) ? $_GET["TouchdownVelocity"] : "0";
$notes              = isset($_GET["Notes"])             ? $_GET["Notes"]             : "";
$server             = isset($_GET["MSFSServer"])        ? $_GET["MSFSServer"]        : "";
$version            = isset($_GET["Version"])           ? $_GET["Version"]           : "1.0.0.n";

// if the server pin is used, the user pin must match the server pin
if (($server_pin != "") ? (trim($user_pin) == trim($server_pin)) : true) {

    // default groundspeed to airspeed if it is not supplied
    if ($groundspeed == "0") $groundspeed = $airspeed;

    // check we have everything we need to store the data
    if (empty($callsign) || empty($aircraft_type) || empty($pilot_name) || empty($group_name)) {
        print "Insufficient data received";	
    } else {

        // Check rate limiting
        if (is_rate_limited($callsign, $_SERVER['REMOTE_ADDR'])) {
            print "rate limited";
        } else {

            // Clean up the data (only allow alphanumeric characters, spaces and hyphens)
            $callsign      = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($callsign));
            $pilot_name    = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($pilot_name));
            $group_name    = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($group_name));
            $server        = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($server));
            $aircraft_type = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($aircraft_type));
            $notes         = preg_replace('/[^A-Za-z0-9.,\n -]/', '', strip_tags($notes));

            // Prepare aircraft data
            $aircraft_data = [
                'Callsign' => $callsign,
                'AircraftType' => $aircraft_type,
                'PilotName' => $pilot_name,
                'GroupName' => $group_name,
                'Latitude' => (float)$latitude,
                'Longitude' => (float)$longitude,
                'Altitude' => (float)$altitude,
                'Heading' => (float)$heading,
                'Airspeed' => (float)$airspeed,
                'Groundspeed' => (float)$groundspeed,
                'TouchdownVelocity' => (float)$touchdown_velocity,
                'Notes' => $notes,
                'Server' => $server,
                'Version' => $version,
                'IPAddress' => $_SERVER['REMOTE_ADDR'],
                'timestamp' => time()
            ];

            // Check if aircraft already exists and update created time
            $position_key = APCU_PREFIX . 'position_' . $callsign;
            $existing = apcu_fetch($position_key);
            if ($existing !== false) {
                $aircraft_data['created'] = $existing['created'] ?? time(); // Keep original created time or set new
            } else {
                $aircraft_data['created'] = time(); // New aircraft
            }
            $aircraft_data['modified'] = time();

            // Store aircraft position in APCu
            if (store_aircraft_position($callsign, $aircraft_data)) {
                print "updated";
            } else {
                print "error storing data";
            }
        }
    }
} else {
    print "invalid pin";
}

?>

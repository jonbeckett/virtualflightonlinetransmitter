<?php
ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  
error_reporting(E_ALL);  

// Server pin for authentication (set this to secure your endpoint)
$server_pin = ""; // Leave empty to disable pin authentication

// Debug mode
$debug = isset($_REQUEST['debug']) ? true : false;

if ($debug) {
    error_log("DEBUG: Received request data: " . print_r($_REQUEST, true));
}

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
    
    // Store current position
    return apcu_store($position_key, $aircraft_data, POSITION_TTL);
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

// Get the data from the request (support both GET and POST)
$user_pin           = $_REQUEST["Pin"] ?? "";
$callsign           = $_REQUEST["Callsign"] ?? "";
$aircraft_type      = $_REQUEST["AircraftType"] ?? "";
$pilot_name         = $_REQUEST["PilotName"] ?? "";
$group_name         = $_REQUEST["GroupName"] ?? "";
$msfs_server        = $_REQUEST["MSFSServer"] ?? "";
$latitude           = $_REQUEST["Latitude"] ?? "0";
$longitude          = $_REQUEST["Longitude"] ?? "0";
$altitude           = $_REQUEST["Altitude"] ?? "0";
$heading            = $_REQUEST["Heading"] ?? "0";
$airspeed           = $_REQUEST["Airspeed"] ?? "0";
$groundspeed        = $_REQUEST["Groundspeed"] ?? "0";
$touchdown_velocity = $_REQUEST["TouchdownVelocity"] ?? "0";
$notes              = $_REQUEST["Notes"] ?? "";
$version            = $_REQUEST["Version"] ?? "1.0.0.n";

// If the server pin is used, the user pin must match the server pin
if (empty($server_pin) || trim($user_pin) === trim($server_pin)) {
    // Default groundspeed to airspeed if it is not supplied
    if ($groundspeed == "0") {
        $groundspeed = $airspeed;
    }

    // Check we have everything we need to store the data
    if (empty($callsign) || empty($aircraft_type) || empty($pilot_name) || empty($group_name)) {
        if ($debug) {
            error_log("DEBUG: Missing required fields - Callsign: '$callsign', AircraftType: '$aircraft_type', PilotName: '$pilot_name', GroupName: '$group_name'");
        }
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
                'Server' => $msfs_server,
                'Version' => $version,
                'IPAddress' => $_SERVER['REMOTE_ADDR'],
                'timestamp' => time()
            ];

            // Check if aircraft already exists and preserve created time
            $position_key = APCU_PREFIX . 'position_' . $callsign;
            $existing = apcu_fetch($position_key);
            if ($existing !== false) {
                $aircraft_data['created'] = $existing['created'] ?? time();
            } else {
                $aircraft_data['created'] = time();
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

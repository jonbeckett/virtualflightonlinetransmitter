<?php
ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  
error_reporting(E_ALL);  

// APCu configuration
define('APCU_PREFIX', 'vfo_');

// Check if APCu is available
if (!extension_loaded('apcu') || !apcu_enabled()) {
    die('APCu extension is not loaded or enabled');
}

// Get all aircraft positions from APCu
function get_all_aircraft_positions() {
    $aircraft_data = [];
    
    // Get all keys with our prefix
    $info = apcu_cache_info();
    if (isset($info['cache_list'])) {
        foreach ($info['cache_list'] as $entry) {
            $key = $entry['info'];
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

// Get aircraft data
$aircraft_data = get_all_aircraft_positions();

// Set content type
//header('Content-Type: text/plain; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Output whazzup format
echo "!GENERAL\r\n";
echo "VERSION = 1\r\n";
echo "RELOAD = 1\r\n";
echo "UPDATE = " . date('YmdHis') . "\r\n";
echo "CONNECTED CLIENTS = " . count($aircraft_data) . "\r\n";
echo "CONNECTED SERVERS = 0\r\n";
echo "!CLIENTS\r\n";
foreach ($aircraft_data as $aircraft) {
    // Format: callsign:cid:realname:clienttype:frequency:latitude:longitude:altitude:groundspeed:planned_aircraft:planned_tascruise:planned_depairport:planned_altitude:planned_destairport:server:protrevision:rating:transponder:facilitytype:visualrange:planned_revision:planned_flighttype:planned_deptime:planned_actdeptime:planned_hrsenroute:planned_minenroute:planned_hrsfuel:planned_minfuel:planned_altairport:planned_remarks:planned_route:planned_depairport_lat:planned_depairport_lon:planned_destairport_lat:planned_destairport_lon:atis_message:time_last_atis_received:time_logon:heading:QNH_iHg:QNH_Mb
    
    print(strip_tags($aircraft['callsign'])
        .":".strip_tags($aircraft['callsign'])
        .":".strip_tags($aircraft['pilot_name'])
        .":PILOT"
        ."::".number_format($aircraft['latitude'],4,".","")
        .":".number_format($aircraft['longitude'],4,".","")
        .":".(int)$aircraft['altitude']
        .":".(int)$aircraft['groundspeed']
        .":".$aircraft['aircraft_type']
        .":::::".$aircraft['msfs_server']
        .":B:6:1234:0:50:0:I:::::::::VFR:::::::"
        .date("YmdHis")
        .":".$aircraft['group_name']
        .":1 :1:1::S:0:"
        .(int)$aircraft['heading']
        .":0:40:\r\n");
}

?>

<?php
header('Access-Control-Allow-Origin: *');

// APCu configuration
define('APCU_PREFIX', 'vfo_');

// Check if APCu is available
if (!extension_loaded('apcu') || !apcu_enabled()) {
    echo json_encode(['error' => 'APCu extension not available or not enabled']);
    exit;
}

function time_ago($timestamp)
{
    $periods = array("second", "minute", "hour", "day", "week", "month", "year", "decade");
    $lengths = array("60","60","24","7","4.35","12","10");
    $now = time();

    if($now > $timestamp) {
        $difference = $now - $timestamp;
        $tense = "ago";
    } else {
        $difference = $timestamp - $now;
        $tense = "from now";
    }
    for($j = 0; $difference >= $lengths[$j] && $j < count($lengths)-1; $j++) {
        $difference /= $lengths[$j];
    }
    $difference = round($difference);
    if($difference != 1) {
        $periods[$j].= "s";
    }
    return "$difference $periods[$j] {$tense}";
}

function DECtoDMS($dec)
{
  // Converts decimal longitude / latitude to DMS
  // ( Degrees / minutes / seconds ) 

  if ($dec<>0){
    $vars = explode(".",$dec);
    $deg = $vars[0];
    $tempma = "0.".$vars[1];

    $tempma = $tempma * 3600;
    $min = floor($tempma / 60);
    $sec = $tempma - ($min*60);

    return array("deg"=>$deg,"min"=>$min,"sec"=>$sec);
  } else {
    return array("deg"=>0,"min"=>0,"sec"=>0);
  }
}    

// Function to get all aircraft data from APCu
function get_who_data() {
    $json_data = [];
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
                        
                        // Format data like original
                        $altitude_formatted = number_format($aircraft['Altitude'] ?? 0, 0, ".", ",");
                        $heading_formatted = number_format($aircraft['Heading'] ?? 0, 0, ".", "");
                        $airspeed_formatted = number_format($aircraft['Airspeed'] ?? 0, 0, ".", ",");
                        $groundspeed_formatted = number_format($aircraft['Groundspeed'] ?? 0, 0, ".", ",");
                        $touchdown_velocity_formatted = number_format(($aircraft['TouchdownVelocity'] ?? 0) * 60, 0, ".", ",");

                        // calculate longitude and latitude formatted for display
                        $lat = DECtoDMS($aircraft['Latitude'] ?? 0);
                        $lon = DECtoDMS($aircraft['Longitude'] ?? 0);
                        $latitude_formatted = htmlspecialchars(abs($lat["deg"])."&deg; ".$lat["min"]."' ".number_format($lat["sec"],2,".","")."\" ".(($aircraft['Latitude'] > 0) ? "N" : "S" ));
                        $longitude_formatted = htmlspecialchars(abs($lon["deg"])."&deg; ".$lon["min"]."' ".number_format($lon["sec"],2,".","")."\" ".(($aircraft['Longitude'] > 0) ? "E" : "W" ));

                        $modified_formatted = date('Y-m-d H:i', $aircraft['modified'] ?? time())." UTC (".time_ago($aircraft['modified'] ?? time()).")";

                        // create aircraft data array
                        $aircraft_data = array(
                            "callsign" => $aircraft['Callsign'] ?? '',
                            "pilot_name" => $aircraft['PilotName'] ?? '',
                            "group_name" => $aircraft['GroupName'] ?? '',
                            "msfs_server" => $aircraft['Server'] ?? '',
                            "aircraft_type" => $aircraft['AircraftType'] ?? '',
                            "version" => $aircraft['Version'] ?? '',
                            "notes" => $aircraft['Notes'] ?? '',
                            "longitude" => $aircraft['Longitude'] ?? 0,
                            "latitude" => $aircraft['Latitude'] ?? 0,
                            "altitude" => $aircraft['Altitude'] ?? 0,
                            "heading" => $aircraft['Heading'] ?? 0,
                            "airspeed" => $aircraft['Airspeed'] ?? 0,
                            "groundspeed" => $aircraft['Groundspeed'] ?? 0,
                            "touchdown_velocity" => ($aircraft['TouchdownVelocity'] ?? 0) * 60,
                            "altitude_formatted" => $altitude_formatted,
                            "heading_formatted" => $heading_formatted,
                            "airspeed_formatted" => $airspeed_formatted,
                            "groundspeed_formatted" => $groundspeed_formatted,
                            "touchdown_velocity_formatted" => $touchdown_velocity_formatted,
                            "latitude_formatted" => $latitude_formatted,
                            "longitude_formatted" => $longitude_formatted,
                            "time_online" => $time_online,
                            "seconds_since_last_update" => $seconds_since_last_update,
                            "modified" => $modified_formatted
                        );
                        
                        $json_data[] = $aircraft_data;
                    }
                }
            }
        }
    }
    
    // Sort by creation time (like original ORDER BY Created ASC)
    usort($json_data, function($a, $b) {
        return strcmp($a['callsign'], $b['callsign']); // Sort by callsign as proxy
    });
    
    return $json_data;
}

// Main execution
ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  
error_reporting(E_ALL);

$json_data = get_who_data();
print(json_encode($json_data));

?>

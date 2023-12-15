<?php


header('Content-Type: application/json; charset=utf-8');

include "config.php";


// Example URL http://178.62.19.142/read.php

ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  
error_reporting(E_ALL);  

$con = mysqli_connect($database_server, $database_username, $database_password, $database_name);

// first delete anything older than 5 minutes ago
$sql = "DELETE FROM Positions"
	." WHERE (Modified < NOW() - INTERVAL 5 MINUTE) OR (ABS(Heading)=0 AND ABS(Groundspeed)=0 AND ABS(Airspeed)=0)";
	
$result = mysqli_query($con,$sql);

// now find the first record with the same group and callsign
$sql = "SELECT * FROM Positions";
if (isset($_GET["group"])) {
	$sql .= " WHERE LOWER(TRIM(GroupName)) LIKE LOWER(TRIM('".mysqli_real_escape_string($con,$_GET["group"])."'))";
}

	
$result = mysqli_query($con, $sql);

$json = "{"
	."\"updatedAt\":\"".date("Y-m-d\TH:i:s").".000Z\",\n"
	."\"servers\": [{\"id\":\"VF\",\"hostname\":\"localhost\",\"ip\":\"127.0.0.1\",\"description\":\"No Server\",\"countryId\":\"GB\",\"currentConnections\":0,\"maximumConnections\":999}],\n"
	."\"voiceServers\": [{\"id\":\"VF\",\"hostname\":\"localhost\",\"ip\":\"127.0.0.1\",\"description\":\"No Voice Server\",\"countryId\":\"GB\",\"currentConnections\":0,\"maximumConnections\":999}],\n"
	."\"clients\": {\n"
	."\"pilots\": [\n";

// if we have records
if ( mysqli_num_rows($result) > 0) {
	
	$i = 0;

	// loop through the records
	while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
	
		$i++;

		// prepare data for the whazzup format

		$callsign = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["Callsign"]));
		$pilot_name = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["PilotName"]));
		$group_name = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["GroupName"]));
		$aircraft_type = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["AircraftType"]));
		$version = strip_tags($row["Version"]);
		$server = strip_tags($row["Server"]);
		$notes = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["Notes"]));

		$latitude = number_format($row["Latitude"],6,".","");
		$longitude = number_format($row["Longitude"],6,".","");
		$altitude = number_format($row["Altitude"],0,".","");
		$heading = number_format($row["Heading"],0,".","");
		$airspeed = number_format($row["Airspeed"],0,".","");
		$groundspeed = number_format($row["Groundspeed"],0,".","");
		$ipaddress = $row["IPAddress"];
	
		$flight_level = number_format($altitude / 100,0,".","");

		// output the whazzup data

		$json .= "{\n"
			."\"time\":".time().",\n"
			."\"id\":".$i.",\n"
			."\"userId\":".$i.",\n"
			."\"callsign\":\"".$callsign."\",\n"
			."\"serverId\":\"".$server."\",\n"
			."\"softwareTypeId\":\"altitude\/win\",\n"
			."\"softwareVersion\":\"".$version."\",\n"
			."\"rating\":1,\n"
			."\"createdAt\":\"".date("Y-m-d\TH:i:s").".000Z\",\n"
			."\"lastTrack\": {\n"
				."\"altitude\":".$altitude.",\n"
				."\"altitudeDifference\":0,\n"
				."\"arrivalDistance\":0,\n"
				."\"departureDistance\":0,\n"
				."\"groundSpeed\":".$groundspeed.",\n"
				."\"heading\":".$heading.",\n"
				."\"latitude\":".$latitude.",\n"
				."\"longitude\":".$longitude.",\n"
				."\"onGround\":false,\n"
				."\"state\":\"Departing\",\n"
				."\"timestamp\":\"".date("Y-m-d\TH:i:s").".000Z\",\n"
				."\"transponder\":\"1234\",\n"
				."\"transponderMode\":\"N\",\n"
				."\"time\":".time()."\n"
				."},\n"
				."\"flightPlan\":{\n"
					."\"id\":".$i.",\n"
               				."\"revision\":1,\n"
               				."\"aircraftId\":\"".$aircraft_type."\",\n"
	               			."\"aircraftNumber\":1,\n"
	               			."\"departureId\":\"\",\n"
	               			."\"arrivalId\":\"\",\n"
	               			."\"alternativeId\":\"\",\n"
	               			."\"alternative2Id\":\"\",\n"
			               	."\"route\":\"\",\n"
	               			."\"remarks\":\"\",\n"
	               			."\"speed\":\"N".$airspeed."\",\n"
	               			."\"level\":\"F".$flight_level."\",\n"
	               			."\"flightRules\":\"I\",\n"
	               			."\"flightType\":\"S\",\n"
	               			."\"eet\":0,\n"
				        ."\"endurance\":0,\n"
			               	."\"departureTime\":0,\n"
	               			."\"actualDepartureTime\":0,\n"
	               			."\"peopleOnBoard\":0,\n"
	               			."\"createdAt\":\"".date("Y-m-d\TH:i:s").".000Z\",\n"
					."\"updatedAt\":\"".date("Y-m-d\TH:i:s").".000Z\",\n"
	               			."\"aircraftEquipments\":\"S\",\n"
	               			."\"aircraftTransponderTypes\":\"AB1\",\n"
	               			."\"aircraft\":{\n"
			                 	."\"icaoCode\":null,\n"
						."\"model\":\"".$aircraft_type."\",\n"
						."\"wakeTurbulence\":\"M\",\n"
						."\"isMilitary\":false,\n"
						."\"description\":\"".$aircraft_type."\"\n"
				        ."}\n"
				."},\n"
				."\"pilotSession\": {\n"
					."\"simulatorId\":\"MSFS\"\n"
				."}\n"
			."},";

			



	}		
}

// close the connection
mysqli_close($con);

// if the last char is a , remove it
$json = rtrim($json, ',');

// close the json
$json .= "],\n"
	."\"atcs\":[],\n"
	."\"connections\":{\n"
      	."\"total\":".$i.",\n"
      	."\"supervisor\":0,\n"
      	."\"atc\":0,\n"
      	."\"observer\":0,\n"
	."\"pilot\":".$i.",\n"
      	."\"worldTour\":0\n"
	."}\n"
	."}\n"
	."}\n";

print $json

?>
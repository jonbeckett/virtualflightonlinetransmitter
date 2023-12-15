<?php

header('Access-Control-Allow-Origin: *');

include "config.php";

ini_set('display_errors', 1);  
ini_set('display_startup_errors', 1);  

error_reporting(E_ALL);  

$con = mysqli_connect("p:".$database_server, $database_username, $database_password, $database_name);

// first delete anything older than 5 minutes ago
$sql = "DELETE FROM Positions"
	." WHERE Modified < NOW() - INTERVAL 1 MINUTE";
$result = mysqli_query($con,$sql);

$sql = "SELECT * FROM Positions";
if (isset($_GET["group"])) {
	$sql .= " WHERE LOWER(TRIM(GroupName)) LIKE LOWER(TRIM('".mysqli_real_escape_string($con,$_GET["group"])."'))";
}
	
$result = mysqli_query($con, $sql);

// output the headers
print("!GENERAL\r\n");
print("VERSION = 1\r\n");
print("RELOAD = 1\r\n");
print("UPDATE = ".date("YmdHis")."\r\n");
print("CONNECTED CLIENTS = ".mysqli_num_rows($result)."\r\n");
print("CONNECTED SERVERS = 0\r\n");
print("!CLIENTS\r\n");

// if we have records
if ( mysqli_num_rows($result) > 0) {
	
	// loop through the records
	while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
	
		// prepare data for the whazzup format

		$version = $row["Version"];


		$callsign = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["Callsign"]));
		$pilot_name = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["PilotName"]));
		$group_name = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["GroupName"]));
		$server_name = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["Server"]));
		$aircraft_type = preg_replace('/[^A-Za-z0-9. -]/', '', strip_tags($row["AircraftType"]));
		

		$latitude = number_format($row["Latitude"],4,".","");
		$longitude = number_format($row["Longitude"],4,".","");
		$altitude = number_format($row["Altitude"],0,".","");
		$heading = number_format($row["Heading"],0,".","");
		$airspeed = number_format($row["Airspeed"],0,".","");
		$groundspeed = number_format($row["Groundspeed"],0,".","");
		$ipaddress = $row["IPAddress"];

		// output the whazzup data
		//print($callsign.":".strip_tags($row["Callsign"]).":".$pilot_name.":PILOT::".$latitude.":".$longitude.":".$altitude.":".$groundspeed.":".$aircraft_type.":::::".$server_name.":B:6:1234:0:50:0:I:::::::::VFR:::::::".date("YmdHis").":".$group_name.":1 :1:1::S:0:".$heading.":0:40:\n");

		print($callsign.":".strip_tags($row["Callsign"]).":".$pilot_name.":PILOT::".$latitude.":".$longitude.":".$altitude.":".$groundspeed.":".$aircraft_type.":::::".$server_name.":B:6:1234:0:50:0:I:::::::::VFR:::::::".date("YmdHis").":".$group_name.":1 :1:1::S:0:".$heading.":0:40:\n");


	}
		
}

// close the connection
mysqli_close($con);


?>
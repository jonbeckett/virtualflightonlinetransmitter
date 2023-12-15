-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)

DROP TABLE IF EXISTS `Positions`;

CREATE TABLE `Positions` (
  `Callsign` varchar(255) NOT NULL,
  `AircraftType` varchar(255) NOT NULL,
  `PilotName` varchar(255) NOT NULL,
  `GroupName` varchar(255) NOT NULL,
  `Created` datetime DEFAULT NULL,
  `Modified` datetime DEFAULT NULL,
  `IPAddress` varchar(255) NOT NULL,
  `Latitude` double DEFAULT NULL,
  `Longitude` double DEFAULT NULL,
  `Altitude` double DEFAULT NULL,
  `Heading` double DEFAULT NULL,
  `Airspeed` double DEFAULT NULL,
  `Groundspeed` double DEFAULT NULL,
  `Notes` text,
  `Version` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `TouchdownVelocity` double DEFAULT NULL,
  `TransponderCode` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `Server` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  KEY `Position_Index` (`Callsign`,`GroupName`)
);

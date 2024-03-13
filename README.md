# Virtual Flight Online Transmitter

## Where do I download the Transmitter installer from?

In the right margin, there is a link to the most recent release:

[https://github.com/jonbeckett/virtualflightonlinetransmitter/releases/tag/transmitter](https://github.com/jonbeckett/virtualflightonlinetransmitter/releases/tag/transmitter)

Once installed and running, you will need to set the server URL within the Transmitter client application. VirtualFlight.Online no longer operates their own Transmitter server, but you are welcome to set your own up using the contents of the server folder (see "Running your own server" below).

## What is "Virtual Flight Online Transmitter" ?

It is a small Windows application that transmits your position in Microsoft Flight Simulator to an online database where your last reported position is held for 1 minute. The website then produces a "whazzup" formatted file that can be used by LittleNavMap to plot aircraft positions live on a map.

## Why?

If you and your friends want to see each other on mapping software such as LittleNavMap to run your own air traffic control sessions for group flights, you will no doubt have discovered that Microsoft Flight Simulator only communicates AI aircraft to external mapping applications such as LittleNavMap - not users. The Virtual Flight Online Transmitter application addresses that.

## How It Works

The desktop application connects to a running copy of Microsoft Flight Simulator via the SimConnect interface, and reads your aircraft's latitude, longitude, altitude, and airspeed. It combines the data with your keyed callsign, aircraft type, and name, and sends it to a server on the internet via the "Server URL" entered into the application.

The server then provides a URL that outputs all aircraft that have been updated in the last few seconds in "whazzup" format - a data format commonly used with the likes of VATSIM and IVAO - and crucially LittleNavMap. The URL of the server can be used to configure LittleNavMap to show you and your friends aircraft on the map.

## Configuring and Running Transmitter

* Launch Microsoft Flight Simulator.
* Run "VirtualFlight.Online Transmitter".
* Fill out the text boxes for:
  * The server URL (e.g. https://yourserver/transmitter/send)
  * Your callsign (e.g. G-ABCD)
  * Your name (e.g. Fred Smith)
  * Your group name (e.g. My Flight Sim Group)
* Click Connect

After clicking connect, the application will broadcast your location within the simulator to the internet once a second.

## Running your own server

The /server subdirectory contains the resources required to make your own server. You'll need some MySQL and PHP webserver experience - a database.sql file is included to create the appropriate database to track aircraft positions (used by send.php and whazzup_ivao.php). The code should be self explanatory. Remember your users will also need to change their server URL to reflect the location of "send.php" for your server.

Your webserver will need PHP and MySQL installed and configured.

The installation procedure is typically as follows:

1. Make a directory within the public HTML folder of your webserver (e.g. transmitter) and copy the server files into it (or even better, create a subdomain)
2. Create a database in MySQL, and use the database.sql file to create the "Positions" table
3. Configure a user for the MySQL database
4. Edit the config.php file to fill in your database name and user details

That's it!

The two URLs you will need after setting up the server are:

* The Server URL for the Transmitter client - e.g. https://yourserver/transmitter/send
* The Whazzup URL for LittleNavMap - e.g. https://yourserver/transmitter/whazzup_ivao

## Configuring LittleNavMap

If you would like to see everybody broadcasting their position with Virtual Flight Online Transmitter, follow these steps in LittleNavMap:

* Click on the Tools menu
* Click on Options
* Select the Online Flying section within the Options panel
* Choose the radio button for "Custom" within the Online Flying section
* Fill the URL http://your_server_name/whazzup_ivao into the URL field
* Set the update rate to something sensible (e.g. 5 seconds)
* Make sure IVAO is chosen in the format drop-down
* Click Apply, and OK

## Final note

I don't really have time to look after Transmitter any more. It was always a stop-gap until Microsoft released a multiplayer location API - but they never have. I will answer questions about Transmitter, but please don't expect me to support your installations or modifications to the code.

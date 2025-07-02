<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>Transmitter</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js" integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy" crossorigin="anonymous"></script>
</head>
<body>

<div class="container">
<h1>Transmitter Development Server</h1>

<h2>Installing and running the Transmitter Client</h2>
<p>In order to broadcast your position, you need the Transmitter client application. It connects to a running instance of Microsoft Flight Simulator
via the SIMCONNECT API, and broadcasts your location and configured identity once per second to a server on the internet.</p>
<ol>
<li>Download the installer from the link below:<br /><a href="https://github.com/jonbeckett/virtualflightonlinetransmitter/releases/download/Transmitter/transmitter_installer_1.0.1.16.exe">https://github.com/jonbeckett/virtualflightonlinetransmitter/releases/download/Transmitter/transmitter_installer_1.0.1.16.exe</a></li>
<li>Run the installer</li>
<li>Find "Transmitter" in your Start Menu, and run it</li>
<li>Enter the server URL and identity into Transmitter - the VirtualFlight.Online test server is as follows:<br /><code>https://transmitter.virtualflight.online/transmit.php</code><br /> - it has no pin number (at the moment)</li>
<li>Run the simulator first, then click the connect button on Transmitter</li>
</ol>
<p>The transmitter client application will remember your server and identity information. While connected, it is transmitting your location in the simulator.</p>

<hr />

<h2>Viewing Live Aircraft</h2>
<p>To view the positions of aircraft that are using transmitter, you can visit the following pages:</p>
<ul>
<li><a href="./status">Status</a></li>
<li><a href="./radar">Radar</a></li>
</ul>

<hr />

<h2>Integrating with LittleNavMap</h2>
<p>You can also integrate Transmitter with LittleNavMap - to show live aircraft positions on the map:</p>
<ol>
<li>Run LittleNavMap</li>
<li>Click the "Tools" menu</li>
<li>Click "Options" in the Tools menu</li>
<li>Click "Online Flying" on the left side of the Options dialog</li>
<li>Select "Custom" in the "Online Service" section of the dialog</li>
<li>Populate the "Whazzup File URL" with <code>https://transmitter.virtualflight.online/ivao.php</code><br />(<em>be careful you have no spaces on the start or end of the URL - use the test button to make sure it works</em>)</li>
<li>Set "Update every" to 5 seconds</li>
<li>Set the "Format" to "IVAO"</li>
<li>Click the "Apply" button, then the "OK" button</li>
</ol>
<p>You should now be able to toggle online aircraft on and off in the map with the red aircraft icon in the LittleNavMap toolbar.</p>

<hr />

<h2>A few notes...</h2>
<ul>
<li>The radar display allows you to drag the labels of the aircraft around.</li>
<li>Remember the radar display only updates every 5 seconds - so it might be a second or two after you start transmitting before you show up.</li>
<li>If you disconnect Transmitter, your old location will show for a minute before vanishing.</li>
<li>Stationary aircraft are shown as dots on the radar - moving aircraft as aircraft icons. If you click on them, they show further information.</li>
<li>The latest version of the server uses APCu rather than MySQL to store aircraft positions. This means it's running in RAM, rather than using a database - so it should be MUCH faster.</li>
<li>If you have any problems with it, remember it's a development version - the source code is available on <a href="https://github.com/jonbeckett/virtualflightonlinetransmitter">Github</a> if you want to see how it works.</li>
<li>The development version is running on a DigitalOcean "basic" VM in the cloud, connected to a domain name via CloudFlare, SSL provided by Certbot.</li>
</ul>

<hr />

<h2>Support VirtualFlight.Online</h2>
<p>If you would like to help support virtualflight.online, we have a Patreon page:</p>
<ul>
<li><a href="https://patreon.com/virtualflightonline">https://patreon.com/virtualflightonline</a></li>
</ul>

</div> <!-- .container -->

</body>
</html>
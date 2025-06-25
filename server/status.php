<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Who is Online?</title>
    <link rel="shortcut icon" type="image/jpg" href="virtualflightonline.jpg"/>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We" crossorigin="anonymous" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossorigin="anonymous"></script>
    <link href="style.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css" integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14=" crossorigin="anonymous"/>
    <script src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js" integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s=" crossorigin="anonymous"></script>
    <script src="status.js?t=<?php echo(time());?>" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css" integrity="sha512-xh6O/CkQoPOWDdYTDqeRdPCVd1SpvCA9XXcUnZS2FmJNp1coAFzvtCN9BmamE+4aHK8yyUHUSCcJHgXloTyT2A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdn.jsdelivr.net/npm/leaflet-rotatedmarker@0.2.0/leaflet.rotatedMarker.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="row">
      <header>
        <h1 class="display-1">Who is Online ?</h1>
        <div class="mb-3">
          <a href="radar.php" class="btn btn-primary">
            <i class="fas fa-radar"></i> Radar Display
          </a>
        </div>
      </header>
      <section class="mt-4 mb-4">
        <div id="map" style="width:100%;height:500px;"></div>
      </section>

      <section class="mt-4 mb-4">
        <table border="0" cellspacing="1" cellpadding="5" width="100%" class="table table-sm table-striped" id="aircraft_table">
          <thead>
            <tr>
              <th class='l icon' scope="col"><a title=''>&nbsp;</a></th>
              <th class='l' scope="col" style="cursor:pointer;"><a title='Callsign (click to sort)'>Callsign</a></th>
              <th class='l' scope="col" style="cursor:pointer;"><a title='Pilot Name (click to sort)'>Name</a></th>
              <th class='l' scope="col" style="cursor:pointer;"><a title='Aircraft Type (click to sort)'>Aircraft</a></th>
              <th class='l' scope="col" style="cursor:pointer;"><a title='Group Name (click to sort)'>Group</a></th>
              <th class='l' scope="col" style="cursor:pointer;"><a title='Server (click to sort)'>Server</a></th>
              <th class='r' scope="col" style="cursor:pointer;"><a title='Altitude (click to sort)'>ALT</a></th>
              <th class='r' scope="col" style="cursor:pointer;"><a title='Heading (click to sort)'>HDG</a></th>
              <th class='r' scope="col" style="cursor:pointer;"><a title='Airspeed (click to sort)'>IAS</a></th>
              <th class='r' scope="col" style="cursor:pointer;"><a title='Groundspeed (click to sort)'>GS</a></th>
              <th class='c' scope="col" style="cursor:pointer;"><a title='Last Landing Rate (click to sort)'>LLR (ft/min)</a></th>
              <th class='c' scope="col" style="cursor:pointer;"><a title='Time Online (click to sort)'>Online</a></th>
              <th class='c' scope="col" style="cursor:pointer;"><a title='Version (click to sort)'>Version</a></th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <p><span id="aircraft_count"></span> aircraft listed. </p>
      </section>

      <div style="display:none;" id="info"></div>

    </div> <!-- row -->		

	</div> <!-- container -->

</body>
</html>

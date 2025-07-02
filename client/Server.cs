using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualFlightOnlineTransmitter
{
    internal class Server
    {
        // [{"serverName":"Your Server Name","callsign":"Your Callsign","pilotName":"Your Pilot Name","groupName":"Your Group Name","notes":"","msfsServer":"WEST EUROPE","autoConnect":"true","serverURL":"http://yourserver/transmit.php","pin":"1234"}]
        public string serverName { get; set; }
        public string callsign { get; set; }
        public string pilotName { get; set; }
        public string groupName { get; set; }
        public string notes { get; set; }
        public string msfsServer { get; set; }
        public string autoConnect { get; set; }
        public string serverURL { get; set; }
        public string pin { get; set; }
    }
}

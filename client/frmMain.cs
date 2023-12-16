using System;
using System.Linq;
using System.Windows.Forms;
using CTrue.FsConnect;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Net;
using System.IO;

namespace VirtualFlightOnlineTransmitter
{
    public partial class frmMain : Form
    {

        /// <summary>
        /// Event handler to capture data received from SimConnect
        /// </summary>
        /// <param name="latitude">Aircraft Latitude</param>
        /// <param name="longitude">Aircraft Longitude</param>
        /// <param name="alititude">Aircraft Altitude</param>
        /// <param name="heading">Aircraft Heading</param>
        /// <param name="airspeed">Aircraft Airspeed</param>
        /// <param name="groundspeed">Aircraft Groundspeed</param>
        public delegate void DataReceivedEventHandler(string aircraft_type, double latitude, double longitude, double alititude, double heading, double airspeed, double groundspeed, double touchdown_velocity, string transponder_code);
        public event DataReceivedEventHandler DataReceivedEvent;


        /// <summary>
        /// FSConnect library to communicate with the flight simulator
        /// </summary>
        public FsConnect FlightSimulatorConnection = new FsConnect();


        /// <summary>
        ///  Control variables used to manage connections with FSConnect
        /// </summary>
        public int planeInfoDefinitionId { get; set; }
        public enum Requests
        {
            PlaneInfoRequest = 0
        }


        /// <summary>
        /// Function to convert longitude decimal to string
        /// </summary>
        /// <param name="dec"></param>
        /// <returns></returns>
        string LongitudeToString(double val)
        {
            int d = (int)val;
            int m = (int)((val - d) * 60);
            double s = ((((val - d) * 60) - m) * 60);
            
            return Math.Abs(d) + "° " + Math.Abs(m) + "' " + string.Format("{0:0.00}", Math.Abs(s)) + "\" " + (val > 0 ? "E" : "W");
        }

        /// <summary>
        /// Converts a latitude decimal to a string
        /// </summary>
        /// <param name="val"></param>
        /// <returns></returns>
        string LatitudeToString(double val)
        {
            int d = (int)val;
            int m = (int)((val - d) * 60);
            double s = ((((val - d) * 60) - m) * 60);

            return Math.Abs(d) + "° " + Math.Abs(m) + "' " + string.Format("{0:0.00}", Math.Abs(s)) + "\" " + (val > 0 ? "N" : "S");
        }


        /// <summary>
        /// Time the connection to the simulator started (used to calculate how long the user has been connected)
        /// </summary>
        public DateTime ConnectionStartTime { get; set; }


        /// <summary>
        /// Data structure used to receive information from SimConnect
        /// </summary>
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
        public struct PlaneInfoResponse
        {
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
            public String Title;
            [SimVar(NameId = FsSimVar.PlaneLatitude, UnitId = FsUnit.Degree)]
            public double PlaneLatitude;
            [SimVar(NameId = FsSimVar.PlaneLongitude, UnitId = FsUnit.Degree)]
            public double PlaneLongitude;
            [SimVar(NameId = FsSimVar.IndicatedAltitude, UnitId = FsUnit.Feet)]
            public double IndicatedAltitude;
            [SimVar(NameId = FsSimVar.GpsPositionAlt, UnitId = FsUnit.Meter)]
            public double GpsPositionAlt;
            [SimVar(NameId = FsSimVar.PlaneAltitude, UnitId = FsUnit.Feet)]
            public double PlaneAltitude;
            [SimVar(NameId = FsSimVar.PlaneHeadingDegreesTrue, UnitId = FsUnit.Degree)]
            public double PlaneHeadingDegreesTrue;
            [SimVar(NameId = FsSimVar.PlaneHeadingDegreesMagnetic, UnitId = FsUnit.Degree)]
            public double PlaneHeadingDegreesMagnetic;
            [SimVar(NameId = FsSimVar.AirspeedIndicated, UnitId = FsUnit.Knot)]
            public double AirspeedIndicated;
            [SimVar(NameId = FsSimVar.GpsGroundSpeed, UnitId = FsUnit.MetersPerSecond)]
            public double GpsGroundSpeed;
            [SimVar(NameId = FsSimVar.PlaneTouchdownNormalVelocity, UnitId = FsUnit.FeetPerSecond)]
            public double PlaneTouchdownNormalVelocity;

            // TODO - look into why TransponderCode doesn't come back from the simvars :)
            [SimVar(NameId = FsSimVar.TransponderCode, UnitId = FsUnit.Bco16)]
            public uint TransponderCode;
                        
        }


        /// <summary>
        /// Handler to receive information from SimConnect
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        public void HandleReceivedFsData(object sender, FsDataReceivedEventArgs e)
        {
            if (e.RequestId == (uint)Requests.PlaneInfoRequest)
            {
                PlaneInfoResponse r = (PlaneInfoResponse)e.Data.FirstOrDefault();

                string aircraft_type = r.Title;
                double latitude = r.PlaneLatitude;
                double longitude = r.PlaneLongitude;
                double altitude = r.IndicatedAltitude;
                double heading = r.PlaneHeadingDegreesTrue;
                double airspeed = r.AirspeedIndicated;
                double groundspeed = r.GpsGroundSpeed;
                double touchdown_velocity = r.PlaneTouchdownNormalVelocity;
                
                // TODO - look into why TransponderCode doesn't come back from the simvars
                uint transponder_code = Bcd.Bcd2Dec(r.TransponderCode);

                this.DataReceivedEvent(aircraft_type,latitude, longitude, altitude, heading, airspeed, groundspeed, touchdown_velocity, transponder_code.ToString());

            }
        }


        /// <summary>
        /// Sends aircraft data to the web server
        /// </summary>
        /// <param name="latitude">Aircraft Latitude</param>
        /// <param name="longitude">Aircraft Longitude</param>
        /// <param name="heading">Aircraft Heading</param>
        /// <param name="altitude">Aircraft Altitude</param>
        /// <param name="airspeed">Aircraft Airspeed</param>
        /// <returns>Response from GET request to Server</returns>
        public string SendDataToServer(string aircraft_type, double latitude, double longitude, double heading, double altitude, double airspeed, double groundspeed, double touchdown_velocity, string transponder_code, string notes, string version)
        {
            string result = "";

            try
            {
                // force the numbers into USA format
                CultureInfo usa_format = new CultureInfo("en-US");

                string url = Properties.Settings.Default["ServerURL"].ToString()
                    + "?Callsign=" + Properties.Settings.Default["Callsign"].ToString()
                    + "&PilotName=" + Properties.Settings.Default["PilotName"].ToString()
                    + "&GroupName=" + Properties.Settings.Default["GroupName"].ToString()
                    + "&MSFSServer=" + Properties.Settings.Default["MSFSServer"].ToString()
                    + "&AircraftType=" + aircraft_type.ToString()
                    + "&Latitude=" + latitude.ToString(usa_format)
                    + "&Longitude=" + longitude.ToString(usa_format)
                    + "&Altitude=" + altitude.ToString(usa_format)
                    + "&Airspeed=" + airspeed.ToString(usa_format)
                    + "&Groundspeed=" + groundspeed.ToString(usa_format)
                    + "&Heading=" + heading.ToString(usa_format)
                    + "&TouchdownVelocity=" + touchdown_velocity.ToString(usa_format)
                    + "&TransponderCode=" + transponder_code
                    + "&Version=" + version
                    + "&Notes=" + System.Net.WebUtility.UrlEncode(notes);
                            
                var request = WebRequest.Create(url);
                request.Method = "GET";
                request.Timeout = 1000; // 1 second
                
                using (var webResponse = request.GetResponse())
                {
                    using (var webStream = webResponse.GetResponseStream())
                    {
                        using (var reader = new StreamReader(webStream))
                        {
                            result = reader.ReadToEnd();
                        }
                    }
                }

                // todo - catch "server not found" errors and report them

            } catch
            {
                // do nothing 
            }
                        
            return result;

        }


        /// <summary>
        /// Constructor for the Form
        /// </summary>
        public frmMain()
        {
            InitializeComponent();

            // Disable illegal cross thread calls warnings
            Control.CheckForIllegalCrossThreadCalls = false;

            // Attach an event reveiver to the data received event
            this.DataReceivedEvent += HandleDataReceived;

        }


        /// <summary>
        /// Handle clicks on the Connect button
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void btnConnect_Click(object sender, EventArgs e)
        {
            if (!this.FlightSimulatorConnection.Connected)
            {
                // we are NOT connected - label the button Connecting
                // (receiving data will mark it as Connected if it isnt already)
                Connect();
            }
        }


        /// <summary>
        /// Handle the Timer control ticking (orchestrating communication with FSConnect, and laterly the web server
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tmrTransmit_Tick(object sender, EventArgs e)
        {
            if (this.FlightSimulatorConnection.Connected)
            {

                // Call the Simulator to fetch data
                try
                {
                    this.FlightSimulatorConnection.RequestData((int)Requests.PlaneInfoRequest, this.planeInfoDefinitionId);
                } catch
                {
                    Disconnect("Problem transmitting data simulator." + ((Properties.Settings.Default["AutoConnect"].ToString().ToLower() == "true") ? " - retrying every 5 seconds" : ""));
                }

            }
        }


        /// <summary>
        /// Event Handler to handle data returning from the simulator
        /// </summary>
        /// <param name="latitude"></param>
        /// <param name="longitude"></param>
        /// <param name="altitude"></param>
        /// <param name="heading"></param>
        /// <param name="airspeed"></param>
        public void HandleDataReceived(string aircraft_type, double latitude, double longitude, double altitude, double heading, double airspeed, double groundspeed, double touchdown_velocity, string transponder_code)
        {

            // convert ground speed from metres per second to knots
            groundspeed = groundspeed * 1.94384449;

            // Update the Screen   
            this.tbAircraftType.Text = aircraft_type;
            this.tbLatitude.Text = LatitudeToString(latitude);
            this.tbLongitude.Text = LongitudeToString(longitude);
            this.tbAltitude.Text = string.Format("{0:0. ft}", altitude);
            this.tbHeading.Text = string.Format("{0:0. deg}", heading);
            this.tbAirspeed.Text = string.Format("{0:0. knots}", airspeed);
            this.tbGroundspeed.Text = string.Format("{0:0. knots}", groundspeed);
            this.tbTouchdownVelocity.Text = string.Format("{0:0. ft/min}", touchdown_velocity * 60);
            
            string version = System.Windows.Forms.Application.ProductVersion;

            // Transmit data to web
            try
            {
                // get notes from the textbox
                string notes = tbNotes.Text;

                // send the data to the server and get the response back
                string response_data = this.SendDataToServer(aircraft_type, latitude,longitude,heading,altitude,airspeed,groundspeed,touchdown_velocity,transponder_code, notes,version);

                tsslMain.Text = "Connected for " + DateTime.Now.Subtract(this.ConnectionStartTime).ToString(@"hh\:mm\:ss");
                
            }
            catch
            {
                // problems
                Disconnect("Problem sending data to the server");
            }

            

        }


        /// <summary>
        /// Handle closing of the form
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void frmMain_FormClosing(object sender, FormClosingEventArgs e)
        {
            // If the simulator is connected, ask the user if they really want to close Transmitter
            if (this.FlightSimulatorConnection.Connected)
            {
                DialogResult result = MessageBox.Show("Transmitter is still connected to the simulator - are you sure you want to close it?", "Warning", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
                if (result == DialogResult.Yes)
                {
                    // disconnect from the simulator
                    this.tmrTransmit.Stop();
                    this.tmrConnect.Stop();
                    this.Disconnect(string.Empty);

                } else {
                    // cancel the form closure
                    e.Cancel = true;
                }
            }
        }


        /// <summary>
        /// Handle loading the form
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void frmMain_Load(object sender, EventArgs e)
        {
            // pre-fill the settings boxes with data from properties
            tbServerURL.Text = Properties.Settings.Default["ServerURL"].ToString();
            tbCallsign.Text = Properties.Settings.Default["Callsign"].ToString();
            tbPilotName.Text = Properties.Settings.Default["PilotName"].ToString();
            tbGroupName.Text = Properties.Settings.Default["GroupName"].ToString();
            cbMSFSServer.Text = Properties.Settings.Default["MSFSServer"].ToString();
            tbNotes.Text = Properties.Settings.Default["Notes"].ToString();

            autoConnectToolStripMenuItem.Checked = Properties.Settings.Default["AutoConnect"].ToString().ToLower() == "true" ? true : false;
            
            // Start the Transmitter
            if (autoConnectToolStripMenuItem.Checked)
            {
                // start the connection timer (which will attempt re-connections)
                tmrConnect.Start();
                tsslMain.Text = "Connecting to Simulator...";
                this.Refresh();

                // cause an immediate connect
                Connect();
                
            } else
            {
                tsslMain.Text = "Version " + System.Windows.Forms.Application.ProductVersion;
            }
            
            this.Refresh();

        }

        /// <summary>
        /// Updates settings when Server URL textbox is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbServerURL_TextChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["ServerURL"] = tbServerURL.Text;
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// Updates settings when callsign textbox is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbCallsign_TextChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["Callsign"] = tbCallsign.Text;
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// Updates settings when pilot name textbox is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbPilotName_TextChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["PilotName"] = tbPilotName.Text;
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// Updates settings when group name textbox content is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbGroupName_TextChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["GroupName"] = tbGroupName.Text;
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// Updates settings when server is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void cbMSFSServer_SelectedIndexChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["MSFSServer"] = cbMSFSServer.Text;
            Properties.Settings.Default.Save();
        }

        /// <summary>
        /// Updates settings when notes textbox is changed
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbNotes_TextChanged(object sender, EventArgs e)
        {
            Properties.Settings.Default["Notes"] = tbNotes.Text;
            Properties.Settings.Default.Save();
        }

        private void tbServerURL_Leave(object sender, EventArgs e)
        {
            tbServerURL.Text = tbServerURL.Text.Trim();
        }


        /// <summary>
        /// Remove spaces when focus leaves callsign field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbCallsign_Leave(object sender, EventArgs e)
        {
            tbCallsign.Text = tbCallsign.Text.Trim();
        }


        /// <summary>
        /// Remove spaces when focus leaves pilot name field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbPilotName_Leave(object sender, EventArgs e)
        {
            tbPilotName.Text = tbPilotName.Text.Trim();
        }


        /// <summary>
        /// Remove spaces when focus leaves group name field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbGroupName_Leave(object sender, EventArgs e)
        {
            tbGroupName.Text = tbGroupName.Text.Trim();
        }


        /// <summary>
        /// Remove spaces when focus leaves notes field
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void tbNotes_Leave(object sender, EventArgs e)
        {
            tbNotes.Text = tbNotes.Text.Trim();
        }


        /// <summary>
        /// Handle users clicking on the About menu option (show a message)
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void aboutToolStripMenuItem_Click(object sender, EventArgs e)
        {
            string version = System.Windows.Forms.Application.ProductVersion;
            MessageBox.Show("Transmitter\nby Jonathan Beckett\nVirtual Flight Online\nhttps://virtualflight.online\nVersion " + version, "About", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }


        /// <summary>
        /// Helper method to connect to SimConnect and update the interface appropriately
        /// </summary>
        private void Connect()
        {

            // first check if the default parameters have been changed
            if (this.tbCallsign.Text == "Your Callsign" || this.tbPilotName.Text == "Your Name")
            {
                tmrConnect.Stop();
                tsslMain.Text = "";
                MessageBox.Show("It looks like you haven't changed your callsign, or name yet. Please change them before connecting.", "Let's do this first", MessageBoxButtons.OK, MessageBoxIcon.Exclamation );
            }
            else
            {
                
                // check if the parameters are empty
                if (tbCallsign.Text != string.Empty && tbPilotName.Text != string.Empty && tbGroupName.Text != string.Empty)
                {
                    
                    // if the user is not connected
                    if (!this.FlightSimulatorConnection.Connected)
                    {
                        
                        // try to connect
                        try
                        {

                            tmrConnect.Start();  // checks the connection to the sim is up every few seconds

                            btnConnect.Enabled = false;
                            btnDisconnect.Enabled = true;

                            tsslMain.Text = "Connecting...";
                            this.Refresh();

                            // connect to simulator
                            this.FlightSimulatorConnection.Connect("VirtualFlightOnlineClient");

                            this.planeInfoDefinitionId = this.FlightSimulatorConnection.RegisterDataDefinition<PlaneInfoResponse>();

                            // Attach event handler
                            this.FlightSimulatorConnection.FsDataReceived += this.HandleReceivedFsData;

                            // Disable the textboxes
                            tbServerURL.Enabled = false;
                            tbCallsign.Enabled = false;
                            tbPilotName.Enabled = false;
                            tbGroupName.Enabled = false;
                            cbMSFSServer.Enabled = false;

                            // Initialise the connection start time
                            this.ConnectionStartTime = DateTime.Now;

                            tmrTransmit.Start(); // transmits data every few seconds

                            autoConnectToolStripMenuItem.Enabled = false;
                            resetSettingsToDefaultsToolStripMenuItem.Enabled = false;

                            this.Refresh();
                        }
                        catch
                        {
                            // problem connecting
                            tsslMain.Text = "Problem connecting to Simulator" + ((Properties.Settings.Default["AutoConnect"].ToString().ToLower() == "true") ? " - retrying every 5 seconds" : "");
                            this.Refresh();
                        }

                    }

                }
                else
                {
                    // user has not filled in all required parameters
                    Disconnect("Please fill required parameters");
                    MessageBox.Show("You must fill out the Callsign, Pilot Name, Aircraft Type, Group Name, and Server URL", "Please Fill Data Fields", MessageBoxButtons.OK, MessageBoxIcon.Warning);

                    tmrConnect.Stop();
                    tmrTransmit.Stop();
                    
                    btnConnect.Enabled = true;
                    btnDisconnect.Enabled = false;
                }
            
            }
        }


        /// <summary>
        /// Helper method to disconnect from SimConnect and update the interface appropriately
        /// </summary>
        private void Disconnect(string msg)
        {

            // stop the timers
            tmrTransmit.Stop();
            tmrConnect.Stop();

            if (msg.Length > 0)
            {
                tsslMain.Text = msg;
            } else
            {
                tsslMain.Text = "Not Connected";
            }
            this.Refresh();

            // if we are connected, disconnect from the simulator
            if (this.FlightSimulatorConnection.Connected) this.FlightSimulatorConnection.Disconnect();

            // configure the connect / disconnect buttons
            btnConnect.Enabled = true;
            btnDisconnect.Enabled = false;

            // switch the UI components back on
            tbServerURL.Enabled = true;
            tbCallsign.Enabled = true;
            tbPilotName.Enabled = true;
            tbGroupName.Enabled = true;
            cbMSFSServer.Enabled = true;

            autoConnectToolStripMenuItem.Enabled = true;
            resetSettingsToDefaultsToolStripMenuItem.Enabled = true;
            
        }

        /// <summary>
        /// Exits the application (shuts things down first)
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void exitToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            // disconnect if connected
            if (this.FlightSimulatorConnection.Connected) this.FlightSimulatorConnection.Disconnect();

            this.tmrConnect.Stop();
            this.tmrTransmit.Stop();

            // close the application
            this.Close();
        }


        /// <summary>
        /// Resets the textboxes
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void resetSettingsToDefaultsToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (!this.FlightSimulatorConnection.Connected)
            {
                tbServerURL.Text = "https://yourserver/send.php";
                tbCallsign.Text = "Your Callsign";
                tbPilotName.Text = "Your Name";
                tbGroupName.Text = "Your Group";
                cbMSFSServer.Text = "SOUTH EAST ASIA";
                
                // save the settings
                Properties.Settings.Default.Save();

            } else
            {
                MessageBox.Show("Please disconnect from the simulator first", "Disconnect First", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }

        }




        private void aircraftDataToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (aircraftDataToolStripMenuItem.Checked)
            {
                this.Height = this.MaximumSize.Height;
            } else
            {
                this.Height = this.MinimumSize.Height;
            }
            
        }

        private void tmrConnect_Tick(object sender, EventArgs e)
        {
            if (!this.FlightSimulatorConnection.Connected)
            {
                Connect();
            }
        }

        private void autoConnectToolStripMenuItem_Click(object sender, EventArgs e)
        {
            
            if (this.autoConnectToolStripMenuItem.Checked)
            {
                Properties.Settings.Default["AutoConnect"] = "true";
                tmrConnect.Start();
            }
            else {
                Properties.Settings.Default["AutoConnect"] = "false";
                tmrConnect.Stop();
            }
            Properties.Settings.Default.Save();

        }

        private void btnDisconnect_Click(object sender, EventArgs e)
        {
            tmrConnect.Stop();
            Disconnect("");
        }




    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VirtualFlightOnlineTransmitter
{
    partial class frmMain
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frmMain));
            this.btnConnect = new System.Windows.Forms.Button();
            this.gbServer = new System.Windows.Forms.GroupBox();
            this.tbServerName = new System.Windows.Forms.TextBox();
            this.lbServerName = new System.Windows.Forms.Label();
            this.lbPin = new System.Windows.Forms.Label();
            this.tbPin = new System.Windows.Forms.TextBox();
            this.lbServer = new System.Windows.Forms.Label();
            this.tbServerURL = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.cbMSFSServer = new System.Windows.Forms.ComboBox();
            this.lbNotes = new System.Windows.Forms.Label();
            this.tbNotes = new System.Windows.Forms.TextBox();
            this.lbGroupName = new System.Windows.Forms.Label();
            this.tbGroupName = new System.Windows.Forms.TextBox();
            this.tbPilotName = new System.Windows.Forms.TextBox();
            this.tbCallsign = new System.Windows.Forms.TextBox();
            this.lbPilotName = new System.Windows.Forms.Label();
            this.lbCallsign = new System.Windows.Forms.Label();
            this.tmrTransmit = new System.Windows.Forms.Timer(this.components);
            this.gbAircraftData = new System.Windows.Forms.GroupBox();
            this.lbAircraftType = new System.Windows.Forms.Label();
            this.tbAircraftType = new System.Windows.Forms.TextBox();
            this.lbTouchdownVelocity = new System.Windows.Forms.Label();
            this.tbTouchdownVelocity = new System.Windows.Forms.TextBox();
            this.lbGroundspeed = new System.Windows.Forms.Label();
            this.tbGroundspeed = new System.Windows.Forms.TextBox();
            this.lbHeading = new System.Windows.Forms.Label();
            this.tbHeading = new System.Windows.Forms.TextBox();
            this.lbAirspeed = new System.Windows.Forms.Label();
            this.lbAltitude = new System.Windows.Forms.Label();
            this.tbAirspeed = new System.Windows.Forms.TextBox();
            this.tbAltitude = new System.Windows.Forms.TextBox();
            this.tbLatitude = new System.Windows.Forms.TextBox();
            this.tbLongitude = new System.Windows.Forms.TextBox();
            this.lbLatitude = new System.Windows.Forms.Label();
            this.lbLongitude = new System.Windows.Forms.Label();
            this.mnuMain = new System.Windows.Forms.MenuStrip();
            this.transmitterToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.autoConnectToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem4 = new System.Windows.Forms.ToolStripSeparator();
            this.resetSettingsToDefaultsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem2 = new System.Windows.Forms.ToolStripSeparator();
            this.exitToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.viewToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.aircraftDataToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.linksToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.virtualFlightOnlineToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem1 = new System.Windows.Forms.ToolStripSeparator();
            this.websiteToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.newsletterToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.airlineToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.forumsToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.discordToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.facebookToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.patreonToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.helpToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.aboutToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.ssMain = new System.Windows.Forms.StatusStrip();
            this.tsslMain = new System.Windows.Forms.ToolStripStatusLabel();
            this.tmrConnect = new System.Windows.Forms.Timer(this.components);
            this.btnDisconnect = new System.Windows.Forms.Button();
            this.gbServers = new System.Windows.Forms.GroupBox();
            this.btnRemoveServer = new System.Windows.Forms.Button();
            this.btnAddServer = new System.Windows.Forms.Button();
            this.lbServers = new System.Windows.Forms.ListBox();
            this.transmitterToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.whosOnlineToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.radarToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.downloadTheSourceCodeToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem3 = new System.Windows.Forms.ToolStripSeparator();
            this.gbServer.SuspendLayout();
            this.gbAircraftData.SuspendLayout();
            this.mnuMain.SuspendLayout();
            this.ssMain.SuspendLayout();
            this.gbServers.SuspendLayout();
            this.SuspendLayout();
            // 
            // btnConnect
            // 
            this.btnConnect.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.btnConnect.Location = new System.Drawing.Point(12, 280);
            this.btnConnect.Name = "btnConnect";
            this.btnConnect.Size = new System.Drawing.Size(563, 23);
            this.btnConnect.TabIndex = 8;
            this.btnConnect.Text = "Connect";
            this.btnConnect.UseVisualStyleBackColor = true;
            this.btnConnect.Click += new System.EventHandler(this.btnConnect_Click);
            // 
            // gbServer
            // 
            this.gbServer.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gbServer.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None;
            this.gbServer.Controls.Add(this.tbServerName);
            this.gbServer.Controls.Add(this.lbServerName);
            this.gbServer.Controls.Add(this.lbPin);
            this.gbServer.Controls.Add(this.tbPin);
            this.gbServer.Controls.Add(this.lbServer);
            this.gbServer.Controls.Add(this.tbServerURL);
            this.gbServer.Controls.Add(this.label1);
            this.gbServer.Controls.Add(this.cbMSFSServer);
            this.gbServer.Controls.Add(this.lbNotes);
            this.gbServer.Controls.Add(this.tbNotes);
            this.gbServer.Controls.Add(this.lbGroupName);
            this.gbServer.Controls.Add(this.tbGroupName);
            this.gbServer.Controls.Add(this.tbPilotName);
            this.gbServer.Controls.Add(this.tbCallsign);
            this.gbServer.Controls.Add(this.lbPilotName);
            this.gbServer.Controls.Add(this.lbCallsign);
            this.gbServer.Location = new System.Drawing.Point(203, 35);
            this.gbServer.Name = "gbServer";
            this.gbServer.Size = new System.Drawing.Size(572, 239);
            this.gbServer.TabIndex = 1;
            this.gbServer.TabStop = false;
            this.gbServer.Text = "Server";
            // 
            // tbServerName
            // 
            this.tbServerName.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbServerName.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbServerName.Location = new System.Drawing.Point(90, 15);
            this.tbServerName.Name = "tbServerName";
            this.tbServerName.Size = new System.Drawing.Size(476, 23);
            this.tbServerName.TabIndex = 0;
            this.tbServerName.TextChanged += new System.EventHandler(this.tbServerName_TextChanged);
            // 
            // lbServerName
            // 
            this.lbServerName.AutoSize = true;
            this.lbServerName.Location = new System.Drawing.Point(7, 19);
            this.lbServerName.Name = "lbServerName";
            this.lbServerName.Size = new System.Drawing.Size(69, 13);
            this.lbServerName.TabIndex = 17;
            this.lbServerName.Text = "Server Name";
            // 
            // lbPin
            // 
            this.lbPin.AutoSize = true;
            this.lbPin.Location = new System.Drawing.Point(478, 47);
            this.lbPin.Name = "lbPin";
            this.lbPin.Size = new System.Drawing.Size(22, 13);
            this.lbPin.TabIndex = 16;
            this.lbPin.Text = "Pin";
            // 
            // tbPin
            // 
            this.tbPin.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbPin.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbPin.Location = new System.Drawing.Point(506, 43);
            this.tbPin.Name = "tbPin";
            this.tbPin.PasswordChar = '*';
            this.tbPin.Size = new System.Drawing.Size(60, 23);
            this.tbPin.TabIndex = 2;
            this.tbPin.TextChanged += new System.EventHandler(this.tbPin_TextChanged);
            // 
            // lbServer
            // 
            this.lbServer.AutoSize = true;
            this.lbServer.Location = new System.Drawing.Point(8, 47);
            this.lbServer.Name = "lbServer";
            this.lbServer.Size = new System.Drawing.Size(63, 13);
            this.lbServer.TabIndex = 14;
            this.lbServer.Text = "Server URL";
            // 
            // tbServerURL
            // 
            this.tbServerURL.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbServerURL.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbServerURL.Location = new System.Drawing.Point(90, 43);
            this.tbServerURL.Name = "tbServerURL";
            this.tbServerURL.Size = new System.Drawing.Size(382, 23);
            this.tbServerURL.TabIndex = 1;
            this.tbServerURL.TextChanged += new System.EventHandler(this.tbServerURL_TextChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(8, 159);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(38, 13);
            this.label1.TabIndex = 12;
            this.label1.Text = "Server";
            // 
            // cbMSFSServer
            // 
            this.cbMSFSServer.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.cbMSFSServer.FlatStyle = System.Windows.Forms.FlatStyle.System;
            this.cbMSFSServer.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.cbMSFSServer.FormattingEnabled = true;
            this.cbMSFSServer.Items.AddRange(new object[] {
            "NORTH EUROPE",
            "WEST EUROPE",
            "EAST USA",
            "WEST USA",
            "SOUTH EAST ASIA"});
            this.cbMSFSServer.Location = new System.Drawing.Point(90, 155);
            this.cbMSFSServer.Name = "cbMSFSServer";
            this.cbMSFSServer.Size = new System.Drawing.Size(476, 23);
            this.cbMSFSServer.TabIndex = 6;
            this.cbMSFSServer.SelectedIndexChanged += new System.EventHandler(this.cbMSFSServer_SelectedIndexChanged);
            // 
            // lbNotes
            // 
            this.lbNotes.AutoSize = true;
            this.lbNotes.Location = new System.Drawing.Point(8, 189);
            this.lbNotes.Name = "lbNotes";
            this.lbNotes.Size = new System.Drawing.Size(35, 13);
            this.lbNotes.TabIndex = 10;
            this.lbNotes.Text = "Notes";
            // 
            // tbNotes
            // 
            this.tbNotes.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbNotes.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbNotes.Location = new System.Drawing.Point(90, 185);
            this.tbNotes.MaxLength = 1024;
            this.tbNotes.Multiline = true;
            this.tbNotes.Name = "tbNotes";
            this.tbNotes.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.tbNotes.Size = new System.Drawing.Size(476, 48);
            this.tbNotes.TabIndex = 7;
            this.tbNotes.TextChanged += new System.EventHandler(this.tbNotes_TextChanged);
            this.tbNotes.Leave += new System.EventHandler(this.tbNotes_Leave);
            // 
            // lbGroupName
            // 
            this.lbGroupName.AutoSize = true;
            this.lbGroupName.Location = new System.Drawing.Point(8, 131);
            this.lbGroupName.Name = "lbGroupName";
            this.lbGroupName.Size = new System.Drawing.Size(67, 13);
            this.lbGroupName.TabIndex = 7;
            this.lbGroupName.Text = "Group Name";
            // 
            // tbGroupName
            // 
            this.tbGroupName.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbGroupName.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbGroupName.Location = new System.Drawing.Point(90, 127);
            this.tbGroupName.Name = "tbGroupName";
            this.tbGroupName.Size = new System.Drawing.Size(476, 23);
            this.tbGroupName.TabIndex = 5;
            this.tbGroupName.TextChanged += new System.EventHandler(this.tbGroupName_TextChanged);
            this.tbGroupName.Leave += new System.EventHandler(this.tbGroupName_Leave);
            // 
            // tbPilotName
            // 
            this.tbPilotName.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbPilotName.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbPilotName.Location = new System.Drawing.Point(90, 99);
            this.tbPilotName.Name = "tbPilotName";
            this.tbPilotName.Size = new System.Drawing.Size(476, 23);
            this.tbPilotName.TabIndex = 4;
            this.tbPilotName.TextChanged += new System.EventHandler(this.tbPilotName_TextChanged);
            this.tbPilotName.Leave += new System.EventHandler(this.tbPilotName_Leave);
            // 
            // tbCallsign
            // 
            this.tbCallsign.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbCallsign.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbCallsign.Location = new System.Drawing.Point(90, 71);
            this.tbCallsign.Name = "tbCallsign";
            this.tbCallsign.Size = new System.Drawing.Size(476, 23);
            this.tbCallsign.TabIndex = 3;
            this.tbCallsign.TextChanged += new System.EventHandler(this.tbCallsign_TextChanged);
            this.tbCallsign.Leave += new System.EventHandler(this.tbCallsign_Leave);
            // 
            // lbPilotName
            // 
            this.lbPilotName.AutoSize = true;
            this.lbPilotName.Location = new System.Drawing.Point(8, 103);
            this.lbPilotName.Name = "lbPilotName";
            this.lbPilotName.Size = new System.Drawing.Size(58, 13);
            this.lbPilotName.TabIndex = 1;
            this.lbPilotName.Text = "Pilot Name";
            // 
            // lbCallsign
            // 
            this.lbCallsign.AutoSize = true;
            this.lbCallsign.Location = new System.Drawing.Point(8, 75);
            this.lbCallsign.Name = "lbCallsign";
            this.lbCallsign.Size = new System.Drawing.Size(43, 13);
            this.lbCallsign.TabIndex = 0;
            this.lbCallsign.Text = "Callsign";
            // 
            // tmrTransmit
            // 
            this.tmrTransmit.Interval = 1000;
            this.tmrTransmit.Tick += new System.EventHandler(this.tmrTransmit_Tick);
            // 
            // gbAircraftData
            // 
            this.gbAircraftData.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gbAircraftData.Controls.Add(this.lbAircraftType);
            this.gbAircraftData.Controls.Add(this.tbAircraftType);
            this.gbAircraftData.Controls.Add(this.lbTouchdownVelocity);
            this.gbAircraftData.Controls.Add(this.tbTouchdownVelocity);
            this.gbAircraftData.Controls.Add(this.lbGroundspeed);
            this.gbAircraftData.Controls.Add(this.tbGroundspeed);
            this.gbAircraftData.Controls.Add(this.lbHeading);
            this.gbAircraftData.Controls.Add(this.tbHeading);
            this.gbAircraftData.Controls.Add(this.lbAirspeed);
            this.gbAircraftData.Controls.Add(this.lbAltitude);
            this.gbAircraftData.Controls.Add(this.tbAirspeed);
            this.gbAircraftData.Controls.Add(this.tbAltitude);
            this.gbAircraftData.Controls.Add(this.tbLatitude);
            this.gbAircraftData.Controls.Add(this.tbLongitude);
            this.gbAircraftData.Controls.Add(this.lbLatitude);
            this.gbAircraftData.Controls.Add(this.lbLongitude);
            this.gbAircraftData.Location = new System.Drawing.Point(12, 309);
            this.gbAircraftData.Name = "gbAircraftData";
            this.gbAircraftData.Size = new System.Drawing.Size(763, 246);
            this.gbAircraftData.TabIndex = 3;
            this.gbAircraftData.TabStop = false;
            this.gbAircraftData.Text = "Aircraft Data";
            // 
            // lbAircraftType
            // 
            this.lbAircraftType.AutoSize = true;
            this.lbAircraftType.Location = new System.Drawing.Point(7, 23);
            this.lbAircraftType.Name = "lbAircraftType";
            this.lbAircraftType.Size = new System.Drawing.Size(67, 13);
            this.lbAircraftType.TabIndex = 15;
            this.lbAircraftType.Text = "Aircraft Type";
            // 
            // tbAircraftType
            // 
            this.tbAircraftType.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbAircraftType.Enabled = false;
            this.tbAircraftType.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbAircraftType.Location = new System.Drawing.Point(89, 19);
            this.tbAircraftType.Name = "tbAircraftType";
            this.tbAircraftType.Size = new System.Drawing.Size(668, 22);
            this.tbAircraftType.TabIndex = 14;
            // 
            // lbTouchdownVelocity
            // 
            this.lbTouchdownVelocity.AutoSize = true;
            this.lbTouchdownVelocity.Location = new System.Drawing.Point(7, 220);
            this.lbTouchdownVelocity.Name = "lbTouchdownVelocity";
            this.lbTouchdownVelocity.Size = new System.Drawing.Size(71, 13);
            this.lbTouchdownVelocity.TabIndex = 13;
            this.lbTouchdownVelocity.Text = "Landing Rate";
            // 
            // tbTouchdownVelocity
            // 
            this.tbTouchdownVelocity.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbTouchdownVelocity.Enabled = false;
            this.tbTouchdownVelocity.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbTouchdownVelocity.Location = new System.Drawing.Point(89, 216);
            this.tbTouchdownVelocity.Name = "tbTouchdownVelocity";
            this.tbTouchdownVelocity.Size = new System.Drawing.Size(668, 22);
            this.tbTouchdownVelocity.TabIndex = 12;
            // 
            // lbGroundspeed
            // 
            this.lbGroundspeed.AutoSize = true;
            this.lbGroundspeed.Location = new System.Drawing.Point(7, 192);
            this.lbGroundspeed.Name = "lbGroundspeed";
            this.lbGroundspeed.Size = new System.Drawing.Size(71, 13);
            this.lbGroundspeed.TabIndex = 11;
            this.lbGroundspeed.Text = "Groundspeed";
            // 
            // tbGroundspeed
            // 
            this.tbGroundspeed.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbGroundspeed.Enabled = false;
            this.tbGroundspeed.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbGroundspeed.Location = new System.Drawing.Point(89, 188);
            this.tbGroundspeed.Name = "tbGroundspeed";
            this.tbGroundspeed.Size = new System.Drawing.Size(668, 22);
            this.tbGroundspeed.TabIndex = 10;
            // 
            // lbHeading
            // 
            this.lbHeading.AutoSize = true;
            this.lbHeading.Location = new System.Drawing.Point(6, 136);
            this.lbHeading.Name = "lbHeading";
            this.lbHeading.Size = new System.Drawing.Size(47, 13);
            this.lbHeading.TabIndex = 9;
            this.lbHeading.Text = "Heading";
            // 
            // tbHeading
            // 
            this.tbHeading.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbHeading.Enabled = false;
            this.tbHeading.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbHeading.Location = new System.Drawing.Point(89, 132);
            this.tbHeading.Name = "tbHeading";
            this.tbHeading.Size = new System.Drawing.Size(668, 22);
            this.tbHeading.TabIndex = 8;
            // 
            // lbAirspeed
            // 
            this.lbAirspeed.AutoSize = true;
            this.lbAirspeed.Location = new System.Drawing.Point(7, 164);
            this.lbAirspeed.Name = "lbAirspeed";
            this.lbAirspeed.Size = new System.Drawing.Size(48, 13);
            this.lbAirspeed.TabIndex = 7;
            this.lbAirspeed.Text = "Airspeed";
            // 
            // lbAltitude
            // 
            this.lbAltitude.AutoSize = true;
            this.lbAltitude.Location = new System.Drawing.Point(7, 107);
            this.lbAltitude.Name = "lbAltitude";
            this.lbAltitude.Size = new System.Drawing.Size(42, 13);
            this.lbAltitude.TabIndex = 6;
            this.lbAltitude.Text = "Altitude";
            // 
            // tbAirspeed
            // 
            this.tbAirspeed.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbAirspeed.Enabled = false;
            this.tbAirspeed.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbAirspeed.Location = new System.Drawing.Point(89, 160);
            this.tbAirspeed.Name = "tbAirspeed";
            this.tbAirspeed.Size = new System.Drawing.Size(668, 22);
            this.tbAirspeed.TabIndex = 9;
            // 
            // tbAltitude
            // 
            this.tbAltitude.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbAltitude.Enabled = false;
            this.tbAltitude.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbAltitude.Location = new System.Drawing.Point(89, 103);
            this.tbAltitude.Name = "tbAltitude";
            this.tbAltitude.Size = new System.Drawing.Size(668, 22);
            this.tbAltitude.TabIndex = 7;
            // 
            // tbLatitude
            // 
            this.tbLatitude.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbLatitude.Enabled = false;
            this.tbLatitude.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbLatitude.Location = new System.Drawing.Point(89, 47);
            this.tbLatitude.Name = "tbLatitude";
            this.tbLatitude.Size = new System.Drawing.Size(668, 22);
            this.tbLatitude.TabIndex = 6;
            // 
            // tbLongitude
            // 
            this.tbLongitude.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tbLongitude.Enabled = false;
            this.tbLongitude.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tbLongitude.Location = new System.Drawing.Point(89, 75);
            this.tbLongitude.Name = "tbLongitude";
            this.tbLongitude.Size = new System.Drawing.Size(668, 22);
            this.tbLongitude.TabIndex = 5;
            // 
            // lbLatitude
            // 
            this.lbLatitude.AutoSize = true;
            this.lbLatitude.Location = new System.Drawing.Point(6, 51);
            this.lbLatitude.Name = "lbLatitude";
            this.lbLatitude.Size = new System.Drawing.Size(45, 13);
            this.lbLatitude.TabIndex = 1;
            this.lbLatitude.Text = "Latitude";
            // 
            // lbLongitude
            // 
            this.lbLongitude.AutoSize = true;
            this.lbLongitude.Location = new System.Drawing.Point(7, 79);
            this.lbLongitude.Name = "lbLongitude";
            this.lbLongitude.Size = new System.Drawing.Size(54, 13);
            this.lbLongitude.TabIndex = 0;
            this.lbLongitude.Text = "Longitude";
            // 
            // mnuMain
            // 
            this.mnuMain.ImageScalingSize = new System.Drawing.Size(24, 24);
            this.mnuMain.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.transmitterToolStripMenuItem,
            this.viewToolStripMenuItem,
            this.linksToolStripMenuItem,
            this.helpToolStripMenuItem});
            this.mnuMain.Location = new System.Drawing.Point(0, 0);
            this.mnuMain.Name = "mnuMain";
            this.mnuMain.Padding = new System.Windows.Forms.Padding(4, 1, 0, 1);
            this.mnuMain.Size = new System.Drawing.Size(784, 24);
            this.mnuMain.TabIndex = 4;
            this.mnuMain.Text = "...";
            // 
            // transmitterToolStripMenuItem
            // 
            this.transmitterToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.autoConnectToolStripMenuItem,
            this.toolStripMenuItem4,
            this.resetSettingsToDefaultsToolStripMenuItem,
            this.toolStripMenuItem2,
            this.exitToolStripMenuItem});
            this.transmitterToolStripMenuItem.Name = "transmitterToolStripMenuItem";
            this.transmitterToolStripMenuItem.Size = new System.Drawing.Size(37, 22);
            this.transmitterToolStripMenuItem.Text = "&File";
            // 
            // autoConnectToolStripMenuItem
            // 
            this.autoConnectToolStripMenuItem.Checked = true;
            this.autoConnectToolStripMenuItem.CheckOnClick = true;
            this.autoConnectToolStripMenuItem.CheckState = System.Windows.Forms.CheckState.Checked;
            this.autoConnectToolStripMenuItem.Name = "autoConnectToolStripMenuItem";
            this.autoConnectToolStripMenuItem.Size = new System.Drawing.Size(207, 22);
            this.autoConnectToolStripMenuItem.Text = "Auto Connect";
            this.autoConnectToolStripMenuItem.Click += new System.EventHandler(this.autoConnectToolStripMenuItem_Click);
            // 
            // toolStripMenuItem4
            // 
            this.toolStripMenuItem4.Name = "toolStripMenuItem4";
            this.toolStripMenuItem4.Size = new System.Drawing.Size(204, 6);
            // 
            // resetSettingsToDefaultsToolStripMenuItem
            // 
            this.resetSettingsToDefaultsToolStripMenuItem.Name = "resetSettingsToDefaultsToolStripMenuItem";
            this.resetSettingsToDefaultsToolStripMenuItem.Size = new System.Drawing.Size(207, 22);
            this.resetSettingsToDefaultsToolStripMenuItem.Text = "&Reset Settings to Defaults";
            this.resetSettingsToDefaultsToolStripMenuItem.Click += new System.EventHandler(this.resetSettingsToDefaultsToolStripMenuItem_Click);
            // 
            // toolStripMenuItem2
            // 
            this.toolStripMenuItem2.Name = "toolStripMenuItem2";
            this.toolStripMenuItem2.Size = new System.Drawing.Size(204, 6);
            // 
            // exitToolStripMenuItem
            // 
            this.exitToolStripMenuItem.Name = "exitToolStripMenuItem";
            this.exitToolStripMenuItem.Size = new System.Drawing.Size(207, 22);
            this.exitToolStripMenuItem.Text = "E&xit";
            this.exitToolStripMenuItem.Click += new System.EventHandler(this.exitToolStripMenuItem1_Click);
            // 
            // viewToolStripMenuItem
            // 
            this.viewToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.aircraftDataToolStripMenuItem});
            this.viewToolStripMenuItem.Name = "viewToolStripMenuItem";
            this.viewToolStripMenuItem.Size = new System.Drawing.Size(44, 22);
            this.viewToolStripMenuItem.Text = "&View";
            // 
            // aircraftDataToolStripMenuItem
            // 
            this.aircraftDataToolStripMenuItem.CheckOnClick = true;
            this.aircraftDataToolStripMenuItem.Name = "aircraftDataToolStripMenuItem";
            this.aircraftDataToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.aircraftDataToolStripMenuItem.Text = "&Aircraft Data";
            this.aircraftDataToolStripMenuItem.Click += new System.EventHandler(this.aircraftDataToolStripMenuItem_Click);
            // 
            // linksToolStripMenuItem
            // 
            this.linksToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.virtualFlightOnlineToolStripMenuItem1,
            this.toolStripMenuItem1,
            this.websiteToolStripMenuItem,
            this.newsletterToolStripMenuItem,
            this.airlineToolStripMenuItem,
            this.forumsToolStripMenuItem,
            this.discordToolStripMenuItem,
            this.facebookToolStripMenuItem,
            this.transmitterToolStripMenuItem1,
            this.patreonToolStripMenuItem});
            this.linksToolStripMenuItem.Name = "linksToolStripMenuItem";
            this.linksToolStripMenuItem.Size = new System.Drawing.Size(46, 22);
            this.linksToolStripMenuItem.Text = "&Links";
            // 
            // virtualFlightOnlineToolStripMenuItem1
            // 
            this.virtualFlightOnlineToolStripMenuItem1.Enabled = false;
            this.virtualFlightOnlineToolStripMenuItem1.Name = "virtualFlightOnlineToolStripMenuItem1";
            this.virtualFlightOnlineToolStripMenuItem1.Size = new System.Drawing.Size(180, 22);
            this.virtualFlightOnlineToolStripMenuItem1.Text = "VirtualFlight.Online";
            // 
            // toolStripMenuItem1
            // 
            this.toolStripMenuItem1.Name = "toolStripMenuItem1";
            this.toolStripMenuItem1.Size = new System.Drawing.Size(177, 6);
            // 
            // websiteToolStripMenuItem
            // 
            this.websiteToolStripMenuItem.Name = "websiteToolStripMenuItem";
            this.websiteToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.websiteToolStripMenuItem.Text = "&Website";
            this.websiteToolStripMenuItem.Click += new System.EventHandler(this.websiteToolStripMenuItem_Click);
            // 
            // newsletterToolStripMenuItem
            // 
            this.newsletterToolStripMenuItem.Name = "newsletterToolStripMenuItem";
            this.newsletterToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.newsletterToolStripMenuItem.Text = "&Newsletter";
            this.newsletterToolStripMenuItem.Click += new System.EventHandler(this.newsletterToolStripMenuItem_Click);
            // 
            // airlineToolStripMenuItem
            // 
            this.airlineToolStripMenuItem.Name = "airlineToolStripMenuItem";
            this.airlineToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.airlineToolStripMenuItem.Text = "&Airline";
            this.airlineToolStripMenuItem.Click += new System.EventHandler(this.airlineToolStripMenuItem_Click);
            // 
            // forumsToolStripMenuItem
            // 
            this.forumsToolStripMenuItem.Name = "forumsToolStripMenuItem";
            this.forumsToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.forumsToolStripMenuItem.Text = "&Forums";
            this.forumsToolStripMenuItem.Click += new System.EventHandler(this.forumsToolStripMenuItem_Click);
            // 
            // discordToolStripMenuItem
            // 
            this.discordToolStripMenuItem.Name = "discordToolStripMenuItem";
            this.discordToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.discordToolStripMenuItem.Text = "&Discord";
            this.discordToolStripMenuItem.Click += new System.EventHandler(this.discordToolStripMenuItem_Click);
            // 
            // facebookToolStripMenuItem
            // 
            this.facebookToolStripMenuItem.Name = "facebookToolStripMenuItem";
            this.facebookToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.facebookToolStripMenuItem.Text = "&Facebook";
            this.facebookToolStripMenuItem.Click += new System.EventHandler(this.facebookToolStripMenuItem_Click);
            // 
            // patreonToolStripMenuItem
            // 
            this.patreonToolStripMenuItem.Name = "patreonToolStripMenuItem";
            this.patreonToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.patreonToolStripMenuItem.Text = "&Patreon";
            this.patreonToolStripMenuItem.Click += new System.EventHandler(this.patreonToolStripMenuItem_Click);
            // 
            // helpToolStripMenuItem
            // 
            this.helpToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.downloadTheSourceCodeToolStripMenuItem,
            this.toolStripMenuItem3,
            this.aboutToolStripMenuItem});
            this.helpToolStripMenuItem.Name = "helpToolStripMenuItem";
            this.helpToolStripMenuItem.Size = new System.Drawing.Size(44, 22);
            this.helpToolStripMenuItem.Text = "&Help";
            // 
            // aboutToolStripMenuItem
            // 
            this.aboutToolStripMenuItem.Name = "aboutToolStripMenuItem";
            this.aboutToolStripMenuItem.Size = new System.Drawing.Size(215, 22);
            this.aboutToolStripMenuItem.Text = "&About";
            this.aboutToolStripMenuItem.Click += new System.EventHandler(this.aboutToolStripMenuItem_Click);
            // 
            // ssMain
            // 
            this.ssMain.ImageScalingSize = new System.Drawing.Size(24, 24);
            this.ssMain.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.tsslMain});
            this.ssMain.Location = new System.Drawing.Point(0, 309);
            this.ssMain.Name = "ssMain";
            this.ssMain.Size = new System.Drawing.Size(784, 22);
            this.ssMain.TabIndex = 5;
            this.ssMain.Text = "...";
            // 
            // tsslMain
            // 
            this.tsslMain.Name = "tsslMain";
            this.tsslMain.Size = new System.Drawing.Size(16, 17);
            this.tsslMain.Text = "...";
            // 
            // tmrConnect
            // 
            this.tmrConnect.Interval = 5000;
            this.tmrConnect.Tick += new System.EventHandler(this.tmrConnect_Tick);
            // 
            // btnDisconnect
            // 
            this.btnDisconnect.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.btnDisconnect.Location = new System.Drawing.Point(576, 280);
            this.btnDisconnect.Name = "btnDisconnect";
            this.btnDisconnect.Size = new System.Drawing.Size(199, 23);
            this.btnDisconnect.TabIndex = 9;
            this.btnDisconnect.Text = "Disconnect";
            this.btnDisconnect.UseVisualStyleBackColor = true;
            this.btnDisconnect.Click += new System.EventHandler(this.btnDisconnect_Click);
            // 
            // gbServers
            // 
            this.gbServers.Controls.Add(this.btnRemoveServer);
            this.gbServers.Controls.Add(this.btnAddServer);
            this.gbServers.Controls.Add(this.lbServers);
            this.gbServers.Location = new System.Drawing.Point(12, 35);
            this.gbServers.Name = "gbServers";
            this.gbServers.Size = new System.Drawing.Size(185, 239);
            this.gbServers.TabIndex = 9;
            this.gbServers.TabStop = false;
            this.gbServers.Text = "Servers";
            // 
            // btnRemoveServer
            // 
            this.btnRemoveServer.Location = new System.Drawing.Point(99, 210);
            this.btnRemoveServer.Name = "btnRemoveServer";
            this.btnRemoveServer.Size = new System.Drawing.Size(80, 23);
            this.btnRemoveServer.TabIndex = 2;
            this.btnRemoveServer.Text = "Remove";
            this.btnRemoveServer.UseVisualStyleBackColor = true;
            this.btnRemoveServer.Click += new System.EventHandler(this.btnRemoveServer_Click);
            // 
            // btnAddServer
            // 
            this.btnAddServer.Location = new System.Drawing.Point(6, 210);
            this.btnAddServer.Name = "btnAddServer";
            this.btnAddServer.Size = new System.Drawing.Size(87, 23);
            this.btnAddServer.TabIndex = 1;
            this.btnAddServer.Text = "Add";
            this.btnAddServer.UseVisualStyleBackColor = true;
            this.btnAddServer.Click += new System.EventHandler(this.btnAddServer_Click);
            // 
            // lbServers
            // 
            this.lbServers.FormattingEnabled = true;
            this.lbServers.Location = new System.Drawing.Point(6, 19);
            this.lbServers.Name = "lbServers";
            this.lbServers.Size = new System.Drawing.Size(173, 186);
            this.lbServers.TabIndex = 0;
            this.lbServers.SelectedIndexChanged += new System.EventHandler(this.lbServers_SelectedIndexChanged);
            // 
            // transmitterToolStripMenuItem1
            // 
            this.transmitterToolStripMenuItem1.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.whosOnlineToolStripMenuItem,
            this.radarToolStripMenuItem});
            this.transmitterToolStripMenuItem1.Name = "transmitterToolStripMenuItem1";
            this.transmitterToolStripMenuItem1.Size = new System.Drawing.Size(180, 22);
            this.transmitterToolStripMenuItem1.Text = "&Transmitter";
            // 
            // whosOnlineToolStripMenuItem
            // 
            this.whosOnlineToolStripMenuItem.Name = "whosOnlineToolStripMenuItem";
            this.whosOnlineToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.whosOnlineToolStripMenuItem.Text = "&Who\'s Online";
            this.whosOnlineToolStripMenuItem.Click += new System.EventHandler(this.whosOnlineToolStripMenuItem_Click_1);
            // 
            // radarToolStripMenuItem
            // 
            this.radarToolStripMenuItem.Name = "radarToolStripMenuItem";
            this.radarToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.radarToolStripMenuItem.Text = "&Radar";
            this.radarToolStripMenuItem.Click += new System.EventHandler(this.radarToolStripMenuItem_Click_1);
            // 
            // downloadTheSourceCodeToolStripMenuItem
            // 
            this.downloadTheSourceCodeToolStripMenuItem.Name = "downloadTheSourceCodeToolStripMenuItem";
            this.downloadTheSourceCodeToolStripMenuItem.Size = new System.Drawing.Size(215, 22);
            this.downloadTheSourceCodeToolStripMenuItem.Text = "&Download the source code";
            this.downloadTheSourceCodeToolStripMenuItem.Click += new System.EventHandler(this.downloadTheSourceCodeToolStripMenuItem_Click);
            // 
            // toolStripMenuItem3
            // 
            this.toolStripMenuItem3.Name = "toolStripMenuItem3";
            this.toolStripMenuItem3.Size = new System.Drawing.Size(212, 6);
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(784, 331);
            this.Controls.Add(this.gbServers);
            this.Controls.Add(this.btnDisconnect);
            this.Controls.Add(this.btnConnect);
            this.Controls.Add(this.gbServer);
            this.Controls.Add(this.ssMain);
            this.Controls.Add(this.mnuMain);
            this.Controls.Add(this.gbAircraftData);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.mnuMain;
            this.MaximumSize = new System.Drawing.Size(800, 618);
            this.MinimumSize = new System.Drawing.Size(800, 370);
            this.Name = "frmMain";
            this.Text = "VirtualFlight.Online Transmitter";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.frmMain_FormClosing);
            this.Load += new System.EventHandler(this.frmMain_Load);
            this.gbServer.ResumeLayout(false);
            this.gbServer.PerformLayout();
            this.gbAircraftData.ResumeLayout(false);
            this.gbAircraftData.PerformLayout();
            this.mnuMain.ResumeLayout(false);
            this.mnuMain.PerformLayout();
            this.ssMain.ResumeLayout(false);
            this.ssMain.PerformLayout();
            this.gbServers.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnConnect;
        private System.Windows.Forms.GroupBox gbServer;
        private System.Windows.Forms.Timer tmrTransmit;
        private System.Windows.Forms.Label lbCallsign;
        private System.Windows.Forms.Label lbPilotName;
        private System.Windows.Forms.TextBox tbPilotName;
        private System.Windows.Forms.TextBox tbCallsign;
        private System.Windows.Forms.GroupBox gbAircraftData;
        private System.Windows.Forms.Label lbAirspeed;
        private System.Windows.Forms.Label lbAltitude;
        private System.Windows.Forms.TextBox tbAirspeed;
        private System.Windows.Forms.TextBox tbAltitude;
        private System.Windows.Forms.TextBox tbLatitude;
        private System.Windows.Forms.TextBox tbLongitude;
        private System.Windows.Forms.Label lbLatitude;
        private System.Windows.Forms.Label lbLongitude;
        private System.Windows.Forms.Label lbHeading;
        private System.Windows.Forms.TextBox tbHeading;
        private System.Windows.Forms.TextBox tbGroupName;
        private System.Windows.Forms.Label lbGroupName;
        private System.Windows.Forms.MenuStrip mnuMain;
        private System.Windows.Forms.ToolStripMenuItem helpToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem aboutToolStripMenuItem;
        private System.Windows.Forms.StatusStrip ssMain;
        private System.Windows.Forms.Label lbGroundspeed;
        private System.Windows.Forms.TextBox tbGroundspeed;
        private ToolStripMenuItem transmitterToolStripMenuItem;
        private ToolStripMenuItem resetSettingsToDefaultsToolStripMenuItem;
        private ToolStripSeparator toolStripMenuItem2;
        private ToolStripMenuItem exitToolStripMenuItem;
        private Label lbNotes;
        private TextBox tbNotes;
        private ToolStripMenuItem viewToolStripMenuItem;
        private ToolStripMenuItem aircraftDataToolStripMenuItem;
        private Label lbTouchdownVelocity;
        private TextBox tbTouchdownVelocity;
        private Label lbAircraftType;
        private TextBox tbAircraftType;
        private Label label1;
        private ComboBox cbMSFSServer;
        private Timer tmrConnect;
        private ToolStripStatusLabel tsslMain;
        private ToolStripMenuItem autoConnectToolStripMenuItem;
        private Button btnDisconnect;
        private ToolStripSeparator toolStripMenuItem4;
        private Label lbServer;
        private TextBox tbServerURL;
        private Label lbPin;
        private TextBox tbPin;
        private GroupBox gbServers;
        private Button btnRemoveServer;
        private Button btnAddServer;
        private ListBox lbServers;
        private Label lbServerName;
        private TextBox tbServerName;
        private ToolStripMenuItem linksToolStripMenuItem;
        private ToolStripMenuItem virtualFlightOnlineToolStripMenuItem1;
        private ToolStripMenuItem newsletterToolStripMenuItem;
        private ToolStripMenuItem airlineToolStripMenuItem;
        private ToolStripMenuItem forumsToolStripMenuItem;
        private ToolStripMenuItem discordToolStripMenuItem;
        private ToolStripMenuItem facebookToolStripMenuItem;
        private ToolStripMenuItem patreonToolStripMenuItem;
        private ToolStripSeparator toolStripMenuItem1;
        private ToolStripMenuItem websiteToolStripMenuItem;
        private ToolStripMenuItem transmitterToolStripMenuItem1;
        private ToolStripMenuItem whosOnlineToolStripMenuItem;
        private ToolStripMenuItem radarToolStripMenuItem;
        private ToolStripMenuItem downloadTheSourceCodeToolStripMenuItem;
        private ToolStripSeparator toolStripMenuItem3;
    }
}


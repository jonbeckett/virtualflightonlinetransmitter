; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "Transmitter"
#define MyAppVersion "1.0.1.14"
#define MyAppPublisher "Jonathan Beckett"
#define MyAppURL "https://virtualflight.online"
#define MyAppExeName "Transmitter.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{2435F882-5856-40D6-ABB7-B9ECF3A37E06}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=commandline
OutputDir=D:\Projects\virtualflightonlinetransmitter\installer
OutputBaseFilename=transmitter_installer
SetupIconFile=D:\Projects\virtualflightonlinetransmitter\client\virtualflightonline128x128.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UsePreviousAppDir=false


[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Runtime.CompilerServices.Unsafe.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Text.Encodings.Web.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Text.Encodings.Web.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Text.Json.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Text.Json.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Threading.Tasks.Extensions.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Threading.Tasks.Extensions.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.ValueTuple.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.ValueTuple.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Transmitter.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Transmitter.exe.config"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Transmitter.pdb"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\CTrue.FsConnect.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\CTrue.FsConnect.Managers.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\CTrue.FsConnect.Managers.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\CTrue.FsConnect.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.Bcl.AsyncInterfaces.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.Bcl.AsyncInterfaces.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.Extensions.Logging.Console.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.Extensions.Logging.Console.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.FlightSimulator.SimConnect.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Microsoft.SyndicationFeed.ReaderWriter.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Newtonsoft.Json.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Newtonsoft.Json.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Serilog.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\Serilog.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\SimConnect.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Buffers.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Buffers.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Diagnostics.DiagnosticSource.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Diagnostics.DiagnosticSource.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Memory.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Memory.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Numerics.Vectors.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Numerics.Vectors.xml"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projects\virtualflightonlinetransmitter\client\bin\Debug\System.Runtime.CompilerServices.Unsafe.dll"; DestDir: "{app}"; Flags: ignoreversion


; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
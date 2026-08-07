[Setup]
AppName=Teyvat Observatory
AppVersion=2.0.0
AppPublisher=Teyvat Observatory
AppPublisherURL=https://github.com
DefaultDirName={autopf}\Teyvat Observatory
DefaultGroupName=Teyvat Observatory
AllowNoIcons=yes
OutputDir=releases
OutputBaseFilename=Teyvat Observatory Setup 2.0.0
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "releases\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Teyvat Observatory"; Filename: "{app}\Teyvat Observatory.exe"
Name: "{group}\{cm:UninstallProgram,Teyvat Observatory}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Teyvat Observatory"; Filename: "{app}\Teyvat Observatory.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\Teyvat Observatory.exe"; Description: "{cm:LaunchProgram,Teyvat Observatory}"; Flags: nowait postinstall skipifsilent

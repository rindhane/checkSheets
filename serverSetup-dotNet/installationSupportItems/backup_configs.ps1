$backupFolder="backup_existing_configs" ;
$supportFolder="installationSupportItems" ;
mkdir $backupFolder ;
cd ..\QdasCheckSheetWebApp ;
cp ServerConfig.json ..\$supportFolder\$backupFolder\ -Force ;
#cp QdasConfig.toml ..\$supportFolder\$backupFolder\  -Force ;
#cp -r checkSheetsData ..\$supportFolder\$backupFolder\ -Force;
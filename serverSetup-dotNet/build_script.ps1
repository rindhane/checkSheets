$buildFolder="publish";
$appFolder="QdasCheckSheetWebApp";
$DataStorage1="checkSheetsData" ;
$DataStorage2="dataFromOperation" ;
$sqlScriptFolder="..\dotnetDBConnector\SqlSetupScripts\*";
$installSupportItems="installationSupportItems";
rm -r $appFolder ;
mkdir $appFolder ;
dotnet publish -c Release -r win-x64 --self-contained true -o $buildFolder ;
#dotnet publish -c Release -r linux-x64 --self-contained true -o $buildFolder; #not working
mv $buildFolder\* $appFolder ;
# collect all items for creating the package
cp -r wwwroot $appFolder;
cp -r $DataStorage1 $appFolder;
cp -r $DataStorage2 $appFolder;
cp ServerConfig.json $appFolder;
cp $sqlScriptFolder $installSupportItems;
#cp QdasConfig.toml $appFolder;
Compress-Archive -Path $appFolder ,
                        $installSupportItems,
                        StartUpScript.cmd `
                -DestinationPath $appFolder".zip";
rm -r $appFolder\* ;
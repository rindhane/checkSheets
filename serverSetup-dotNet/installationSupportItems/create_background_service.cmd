@echo off
set serviceName=QdasT
set path=%cd%
set qdasFolder=QdasCheckSheetWebApp
set serviceFile=backendServerApp.exe
cd %path%\..\%qdasFolder%
::set the path of webservice path in the workdir
set workdir=%cd%
set sc=c:\Windows\System32\sc.exe
:: creating the service for qdas Traceability Application 
:: ref: https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sc-create
%sc% create "%serviceName%" binpath="%workdir%\%serviceFile%" start= auto
:: ref : https://learn.microsoft.com/en-us/dotnet/core/extensions/windows-service#configure-the-windows-service
%sc% failure "%serviceName%" reset=0 actions=restart/60000/restart/60000/run/1000
::
set /p "input=please press enter to close the script" 
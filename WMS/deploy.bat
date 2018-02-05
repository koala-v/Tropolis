@echo on
set target="\\192.168.0.230\wwwroot\app\wms\Tropolis"
xcopy /y/e/s www %target%\www

pause

copy /y index.html %target%
copy /y update.json %target%
copy /y Tropolis.apk %target%\Tropolis.apk
del Tropolis.apk /f /q

pause 
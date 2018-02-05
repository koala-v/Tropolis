@echo on

call cordova build --release android

pause 

cd platforms\android\build\outputs\apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../key.keystore android-armv7-release-unsigned.apk alias_name

F:\Android\sdk\android-sdk\build-tools\22.0.1\zipalign.exe -v 4 android-armv7-release-unsigned.apk Tropolis.apk

xcopy /y "%~dp0platforms\android\build\outputs\apk\Tropolis.apk" "%~dp0"

del "%~dp0platforms\android\build\outputs\apk\Tropolis.apk" /f /q

pause
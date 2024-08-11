@ECHO OFF
title DB Browser for SQLite Wrapper

if not exist ".db4s\DB Browser for SQLite.exe" (
	echo ^>Downloading and extracting DB Browser for SQLite...
	mkdir .tmp 2>nul
	mkdir .db4s
	powershell -command "Start-BitsTransfer -Source https://nightlies.sqlitebrowser.org/latest/DB.Browser.for.SQLite-win64.zip -Destination .tmp\db4s.zip"
	powershell -command "Expand-Archive .tmp\db4s.zip .db4s"
	del .tmp\db4s.zip
	rmdir /q .tmp 2>nul
)

start "" ".db4s\DB Browser for SQLite.exe" database.sqlite

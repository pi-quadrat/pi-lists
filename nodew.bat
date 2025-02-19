@ECHO OFF
title Node Wrapper

if not exist ".node\node.exe" (
	echo ^>Downloading and extracting Node...
	mkdir .tmp 2>nul
	powershell -command "Start-BitsTransfer -Source https://nodejs.org/dist/v22.6.0/node-v22.6.0-win-x64.zip -Destination .tmp\node.zip"
	powershell -command "Expand-Archive -Force .tmp\node.zip .tmp"
	move /y .tmp\node-v22.6.0-win-x64 .node
	del .tmp\node.zip
	rmdir /q .tmp 2>nul
)

setlocal
set PATH=%PATH%;.node

echo ^>npm install
call npm install || pause

echo ^>npm run dev
call npm run dev || pause

endlocal
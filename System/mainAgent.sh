#!/bin/sh
cd
cd /home/root/FirmwareGateway
folder_path="/home/root/FirmwareGateway/log/MainAgentLog"
if [ ! -d "$folder_path" ]; then
    mkdir -p $folder_path
fi

LOG_FILE="$(date +"%d_%m_%yt%Hh%Mm%Ss").txt"
node MainAgent.js > $folder_path/$LOG_FILE
sleep 1

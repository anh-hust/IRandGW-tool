#!/bin/sh
#echo "AUTO_RUN..."
cd
cd /home/anhbt/test
folder_path="/home/anhbt/test"
if [ ! -d "$folder_path" ]; then
    mkdir -m777 -p $folder_path
fi

LOG_FILE="$(date +"%d_%m_%yt%Hh_%Mm").txt"
touch $LOG_FILE
chmod 777 $LOG_FILE
/usr/bin/node MainAgent.js > ./test.txt
#$folder_path/$LOG_FILE 
#2>&1 &
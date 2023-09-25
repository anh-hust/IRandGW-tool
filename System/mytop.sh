#Set up env to "compile" (ex: !/bin/node)
#!/bin/sh
clear

rm -r "$HOME/log/$(date -d '-1 day' +%d_%m_%y)"

PARENT_FOLDER="$HOME/log/$(date +%d_%m_%y)"
mkdir -p $PARENT_FOLDER
cd $PARENT_FOLDER

# Specify the log file
LOG_FILE="$(date +"%H_%M").txt"
touch $LOG_FILE

# Loop indefinitely to keep appending updates with newline characters
while true; do
  (date +%d-%m-%y\ "%H:%M:%S") >> $LOG_FILE
  (top -b -n1 | grep Main) >> $LOG_FILE
  echo "" >> "$LOG_FILE"  # Append a newline character
  sleep 1  # Adjust the sleep duration to control update frequency
done

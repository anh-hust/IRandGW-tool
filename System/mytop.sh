#Set up env to "compile" (ex: !/bin/node)
#!/bin/sh
clear

PARENT_FOLDER="$HOME/log/$(date +%d_%m_%y)"

# remove all, except "this day" log folder
cd $HOME/log
for FILE in *; do
  if [[ "$FILE" != "$(date +%d_%m_%y)" ]]; then 
    rm -rv "$FILE"
  fi
done

# Go to log folder
mkdir -p $PARENT_FOLDER
cd $PARENT_FOLDER

# Specify the log file
LOG_FILE="$(date +"%H_%M").txt"
touch $LOG_FILE

# Loop indefinitely to keep appending updates
while true; do
  (date +%d-%m-%y\ "%H:%M:%S") >> $LOG_FILE
  (top -b -n1 | grep Main) >> $LOG_FILE
  echo "" >> "$LOG_FILE"  # Append a newline character
  sleep 1  # Adjust the sleep duration to control update frequency
done

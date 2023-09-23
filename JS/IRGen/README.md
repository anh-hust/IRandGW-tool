## Environment require:

1. NodeJS
2. Mosquitto
3. npm package: nedb, express, body-parser, cors, mqtt, node-fetch, nodejs. archiver, zlib, path

## STEP 1: Setup tool by command

### Download essential

1. Download and install [NodeJS](https://nodejs.org/en/download/current)

2. Then run some command

```
npm init -y
```

```
npm install nedb fs mqtt express cors path
```

## STEP 2: Set up Mosquitto

1. Download and install [Mosquitto](https://github.com/benbalter/word-to-markdown)

2. Create file <name_of_config_file>.conf with content:

```
listener 1883
allow_anonymous=true
```

## STEP 3: Run tool

1. Open MQTT broker using Mosquitto

```
sudo mosquitto -c <path_to_.conf_file>.conf
```

2. NodeJS (Server side)

```
node server.js
```

3. After collect done, reloadDB

```
node reloadDB.js
```

3. And you can also check which DB need to maintain, the result export to checkMaintain_result.txt

```
node checkMaintain.js
```

3. And you can also make remoteList CSV file of all remote you already collect

```
node genCSVremoteList.js
```

# Overview

## Server side

Subcribe these topic:

```

1. data
3. checkedData

```

Publish to topic

```

control

```

### Function of server

#### FE MANIPULATE

1. Collect IR signal of button
2. Override already collected button
3. Delete already existed button
4. Check button
5. Override checked button
6. Delete checked button
7. Send raw of specific button

## ESP side

Subcribe for topic

```

control

```

Publish to these topic

```

1. data
3. checkedData

```

### Function of ESP

1. Listen IR signal and handle depend on command from server
2. Encode and decode IR signal

# Message Format

## DOWNLINK, from Server to ESP

- control topic

**To read (listen) IR singal**

```

{
"cmd": "read"
}

```

**To test IR signal**

```

{
"cmd": "check",
"code": "<encoded IR signal>"
}

```

**To convert DB to new format**

```

{
"cmd": "convert",
"code": "<encoded DB signal>"
}

```

## UPLINK, from ESP to server

- convertedData topic

```

{
"mapping_code": "<mapping code>"
}

```

- data topic

```

{
"code": "<encoded IR signal>",
"mapping_code": "<mapping code>"
}

```

- checkedData topic

```

{
"mapping_code": "<mapping code>"
}

```

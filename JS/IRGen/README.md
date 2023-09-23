## Environment require:

1. NodeJS
2. Mosquitto
3. npm package: nedb, express, body-parser, cors, mqtt, node-fetch, nodejs. archiver, zlib, path

## STEP 1: Setup tool by command

### Download essential

```
npm init -y
```

```
npm install nedb express body-parser cors mqtt node-fetch nodejs archiver path zlib
```

### Make script command npm

## STEP 1: Set up Mosquitto

1. Download and install [Mosquitto](https://github.com/benbalter/word-to-markdown)

2. Create file <name_of_config_file>.conf with content:

```
listener 1883
allow_anonymous=true
```

## STEP 2: Run tool

1. Mosquitto

```
sudo mosquitto -c <path_to_.conf_file>
```

2. NodeJS (Server)

```
node server.js
```

3. After collect done, reloadDB

```
node reloadDB.js
```

3. And you can also check which DB need to maintain

```
node checkProtocolDB.js
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
2. convertedData (no longer available)
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

#### DEPRECATE

1. Encode whole database
2. Convert database to new format

## ESP side

Subcribe for topic

```

control

```

Publish to these topic

```

1. data
2. convertedData (no longer available)
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

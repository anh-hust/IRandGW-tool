## SET UP MANUAL

### 1. Open HOSPOT ON LAPTOP

- For window [click here](https://support.microsoft.com/en-us/windows/use-your-windows-pc-as-a-mobile-hotspot-c89b0fad-72d5-41e8-f7ea-406ad9036b85)

- For Ubuntu [click here](https://help.ubuntu.com/stable/ubuntu-help/net-wireless-adhoc.html.en)

### 2. Determine the MQTT server (broker) address running locally on your machine

```
ip r
```

### 3. Run MQTT server

**3.1. Insert this content into myMQTTconfig.conf**

```
listener 1883
allow_anonymous true
```

**3.2. Run MQTT broker**

```
sudo mosquitto -c <full_path_to_conf_file_you_just_create>
```

### 4. Config MACROS for connection of ESP32

**4.1. Open project by PlatformIO**

**4.2. In _/include/main.h_ change these parameter**

```
const char* ssid = "<SSID_host_port_at_step_1>";
const char* password = "<pasword_host_port_at_step_1>";

#define MQTT_SERVER "<IP_address_of_HOSTPORT_SERVER_at_step_2>"
```

## All done!!! Enjoy and collect & check IR signal

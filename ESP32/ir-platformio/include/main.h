#ifndef __MAIN_H__
#define __MAIN_H__

#include <IRac.h>
#include <IRrecv.h>
#include <IRremoteESP8266.h>
#include <IRtext.h>
#include <IRutils.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <vector>

// const char* ssid = "HDWifi";
// const char* password = "hnh433429";

// const char* ssid = "CAM_TEST2";
// const char* password = "1234567890";

const char* ssid = "athinkbook";
const char* password = "btaANH00";

// const char *ssid = "CAM_TEST_EN";
// const char *password = "taokhongbiet";

// const char* ssid = "labhw";
// const char* password = "khongpass";

/** Define Macros */
// #define MQTT_SERVER "192.168.201.27"
// #define MQTT_SERVER "192.168.88.100"
// #define MQTT_SERVER "192.168.1.5"
#define MQTT_SERVER "172.17.0.1"

/** MQTT MACROS */
#define MQTT_PORT 1883
#define SUB_TOPIC "control"
#define PUB_DATA_TOPIC "data"
#define PUB_CONVERT_DATA_TOPIC "convertedData"
#define PUB_CHECK_DATA_TOPIC "checkedData"
#define PUB_SEND_RAW_TOPIC "sendRaw"

#define COLLECT_COMMAND "read"
#define CONVERT_COMMAND "convert"
#define CHECK_COMMAND "check"
#define SEND_RAW_COMMAND "sendRaw"

/** IR MACROS */
#define LED_START 3 // blink when sense IR coming
// #define LED_START 23 // ON to notify start receive IR signal
// #define GND_PIN 22 // ON to notify start receive IR signal
#define IR_SEND_PIN 18
#define IR_RECEIVE_PIN 22
#define IR_BUFFER_SIZE (uint16_t)2048
#define IR_TOLERANCE 25
#define IR_TIMEOUT 50
#define IR_RAW_TICK 2
#define IR_MIN_UNKNOWN_SIZE 12
#define ROUND_SPACE (50 / 2)

struct ControlCommand {
    String cmd;
    String data;
};

/**
  ===== function declaration =====
*/
void setup_wifi();
void connect_to_broker();
// call back function when MQTT message come
void callback(char* topic, byte* payload, unsigned int length);

/* Use for collect */
// open pin to listen IR signal
void listenIR();
String checkIR(String encodedDataFromDB);

// open pin to listen IR signal
bool sendAndListenIR(String encodedDataFromDB);

ControlCommand* parseCommand(const char* command, unsigned int length);
/* Use for test */
// decode IR signal Tastoma format
void decode(const char* encodedRaw);

String encodeRaw(decode_results* results);

// round up the raw code, avoid alphabet character overflow when try encode raw data to string
void roudizeRaw(decode_results* results);

#endif
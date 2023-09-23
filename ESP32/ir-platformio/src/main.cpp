#include "main.h"

WiFiClient wifiClient;
PubSubClient client(wifiClient);

IRrecv irrecv(IR_RECEIVE_PIN, IR_BUFFER_SIZE, IR_TIMEOUT, true);
decode_results results;

IRsend irsend(IR_SEND_PIN); // Set the GPIO to be used to sending the message.

void setup()
{
    Serial.begin(115200);
    Serial.setTimeout(500);

    /** IR setup */
    pinMode(LED_START, OUTPUT);
    // pinMode(LED_START, OUTPUT);
    // pinMode(GND_PIN, OUTPUT);
    irsend.begin();

    // Receiver actiev
    irrecv.setUnknownThreshold(IR_MIN_UNKNOWN_SIZE);
    irrecv.setTolerance(IR_TOLERANCE); // Override the default tolerance.
    irrecv.enableIRIn(); // Start the receiver

    /** Wifi set up */
    setup_wifi();

    /** MQTT setup */
    client.setServer(MQTT_SERVER, MQTT_PORT);
    client.setCallback(callback);
    client.setBufferSize(4096);
    connect_to_broker();
}

void loop()
{
    client.loop();
    if (!client.connected()) {
        connect_to_broker();
    }
}

/**
    Connect wifi
*/
void setup_wifi()
{
    Serial.print("Connecting to ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    // digitalWrite(GND_PIN, 0);
}

/**
  ===== Connect & Subcribe =====
*/
void connect_to_broker()
{
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        String clientId = "slave";

        if (client.connect(clientId.c_str())) {
            Serial.println("connected");
            client.subscribe(SUB_TOPIC);
            Serial.printf("Subcribe to topic: %s\n", SUB_TOPIC);
        }

        else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 3 seconds");
            delay(3000);
        }
    }
}

/**
  ===== Callback func when SUB_TOPIC have value =====
*/
void callback(char* topic, byte* payload, unsigned int length)
{
    Serial.println();
    Serial.println();
    Serial.println();
    Serial.println("------------ new message from broker ------------");
    Serial.print("topic: ");
    Serial.println(topic);
    Serial.print("message: ");
    Serial.write(payload, length);

    char* payloadData = (char*)calloc(length + 1, sizeof(char));

    for (int16_t i = length - 1; i >= 0; i--) {
        payloadData[i] = payload[i];
    }

    payloadData[length] = '\0';

    // Serial.printf("\nPayload copy: %s", payloadData);

    ControlCommand* controlCommand = parseCommand(payloadData, length);
    Serial.println("\nParse control command\nCommand: " + controlCommand->cmd + "\nData: " + controlCommand->data);

    // if have command read from server
    if (controlCommand->cmd.equals(COLLECT_COMMAND)) {
        Serial.println("*****===== READ COMMAND =====*****");
        // turn on LED to notify start to listen signal
        digitalWrite(LED_START, 1);
        listenIR();
        // roudizeRaw(&results);
        String data;
        data = "{\"code\":\"";

        data += encodeRaw(&results);
        data += "\",";

        // decoded field
        data += "\"mapping_code\":\"";
        data += String(results.decode_type) + "_" + String(results.command) + "_" + String(results.address) + "_" + String(results.value) + "\"";

        data += "}";

        Serial.printf("\n\nPackage to send:\n%s\n", data.c_str());
        Serial.println("Success receive & package data !!!");

        client.publish(PUB_DATA_TOPIC, data.c_str());
        Serial.println("Publish data to server is completed ---");
        digitalWrite(LED_START, 0);

    } else if (controlCommand->cmd.equals(CHECK_COMMAND)) {
        Serial.println("*****===== CHECK COMMAND =====*****");
        // turn on LED to notify start to listen signal
        digitalWrite(LED_START, 1);
        listenIR(); // roudizeRaw(&results);
        String data;

        // decoded field
        data = "{\"mapping_code\":";
        data += "\"" + String(results.decode_type) + "_" + String(results.command) + "_" + String(results.address) + "_" + String(results.value) + "\",";
        data += "\"length\":" + String(results.rawlen);
        data += "}";

        Serial.printf("\n%s\n", data.c_str());
        Serial.println("Success receive & package mapping_data !!!");

        client.publish(PUB_CHECK_DATA_TOPIC, data.c_str());
        Serial.println("Publish mapping_data to server is completed ---");
        digitalWrite(LED_START, 0);
    }

    else if (controlCommand->cmd.equals(SEND_RAW_COMMAND)) {
        Serial.println("*****===== SEND RAW COMMAND =====*****");
        // turn on LED to notify start to listen signal
        digitalWrite(LED_START, 1);
        decode(controlCommand->data.c_str());
        irsend.sendRaw((const uint16_t*)results.rawbuf, results.rawlen, 38); // Send a raw data capture at 38kHz.
        Serial.println("Send raw: [");
        for (int i = 0; i < results.rawlen; i++) {
            Serial.print(String(results.rawbuf[i]) + ",");
        }
        Serial.println(']');

        // roudizeRaw(&results);
        String response = "{\"status\":1}";

        client.publish(PUB_SEND_RAW_TOPIC, response.c_str());
        Serial.println("Publish mapping_data to server is completed ---");
        digitalWrite(LED_START, 0);
    } else {
        Serial.println("COMMAND NOT AVAILABLE !!!");
    }

    // free to avoid mem leak
    free(payloadData);
    free(controlCommand);
}

// read IR and convert from uint16_t array to String
void listenIR()
{
    bool flag = 0;
    // irrecv.enableIRIn(); // Start the receiver
    /* While loop until temp take raw Data */
    do {
        if (irrecv.decode(&results)) {
            /** Check overflow */
            if (results.overflow || results.rawlen < 30) {
                Serial.println("Overflow || Noise");
            } else {
                flag = 1;
                Serial.print("Length raw: ");
                Serial.println(results.rawlen);
            }
        }

    } while (!flag);
    // irrecv.disableIRIn();
    Serial.println(resultToSourceCode(&results));
    // Serial.print(resultToHumanReadableBasic(&results));
}

ControlCommand* parseCommand(const char* command, unsigned int length)
{
    uint8_t quoteCount = 0; // 2 quote --> an key or fucking value
    ControlCommand* controlCommand = new ControlCommand;

    // we ignore {} of JSON
    for (int i = 1; i < length - 1; i++) {
        if (command[i] == '"') {
            quoteCount += 1;
        }
        if (quoteCount == 3) {
            // take all command value
            controlCommand->cmd += command[i];
        }
        if (quoteCount == 7) {
            // take all data value
            controlCommand->data += command[i];
        }
        if (quoteCount == 8) {
            break;
        }
    }

    controlCommand->cmd = controlCommand->cmd.substring(1, controlCommand->cmd.length());
    controlCommand->data = controlCommand->data.substring(1, controlCommand->data.length());

    return controlCommand;
}

void decode(const char* encodedRaw)
{
    // fresh data
    results.rawlen = 0;
    results.rawbuf = nullptr;

    uint16_t rawLength = strlen(encodedRaw);

    uint16_t numberHandler = 0; // xu ly chuoi so
    uint8_t flagToTakeNumber = false;
    uint16_t tastomaCode[26] = { 0 }; // 26 ki tu trong alphabet
    uint16_t tastomaCount = 0; // theo doi vi tri mang cua tastoma
    uint16_t rawDataCount = 0; // size cua rawdata

    // determine size of outp[ut array
    for (int16_t i = rawLength - 1; i >= 0; i--) {
        // if alphabet and + or -, increase size of raw data to 1
        if ((encodedRaw[i] >= 'a' && encodedRaw[i] <= 'z') || (encodedRaw[i] >= 'A' && encodedRaw[i] <= 'Z') || encodedRaw[i] == '+' || encodedRaw[i] == '-') {
            // cout << encodedRaw[i] << endl;
            results.rawlen += 1;
        }
    }

    // init output array
    results.rawbuf = new uint16_t[results.rawlen];

    // decode phase
    for (int16_t i = 0; i < rawLength; i++) {
        if (numberHandler && flagToTakeNumber) {
            results.rawbuf[rawDataCount] = numberHandler; // =0
            rawDataCount += 1;
            if (tastomaCount < 26) {
                tastomaCode[tastomaCount] = numberHandler;
                // at index 25 (Z or z) do not count ++ anymore
                tastomaCount += 1; // to next position in array tastoma code
            }
            numberHandler = 0;
            flagToTakeNumber = false;
        }
        if (encodedRaw[i] >= '0' && encodedRaw[i] <= '9') {
            // if number
            numberHandler = numberHandler * 10 + encodedRaw[i] - '0';
        } else {
            // at start of '+' or '-' symbol, do not raise flag (numberHandler at first numbersymbol)
            if (numberHandler > 10)
                flagToTakeNumber = true;

            if (numberHandler && flagToTakeNumber) {
                results.rawbuf[rawDataCount] = numberHandler; // =0
                rawDataCount += 1;
                if (tastomaCount < 26) {
                    tastomaCode[tastomaCount] = numberHandler;
                    // at index 25 (Z or z) do not count ++ anymore
                    tastomaCount += 1; // to next position in array tastoma code
                }
                numberHandler = 0;
                flagToTakeNumber = false;
            }
            // if lowercase
            if (encodedRaw[i] >= 'a' && encodedRaw[i] <= 'z') {
                results.rawbuf[rawDataCount] = tastomaCode[encodedRaw[i] - 'a'];
                rawDataCount += 1;
            }
            if (encodedRaw[i] >= 'A' && encodedRaw[i] <= 'Z') {
                // else upper case
                results.rawbuf[rawDataCount] = tastomaCode[encodedRaw[i] - 'A'];
                rawDataCount += 1;
            }
        }
    }

    // last remaining
    if (numberHandler) {
        results.rawbuf[rawDataCount] = numberHandler;
    }
}

String encodeRaw(decode_results* results)
{
    String encodedRaw = "";
    uint32_t mappingArray[26] = { 0 }; // hold the value, the index as A(a) to Z(z)
    uint16_t tastomaCount = 0; // trace the index of mappingArray
    bool isExisted;

    for (int16_t index = 1; index < results->rawlen; index++) {
        isExisted = false;
        // check if the number can encode as alphabet

        for (int16_t key = 0; key < 26; key++) {
            // in element not fill yet
            if (mappingArray[key] == 0)
                break;
            if (results->rawbuf[index] * IR_RAW_TICK == mappingArray[key]) {
                if (index % 2 == 1) {
                    encodedRaw += (char)('A' + key); // uppercase
                } else {
                    encodedRaw += (char)('a' + key); // lowercase
                }
                isExisted = true;
                break;
            }
        }
        // if element duplicate with mapping array --> continue
        if (isExisted) {
            continue;
        }
        // if array still remain alphabet pool
        if (tastomaCount < 26) {
            // if not in mappingArray, so it become element of mappingArray
            if (index % 2 == 1)
                encodedRaw += "+" + String(results->rawbuf[index] * IR_RAW_TICK);
            else
                encodedRaw += "-" + String(results->rawbuf[index] * IR_RAW_TICK);
            mappingArray[tastomaCount] = results->rawbuf[index] * IR_RAW_TICK;
            // at 25 (Z or z) do not count tastomaCount anymore
            tastomaCount += 1;
        }
        // if exceed Z or z, do not encode as alphabet anymore
        else {
            if (index % 2 == 1)
                encodedRaw += "+" + String(results->rawbuf[index] * IR_RAW_TICK);
            else
                encodedRaw += "-" + String(results->rawbuf[index] * IR_RAW_TICK);
        }
    }

    return encodedRaw;
}

void roudizeRaw(decode_results* results)
{
    Serial.println("After round nearest raw data array (round space is 50):");
    for (int16_t i = results->rawlen - 1; i > 0; i--) {
        uint8_t remainder = results->rawbuf[i] % ROUND_SPACE;
        if (remainder >= (ROUND_SPACE + ROUND_SPACE / 2)) {
            results->rawbuf[i] = results->rawbuf[i] - remainder + ROUND_SPACE * 2; // from =75 to 100 --> ceil to 100
        } else if (remainder > ROUND_SPACE && remainder < (ROUND_SPACE + ROUND_SPACE / 2)) {
            results->rawbuf[i] = results->rawbuf[i] - remainder + ROUND_SPACE; // from 50 to 75 --> floor to 50
        } else if (remainder >= (ROUND_SPACE / 2) && remainder < ROUND_SPACE) {
            results->rawbuf[i] = results->rawbuf[i] - remainder + ROUND_SPACE; // from =25 to 50 --> ceil to 50
        } else if (remainder < (ROUND_SPACE / 2)) {
            results->rawbuf[i] = results->rawbuf[i] - remainder; // less than 25 --> floor to 0
        } else {
            continue; // 50 --> do nothing
        }
    }

    for (int16_t i = 1; i < results->rawlen; i++) {
        Serial.printf("%u, ", results->rawbuf[i] * 2);
    }
}
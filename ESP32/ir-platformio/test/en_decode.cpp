#include <iostream>
#include <stdint.h>
#include <string.h>

using namespace std;

#define IR_RAW_TICK 2

class decode_results {
public:
    uint16_t* rawbuf; // Raw intervals in .5 us ticks
    uint16_t rawlen; // Number of records in rawbuf.
};

decode_results decode_result;

// typedef struct RawData {
//     uint16_t* raw;
//     uint16_t size = 0;
// } RawData;

// RawData rawData;

string encodeRaw(decode_results* results)
{
    string encodedRaw = "";
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
                encodedRaw += "+" + to_string(results->rawbuf[index] * IR_RAW_TICK);
            else
                encodedRaw += "-" + to_string(results->rawbuf[index] * IR_RAW_TICK);
            mappingArray[tastomaCount] = results->rawbuf[index] * IR_RAW_TICK;
            // at 25 (Z or z) do not count tastomaCount anymore
            tastomaCount += 1;
        }
        // if exceed Z or z, do not encode as alphabet anymore
        else {
            if (index % 2 == 1)
                encodedRaw += "+" + to_string(results->rawbuf[index] * IR_RAW_TICK);
            else
                encodedRaw += "-" + to_string(results->rawbuf[index] * IR_RAW_TICK);
        }
    }

    cout << "Tas array" << endl;
    for (int i = 0; i < 26; i++) {
        cout << mappingArray[i] << ",";
    }
    cout << endl
         << "Tastoma count = " << tastomaCount
         << endl;
    return encodedRaw;
}

void decode(const char* encodedRaw)
{
    // fresh data
    decode_result.rawlen = 0;
    decode_result.rawbuf = nullptr;

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
            decode_result.rawlen += 1;
        }
    }

    // init output array
    cout << "Size: " << decode_result.rawlen << endl;
    decode_result.rawbuf = new uint16_t[decode_result.rawlen];

    // decode phase
    for (int16_t i = 0; i < rawLength; i++) {
        if (numberHandler && flagToTakeNumber) {
            decode_result.rawbuf[rawDataCount] = numberHandler; // =0
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
                decode_result.rawbuf[rawDataCount] = numberHandler; // =0
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
                decode_result.rawbuf[rawDataCount] = tastomaCode[encodedRaw[i] - 'a'];
                rawDataCount += 1;
            }
            if (encodedRaw[i] >= 'A' && encodedRaw[i] <= 'Z') {
                // else upper case
                decode_result.rawbuf[rawDataCount] = tastomaCode[encodedRaw[i] - 'A'];
                rawDataCount += 1;
            }
        }
    }

    // last remaining
    if (numberHandler) {
        decode_result.rawbuf[rawDataCount] = numberHandler;
    }

    cout << "Tas array" << endl;
    for (int i = 0; i < 26; i++) {
        cout << tastomaCode[i] << ",";
    }
    cout << endl
         << endl;
}

int main()
{
    uint16_t raw[] = { 1, 1244, 476, 1254, 462, 444, 1276, 1246, 474, 1256, 460, 440, 1278, 446, 1274, 1248, 470, 436, 1286, 444, 1278, 438, 1280, 440, 8140, 1262, 458, 1258, 460, 440, 1280, 1250, 470, 1258, 458, 442, 1278, 440, 1276, 1252, 466, 438, 1282, 442, 1278, 440, 1274, 442, 8142, 1260, 458, 1246, 472, 444, 1272, 1254, 468, 1244, 474, 442, 1276, 446, 1272, 1252, 468, 440, 1280, 438, 1278, 440, 1280, 442, 8142, 1254, 462, 1250, 470, 440, 1278, 1246, 472, 1256, 460, 438, 1280, 466, 1258, 1256, 458, 446, 1272, 442, 1276, 440, 1280, 440, 8144, 1244, 476, 1256, 464, 440, 1278, 1258, 458, 1248, 472, 442, 1276, 440, 1276, 1248, 470, 438, 1282, 442, 1274, 442, 1274, 468 };
    decode_result.rawbuf = raw;
    decode_result.rawlen = 119 + 1;

    // cout << "===== Encode phase" << endl;
    // string encodedRaw = encodeRaw(&decode_result);
    // cout << encodedRaw << endl;
    // cout << "Length = " << encodedRaw.length() << endl;
    // cout << endl;

    string encodedRaw = "+9318-4582+616-510+614-508E-1662EfEfEfEfEfEgEgEfEgEgEgEgEgEfEfEfEgEfEfEfEfEgEgEgEfEgEgEgEgE-41920+9328-2312+618";
    cout << "===== Decode phase: " << endl;
    decode(encodedRaw.c_str());
    cout << "out" << endl;
    for (int i = 0; i < decode_result.rawlen; i++) {
        cout << decode_result.rawbuf[i] << ",";
    }
    cout << endl
         << decode_result.rawbuf[decode_result.rawlen - 1] << endl;
    cout << endl;
    delete[] decode_result.rawbuf;
    cout << endl;

    return 0;
}
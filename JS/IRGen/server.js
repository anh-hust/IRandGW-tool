#! /usr/bin/env node

/** LIB import */
const common = require("./common.js");
const cors = common.cors;
const mqtt = common.mqtt;
const express = common.express;

/** TAG import */
const STATUS_TAG = common.STATUS_TAG;
const SUCCESS_TAG = common.SUCCESS_TAG;
const HARD_FAIL_TAG = common.HARD_FAIL_TAG;
const SOFT_FAIL_TAG = common.SOFT_FAIL_TAG;
const DB_TAG = common.DB_TAG;
const VALUE_TAG = common.VALUE_TAG;
const MQTT_TAG = common.MQTT_TAG;

/** DB manipulate for test function */
const dbManipulateForTestKey = require("./DBmanipulateForTestKey.js");
const checkAlreadyTestKey = dbManipulateForTestKey.checkAlreadyTestKey;
const retrieveDB = dbManipulateForTestKey.retrieveDB;
const storeCheckKeyStatus = dbManipulateForTestKey.storeCheckKeyStatus;
const overrideCheckedBtnDB = dbManipulateForTestKey.overrideCheckedBtnDB;
const deleteCheckedBtnFromDB = dbManipulateForTestKey.deleteCheckedBtnFromDB;

/** DB manipulate for collect DB function */
const dbManipulateForCollect = require("./DBmanipulateForCollect.js");
const checkConflictDB = dbManipulateForCollect.checkConflictDB;
const storeToDB = dbManipulateForCollect.storeToDB;
const overrideBtnDB = dbManipulateForCollect.overrideBtnDB;
const deleteBtnFromDB = dbManipulateForCollect.deleteBtnFromDB;

/** Connect */
const HOST = common.HOST;
const MQTT_PORT = common.MQTT_PORT;
const TOPIC_CONTROL = common.TOPIC_CONTROL;
const TOPIC_CHECK = common.TOPIC_CHECK;
const TOPIC_DATA = common.TOPIC_DATA;
const TOPIC_SEND_RAW = common.TOPIC_SEND_RAW;

const HTTP_PORT = common.HTTP_PORT;

const client = common.client;
const app = common.app;

app.use(express.json());
app.use(cors()); // avoid conflict self-host when deploy HTTP serve & backend in same port

/**
 *
 *
 * ========== Establish connection ==========
 *
 *
 */
/** MQTT */
client.on("connect", () => {
  console.log(
    `>>>>> [${STATUS_TAG}]: Listen from ${HOST} on port ${MQTT_PORT}`
  );
  console.log(`>>>>> [${SUCCESS_TAG}]: Connected`);
  client.subscribe(TOPIC_DATA, () => {
    console.log(`>>>>> [${STATUS_TAG}]: Subscribe to topic ${TOPIC_DATA}`);
  });
  client.subscribe(TOPIC_CHECK, () => {
    console.log(`>>>>> [${STATUS_TAG}]: Subscribe to topic ${TOPIC_CHECK}`);
  });
  client.subscribe(TOPIC_SEND_RAW, () => {
    console.log(`>>>>> [${STATUS_TAG}]: Subscribe to topic ${TOPIC_SEND_RAW}`);
  });
});

/** HTTP */
app.listen(HTTP_PORT, () => {
  console.log(
    `\n\n========== ========== SERVER ON ${Date(
      Date.now()
    )}  ========= =========`
  );
  console.log(`>>>>> [${STATUS_TAG}]: Listening HTTP on port ${HTTP_PORT}`);
});
app.use(express.static("front-end")); // jump into folder "front-end" and serve index.html

/**
 *
 *
 * ========== Handle POST request from user ==========
 *
 *
 */
app.post("/device", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(`========== NEW REQUEST ${Date(Date.now())} ==========`);
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /device`);
    const data = request.body;

    console.log(`>>>>> [${VALUE_TAG}]: Category from POST:  ${data.category}`);
    console.log(`>>>>> [${VALUE_TAG}]: Brand from POST:  ${data.brand}`);
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);
    console.log(
      `>>>>> [${VALUE_TAG}]: Name of button from POST:  ${data.nameOfBtn}`
    );

    /** Check if body is empty or wrong format, return POST fail content */
    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("category" in data) || // check if not have attr
      !data.category || // check if attr is null
      !("brand" in data) ||
      !data.brand ||
      !("model" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button ||
      !("nameOfBtn" in data) ||
      !data.nameOfBtn
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /** Check conflict input first */
    var notifySuccess;
    await checkConflictDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase(),
      data.nameOfBtn.toUpperCase()
    );

    const command = {
      cmd: "read",
    };
    /** command to ESP32 to listen IR */
    client.publish(
      TOPIC_CONTROL,
      JSON.stringify(command),
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to publish command to topic ${TOPIC_CONTROL}`
          );
          console.log(error);
        } else {
          console.log(
            `>>>>> [${STATUS_TAG}]: Send read command to ESP under topic ${TOPIC_CONTROL}`
          );
        }
      }
    );

    /** Wait for pub raw data from ESP32 then store to DB */
    console.log(`>>>>> [${STATUS_TAG}]: Wait raw data from ESP32`);
    const dataMQTT = await waitMQTT(); // already JSON format

    notifySuccess = await storeToDB(
      data.category.toUpperCase(),
      data.model.toUpperCase(),
      data.brand.toUpperCase(),
      data.button.toUpperCase(),
      data.nameOfBtn.toUpperCase(),
      dataMQTT
    );
    console.log(`>>>>> [${DB_TAG}]: Database escape`);
    response.json({
      status: 1,
      content: notifySuccess,
    });
  } catch (err) {
    if (typeof err == "object") {
      // if key (button) is duplicate --> override option
      response.json({
        status: 0,
        model: err.model,
        button: err.button,
        nameOfBtn: err.nameOfBtn,
        content: err.content,
      });
    } else {
      // err here is err (reject) of await for Promise func (just catch at the first reject)
      response.json({
        status: 0,
        content: err,
      });
    }
  }
});

/**
 * Override button HTTP POST handle
 */
app.post("/overrideBtn", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(
      `========== NEW REQUEST OVERRIDE ${Date(Date.now())} ==========`
    );
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /overrideBtn`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);
    console.log(
      `>>>>> [${VALUE_TAG}]: Name of button from POST:  ${data.nameOfBtn}`
    );

    /** Check if body is empty or wrong format, return POST fail content */
    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button ||
      !("nameOfBtn" in data) ||
      !data.brand ||
      !("brand" in data) ||
      !data.brand
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    const command = {
      cmd: "read",
    };
    /** pub "read" command to ESP32 */
    client.publish(
      TOPIC_CONTROL,
      JSON.stringify(command),
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to publish command to topic ${TOPIC_CONTROL}`
          );
          console.log(error);
        } else {
          console.log(
            `>>>>> [${STATUS_TAG}]: Send read command to ESP under topic ${TOPIC_CONTROL}`
          );
        }
      }
    );

    /** Wait for pub raw data from ESP32 then store to DB */
    console.log(`>>>>> [${STATUS_TAG}]: Wait raw data from ESP32`);
    const dataMQTT = await waitMQTT(); // already JSON parse

    const notifySuccess = await overrideBtnDB(
      data.category.toUpperCase(),
      data.model.toUpperCase(),
      data.brand.toUpperCase(),
      data.button.toUpperCase(),
      data.nameOfBtn.toUpperCase(),
      dataMQTT
    );

    console.log(`>>>>> [${DB_TAG}]: Database escape`);
    response.json({
      status: 1,
      content: notifySuccess,
    });
  } catch (err) {
    // err here is err (reject) of await for Promise func (just catch at the first reject)
    response.json({
      status: 0,
      content: err,
    });
  }
});

/**
 *
 * ========== Delete Button post handle ==========
 *
 */
app.post("/deleteBtn", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(
      `========== NEW REQUEST DELETE BUTTON ${Date(Date.now())} ==========`
    );
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /deleteBtn`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Brand from POST:  ${data.brand}`);
    console.log(`>>>>> [${VALUE_TAG}]: Category from POST:  ${data.category}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);

    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !("model" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /* wait to retrieve data from db */
    await deleteBtnFromDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    response.json({
      status: 1,
      content: `Key ${data.button} is removed from DB of ${data.model}`,
    });
  } catch (err) {
    // err here is err (reject) of await for Promise func (just catch at the first reject)
    response.json({
      status: 0,
      content: err,
    });
  }
});

/**
 *
 * ===== Test button HTTP POST handle =====
 *
 */
app.post("/check", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(`========== NEW REQUEST TEST ${Date(Date.now())} ==========`);
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /check`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Category from POST:  ${data.category}`);
    console.log(`>>>>> [${VALUE_TAG}]: Brand from POST:  ${data.brand}`);
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);

    /** Check if body is empty or wrong format, return POST fail content */
    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !("category" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /* wait to retrieve data from db */
    const dataRetrieve = await retrieveDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    console.log(`>>>>>>>>>> [${VALUE_TAG}] Button Information: `);
    console.log(`${JSON.stringify(dataRetrieve)}`);

    const checkTestedKey = await checkAlreadyTestKey(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    const command = {
      cmd: "check",
      code: dataRetrieve.code.toString(),
    };
    /** pub "read" command to ESP32 */
    client.publish(
      TOPIC_CONTROL,
      JSON.stringify(command),
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to publish command to topic ${TOPIC_CONTROL}`
          );
          console.log(error);
        } else {
          console.log(
            `>>>>> [${STATUS_TAG}]: Send command to check encoded data: ${JSON.stringify(
              command
            )} to ESP under topic ${TOPIC_CONTROL}`
          );
        }
      }
    );

    /** Wait for pub check raw data from ESP32 then store to DB */
    console.log(`>>>>> [${STATUS_TAG}]: Wait response from ESP32`);
    const check_mapping_code = await waitMQTT(); // status is Object format

    var status;
    if (check_mapping_code.mapping_code == dataRetrieve.mapping_code) {
      status = {
        status: 1,
      };
    } else {
      status = {
        status: 0,
        old_mapping_code: dataRetrieve.mapping_code,
        test_mapping_code: check_mapping_code.mapping_code,
      };
    }

    const notify = await storeCheckKeyStatus(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase(),
      status
    );

    response.json({
      status: 1,
      content: notify,
    });
  } catch (err) {
    if (typeof err == "object") {
      response.json({
        status: 0,
        button: err.key,
        content: err.content,
      });
    } else {
      // err here is err (reject) of await for Promise func (just catch at the first reject)
      response.json({
        status: 0,
        content: err,
      });
    }
  }
});

/**
 * Check again button HTTP POST handle
 */
app.post("/checkAgain", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(
      `========== NEW REQUEST CHECK_AGAIN ${Date(Date.now())} ==========`
    );
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /checkAgainBtn`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);

    /** Check if body is empty or wrong format, return POST fail content */
    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button ||
      !data.brand ||
      !("brand" in data) ||
      !data.brand
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /* wait to retrieve data from db */
    const dataRetrieve = await retrieveDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    console.log("Button Infromation: ");
    console.log(JSON.stringify(dataRetrieve));

    const command = {
      cmd: "check",
      code: dataRetrieve.code.toString(),
    };
    /** pub "read" command to ESP32 */
    client.publish(
      TOPIC_CONTROL,
      JSON.stringify(command),
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to publish command to topic ${TOPIC_CONTROL}`
          );
          console.log(error);
        } else {
          console.log(
            `>>>>> [${STATUS_TAG}]: Send read command to ESP under topic ${TOPIC_CONTROL}`
          );
        }
      }
    );

    /** Wait for pub raw data from ESP32 then store to DB */
    console.log(`>>>>> [${STATUS_TAG}]: Wait raw data from ESP32`);
    const dataMQTT = await waitMQTT(); // already JSON parse

    const notifySuccess = await overrideCheckedBtnDB(
      data.category.toUpperCase(),
      data.model.toUpperCase(),
      data.brand.toUpperCase(),
      data.button.toUpperCase(),
      dataRetrieve,
      dataMQTT
    );
 
    console.log(`>>>>> [${DB_TAG}]: Database escape`);
    response.json({
      status: 1,
      content: notifySuccess,
    });
  } catch (err) {
    // err here is err (reject) of await for Promise func (just catch at the first reject)
    response.json({
      status: 0,
      content: err,
    });
  }
});

app.get("/cancel", (req, res) => {
  client.removeAllListeners();
  console.log(`\n>>>>> [${STATUS_TAG}]: Remove listener wait message MQTT`);
  const response = {
    status: 1,
  };
  res.send(response);
});

/**
 *
 * ========== Delete Check Button post handle ==========
 *
 */
app.post("/deleteCheckBtn", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(
      `========== NEW REQUEST DELETE CHECK BUTTON ${Date(
        Date.now()
      )} ==========`
    );
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /deleteCheckBtn`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Brand from POST:  ${data.brand}`);
    console.log(`>>>>> [${VALUE_TAG}]: Category from POST:  ${data.category}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);

    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /* wait to retrieve data from db */
    await deleteCheckedBtnFromDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    response.json({
      status: 1,
      content: `Key ${data.button} is removed from DB of ${data.model}`,
    });
  } catch (err) {
    // err here is err (reject) of await for Promise func (just catch at the first reject)
    response.json({
      status: 0,
      content: err,
    });
  }
});

app.get("/cancel", (req, res) => {
  client.removeAllListeners();
  console.log(`\n>>>>> [${STATUS_TAG}]: Remove listener wait message MQTT`);
  const response = {
    status: 1,
  };
  res.send(response);
});

/**
 *
 * ===== Test button HTTP POST handle =====
 *
 */
app.post("/sendRaw", async (request, response) => {
  try {
    console.log(`\n`);
    console.log(`========== NEW REQUEST TEST ${Date(Date.now())} ==========`);
    console.log(`>>>>> [${STATUS_TAG}]: Got an POST /sendRaw`);
    const data = request.body;
    console.log(`>>>>> [${VALUE_TAG}]: Category from POST:  ${data.category}`);
    console.log(`>>>>> [${VALUE_TAG}]: Brand from POST:  ${data.brand}`);
    console.log(`>>>>> [${VALUE_TAG}]: Model from POST:  ${data.model}`);
    console.log(`>>>>> [${VALUE_TAG}]: Button from POST:  ${data.button}`);

    /** Check if body is empty or wrong format, return POST fail content */
    if (
      Object.keys(data).length === 0 || // check is body is NULL
      !("model" in data) ||
      !("category" in data) ||
      !data.model ||
      !("button" in data) ||
      !data.button
    ) {
      response.json({
        status: 0,
        content: "POST request fail on body error - Empty body",
      });
      return;
    }

    /* wait to retrieve data from db */
    const dataRetrieve = await retrieveDB(
      data.category.toUpperCase(),
      data.brand.toUpperCase(),
      data.model.toUpperCase(),
      data.button.toUpperCase()
    );

    console.log(`>>>>>>>>>> [${VALUE_TAG}] Button Information: `);
    console.log(`${JSON.stringify(dataRetrieve)}`);

    const command = {
      cmd: "sendRaw",
      code: dataRetrieve.code.toString(),
    };
    /** pub "read" command to ESP32 */
    client.publish(
      TOPIC_CONTROL,
      JSON.stringify(command),
      { qos: 0, retain: false },
      (error) => {
        if (error) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to publish command to topic ${TOPIC_CONTROL}`
          );
          console.log(error);
        } else {
          console.log(
            `>>>>> [${STATUS_TAG}]: Send command to send raw data: ${JSON.stringify(
              command
            )} to ESP under topic ${TOPIC_CONTROL}`
          );
        }
      }
    );

    /** Wait for pub check raw data from ESP32 then store to DB */
    console.log(`>>>>> [${STATUS_TAG}]: Wait response from ESP32`);
    const esp_response = await waitMQTT(); // status is Object format

    response.json({
      status: 1,
      content: `SEND RAW: ${dataRetrieve.code}<br>Mapping_code: ${dataRetrieve.mapping_code}`,
    });
  } catch (err) {
    // err here is err (reject) of await for Promise func (just catch at the first reject)
    response.json({
      status: 0,
      content: err,
    });
  }
});

/**
 *
 *
 * ========== Function ==========
 * @function waitMQTT: wait until message MQTT come
 *  @return rawdata (is payload.toString())
 *
 */

/** Listen topic data, return a Promise */
const waitMQTT = () => {
  return new Promise((resolve, reject) => {
    client.on("message", function receiveMessage(topic, payload) {
      const data = JSON.parse(payload.toString());

      switch (topic) {
        case TOPIC_DATA:
          console.log(`\n>>>>> [${MQTT_TAG}]: GOT MQTT pub on topic: ${topic}`);
          console.log(`>>>>> [${MQTT_TAG}]: Raw typeof: ` + typeof data);
          console.log(
            `>>>>> [${MQTT_TAG}]: Received Code Length: ` + data.code.length
          );
          console.log(
            `>>>>> [${MQTT_TAG}]: Received Code: ` + data.code.toString()
          );
          console.log(
            `>>>>> [${MQTT_TAG}]: Received Mapping Code: ` +
              data.mapping_code.toString()
          );
          break;
        case TOPIC_CHECK:
          console.log(`\n>>>>> [${MQTT_TAG}]: GOT MQTT pub on topic: ${topic}`);
          console.log(`>>>>> [${MQTT_TAG}]: Raw typeof: ` + typeof data);
          console.log(
            `>>>>> [${MQTT_TAG}]: Received Message: ` + JSON.stringify(data)
          );
          break;
        case TOPIC_SEND_RAW:
          console.log(`\n>>>>> [${MQTT_TAG}]: GOT MQTT pub on topic: ${topic}`);
          console.log(`>>>>> [${MQTT_TAG}]: Raw typeof: ` + typeof data);
          console.log(
            `>>>>> [${MQTT_TAG}]: Received Message: ` + JSON.stringify(data)
          );
          break;
        default:
          console.log(`\n>>>>> [${MQTT_TAG}]: ${topic} is not available`);
          break;
      }

      // check empty
      if (data) {
        resolve(data);
      } else {
        console.log(`>>>>> [${SOFT_FAIL_TAG}]: MQTT payload is EMPTY`);
        reject(`MQTT payload is EMPTY`);
      }
      // remove listener on message unless at every POST request make new listener --> memory leak
      client.removeListener("message", receiveMessage);
    });
  });
};

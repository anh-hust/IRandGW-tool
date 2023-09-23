const DataStore = require("nedb");
const fs = require("fs");
const mqtt = require("mqtt");
const express = require("express"); // @NOTE: require will take from package.json
const cors = require("cors");
const path = require("path");

/** TAG */
const STATUS_TAG = "STATUS";
const SUCCESS_TAG = "SUCCESS";
const HARD_FAIL_TAG = "HARD_FAIL";
const SOFT_FAIL_TAG = "SOFT_FAIL";
const DB_TAG = "DB";
const VALUE_TAG = "VALUE";
const MQTT_TAG = "MQTT";

const DATABASE_FOLDER = "database";
const CHECK_KEY_DB_FOLDER = "checkKeyDB";

/** MQTT Setup */
const HOST = "localhost";
const MQTT_PORT = "1883";
const CLIENT_ID = "Server";
const TOPIC_DATA = "data";
const TOPIC_CONTROL = "control";
const TOPIC_CHECK = "checkedData";
const TOPIC_SEND_RAW = "sendRaw";

const CONNECT_URL = `mqtt://${HOST}:${MQTT_PORT}`;

const client = mqtt.connect(CONNECT_URL, {
  clientId: CLIENT_ID,
  clean: true,
  connectTimeout: 4000,
  //   username: "emqx",
  //   password: "public",
  reconnectPeriod: 1000,
});

/** HTTP server */
const HTTP_PORT = 8080;
const app = express();

module.exports = {
  DataStore: DataStore,
  fs: fs,
  mqtt: mqtt,
  express: express,
  cors: cors,
  path: path,
  STATUS_TAG: STATUS_TAG,
  SUCCESS_TAG: SUCCESS_TAG,
  HARD_FAIL_TAG: HARD_FAIL_TAG,
  SOFT_FAIL_TAG: SOFT_FAIL_TAG,
  DB_TAG: DB_TAG,
  VALUE_TAG: VALUE_TAG,
  MQTT_TAG: MQTT_TAG,
  DATABASE_FOLDER: DATABASE_FOLDER,
  CHECK_KEY_DB_FOLDER: CHECK_KEY_DB_FOLDER,
  HOST: HOST,
  MQTT_PORT: MQTT_PORT,
  CLIENT_ID: CLIENT_ID,
  TOPIC_CONTROL: TOPIC_CONTROL,
  TOPIC_CHECK: TOPIC_CHECK,
  TOPIC_DATA: TOPIC_DATA,
  TOPIC_SEND_RAW: TOPIC_SEND_RAW,
  CONNECT_URL: CONNECT_URL,
  client: client,
  HTTP_PORT: HTTP_PORT,
  app: app,
};

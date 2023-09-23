const mqtt = require("mqtt");
var config = require("./config.js");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");

/**
 * Set up prequisites for log file
 */
const timestamp = Date.now();
const dateFormat = new Date(timestamp);
const FOLDER = `./log/${dateFormat.getDate()}_${dateFormat.getMonth() + 1}`;
const LOG_FILE =
  FOLDER +
  `/logGW_${dateFormat.getHours()}h${dateFormat.getMinutes()}m(${dateFormat.getDate()}_${
    dateFormat.getMonth() + 1
  }).json`;
const CONFIG_FILE = "./config.txt";

if (!fs.existsSync(FOLDER)) {
  fs.mkdir(FOLDER, { recursive: true }, (err) => {
    if (err) throw err;
  });
}

/*****************************************************************
 *                        Function
 *****************************************************************/
/**
 *
 * @param {*} GW_EUI: EUI of GW we extract from topic prototype (gw/...EUI.../...)
 */
function logOn(client) {
  /**
   * Sub to all desired topics
   */

  client.subscribe(["#"], () => {
    console.log(`->> Subscribe topic #`);
  });
  /**
   * Write to file
   */
  var countMessage = 0; // index the message
  fs.appendFileSync(LOG_FILE, "[", (err) => {});
  client.on("message", (topic, payload) => {
    var timeContent = `// Time: ${dateFormat.getHours()}:${dateFormat.getMinutes()}:${dateFormat.getSeconds()}`;
    var daycontent = `    ---    Date: ${dateFormat.getDate()}-${
      dateFormat.getMonth() + 1
    }`;
    countMessage += 1;
    var content =
      timeContent +
      daycontent +
      `\n// ${countMessage}. ${topic}:\n${payload},\n\n`;
    fs.appendFile(LOG_FILE, content, (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
}

/*****************************************************
 *                    MAIN
 * ***************************************************/
/**
 * Set up write the ']' to file on SIGINT
 */
process.on("SIGINT", () => {
  if (fs.existsSync(LOG_FILE)) {
    fs.appendFileSync(LOG_FILE, "]");
  }
  // Exit the Node.js process gracefully
  process.exit(0);
});

/**
 * Parse argument user fill in node scripts
 */
const user_arg = process.argv[2];
switch (user_arg) {
  case "clean":
    fs.unlinkSync(CONFIG_FILE);
    console.log("Remove config file success !!!");
    process.exit(0);
  default:
    console.log(`IP address input: ${user_arg}`);
    /**
     * ^: anchor, should start matching at beginning of string
     * \d: match digit from 0 to 9
     * {1,3}: have from 1 to 3 number (with digit from 1 to 9)
     * ( ... )
     *
     */
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(user_arg)) {
      /**
       * Prerequisite set up for connect MQTT
       */
      const HOST = String(process.argv[2]);
      const PORT = "1883";
      const connectUrl = `mqtt://${HOST}:${PORT}`;
      const CLIENT_ID = "TuanAnhHere";
      const client = mqtt.connect(connectUrl, {
        clientId: CLIENT_ID,
        clean: true,
        connectTimeout: 3000,
        username: "homegateway",
        password: "vnpttechnology",
        reconnectPeriod: 500,
      });

      /**
       * Catch client ERROR
       */
      client.on("error", (error) => {
        console.error("Client on ERROR !!!", error);
      });

      /**
       * Reconnect
       */
      client.on("reconnect", (error) => {
        if (error) {
          console.error("reconnect failed", error);
        }
        console.log("..... Disconnect ....., try to reconnect !!!");
      });

      /**
       * Connect & subcribe to topic # to extract EUI of GW
       */
      client.on("connect", async () => {
        console.log(">> Connected");

        logOn(client);
      });
    } else {
      console.error("ERROR: IP address not valid !!!");
      process.exit(0);
    }
}

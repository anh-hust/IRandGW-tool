const mqtt = require("mqtt");
var config = require("./config.js");
const fs = require("fs");
const { resolve } = require("path");
const { rejects } = require("assert");

/**
 * Set up prequisites for log file
 */

var timestampAtMessage;
var dateFormatAtMessage;
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
function extractGW_EUI(client, ip_addr) {
  return new Promise((resolve, rejects) => {
    client.subscribe("#", (error) => {
      if (error) {
        rejects(error);
      }
      console.log(`->> Subscribe topic # to extract EUI`);
    });
    /**
     * Event handle: write to file (name file format: logGW_<time>.json)
     */
    client.on("message", (topic, payload) => {
      if (/gw\//.test(topic)) {
        console.log(`Catch topic contains EUI: ${topic}`);

        const parts = topic.split("/");
        var gw_eui = parts[1];
        console.log(`EUI: ${gw_eui}`);
        /**
         * Un & Subcribe topic
         */
        client.unsubscribe("#", () => {
          console.log("->> Unsubcribe topic #");
          client.removeAllListeners();
          config.assignConfigInfo(ip_addr, gw_eui);
          resolve();
        });
      }
    });
  });
}
/**
 *
 * @param {*} GW_EUI: EUI of GW we extract from topic prototype (gw/...EUI.../...)
 */
function logOn(client) {
  /**
   * Sub to all desired topics
   */
  config.assignTopics();
  const listenedTopics = Object.values(config.Topics);
  for (let topic of listenedTopics) {
    client.subscribe([topic], () => {
      console.log(`->> Subscribe topic '${topic}'`);
    });
  }
  /**
   * Write to file
   */
  var countMessage = 0; // index the message
  fs.appendFileSync(LOG_FILE, "[", (err) => {});
  client.on("message", (topic, payload) => {
    timestampAtMessage = Date.now();
    dateFormatAtMessage = new Date(timestampAtMessage);
    var timeContent = `// Time: ${dateFormatAtMessage.getHours()}:${dateFormatAtMessage.getMinutes()}:${dateFormatAtMessage.getSeconds()}`;
    var daycontent = `    ---    Date: ${dateFormatAtMessage.getDate()}-${
      dateFormatAtMessage.getMonth() + 1
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

/**
 *
 * @param {*} ip_arg: IP argument from node script
 * @returns true: file exist && IP match
 *          false: if file not exist or IP not match
 */
function handleConfigGWInfor(ip_arg) {
  if (fs.existsSync(CONFIG_FILE)) {
    console.log("\nConfig file available");
    const allFileContents = fs.readFileSync(CONFIG_FILE, "utf-8");
    lineByline = allFileContents.split(/\r?\n/);
    if (lineByline[0] == ip_arg) {
      console.log("IP match -- file config content:");
      for (const line of lineByline) {
        console.log(line);
      }

      config.assignConfigInfo(lineByline[0], lineByline[1]);
      return true;
    }
    console.log("\n->> IP not match -- check it out");
    console.log("*** -1. New GW run script:");
    console.log("\t\tnode main.js clean");
    console.log("\t\tnode main.js <IP_addr>");
    console.log("*** -2. Still that GW -- check IP if it's wrong:\n");
    process.exit(0);
  }
  config.assignConfigInfo(ip_arg, "");
  console.log("New IP -- create new config file after extract EUI success");
  return false;
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
      // check file existed & assign addr + eui if exist
      let fileExisted = handleConfigGWInfor(user_arg);
      /**
       * Prerequisite set up for connect MQTT
       */
      const HOST = config.Config.GW_ADDRESS;
      const PORT = config.Config.GW_PORT;
      const connectUrl = `mqtt://${HOST}:${PORT}`;
      const CLIENT_ID = "TuanAnhHere";
      const client = mqtt.connect(connectUrl, {
        clientId: CLIENT_ID,
        clean: true,
        connectTimeout: 3000,
        username: config.Config.USERNAME,
        password: config.Config.PASSWORD,
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

        if (fileExisted) {
          logOn(client);
        } else {
          await extractGW_EUI(client, user_arg);
          // write to file config
          const content = `${config.Config.GW_ADDRESS}\n${config.Config.GW_EUI}`;
          fs.writeFileSync("config.txt", content);
          logOn(client);
        }
      });
    } else {
      console.error("ERROR: IP address not valid !!!");
      process.exit(0);
    }
}

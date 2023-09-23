const common = require("./common.js");
const fs = common.fs;
const DataStore = common.DataStore;
const path = common.path;

/** TAG */
const STATUS_TAG = common.STATUS_TAG;
const SUCCESS_TAG = common.SUCCESS_TAG;
const HARD_FAIL_TAG = common.HARD_FAIL_TAG;
const SOFT_FAIL_TAG = common.SOFT_FAIL_TAG;
const DB_TAG = common.DB_TAG;
const VALUE_TAG = common.VALUE_TAG;
const MQTT_TAG = common.MQTT_TAG;

/** DB Path */
const CHECK_KEY_DB_FOLDER = common.CHECK_KEY_DB_FOLDER;
const DATABASE_FOLDER = common.DATABASE_FOLDER;

/*************************************** */

// ===== DB Manipulate for collect funtion ====== //

/*************************************** */
/**
 *
 * @param category_a
 * @param brand_a
 * @param model_a
 * @param button_a
 * @param nameOfBtn_a
 *
 * @returns reject if -- brand || category is not match
 *                    -- key (button) || name of button is duplicate
 *
 *          resolve if no conflict --> make template
 */
const checkConflictDB = (
  category_a,
  brand_a,
  model_a,
  button_a,
  nameOfBtn_a
) => {
  /** Database load */
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }

      db.find({ model: model_a }, function (err, doc) {
        if (err) {
          console.log(`>>>>> [${HARD_FAIL_TAG}]: Error on <<db.find>>`);
          console.log(err);
          reject(`>>>>> [${HARD_FAIL_TAG}]: Error on <<db.find>>`);
          return;
        }
        /** Empty ==> New model ==> insert whole new model */
        if (!doc[0]) {
          const timestamp = Date.now();
          var storedData = {
            category: category_a,
            brand: brand_a,
            model: model_a,
            type: 1,
            version: "1.0",
            create_date: timestamp,
            protocol: brand_a,
            map_code: [],
          };

          db.insert(storedData, (err) => {
            if (err) {
              console.log(
                `>>>>> [${HARD_FAIL_TAG}]: Error on db.insert at checkConflictDB()`
              );
              console.log(err);
              return;
            }
            console.log(
              `>>>>> [${DB_TAG}]: New template model insert: ${JSON.stringify(
                storedData
              )}`
            );
            resolve();
            return;
          });
        } else {
          /** flag isConflict -- true: consflict -- false: no conflict */
          var isConflict = false;
          /** if model exist ==> check Category & Brand if not same */
          if (!(doc[0].category == category_a) || !(doc[0].brand == brand_a)) {
            console.log(`>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Model not match Category & Brand]: 
              ----------Input category: ${category_a} -- Database category: ${doc[0].category}
              ----------Input brand: ${brand_a} -- Database brand: ${doc[0].brand}`);
            reject(
              // escape Promise with reject
              `>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Model not match Category & Brand]
                <br>Input category: ${category_a} -- Database category: ${doc[0].category}
                <br>Input brand: ${brand_a} -- Database brand: ${doc[0].brand}`
            );
            isConflict = true;
            return;
          }

          /**
           *  check if key is duplicate ==> return reject with index of Button conflict & content
           * @param index: return index of KEY to override
           *
           */
          const codeAvai = doc[0].map_code;
          var duplicateNotify = `>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate KEY || NAME]
                        <br>----------In key (button): ${button_a} -- name: ${nameOfBtn_a}`;
          codeAvai.forEach((element) => {
            if (element.key == button_a || element.name == nameOfBtn_a) {
              duplicateNotify += `\n<br>----------DB key (button): ${element.key} -- name: ${element.name}`;
              reject({
                model: `${doc[0].model}`,
                button: `${element.key}`,
                nameOfBtn: `${element.name}`,
                // escape Promise with reject
                content: `>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate KEY || NAME] 
                <br>Input key (button): ${button_a} -- Database key (button): ${element.key}
                <br>Input name (name of btn): ${nameOfBtn_a} -- Database name (name of btn): ${element.name}`,
              });
              isConflict = true;
              return;
            }
          });

          // if not confict ==> resolve
          if (!isConflict) {
            resolve();
          }
        }
      });
    });
  });
};

/**
 *
 * @brief storeDB key + nameOfBtn + rawData after checkConflict
 *
 * @param {*} model_a: string
 * @param {*} button_a: string
 * @param {*} nameOfBtn_a: string
 * @param {*} rawData_a: array of number
 * @returns
 */
const storeToDB = (
  category_a,
  model_a,
  brand_a,
  button_a,
  nameOfBtn_a,
  data_a
) => {
  /** Database load */
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }

      db.find({ model: model_a }, function (err, doc) {
        if (err) {
          console.log(`>>>>> [${HARD_FAIL_TAG}]: Error on <<db.find>>`);
          console.log(err);
          return;
        }

        /**
         *
         * @param check duplicate rawData
         * @return reject: notify key + name of button has that raw, no update
         *
         */
        /** flag is conflict */
        var isDuplicate = false;
        const codeAvai = doc[0].map_code;

        //
        for (var i = codeAvai.length - 1; i >= 0; i--) {
          const existValue = codeAvai[i].mapping_code;

          if (data_a.mapping_code.toString() == existValue) {
            console.log(`>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate Value data]
              ----------Value data <${data_a.mapping_code.toString()}> has already existed
              ----------on key (button): ${codeAvai[i].key} -- name: ${
              codeAvai[i].name
            } -- brand: ${doc[0].brand} -- category: ${doc[0].category}`);
            reject(
              // escape Promise with reject

              `>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate Value data]
              <br>Value data <${data_a.mapping_code.toString()}> has alreadyy existed
              <br>on key (button): ${codeAvai[i].key} -- name: ${
                codeAvai[i].name
              } -- brand: ${doc[0].brand} -- category: ${doc[0].category}`
            );
            isDuplicate = true;
            return;
          }
        }
        /** if model exist & no conflict ==> add new button into model, return above is still jump into update if not flag */
        if (!isDuplicate) {
          db.update(
            { model: model_a },
            {
              $push: {
                map_code: {
                  key: button_a,
                  name: nameOfBtn_a,
                  code: data_a.code,
                  mapping_code: data_a.mapping_code,
                  state: 1,
                },
              },
            },
            {},
            () => {
              console.log(
                `>>>>> [${DB_TAG}]: Success add new button into model ${model_a}`
              );
              resolve(`Success add new button ${button_a}, name: ${nameOfBtn_a} into model ${model_a}
                <br>Raw data: ${data_a.code.toString()}
                <br>Value data: ${data_a.mapping_code.toString()}
                <br>of category: ${doc[0].category} -- brand: ${doc[0].brand}`);
              return;
            }
          );
        }
      });
    });
  });
};

/**
 *
 * @param {*} oldButton_a: string
 * @param {*} model_a: string
 * @param {*} button_a: string
 * @param {*} nameOfBtn_a: string
 * @param {*} rawData_a: array of number
 * @returns resolve --> override success
 *          no reject (notify of duplicate rawData, still update if raw duplicate)
 *
 * @use for /overrideBtn POST
 */
const overrideBtnDB = (
  category_a,
  model_a,
  brand_a,
  button_a,
  nameOfBtn_a,
  data_a
) => {
  /** Database load */
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }

      /** override new button into model */
      db.update(
        { model: model_a },
        {
          // pull old btn, (pull all key: key_val)
          $pull: {
            map_code: {
              key: button_a,
            },
          },
        },
        {},
        () => {
          console.log(
            `>>>>> [${DB_TAG}]: Pull button ${button_a} from model ${model_a}`
          );
          // Check if override cause duplicate raw data after update
          db.find({ model: model_a }, (err, doc) => {
            var isDuplicate = false;
            const codeAvai = doc[0].map_code;
            //
            for (var i = codeAvai.length - 1; i >= 0; i--) {
              const existVal = codeAvai[i].mapping_code;

              if (existVal == data_a.mapping_code) {
                console.log(`>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate Value data]
                  ----------Value data <${data_a.mapping_code.toString()}> has already existed
                  ----------on key (button): ${codeAvai[i].key} -- name: ${
                  codeAvai[i].name
                } -- brand: ${doc[0].brand} -- category: ${doc[0].category}`);
                reject(
                  // escape Promise with reject

                  `>>>>> [${SOFT_FAIL_TAG}]: Conflict in database [Duplicate Raw data]
                  <br>Value data <${data_a.mapping_code.toString()}> has already existed
                  <br>on key (button): ${codeAvai[i].key} -- name: ${
                    codeAvai[i].name
                  } -- brand: ${doc[0].brand} -- category: ${doc[0].category}`
                );
                isDuplicate = true;
                return;
              }
            }
            // if raw data not duplicate --> update $push
            if (!isDuplicate) {
              db.update(
                { model: model_a },
                {
                  $push: {
                    map_code: {
                      key: button_a,
                      name: nameOfBtn_a,
                      code: data_a.code,
                      mapping_code: data_a.mapping_code,
                      state: 1,
                    },
                  },
                },
                {},
                () => {
                  console.log(
                    `>>>>> [${DB_TAG}]: Success override button into model ${model_a}`
                  );
                }
              );
              resolve(`Success override button ${button_a} -- name ${nameOfBtn_a} into model ${model_a}
                    <br>Raw data: ${data_a.code.toString()}
                    <br>Value: ${data_a.mapping_code.toString()}
                    <br>of category: ${doc[0].category} -- brand: ${
                doc[0].brand
              }`);
              return;
            }
          });
        }
      );
    });
  });
};

/**
 *
 * @param {*} brand_a
 * @param {*} model_a
 * @param {*} button_a
 * @returns remove key & resolve is raw data of that key of that model
 *  reject when model not exist or key in model not exist
 */
const deleteBtnFromDB = (category_a, brand_a, model_a, button_a) => {
  // Check if the file exists
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }
      db.update({}, { $pull: { map_code: { key: button_a } } }, {}, () => {
        console.log(`>>>>> [${DB_TAG}]: Success remove key from DB`);
        resolve();
      });
    });
  });
};

module.exports = {
  checkConflictDB: checkConflictDB,
  storeToDB: storeToDB,
  overrideBtnDB: overrideBtnDB,
  deleteBtnFromDB: deleteBtnFromDB,
};

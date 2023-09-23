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

/**
 *
 *
 * ======= TEST KEY FUNCTION ==========
 *
 *
 */
/**
 *
 * @param {*} model_a
 * @param {*} button_a
 * @returns resolve is raw data of that key of that model
 *  reject when model not exist or key in model not exist
 */
const checkAlreadyTestKey = (category_a, brand_a, model_a, button_a) => {
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${CHECK_KEY_DB_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }
      db.find({ key: button_a }, function (err, doc) {
        if (err) {
          console.log(
            `>>>>>>>>>> [${HARD_FAIL_TAG}]: Fail to find in Check DB, ${err}`
          );
          reject(err);
          return;
        }
        // if key exist
        if (doc[0]) {
          var response;
          if (doc[0].status == 0) {
            response = {
              key: doc[0].key,
              constent: `Check button information: Status: ${doc[0].status}
                  <br>Old mapping_code: ${doc[0].old_mapping_code}
                  <br>New mapping_code: ${doc[0].test_mapping_code}`,
            };
          } else {
            response = {
              key: doc[0].key,
              content: `Check button information: Status: ${doc[0].status}`,
            };
          }
          reject(response);
        } else {
          resolve();
        }
      });
    });
  });
};

const retrieveDB = (category_a, brand_a, model_a, button_a) => {
  // Check if the file exists
  return new Promise((resolve, reject) => {
    fs.access(
      `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`,
      fs.constants.F_OK,
      (err) => {
        // if cannot found model on DB
        if (err) {
          console.log(
            `>>>>> [${SOFT_FAIL_TAG}]: Model ${model_a} of brand ${brand_a} of category ${category_a} not be available to test`
          );
          reject(
            `>>>>> [${SOFT_FAIL_TAG}]: Model ${model_a} of brand ${brand_a} of category ${category_a} not be available to test`
          );
          return;
        } else {
          // model is found --> load DB to check key exist
          console.log(
            `>>>>> [${SUCCESS_TAG}]: Found model ${model_a} of brand ${brand_a} in DB`
          );
          const db = new DataStore(
            `${DATABASE_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
          );
          db.loadDatabase(function (err) {
            if (err) {
              console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
              return;
            }
            db.find(
              { map_code: { $elemMatch: { key: button_a } } },
              function (err, doc) {
                // if key exist
                if (doc[0]) {
                  console.log(`>>>>> [${DB_TAG}]: Key exist inside DB`);
                  // iterating array to take raw data of specific key
                  var dataRetrieve;
                  for (const element of doc[0].map_code) {
                    if (element.key == button_a) {
                      dataRetrieve = {
                        code: element.code,
                        mapping_code: element.mapping_code,
                      };
                      resolve(dataRetrieve);
                      return;
                    }
                  }
                } else {
                  // if key not exit --> reject
                  console.log(
                    `>>>>> [${SOFT_FAIL_TAG}]: Key ${button_a} do not exist in model ${model_a} of brand ${brand_a} of category ${category_a}`
                  );
                  reject(
                    `>>>>> [${SOFT_FAIL_TAG}]: Key ${button_a} do not exist in model ${model_a} of brand ${brand_a} of category ${category_a}`
                  );
                }
              }
            );
          });
        }
      }
    );
  });
};

const storeCheckKeyStatus = (
  category_a,
  brand_a,
  model_a,
  button_a,
  status_a
) => {
  /** Database load */
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${CHECK_KEY_DB_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );

    var checkContent;
    if (status_a.status == 1) {
      checkContent = {
        key: button_a,
        status: 1,
      };
    } else {
      checkContent = {
        key: button_a,
        status: 0,
        old_mapping_code: status_a.old_mapping_code,
        test_mapping_code: status_a.test_mapping_code,
      };
    }
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        reject(err);
        return;
      }

      // else insert
      db.insert(checkContent, (err, doc) => {
        if (err) {
          console.log(
            `>>>>> [${HARD_FAIL_TAG}]: Fail to insert database in storeCheckKeyStatus() func`
          );
          reject(err);
          return;
        }
        console.log(`>>>>> [${DB_TAG}]: Insert new tested key status`);
        if (status_a.status == 0)
          resolve(
            `>>>>> [${SUCCESS_TAG}]: Test button ${button_a} in model ${model_a} of brand ${brand_a} of category ${category_a} successfully
                  <br><p style="color:red;">MAPPING_CODE DO NOT MATCH</p>
                  <p style="color:red;">old_mapping_code: ${status_a.old_mapping_code}</p>
                  <p style="color:red;">test_mapping_code: ${status_a.test_mapping_code}</p>,`
          );
        else
          resolve(`>>>>> [${SUCCESS_TAG}]: Test button ${button_a} in model ${model_a} successfully
                  <br><p style="color:green;">MAPPING_CODE MATCH</p>`);
      });
    });
  });
};

const deleteCheckedBtnFromDB = (category_a, brand_a, model_a, button_a) => {
  // Check if the file exists
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${CHECK_KEY_DB_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        return;
      }
      db.remove({ key: button_a }, { multi: true }, (err, doc) => {
        console.log(`>>>>> [${DB_TAG}]: Success remove key from DB`);
        resolve();
      });
    });
  });
};

const overrideCheckedBtnDB = (
  category_a,
  model_a,
  brand_a,
  button_a,
  dataFromDB_a,
  dataFromESP_a
) => {
  console.log(JSON.stringify(dataFromDB_a));
  console.log(JSON.stringify(dataFromESP_a));
  /** Database load */
  return new Promise((resolve, reject) => {
    const db = new DataStore(
      `${CHECK_KEY_DB_FOLDER}/${category_a}/${brand_a}/${model_a}.json`
    );
    db.loadDatabase(function (err) {
      if (err) {
        console.log(`>>>>> [${HARD_FAIL_TAG}]: Fail to load db ${err}`);
        reject(err);
        return;
      }

      /** override new button into model */
      db.remove({ key: button_a }, { multi: true }, (err, numRemoved) => {
        console.log(
          `>>>>> [${DB_TAG}]: Remove checkded button ${button_a} from model ${model_a}`
        );

        var doc;
        if (
          dataFromDB_a.mapping_code.toString() ==
          dataFromESP_a.mapping_code.toString()
        ) {
          doc = {
            key: button_a,
            status: 1,
          };
        } else {
          doc = {
            key: button_a,
            status: 0,
            old_mapping_code: dataFromDB_a.mapping_code,
            test_mapping_code: dataFromESP_a.mapping_code,
          };
        }
        db.insert(doc, () => {
          console.log(
            `>>>>> [${DB_TAG}]: Success override ${JSON.stringify(doc)}`
          );
        });
        resolve(`>>>>> [${DB_TAG}]: Success override ${JSON.stringify(doc)}`);
        return;
      });
    });
  });
};

module.exports = {
  checkAlreadyTestKey: checkAlreadyTestKey,
  retrieveDB: retrieveDB,
  storeCheckKeyStatus: storeCheckKeyStatus,
  overrideCheckedBtnDB: overrideCheckedBtnDB,
  deleteCheckedBtnFromDB: deleteCheckedBtnFromDB,
};

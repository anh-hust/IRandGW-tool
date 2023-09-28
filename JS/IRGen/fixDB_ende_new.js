const { count } = require("console");
const fs = require("fs");
const DataStore = require("nedb");

function encodeRaw(result) {
  var encodedRaw = "";
  var mappingArray = []; // hold the value, the index as A(a) to Z(z)
  var tastomaCount = 0; // trace the index of mappingArray
  var isExisted;

  for (var index = 0; index < result.length; index++) {
    isExisted = false;
    // check if the number can encode as alphabet

    for (var key = 0; key < 26; key++) {
      // in element not fill yet
      if (mappingArray[key] == 0) break;
      if (result[index] == mappingArray[key]) {
        if (index % 2 == 0) {
          encodedRaw += String.fromCharCode(65 + key); // uppercase
        } else {
          encodedRaw += String.fromCharCode(97 + key); // lowercase
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
      if (index % 2 == 0) encodedRaw += "+" + String(result[index]);
      else encodedRaw += "-" + String(result[index]);
      mappingArray[tastomaCount] = result[index];
      // at 25 (Z or z) do not count tastomaCount anymore
      tastomaCount += 1;
    }
    // if exceed Z or z, do not encode as alphabet anymore
    else {
      if (index % 2 == 0) encodedRaw += "+" + String(result[index]);
      else encodedRaw += "-" + String(result[index]);
    }
  }

  return encodedRaw;
}

function decode(encodedRaw) {
  var rawLength = encodedRaw.length;

  var numberHandler = 0; // xu ly chuoi so
  var flagToTakeNumber = false;
  var tastomaCode = []; // 26 ki tu trong alphabet
  var tastomaCount = 0; // theo doi vi tri mang cua tastoma
  var rawDataCount = 0; // size cua rawdata
  var raw = [];

  // decode phase
  for (var i = 0; i < rawLength; i++) {
    if (numberHandler && flagToTakeNumber) {
      raw[rawDataCount] = numberHandler; // =0
      rawDataCount += 1;
      if (tastomaCount < 26) {
        tastomaCode[tastomaCount] = numberHandler;
        // at index 25 (Z or z) do not count ++ anymore
        tastomaCount += 1; // to next position in array tastoma code
      }
      numberHandler = 0;
      flagToTakeNumber = false;
    }
    if (
      encodedRaw[i].charCodeAt(0) >= "0".charCodeAt(0) &&
      encodedRaw[i].charCodeAt(0) <= "9".charCodeAt(0)
    ) {
      // if number
      numberHandler =
        numberHandler * 10 + encodedRaw[i].charCodeAt(0) - "0".charCodeAt(0);
    } else {
      // at start of '+' or '-' symbol, do not raise flag (numberHandler at first numbersymbol)
      if (numberHandler > 10) flagToTakeNumber = true;

      if (numberHandler && flagToTakeNumber) {
        raw[rawDataCount] = numberHandler; // =0
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
      if (
        encodedRaw[i].charCodeAt(0) >= "a".charCodeAt(0) &&
        encodedRaw[i].charCodeAt(0) <= "z".charCodeAt(0)
      ) {
        raw[rawDataCount] =
          tastomaCode[encodedRaw[i].charCodeAt(0) - "a".charCodeAt(0)];
        rawDataCount += 1;
      }
      if (
        encodedRaw[i].charCodeAt(0) >= "A".charCodeAt(0) &&
        encodedRaw[i].charCodeAt(0) <= "Z".charCodeAt(0)
      ) {
        // else upper case
        raw[rawDataCount] =
          tastomaCode[encodedRaw[i].charCodeAt(0) - "A".charCodeAt(0)];
        rawDataCount += 1;
      }
    }
  }

  // last remaining
  if (numberHandler) {
    raw[rawDataCount] = numberHandler;
  }

  return raw;
}

async function updateButtonToDB(db, model_a, button_a, encodedRaw) {
  return new Promise((resolve, reject) => {
    if (button_a.code.length != encodedRaw.length)
      console.log(
        `\t${button_a.key}: ${button_a.code.length}  -  ${encodedRaw.length}`
      );
    /** override new button into model */
    db.update(
      { model: model_a },
      {
        // pull old btn, (pull all key: key_val)
        $pull: {
          map_code: {
            key: button_a.key,
          },
        },
      },
      {},
      () => {
        db.update(
          { model: model_a },
          {
            $push: {
              map_code: {
                key: button_a.key,
                name: button_a.name,
                code: encodedRaw,
                mapping_code: button_a.mapping_code,
                state: 1,
              },
            },
          },
          {},
          () => {
            resolve("OK");
          }
        );
      }
    );
  });
}

const DB_FOLDER_PATH = "database";
const categoryFolder = fs.readdirSync(DB_FOLDER_PATH);

const fixThemAll = (pathToRemote) => {
  return new Promise((resolve, reject) => {
    const db = new DataStore(pathToRemote);
    db.loadDatabase((err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      db.find({}, async (err, docs) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        // xheck protocol of an remote
        if (docs[0].map_code.length) {
          for (const button of docs[0].map_code) {
            var encoded = encodeRaw(decode(button.code));
            await updateButtonToDB(db, docs[0].model, button, encoded);
          }
          resolve("OK");
        } else {
          try {
            //remove the remote that have no button inside
            fs.unlinkSync(pathToRemote);
          } catch (err) {
            reject(err);
          }
          resolve(null);
        }
      });
    });
  });
};

async function main() {
  // traverse category
  for (category of categoryFolder) {
    console.log(`\n\n===== Category <${category}> =====`);
    const brandFolder = fs.readdirSync(`${DB_FOLDER_PATH}/${category}`);

    // traverse brand
    for (brand of brandFolder) {
      console.log(`*** Brand <${brand}>`);
      const remoteList = fs.readdirSync(
        `${DB_FOLDER_PATH}/${category}/${brand}`
      );
      // traverse remote
      for (remote of remoteList) {
        console.log(remote);
        const result = await fixThemAll(
          `${DB_FOLDER_PATH}/${category}/${brand}/${remote}`
        );
      }
    }
  }
}

main()
  .then(() => {
    console.log("Done!!");
  })
  .catch((err) => {
    console.log(err);
  });

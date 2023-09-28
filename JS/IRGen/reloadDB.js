const { count } = require("console");
const fs = require("fs");
const DataStore = require("nedb");

const DB_FOLDER_PATH = "database";
const categoryFolder = fs.readdirSync(DB_FOLDER_PATH);

const reload = (pathToRemote) => {
  return new Promise((resolve, reject) => {
    const db = new DataStore(pathToRemote);
    db.loadDatabase((err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      db.find({}, (err, docs) => {
        if (err) {
          console.log(err);
          reject(err);
        }

        var protocolArr = [];
        // xheck protocol of an remote
        if (!docs[0].map_code.length) {
          try {
            fs.unlinkSync(pathToRemote);
          } catch (err) {
            reject(err);
          }
        }
        resolve();
      });
    });
  });
};

async function main() {
  var countRemoteTotal = 0;

  for (category of categoryFolder) {
    console.log(`===== Category <${category}> =====`);
    const brandFolder = fs.readdirSync(`${DB_FOLDER_PATH}/${category}`);

    for (brand of brandFolder) {
      var countRemoteBrand = 0;
      console.log(`*** Brand <${brand}>`);
      const remoteList = fs.readdirSync(
        `${DB_FOLDER_PATH}/${category}/${brand}`
      );

      for (remote of remoteList) {
        console.log(remote);
        await reload(`${DB_FOLDER_PATH}/${category}/${brand}/${remote}`);
        // console.log(`${remote}`);
        countRemoteTotal += 1;
        countRemoteBrand += 1;
      }
      console.log(`==========> Count Remote Brand: ${countRemoteBrand}\n`);
    }
  }
  console.log(`\n\n==========> Count Remote Total: ${countRemoteTotal}`);
}

main()
  .then(() => {
    console.log("Done!!");
  })
  .catch((err) => {
    console.log(err);
  });

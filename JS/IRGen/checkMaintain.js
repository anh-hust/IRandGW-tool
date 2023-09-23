const { count } = require("console");
const fs = require("fs");
const DataStore = require("nedb");

const PROTOCOL = [
  "UNKNOWN",
  "UNUSED",
  "RC5",
  "RC6",
  "NEC",
  "SONY",
  "PANASONIC",
  "JVC",
  "SAMSUNG",
  "WHYNTER",
  "AIWA_RC_T501",
  "LG",
  "SANYO",
  "MITSUBISHI",
  "DISH",
  "SHARP",
  "COOLIX", // (15)
  "DAIKIN",
  "DENON",
  "KELVINATOR",
  "SHERWOOD",
  "MITSUBISHI_AC", // (20)
  "RCMM",
  "SANYO_LC7461",
  "RC5X",
  "GREE",
  "PRONTO", // Technically not a protocol", but an encoding. (25)
  "NEC_LIKE",
  "ARGO",
  "TROTEC",
  "NIKAI",
  "RAW", // Technically not a protocol", but an encoding. (30)
  "GLOBALCACHE", // Technically not a protocol", but an encoding.
  "TOSHIBA_AC",
  "FUJITSU_AC",
  "MIDEA",
  "MAGIQUEST", // (35)
  "LASERTAG",
  "CARRIER_AC",
  "HAIER_AC",
  "MITSUBISHI2",
  "HITACHI_AC", // (40)
  "HITACHI_AC1",
  "HITACHI_AC2",
  "GICABLE",
  "HAIER_AC_YRW02",
  "WHIRLPOOL_AC", // (45)
  "SAMSUNG_AC",
  "LUTRON",
  "ELECTRA_AC",
  "PANASONIC_AC",
  "PIONEER", // (50)
  "LG2",
  "MWM",
  "DAIKIN2",
  "VESTEL_AC",
  "TECO", // (55)
  "SAMSUNG36",
  "TCL112AC",
  "LEGOPF",
  "MITSUBISHI_HEAVY_88",
  "MITSUBISHI_HEAVY_152", // 60
  "DAIKIN216",
  "SHARP_AC",
  "GOODWEATHER",
  "INAX",
  "DAIKIN160", // 65
  "NEOCLIMA",
  "DAIKIN176",
  "DAIKIN128",
  "AMCOR",
  "DAIKIN152", // 70
  "MITSUBISHI136",
  "MITSUBISHI112",
  "HITACHI_AC424",
  "SONY_38K",
  "EPSON", // 75
  "SYMPHONY",
  "HITACHI_AC3",
  "DAIKIN64",
  "AIRWELL",
  "DELONGHI_AC", // 80
  "DOSHISHA",
  "MULTIBRACKETS",
  "CARRIER_AC40",
  "CARRIER_AC64",
  "HITACHI_AC344", // 85
  "CORONA_AC",
  "MIDEA24",
  "ZEPEAL",
  "SANYO_AC",
  "VOLTAS", // 90
  "METZ",
  "TRANSCOLD",
  "TECHNIBEL_AC",
  "MIRAGE",
  "ELITESCREENS", // 95
  "PANASONIC_AC32",
  "MILESTAG2",
  "ECOCLIM",
  "XMP",
  "TRUMA", // 100
  "HAIER_AC176",
  "TEKNOPOINT",
  "KELON",
  "TROTEC_3550",
  "SANYO_AC88", // 105
  "BOSE",
  "ARRIS",
  "RHOSS",
  "AIRTON",
  "COOLIX48", // 110
  "HITACHI_AC264",
  "KELON168",
  "HITACHI_AC296",
  "DAIKIN200",
  "HAIER_AC160", // 115
  "CARRIER_AC128",
  "TOTO",
  "CLIMABUTLER",
  "TCL96AC",
  "BOSCH144", // 120
  "SANYO_AC152",
  "DAIKIN312",
  "GORENJE",
  "WOWWEE",
  "CARRIER_AC84", // 125
  "YORK",
];

const DB_FOLDER_PATH = "database";
const categoryFolder = fs.readdirSync(DB_FOLDER_PATH);

const checkRemoteProtocol = (pathToRemote) => {
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
        var buttonsExceed500 = [];
        // xheck protocol of an remote
        if (docs[0].map_code.length) {
          for (const button of docs[0].map_code) {
            protocolIndex =
              Number(
                button.mapping_code.substring(
                  0,
                  button.mapping_code.indexOf("_")
                )
              ) + 1;

            if (!protocolArr.includes(PROTOCOL[protocolIndex], 0)) {
              protocolArr.push(PROTOCOL[protocolIndex]);
            }

            if (button.code.length >= 500) {
              buttonsExceed500.push(`${button.key} (${button.code.length})`);
            }
          }
          var result = {
            protocolArr: protocolArr,
            buttonsExceed500: buttonsExceed500,
          };
          resolve(result);
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
  var log = "";
  var countMaintainRemote = 0;
  // traverse category
  for (category of categoryFolder) {
    console.log(`\n\n===== Category <${category}> =====`);
    log += `\n\n===== Category <${category}> =====`;
    const brandFolder = fs.readdirSync(`${DB_FOLDER_PATH}/${category}`);

    // traverse brand
    for (brand of brandFolder) {
      console.log(`*** Brand <${brand}>`);
      log += `\n*** Brand <${brand}>`;
      const remoteList = fs.readdirSync(
        `${DB_FOLDER_PATH}/${category}/${brand}`
      );
      // traverse remote
      for (remote of remoteList) {
        const result = await checkRemoteProtocol(
          `${DB_FOLDER_PATH}/${category}/${brand}/${remote}`
        );

        if (result == null) {
          continue;
        }
        // if 1 model have more than 1 protocol on buttons so it need to be maintain
        // || if any button exceed 500 length of string
        if (
          result.protocolArr.length > 1 ||
          result.buttonsExceed500.length > 0
        ) {
          var logR = `${remote} - `;
          for (const protocol of result.protocolArr) {
            logR += `${protocol}, `;
          }
          logR += `\n`;
          for (const button of result.buttonsExceed500) {
            logR += `\t${button}\n`;
          }
          console.log(logR);
          log += `\n${logR}`;
          countMaintainRemote += 1;
        }
      }
    }
  }
  console.log(
    `\n\n==========> Number of remote must be maintained: ${countMaintainRemote}`
  );
  log += `\n\n==========> Number of remote must be maintained: ${countMaintainRemote}`;
  fs.writeFileSync("checkMaintain_result.txt", log);
}

main()
  .then(() => {
    console.log("Done!!");
  })
  .catch((err) => {
    console.log(err);
  });

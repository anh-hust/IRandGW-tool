const { convertArrayToCSV } = require("convert-array-to-csv");
const fs = require("fs");

const LIST_FOLDER_PATH = "csvFile";
const DB_FOLDER_PATH = "database";

const header = ["STT", "MODEL", "DOWNLOAD", "NOTE"];

categoryFolder = fs.readdirSync(DB_FOLDER_PATH);

if (!fs.existsSync(LIST_FOLDER_PATH)) {
  fs.mkdirSync(LIST_FOLDER_PATH);
}

for (category of categoryFolder) {
  brandFolder = fs.readdirSync(`${DB_FOLDER_PATH}/${category}`);

  var remoteArray = [];

  for (brand of brandFolder) {
    remoteArray.push([brand]);
    remoteArray.push(header);
    files = fs.readdirSync(`${DB_FOLDER_PATH}/${category}/${brand}`);

    // insert content for csv file, arrays inside array
    var remoteCount = 0;

    for (const file of files) {
      remoteCount += 1;
      remoteArray.push([remoteCount, `Remote ID ${removeExtension(file)}`]);
    }
  }
  const csvFormat = convertArrayToCSV(remoteArray, {
    separator: ",",
  });
  // write file after traverse all files
  fs.appendFileSync(`${LIST_FOLDER_PATH}/${category}.csv`, csvFormat, (err) => {
    if (err) console.log(err);
  });
}

// remove .json file extensions
function removeExtension(filename) {
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

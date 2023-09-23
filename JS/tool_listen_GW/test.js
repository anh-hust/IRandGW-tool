const fs = require("fs");

const allFileContents = fs.readFileSync("test.txt", "utf-8");
lineByline = allFileContents.split(/\r?\n/);
console.log(lineByline);

const fs = require("fs");
// Step 1. Read the gmailList.json file
const createMembers = fs.readFileSync(`${__dirname}/gmailList.json`, "utf8");
// Step 2. Parse the file
const gmailList = JSON.parse(createMembers);
console.log(gmailList);

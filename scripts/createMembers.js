const fs = require("fs");
require("dotenv").config({ path: "./config.env" });

// Step 1. Read the gmailList.json file
const createMembers = fs.readFileSync(`${__dirname}/gmailList.json`, "utf8");

// Step 2. Parse the file
const gmailList = JSON.parse(createMembers);
const apiURL = `${process.env.SERVER_URL}${process.env.API_PREFIX}/members`;

// Step 3. Define a function to Create a new member for each email address
const createMemberPromise = async (member) => {
  const data = {
    gmail: member.gmail,
    pwd: member.pwd,
    recoveryMail: "rec1to100@gmail.com",
    recoveryMailVerified: false,
  };
  const result = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const res = await result.json();
  console.log(res);
};

// Step 4. Define a function to process the array sequentially
async function processArraySequentially(array, processItemFunction) {
  for (const item of array) {
    await processItemFunction(item); // Waits for completion before next iteration
  }
}
// Step 5. Call the function "processArraySequentially" to Create all members of gmailList
processArraySequentially(gmailList, createMemberPromise);

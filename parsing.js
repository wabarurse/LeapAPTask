import fs from "fs";
const fileName = process.argv[2];

const data = fs.readFileSync(fileName, "utf-8");

// Match: Customer no. - Account no. followed by zero or more spaces, then zero or more characters except new line (optional), then one or more digits, then a space, then one or more digits
const customerAccountRegex = /Customer no\. - Account no\.\s*.*?([0-9]+) - ([0-9]+)/;
const customerAccountMatch = data.match(customerAccountRegex);

// Match: Bill date: followed by zero or more spaces, then zero or more characters except new line (optional), then one or more letters (month), then one or more spaces, 
// then one or two digits (day), then a comma, then one or more spaces then four numbers (year)
const billDateRegex = /Bill date:\s*.*?([A-Za-z]+\s+[0-9]{1,2},\s+[0-9]{4})/;
const billDateMatch = data.match(billDateRegex);

// Match: Bill number: followed by zero or more spaces, then zero or more characters except new line (optional), then one or more digits
const billNumberRegex = /Bill number:\s*.*?([0-9]+)/;
const billNumberMatch = data.match(billNumberRegex);

// Match: Bill period: followed by zero or more spaces, then zero or more characters except new line (optional),
// then one or more letters (month), then one or more spaces, then one or two digits (day), then a comma, then one or more spaces
// then four numbers (year), then one or more spaces, then to, then one or more spaces, then one or more letters (month), then one or more spaces,
// then one or two digits (day), then a comma, then one or more spaces then four numbers (year)
const billPeriodRegex = /Bill period:\s*.*?([A-Za-z]+\s+[0-9]{1,2},\s+[0-9]{4})\s+to\s+([A-Za-z]+\s+[0-9]{1,2},\s+[0-9]{4})/;
const billPeriodMatch = data.match(billPeriodRegex);

// Match: Total new charges followed by zero or more spaces, then zero or more characters except new line (optional), then a $ then one or more digits, then a comma, then two digits (cents).
const totalNewChargesRegex = /Total new charges\s*.*?\$([0-9,]+\.[0-9]{2})/;
const totalNewChargesMatch = data.match(totalNewChargesRegex);

console.log("Customer Number: ", customerAccountMatch ? customerAccountMatch[1] : "Not found");
console.log("Account Number: ", customerAccountMatch ? customerAccountMatch[2] : "Not found");
console.log("Bill Date: ", billDateMatch ? billDateMatch[1] : "Not found");
console.log("Bill Number: ", billNumberMatch ? billNumberMatch[1] : "Not found");
console.log("Bill Period: ", billPeriodMatch ? billPeriodMatch[1] + " to " + billPeriodMatch[2] : "Not found");
console.log("Total New Charges: ", totalNewChargesMatch ? totalNewChargesMatch[1] : "Not found");


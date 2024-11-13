const dotenv = require("dotenv");
const { google } = require("googleapis");

dotenv.config();

const client_email = process.env.CLIENT_EMAIL;
const private_key = process.env.PRIVATE_KEY;

if (!client_email || !private_key) {
  console.log("client_email or private key error");
  return 0;
}

const auth = new google.auth.JWT(client_email, null, private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);
// google spread sheet api 가져오기
const sheets = google.sheets({
  version: "v4",
  auth: auth,
});

const sheetId = process.env.GOOGLE_SHEET_ID;

async function list() {
  const name = [
    "공통밈",
    "케미",
    "character",
    "gomem",
    "woo",
    "ine",
    "jingburger",
    "lilpa",
    "jururu",
    "gosegu",
    "viichan",
  ];
  let data = [];
  for (let i = 0; i < name.length; i++) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${name[i]}!A2:H`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return;
    }
    rows.forEach((row) => {
      if (row.length !== 0 && row[1]) data.push(getJson(row));
    });
  }
  //fs.writeFileSync("./data.json", JSON.stringify(data));
  return data;
}

function getJson(row) {
  const data = {
    _id: row[0],
    keyword: row[1].trim(),
    mean: row[2],
    info: row[3],
    tag: row[4].split(", "),
    url: row[5] ? row[5].split(" \n") : null,
    bgm: row[6] ? row[6] : "woo-8",
    type: row[7] ? row[7] : "WAKTA",
  };
  return data;
}

module.exports = { list };

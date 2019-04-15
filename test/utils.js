const { padLeft } = require("web3-utils");

function ts(date) {
  date = date || new Date();
  return Math.round(date.getTime()).toString();
}

function randomAddress() {
  return padLeft("0x" + ts(), 40);
}

module.exports = {
  ts,
  randomAddress
};

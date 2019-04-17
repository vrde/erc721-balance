const { padLeft } = require("web3-utils");
let COUNTER = new Date().getTime();

function integer() {
  return COUNTER++;
}

function string() {
  return integer().toString();
}

function address() {
  return padLeft("0x" + string(), 40);
}

module.exports = {
  integer,
  string,
  address
};

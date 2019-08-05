const cryptokitties = require("./cryptokitties");
const mlb = require("./mlb");
const events = require("./events");
const enumerable = require("./enumerable");

const routes = [cryptokitties, mlb, enumerable, events];

async function dispatch(web3, contractAddress) {
  let i;
  for (i = 0; i < routes.length; i++) {
    let r = await routes[i].match(web3, contractAddress);
    if (r) {
      break;
    }
  }
  if (i === routes.length) {
    throw new Error("Cannot dispatch request");
  }
  return routes[i];
}

module.exports = {
  dispatch
};

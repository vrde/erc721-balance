import Web3 from "web3";

import cryptokitties from "./cryptokitties";
import mlb from "./mlb";
import events from "./events";
import enumerable from "./enumerable";

const routes = [cryptokitties, mlb, enumerable, events];

async function dispatch(web3: Web3, contractAddress: string) {
  let i: number;
  for (i = 0; i < routes.length; i++) {
    if (await routes[i].match(web3, contractAddress)) {
      break;
    }
  }
  if (routes[i] === undefined) {
    throw new Error("Cannot dispatch request");
  }
  return routes[i];
}

export default {
  dispatch
};

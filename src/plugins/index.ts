import Web3 from "web3";

import * as cryptokitties from "./cryptokitties";
import * as mlb from "./mlb";
import * as events from "./events";
import * as enumerable from "./enumerable";
import { IToken } from "./common";
import Contract from "web3/eth/contract";

const strategies = [cryptokitties, mlb, enumerable, events];

interface IStrategy {
  getTokens(
    web3: Web3,
    contractAddress: string,
    ownerAddress: string
  ): Promise<Promise<IToken>[]>;
  getTokenMetadata(contract: Contract, token: IToken): Promise<IToken>;
}

export async function dispatch(
  web3: Web3,
  contractAddress: string
): Promise<IStrategy> {
  let i: number;
  for (i = 0; i < strategies.length; i++) {
    if (await strategies[i].match(web3, contractAddress)) {
      break;
    }
  }
  if (strategies[i] === undefined) {
    throw new Error("Cannot dispatch request");
  }
  return {
    getTokens: strategies[i].getTokens,
    getTokenMetadata: strategies[i].getTokenMetadata
  };
}

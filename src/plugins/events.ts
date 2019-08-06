import Web3 from "web3";
import { getTokenURI, getTokenURIAndMetadata, IToken } from "./common";
import ERC721ABI from "../../abis/erc721.abi.json";

export function match(web3: Web3, contractAddress: string) {
  return true;
}

const { sha3, padLeft } = Web3.utils;

// Inspired by:
// https://github.com/TimDaub/ERC721-wallet/blob/master/src/sagas/fetchTransactions.js
export async function getTokens(
  web3: Web3,
  contractAddress: string,
  ownerAddress: string
): Promise<Promise<IToken>[]> {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const promises = [];

  const outputs = await contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      sha3("Transfer(address,address,uint256)"),
      padLeft(ownerAddress, 64, "0"),
      ""
    ]
  });

  const inputs = await contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      sha3("Transfer(address,address,uint256)"),
      "",
      padLeft(ownerAddress, 64, "0")
    ]
  });

  for (let i = 0; i < outputs.length; i++) {
    const outputTokenId = outputs[i].returnValues.tokenId;
    for (let j = 0; j < inputs.length; j++) {
      const inputTokenId = inputs[j].returnValues.tokenId;
      if (outputTokenId === inputTokenId) {
        inputs.splice(j, 1);
      }
    }
  }

  return inputs.map(
    input =>
      new Promise(resolve => resolve({ tokenId: input.returnValues.tokenId }))
  );
}

export const getTokenMetadata = getTokenURIAndMetadata;

import Web3 from "web3";
import { IToken } from "./common";

import { hasMethod } from "./utils";
import { getTokenURIAndMetadata } from "./common";
import ERC721EnumerableABI from "../../abis/erc721enumerable.abi.json";

export async function match(web3: Web3, contractAddress: string) {
  return await hasMethod(
    web3,
    contractAddress,
    "tokenOfOwnerByIndex(address,uint256)"
  );
}

export async function getTokens(
  web3: Web3,
  contractAddress: string,
  ownerAddress: string
): Promise<Promise<IToken>[]> {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const total = await contract.methods.balanceOf(ownerAddress).call();
  const promises = [];

  for (let i = 0; i < total; i++) {
    promises.push(
      contract.methods
        .tokenOfOwnerByIndex(ownerAddress, i)
        .call()
        .then((tokenId: string) => ({
          tokenId
        }))
    );
  }
  return promises;
}

export const getTokenMetadata = getTokenURIAndMetadata;

import Web3 from "web3";
import { IToken } from "./common";
import Contract from "web3/eth/contract";
import fetch from "node-fetch";

export async function match(
  web3: Web3,
  contractAddress: string
): Promise<boolean> {
  return contractAddress === "0x06012c8cf97bead5deae237070f9587f8e7a266d";
}

export async function getTokens(
  web3: Web3,
  contractAddress: string,
  ownerAddress: string
): Promise<Promise<IToken>[]> {
  let response;
  let tokens;
  response = await fetch(
    "https://api.cryptokitties.co/kitties/all/" + ownerAddress
  );
  tokens = await response.json();
  return tokens.map((token: { id: string }) => {
    return new Promise(resolve =>
      resolve({
        tokenId: token.id,
        tokenURI: "https://api.cryptokitties.co/kitties/" + token.id
      })
    );
  });
}

export async function getTokenMetadata(
  _: Contract,
  token: IToken
): Promise<IToken> {
  // pls change this asap
  const response = await fetch(token.tokenURI || "");
  const metadata = await response.json();
  return {
    ...token,
    metadata: {
      name: metadata.name,
      description: metadata.bio,
      image: metadata.image_url,
      link: "https://www.cryptokitties.co/kitty/" + token.tokenId,
      raw: metadata
    }
  };
}

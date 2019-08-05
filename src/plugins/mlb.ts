import {
  getTokenURI,
  getTokenMetadata as _getTokenMetadata,
  IToken
} from "./common";
import Web3 from "web3";
import Contract from "web3/eth/contract";
export { getTokens } from "./enumerable";

export async function match(
  web3: Web3,
  contractAddress: string
): Promise<boolean> {
  return contractAddress === "0x8c9b261faef3b3c2e64ab5e58e04615f8c788099";
}

export async function getTokenMetadata(
  contract: Contract,
  token: IToken
): Promise<IToken> {
  const tokenURI = await getTokenURI(contract, token.tokenId);
  const tokenMetadata = await _getTokenMetadata(tokenURI);
  const link = "https://www.mlbcryptobaseball.com/asset/" + token.tokenId;
  return {
    tokenURI,
    metadata: {
      link,
      ...tokenMetadata
    },
    ...token
  };
}

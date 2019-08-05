import Contract from "web3/eth/contract";
import fetch from "node-fetch";

export interface ITokenMetadata {
  name: string;
  description: string;
  image: string;
  link?: string;
  raw: any;
}

export interface IToken {
  tokenId: string;
  tokenURI?: string;
  error?: string;
  metadata?: ITokenMetadata;
}

export async function getTokenURI(
  contract: Contract,
  tokenId: string
): Promise<string> {
  return await contract.methods.tokenURI(tokenId).call();
}

export async function getTokenMetadata(
  tokenURI: string
): Promise<ITokenMetadata> {
  const response = await fetch(tokenURI);
  const metadata = await response.json();
  return {
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    raw: metadata
  };
}

export async function getTokenURIAndMetadata(
  contract: Contract,
  token: IToken
): Promise<IToken> {
  const tokenURI = await getTokenURI(contract, token.tokenId);
  const tokenMetadata = await getTokenMetadata(tokenURI);
  return {
    ...token,
    metadata: tokenMetadata
  };
}

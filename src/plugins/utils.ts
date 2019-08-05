import Web3 from "web3";

// From: https://ethereum.stackexchange.com/a/50091/33448
export async function hasMethod(
  web3: Web3,
  contractAddress: string,
  signature: string
) {
  const code = await web3.eth.getCode(contractAddress);
  const hash = web3.eth.abi.encodeFunctionSignature(signature);
  return code.indexOf(hash.slice(2, hash.length)) > 0;
}

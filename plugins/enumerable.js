const { hasMethod } = require("./utils");
const { getTokenURI, getTokenURIAndMetadata } = require("./common");
const ERC721EnumerableABI = require("../abis/erc721enumerable.abi.json");

async function match(web3, contractAddress) {
  return await hasMethod(
    web3,
    contractAddress,
    "tokenOfOwnerByIndex(address,uint256)"
  );
}

async function getTokens(web3, contractAddress, ownerAddress) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const total = await contract.methods.balanceOf(ownerAddress).call();
  const promises = [];

  for (let i = 0; i < total; i++) {
    promises.push(contract.methods.tokenOfOwnerByIndex(ownerAddress, i).call());
  }
  return promises;
}

module.exports = {
  match,
  getTokens,
  getTokenMetadata: getTokenURIAndMetadata
};

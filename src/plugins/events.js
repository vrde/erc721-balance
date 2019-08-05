const { sha3, padLeft } = require("web3-utils");
const { getTokenURI, getTokenURIAndMetadata } = require("./common");
const ERC721ABI = require("../../abis/erc721.abi.json");

function match(web3, contractAddress) {
  return true;
}

// Inspired by:
// https://github.com/TimDaub/ERC721-wallet/blob/master/src/sagas/fetchTransactions.js
async function getTokens(web3, contractAddress, ownerAddress) {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const promises = [];

  const outputs = await contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      sha3("Transfer(address,address,uint256)"),
      padLeft(ownerAddress, 64),
      null
    ]
  });

  const inputs = await contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      sha3("Transfer(address,address,uint256)"),
      null,
      padLeft(ownerAddress, 64)
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
    input => new Promise(resolve => resolve(input.returnValues.tokenId))
  );
}

module.exports = {
  match,
  getTokens,
  getTokenMetadata: getTokenURIAndMetadata
};

const { sha3, padLeft } = require("web3-utils");
const ERC721EnumerableABI = require("./erc721enumerable.abi.json");

// Inspired by:
// https://github.com/TimDaub/ERC721-wallet/blob/master/src/sagas/fetchTransactions.js
async function* tokensViaEvents(web3, contractAddress, ownerAddress) {
  contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
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
  for (let i = 0; i < inputs.length; i++) {
    yield inputs[i].returnValues.tokenId;
  }
}

async function* tokensViaEnum(web3, contractAddress, ownerAddress) {
  contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const n = await contract.methods.balanceOf(ownerAddress).call();

  let promises = {};

  for (let i = 0; i < n; i++) {
    promises[i] = new Promise((resolve, reject) =>
      contract.methods
        .tokenOfOwnerByIndex(ownerAddress, i)
        .call()
        .then(r => resolve([i, r]))
    );
  }
  while (Object.values(promises).length) {
    let [i, v] = await Promise.race(Object.values(promises));
    delete promises[i];
    yield v;
  }
}

async function* tokensViaEnumBatch(web3, contractAddress, ownerAddress) {
  contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const n = await contract.methods.balanceOf(ownerAddress).call();

  let promises = {};
  const batch = new web3.BatchRequest();

  for (let i = 0; i < n; i++) {
    promises[i] = new Promise((resolve, reject) =>
      batch.add(
        contract.methods
          .tokenOfOwnerByIndex(ownerAddress, i)
          .call.request({ from: ownerAddress }, (a, b) => resolve([i, b]))
      )
    );
  }
  batch.execute();
  while (Object.values(promises).length) {
    let [i, v] = await Promise.race(Object.values(promises));
    delete promises[i];
    yield v;
  }
}

// From: https://ethereum.stackexchange.com/a/50091/33448
async function hasMethod(web3, contractAddress, signature) {
  const code = await web3.eth.getCode(contractAddress);
  const hash = web3.eth.abi.encodeFunctionSignature(signature);
  return code.indexOf(hash.slice(2, hash.length)) > 0;
}

async function isEnumerable(web3, contractAddress) {
  return await hasMethod(
    web3,
    contractAddress,
    "tokenOfOwnerByIndex(address,uint256)"
  );
}

async function hasMetadata(web3, contractAddress) {
  return await hasMethod(web3, contractAddress, "tokenURI(uint256)");
}

async function yieldTokensOfOwner(web3, contractAddress, ownerAddress) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  let strategy;
  if (await isEnumerable(web3, contractAddress)) {
    strategy = tokensViaEnum;
  } else {
    strategy = tokensViaEvents;
  }
  return strategy(web3, contractAddress, ownerAddress);
}

async function getTokensOfOwner(web3, contractAddress, ownerAddress) {
  const gen = await yieldTokensOfOwner(web3, contractAddress, ownerAddress);
  const tokens = [];

  while (true) {
    let { value, done } = await gen.next();
    if (done) {
      break;
    }
    tokens.push(value);
  }
  return tokens;
}

module.exports = {
  hasMethod,
  isEnumerable,
  hasMetadata,
  getTokensOfOwner
};

global.fetch = require("node-fetch");
const { sha3, padLeft } = require("web3-utils");
const ERC721EnumerableABI = require("./erc721enumerable.abi.json");

// Inspired by:
// https://github.com/TimDaub/ERC721-wallet/blob/master/src/sagas/fetchTransactions.js
async function tokensViaEvents(web3, contractAddress, ownerAddress) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
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
    i => new Promise(resolve => resolve(i.returnValues.tokenId))
  );
}

async function tokensViaEnum(web3, contractAddress, ownerAddress) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const total = await contract.methods.balanceOf(ownerAddress).call();
  const promises = [];

  for (let i = 0; i < total; i++) {
    promises.push(contract.methods.tokenOfOwnerByIndex(ownerAddress, i).call());
  }
  return promises;
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

function subscribe(web3, contractAddress, ownerAddress, wantMetadata = true) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const funcs = {};
  const onAddCallbacks = [];
  const onRemoveCallbacks = [];
  const listen = true;

  function onAdd(callback) {
    onAddCallbacks.push(callback);
    return funcs;
  }

  function onRemove(callback) {
    onRemoveCallbacks.push(callback);
    return funcs;
  }

  function unsubscribe() {
    listen = false;
  }

  funcs.onAdd = onAdd;
  funcs.onRemove = onRemove;
  funcs.unsubscribe = unsubscribe;

  setTimeout(async () => {
    const strategy = (await isEnumerable(web3, contractAddress))
      ? tokensViaEnum
      : tokensViaEvents;

    const promises = await strategy(web3, contractAddress, ownerAddress);
    for (let i = 0; i < promises.length; i++) {
      if (wantMetadata) {
        promises[i] = promises[i]
          .then(tokenId => getTokenURI(contract, tokenId))
          .then(data => getTokenMetadata(contract, data));
      }
      promises[i].then(value =>
        onAddCallbacks.map(callback => callback(value))
      );
    }
  });
  return funcs;
}

async function getTokenURI(contract, tokenId) {
  const tokenURI = await contract.methods.tokenURI(tokenId).call();
  return {
    tokenId,
    tokenURI
  };
}

async function getTokenMetadata(contract, { tokenId, tokenURI }) {
  let response;
  let metadata;
  try {
    response = await fetch(tokenURI);
    metadata = await response.json();
  } catch (error) {
    console.log(error);
    return { tokenId, tokenURI, error };
  }
  return {
    tokenId,
    tokenURI,
    metadata
  };
}

async function getTokensOfOwner(
  web3,
  contractAddress,
  ownerAddress,
  wantMetadata = true
) {
  const contract = new web3.eth.Contract(ERC721EnumerableABI, contractAddress);
  const total = await contract.methods.balanceOf(ownerAddress).call();
  const tokens = [];

  return new Promise((resolve, reject) => {
    const s = subscribe(web3, contractAddress, ownerAddress, wantMetadata);
    s.onAdd(token => {
      tokens.push(token);
      if (tokens.length == total) {
        resolve(tokens);
      }
    });
  });
}

module.exports = {
  hasMethod,
  isEnumerable,
  hasMetadata,
  subscribe,
  getTokensOfOwner
};

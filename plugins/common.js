global.fetch = require("node-fetch");

async function getTokenURI(contract, tokenId) {
  const tokenURI = await contract.methods.tokenURI(tokenId).call();
  return {
    tokenId,
    tokenURI
  };
}

async function getTokenMetadata(contract, data) {
  const { tokenId, tokenURI } = data;
  let response;
  let metadata;
  try {
    response = await fetch(tokenURI);
    metadata = await response.json();
  } catch (error) {
    console.log(error);
    return (data.error = error);
  }
  return Object.assign(data, {
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    raw: metadata
  });
}

async function getTokenURIAndMetadata(contract, tokenId) {
  const { tokenURI } = await getTokenURI(contract, tokenId);
  return await getTokenMetadata(contract, { tokenId, tokenURI });
}

module.exports = {
  getTokenURI,
  getTokenMetadata,
  getTokenURIAndMetadata
};

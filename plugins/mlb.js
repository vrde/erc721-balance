const { getTokenMetadata: _getTokenMetadata } = require("./common");
const { getTokens } = require("./enumerable");

async function match(web3, contractAddress) {
  return new Promise(resolve =>
    resolve(contractAddress === "0x8c9b261faef3b3c2e64ab5e58e04615f8c788099")
  );
}

async function getTokenURI(contract, tokenId) {
  return new Promise(resolve =>
    resolve({
      tokenId: tokenId
    })
  );
}

async function getTokenMetadata(contract, tokenId) {
  const { tokenURI } = await getTokenURI(contract, tokenId);
  const data = await _getTokenMetadata(contract, { tokenId, tokenURI });
  data.link = "https://www.mlbcryptobaseball.com/asset/" + tokenId;
  return data;
}

module.exports = {
  match,
  getTokens,
  getTokenMetadata
};

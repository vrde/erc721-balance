async function match(web3, contractAddress) {
  return new Promise(resolve =>
    resolve(contractAddress === "0x06012c8cf97bead5deae237070f9587f8e7a266d")
  );
}

async function getTokens(
  web3,
  contractAddress,
  ownerAddress,
  wantMetadata = true
) {
  let response;
  let tokens;
  try {
    response = await fetch(
      "https://api.cryptokitties.co/kitties/all/" + ownerAddress
    );
    tokens = await response.json();
  } catch (err) {
    throw err;
  }
  return tokens.map(
    token =>
      new Promise(resolve =>
        resolve({
          tokenId: token.id,
          tokenURI: "https://api.cryptokitties.co/kitties/" + token.id
        })
      )
  );
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
    return { tokenId, tokenURI, error };
  }
  return Object.assign(data, {
    name: metadata.name,
    description: metadata.bio,
    image: metadata.image_url,
    link: "https://www.cryptokitties.co/kitty/" + tokenId,
    raw: metadata
  });
}

module.exports = {
  match,
  getTokens,
  getTokenMetadata
};

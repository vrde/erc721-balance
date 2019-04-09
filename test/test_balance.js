const { getTokensOfOwner } = require("../");
const MyERC721 = artifacts.require("MyERC721");
const MyERC721Enumerable = artifacts.require("MyERC721Enumerable");

contract("ERC721", async accounts => {
  it("getTokensOfOwner", async () => {
    const myERC721 = await MyERC721.deployed();
    const ownerToTokens = {};

    for (let i = 0; i < 1; i++) {
      let tokens = [];
      for (let t = 0; t < 10; t++) {
        let tokenId = t + i * 10;
        await myERC721.mint(accounts[i], tokenId, { from: accounts[i] });
        tokens.push(tokenId.toString());
      }
      ownerToTokens[accounts[i]] = tokens;
    }

    assert.deepEqual(
      await getTokensOfOwner(web3, myERC721.address, accounts[0]),
      ownerToTokens[accounts[0]]
    );
  });
});

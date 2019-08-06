const { writeFileSync } = require("fs");
const { padLeft } = require("web3-utils");
const MyERC721 = artifacts.require("MyERC721");
const MyERC721Enumerable = artifacts.require("MyERC721Enumerable");

module.exports = function(deployer) {
  deployer
    .deploy(MyERC721, "test", "TEST")
    .then(() =>
      writeFileSync(
        "./src/abis/erc721.abi.json",
        JSON.stringify(MyERC721.abi, null, 2)
      )
    );
  deployer
    .deploy(MyERC721Enumerable, "test", "TEST")
    .then(() =>
      writeFileSync(
        "./src/abis/erc721enumerable.abi.json",
        JSON.stringify(MyERC721Enumerable.abi, null, 2)
      )
    );
};

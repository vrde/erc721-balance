const { hasMethod, isEnumerable } = require("../");
const MyERC721 = artifacts.require("MyERC721");
const MyERC721Enumerable = artifacts.require("MyERC721Enumerable");

describe("hasMethod", () => {
  it("detects if a contract method exists", async () => {
    assert.isFalse(
      await hasMethod(
        web3,
        MyERC721.address,
        "tokenOfOwnerByIndex(address,uint256)"
      )
    );
    assert.isTrue(
      await hasMethod(
        web3,
        MyERC721Enumerable.address,
        "tokenOfOwnerByIndex(address,uint256)"
      )
    );
  });
  it("detects if a contract is enumerable", async () => {
    assert.isFalse(await isEnumerable(web3, MyERC721.address));
    assert.isTrue(await isEnumerable(web3, MyERC721Enumerable.address));
  });
});

const fetchMock = require("fetch-mock");
const { getTokensOfOwner } = require("../");
const MyERC721 = artifacts.require("MyERC721");
const MyERC721Enumerable = artifacts.require("MyERC721Enumerable");

contract("ERC721 Metadata", async accounts => {
  beforeEach(() => {
    fetchMock.get("*", url => ({
      title: "token " + url.split("/")[3]
    }));
  });
  afterEach(() => {
    fetchMock.restore();
  });

  it("getTokensOfOwner with metadata", async () => {
    const [alice] = accounts;
    const myERC721 = await MyERC721.deployed();

    await myERC721.mint(alice, "1", "http://example.com/1", {
      from: alice
    });

    await myERC721.mint(alice, "10", "http://example.com/10", {
      from: alice
    });

    await myERC721.mint(alice, "666", "http://example.com/666", {
      from: alice
    });

    const tokens = await getTokensOfOwner(web3, myERC721.address, alice);
    tokens.sort((a, b) => parseInt(a.tokenId, 10) - parseInt(b.tokenId, 10));

    assert.deepEqual(tokens, [
      {
        tokenId: "1",
        tokenURI: "http://example.com/1",
        metadata: { title: "token 1" }
      },
      {
        tokenId: "10",
        tokenURI: "http://example.com/10",
        metadata: { title: "token 10" }
      },
      {
        tokenId: "666",
        tokenURI: "http://example.com/666",
        metadata: { title: "token 666" }
      }
    ]);
  });
});

const fetchMock = require("fetch-mock");
const { getTokensOfOwner } = require("../");
const { randomAddress } = require("./utils");
const MyERC721 = artifacts.require("MyERC721");
const MyERC721Enumerable = artifacts.require("MyERC721Enumerable");

contract("ERC721 Metadata", async accounts => {
  beforeEach(() => {
    fetchMock.get("*", url => ({
      description: "description " + url.split("/")[3],
      image: "image " + url.split("/")[3],
      name: "name " + url.split("/")[3],
      extra: "extra " + url.split("/")[3]
    }));
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("getTokensOfOwner with metadata", async () => {
    const [alice] = accounts;
    const dest = randomAddress();
    const myERC721 = await MyERC721.deployed();

    await myERC721.mint(dest, "1", "http://example.com/1", {
      from: alice
    });

    await myERC721.mint(dest, "10", "http://example.com/10", {
      from: alice
    });

    await myERC721.mint(dest, "666", "http://example.com/666", {
      from: alice
    });

    const tokens = await getTokensOfOwner(web3, myERC721.address, dest);
    tokens.sort((a, b) => parseInt(a.tokenId, 10) - parseInt(b.tokenId, 10));

    assert.deepEqual(tokens, [
      {
        tokenId: "1",
        tokenURI: "http://example.com/1",
        description: "description 1",
        image: "image 1",
        name: "name 1",
        raw: {
          description: "description 1",
          image: "image 1",
          name: "name 1",
          extra: "extra 1"
        }
      },
      {
        tokenId: "10",
        tokenURI: "http://example.com/10",
        description: "description 10",
        image: "image 10",
        name: "name 10",
        raw: {
          description: "description 10",
          image: "image 10",
          name: "name 10",
          extra: "extra 10"
        }
      },
      {
        tokenId: "666",
        tokenURI: "http://example.com/666",
        description: "description 666",
        image: "image 666",
        name: "name 666",
        raw: {
          description: "description 666",
          image: "image 666",
          name: "name 666",
          extra: "extra 666"
        }
      }
    ]);
  });
});

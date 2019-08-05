const fetchMock = require("fetch-mock");
const { getTokensOfOwner } = require("../lib");
const generate = require("./generate");
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
    const dest = generate.address();
    const myERC721 = await MyERC721.deployed();

    const tid = [generate.string(), generate.string(), generate.string()];

    await myERC721.mint(dest, tid[0], "http://example.com/" + tid[0], {
      from: alice
    });

    await myERC721.mint(dest, tid[1], "http://example.com/" + tid[1], {
      from: alice
    });

    await myERC721.mint(dest, tid[2], "http://example.com/" + tid[2], {
      from: alice
    });

    const tokens = await getTokensOfOwner(web3, myERC721.address, dest);
    tokens.sort((a, b) => parseInt(a.tokenId, 10) - parseInt(b.tokenId, 10));

    assert.deepEqual(tokens, [
      {
        tokenId: tid[0],
        tokenURI: "http://example.com/" + tid[0],
        description: "description " + tid[0],
        image: "image " + tid[0],
        name: "name " + tid[0],
        raw: {
          description: "description " + tid[0],
          image: "image " + tid[0],
          name: "name " + tid[0],
          extra: "extra " + tid[0]
        }
      },
      {
        tokenId: tid[1],
        tokenURI: "http://example.com/" + tid[1],
        description: "description " + tid[1],
        image: "image " + tid[1],
        name: "name " + tid[1],
        raw: {
          description: "description " + tid[1],
          image: "image " + tid[1],
          name: "name " + tid[1],
          extra: "extra " + tid[1]
        }
      },
      {
        tokenId: "" + tid[2],
        tokenURI: "http://example.com/" + tid[2],
        description: "description " + tid[2],
        image: "image " + tid[2],
        name: "name " + tid[2],
        raw: {
          description: "description " + tid[2],
          image: "image " + tid[2],
          name: "name " + tid[2],
          extra: "extra " + tid[2]
        }
      }
    ]);
  });
});

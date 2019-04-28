const Web3 = require("web3");
const { getTokensOfOwner } = require("../");

describe("CryptoKitties", () => {
  it("getTokensOfOwner", async () => {
    const web3 = new Web3("https://mainnet.infura.io/");
    try {
      const tokens = await getTokensOfOwner(
        web3,
        "0x06012c8cf97bead5deae237070f9587f8e7a266d",
        "0xfaded37388bb491e7cf33239389206d8bcf4f482"
      );
      assert(tokens.length > 0);
    } catch (e) {
      console.log("err", e);
    }
  });
});

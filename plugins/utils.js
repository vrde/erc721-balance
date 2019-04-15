// From: https://ethereum.stackexchange.com/a/50091/33448
async function hasMethod(web3, contractAddress, signature) {
  const code = await web3.eth.getCode(contractAddress);
  const hash = web3.eth.abi.encodeFunctionSignature(signature);
  return code.indexOf(hash.slice(2, hash.length)) > 0;
}

module.exports = {
  hasMethod
};

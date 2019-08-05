import { dispatch } from "./plugins";
import ERC721ABI from "../abis/erc721.abi.json";

function subscribe(web3, contractAddress, ownerAddress, wantMetadata = true) {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const funcs = {};
  const onAddCallbacks = [];
  const onRemoveCallbacks = [];
  const listen = true;

  function onAdd(callback) {
    onAddCallbacks.push(callback);
    return funcs;
  }

  function onRemove(callback) {
    onRemoveCallbacks.push(callback);
    return funcs;
  }

  function unsubscribe() {
    listen = false;
  }

  funcs.onAdd = onAdd;
  funcs.onRemove = onRemove;
  funcs.unsubscribe = unsubscribe;

  setTimeout(async () => {
    const { getTokens, getTokenMetadata } = await dispatch(
      web3,
      contractAddress
    );

    const promises = await getTokens(web3, contractAddress, ownerAddress);
    for (let i = 0; i < promises.length; i++) {
      if (wantMetadata) {
        promises[i] = promises[i].then(getTokenMetadata.bind(null, contract));
      }
      promises[i].then(value =>
        onAddCallbacks.map(callback => callback(value))
      );
    }
  });
  return funcs;
}

async function getTokensOfOwner(
  web3,
  contractAddress,
  ownerAddress,
  wantMetadata = true
) {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const total = parseInt(
    await contract.methods.balanceOf(ownerAddress).call(),
    10
  );
  const tokens = [];

  return new Promise((resolve, reject) => {
    if (total === 0) {
      resolve([]);
    }
    const s = subscribe(web3, contractAddress, ownerAddress, wantMetadata);
    s.onAdd(token => {
      tokens.push(token);
      if (tokens.length === total) {
        resolve(tokens);
      }
    });
  });
}

export default {
  // hasMetadata,
  subscribe,
  getTokensOfOwner
};

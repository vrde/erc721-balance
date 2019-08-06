import Web3 from "web3";
import { dispatch } from "./plugins";
import ERC721ABI from "./abis/erc721.abi.json";
import { IToken } from "./plugins/common";
import { UnderscoreStatic } from "underscore";

type UseToken = (token: IToken) => void;

class TokenEmitter {
  onAddCallbacks: Array<UseToken>;
  onRemoveCallbacks: Array<UseToken>;

  constructor() {
    this.onAddCallbacks = [];
    this.onRemoveCallbacks = [];
  }

  dispatchAdd(token: IToken) {
    this.onAddCallbacks.forEach(callback => callback(token));
  }

  dispatchRemove(token: IToken) {
    this.onRemoveCallbacks.forEach(callback => callback(token));
  }

  onAdd(callback: UseToken) {
    this.onAddCallbacks.push(callback);
    return this;
  }

  onRemove(callback: UseToken) {
    this.onRemoveCallbacks.push(callback);
    return this;
  }

  unsubscribe() {}
}

export function subscribe(
  web3: Web3,
  contractAddress: string,
  ownerAddress: string,
  wantMetadata: boolean = true
) {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const tokenEmitter = new TokenEmitter();
  let listen = true;

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
      promises[i].then(tokenEmitter.dispatchAdd.bind(tokenEmitter));
    }
  }, 0);
  return tokenEmitter;
}

export async function getTokensOfOwner(
  web3: Web3,
  contractAddress: string,
  ownerAddress: string,
  wantMetadata: boolean = true
) {
  const contract = new web3.eth.Contract(ERC721ABI, contractAddress);
  const total = parseInt(
    await contract.methods.balanceOf(ownerAddress).call(),
    10
  );
  const tokens: Array<IToken> = [];

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

pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";

contract MyERC721Enumerable is ERC721, ERC721Enumerable, ERC721Metadata {

  constructor (string memory name, string memory symbol)
    ERC721Metadata(name, symbol)
    public {}

  function mint(address to, uint256 tokenId, string calldata tokenURI) external {
    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);
  }
}

pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract MyERC721 is ERC721 {
  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }
}

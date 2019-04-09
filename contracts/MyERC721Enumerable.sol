pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol";

contract MyERC721Enumerable is ERC721, ERC721Enumerable {
  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }
}

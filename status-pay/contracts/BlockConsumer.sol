// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

import "./IBlockRelay.sol";

contract BlockConsumer {
  IBlockRelay private blockRelay;
  function() view returns(uint256) internal currentBlock;
  function(uint256) view returns(bytes32) internal blockHash;
  function() view returns(uint256) internal blockTimestamp;

  function _setBlockRelay(address _blockRelay) internal {
    blockRelay = IBlockRelay(_blockRelay);

    if (_blockRelay == address(0)) {
      currentBlock = internalBlockNumber;
      blockHash = internalBlockHash;
      blockTimestamp = internalBlockTimestamp;
    } else {
      currentBlock = relayedBlockNumber;
      blockHash = relayedBlockHash;
      // see how to handle timestamp on L2
      blockTimestamp = internalBlockTimestamp;
    }
  }

  function validateAnchorBlock(uint256 _blockNumber, bytes32 _blockHash, uint256 _maxTxDelayInBlocks) internal view returns (uint256) {
    uint256 blockNumber = currentBlock();

    // check that the block number used for signing is not newer than the block number
    require(_blockNumber < blockNumber, "transaction cannot be in the future");

    // check that the block number used is not too old
    require(_blockNumber >= (blockNumber - _maxTxDelayInBlocks), "transaction too old");

    // check that the blockHash is valid
    require(_blockHash == blockHash(_blockNumber), "invalid block hash");

    return blockNumber;
  }

  function relayedBlockNumber() internal view returns (uint256) {
    // block.number is expected to return the block we are running on, not the latest committed one
    return blockRelay.getLast() + 1;
  }

  function relayedBlockHash(uint256 _num) internal view returns (bytes32) {
    return blockRelay.getHash(_num);
  }

  function internalBlockNumber() internal view returns (uint256) {
    return block.number;
  }

  function internalBlockHash(uint256 _num) internal view returns (bytes32) {
    return blockhash(_num);
  }

  function internalBlockTimestamp() internal view returns (uint256) {
    return block.timestamp;
  }

  function blockHistorySize() internal view returns (uint256) {
    if (address(blockRelay) == address(0)) {
      return 255;
    } else {
      return blockRelay.historySize();
    }
  }
}
import { AbiItem } from 'web3-utils';

export const abi: AbiItem[] = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "name",
        "type": "bytes3"
      },
      {
        "name": "keycard",
        "type": "address"
      },
      {
        "name": "maxTxValue",
        "type": "uint256"
      }
    ],
    "name": "create",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ownerWalletsCount",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "keycardsWallets",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ownersWallets",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "wallet",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "name",
        "type": "bytes3"
      }
    ],
    "name": "NewWallet",
    "type": "event",
  }
]

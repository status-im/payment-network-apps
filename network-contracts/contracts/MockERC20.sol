pragma solidity >=0.5.0 <0.7.0;

import "./IERC20.sol";

contract MockERC20 is IERC20 {
    constructor() public {
        totalSupply = 1000;
    }

    function balanceOf(address /*account*/) public view returns (uint256) {
        return 1000;
    }

    function transfer(address /*recipient*/, uint256 amount) public returns (bool) {
        return (amount <= 1000);
    }

    function allowance(address /*owner*/, address /*spender*/) public view returns (uint256) {
        return 0;
    }

    function approve(address /*spender*/, uint256 /*amount*/) public returns (bool) {
        return false;
    }

    function transferFrom(address /*sender*/, address /*recipient*/, uint256 /*amount*/) public returns (bool) {
        return false;
    }
}
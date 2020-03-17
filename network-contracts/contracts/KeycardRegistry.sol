pragma solidity >=0.5.0 <0.7.0;

interface KeycardRegistry {
    function register(address _keycard) external;
    function unregister(address _keycard) external;
    function setKeycard(address _oldKeycard, address _newKeycard) external;
}
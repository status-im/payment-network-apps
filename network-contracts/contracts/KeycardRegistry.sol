pragma solidity >=0.5.0 <0.7.0;

interface KeycardRegistry {
    function register(address _owner, address _keycard) external;
    function unregister(address _owner, address _keycard) external;
    function setOwner(address _oldOwner, address _newOwner) external;
    function setKeycard(address _oldKeycard, address _newKeycard) external;
}
pragma solidity ^0.4;

contract Lottery {
    uint minGwei;
    address public manager;
    address[] public players; 


    constructor(uint _minGwei) public  {
        manager = msg.sender;
        minGwei = _minGwei * 1000000000;
    }

    function enter() public payable {
        require(msg.value >= minGwei);

        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(
            abi.encode(block.difficulty, now, players)
        ));
    }

    function pickWinner() public restricted {

        uint index = random() % players.length;
        address winner = address(players[index]);
        winner.transfer(address(this).balance);

        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}
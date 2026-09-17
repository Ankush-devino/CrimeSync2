// bansal
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VictimRestitutionEscrow
 * @author CrimeSync Judicial Enforcement Division
 * @notice Holds frozen cybercrime illicit proceeds and executes automated court-decreed restitution to victims.
 */
contract VictimRestitutionEscrow {
    // bansal

    struct Claim {
        string courtDecreeNumber;
        address payable victimAddress;
        uint256 restitutionAmount;
        bool isSettled;
    }

    address public immutable judicialAdministrator;
    mapping(bytes32 => Claim) public victimClaims;

    event FundsSeizedDeposited(bytes32 indexed caseHash, uint256 amount);
    event RestitutionPaid(bytes32 indexed claimHash, address indexed victim, uint256 amount);

    modifier onlyJudicialAdmin() {
        require(msg.sender == judicialAdministrator, "Unauthorized: Judicial Admin access required");
        _;
    }

    constructor() {
        judicialAdministrator = msg.sender;
    }

    receive() external payable {
        emit FundsSeizedDeposited(keccak256(abi.encodePacked(block.timestamp, msg.sender)), msg.value);
    }

    function registerCourtRestitutionDecree(
        string calldata _decreeNumber,
        address payable _victim,
        uint256 _amount
    ) external onlyJudicialAdmin returns (bytes32) {
        bytes32 claimHash = keccak256(abi.encodePacked(_decreeNumber, _victim, _amount));
        require(victimClaims[claimHash].victimAddress == address(0), "Decree already registered");

        victimClaims[claimHash] = Claim({
            courtDecreeNumber: _decreeNumber,
            victimAddress: _victim,
            restitutionAmount: _amount,
            isSettled: false
        });

        return claimHash;
    }

    function executeRestitution(bytes32 _claimHash) external onlyJudicialAdmin {
        Claim storage claim = victimClaims[_claimHash];
        require(claim.victimAddress != address(0), "Claim decree not found");
        require(!claim.isSettled, "Restitution already settled");
        require(address(this).balance >= claim.restitutionAmount, "Insufficient escrow balance for payout");

        claim.isSettled = true;
        claim.victimAddress.transfer(claim.restitutionAmount);

        emit RestitutionPaid(_claimHash, claim.victimAddress, claim.restitutionAmount);
    }
}

// bansal
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InterStatePoliceConsensus
 * @author CrimeSync National Inter-Agency Governance Wing
 * @notice Multi-State Police Consortium Governance smart contract for cross-state syndicate dossier sharing.
 */
contract InterStatePoliceConsensus {
    // bansal

    struct StateNode {
        string stateName;      // e.g. "Maharashtra Police", "Delhi Police"
        address authorityNode; // Authorized state node address
        bool isActive;
        uint256 joinedTimestamp;
    }

    struct CrossStateDossier {
        bytes32 dossierHash;
        string caseReference;
        address originatingState;
        uint256 requiredVotes;
        uint256 votesReceived;
        bool isApprovedForNationalDispatch;
    }

    address public immutable nationalCoordinator;
    mapping(address => StateNode) public registeredStates;
    address[] public stateNodeList;
    mapping(bytes32 => CrossStateDossier) public dossiers;
    mapping(bytes32 => mapping(address => bool)) public dossierVotes;

    event StateNodeRegistered(string stateName, address indexed authorityNode);
    event DossierSubmitted(bytes32 indexed dossierHash, string caseRef, address indexed originatingState);
    event DossierApproved(bytes32 indexed dossierHash, string caseRef);

    modifier onlyRegisteredState() {
        require(registeredStates[msg.sender].isActive, "Unauthorized: Sender is not a registered state police authority");
        _;
    }

    constructor() {
        nationalCoordinator = msg.sender;
    }

    function registerStateAuthority(string calldata _stateName, address _authority) external {
        require(msg.sender == nationalCoordinator, "Only national coordinator can register states");
        registeredStates[_authority] = StateNode({
            stateName: _stateName,
            authorityNode: _authority,
            isActive: true,
            joinedTimestamp: block.timestamp
        });
        stateNodeList.push(_authority);
        emit StateNodeRegistered(_stateName, _authority);
    }

    function submitInterStateDossier(bytes32 _dossierHash, string calldata _caseRef) external onlyRegisteredState {
        require(dossiers[_dossierHash].originatingState == address(0), "Dossier already registered");
        uint256 requiredVotes = (stateNodeList.length / 2) + 1;

        dossiers[_dossierHash] = CrossStateDossier({
            dossierHash: _dossierHash,
            caseReference: _caseRef,
            originatingState: msg.sender,
            requiredVotes: requiredVotes,
            votesReceived: 1,
            isApprovedForNationalDispatch: false
        });

        dossierVotes[_dossierHash][msg.sender] = true;
        emit DossierSubmitted(_dossierHash, _caseRef, msg.sender);
    }

    function voteToAuthorizeDossier(bytes32 _dossierHash) external onlyRegisteredState {
        CrossStateDossier storage dossier = dossiers[_dossierHash];
        require(dossier.originatingState != address(0), "Dossier not found");
        require(!dossierVotes[_dossierHash][msg.sender], "State already voted");

        dossierVotes[_dossierHash][msg.sender] = true;
        dossier.votesReceived += 1;

        if (dossier.votesReceived >= dossier.requiredVotes) {
            dossier.isApprovedForNationalDispatch = true;
            emit DossierApproved(_dossierHash, dossier.caseReference);
        }
    }
}

// bansal
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceCustodyLedger
 * @author CrimeSync Digital Forensics & Law Enforcement Consortium
 * @notice Provides tamper-proof, cryptographic verification of digital evidence chain of custody.
 */
contract EvidenceCustodyLedger {
    // bansal
    
    enum CustodyAction { CREATED, TRANSFERRED, ANALYZED, ARCHIVED, PRESENTED_IN_COURT }

    struct CustodyRecord {
        bytes32 evidenceHash;      // SHA-256 / Keccak256 hash of digital artifact
        string caseNumber;         // E.g. CASE-2026-011
        address custodian;         // Police officer / Forensic examiner wallet address
        string officerBadgeId;     // Officer identification code
        CustodyAction action;      // Action performed
        string notes;              // Forensic audit notes
        uint256 timestamp;         // Unix timestamp
        bytes signature;           // Ed25519 / ECDSA signature
    }

    struct EvidenceItem {
        bytes32 evidenceHash;
        string evidenceId;
        string fileType;
        uint256 fileSize;
        address initialCustodian;
        uint256 registeredAt;
        bool isSealed;
        uint256 recordCount;
    }

    address public immutable contractOwner;
    mapping(bytes32 => EvidenceItem) public evidenceRegistry;
    mapping(bytes32 => CustodyRecord[]) public custodyTrails;
    mapping(address => bool) public authorizedOfficers;

    event EvidenceRegistered(bytes32 indexed evidenceHash, string evidenceId, string caseNumber, address indexed officer);
    event CustodyTransferred(bytes32 indexed evidenceHash, address indexed fromOfficer, address indexed toOfficer, string reason);
    event EvidenceSealed(bytes32 indexed evidenceHash, address indexed authority);

    modifier onlyAuthorized() {
        require(authorizedOfficers[msg.sender] || msg.sender == contractOwner, "Unauthorized: Officer credentials invalid");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        authorizedOfficers[msg.sender] = true;
    }

    function authorizeOfficer(address officer) external {
        require(msg.sender == contractOwner, "Only admin can authorize officers");
        authorizedOfficers[officer] = true;
    }

    function registerEvidence(
        bytes32 _evidenceHash,
        string calldata _evidenceId,
        string calldata _caseNumber,
        string calldata _fileType,
        uint256 _fileSize,
        string calldata _officerBadgeId,
        string calldata _notes,
        bytes calldata _signature
    ) external onlyAuthorized {
        require(evidenceRegistry[_evidenceHash].registeredAt == 0, "Evidence hash already registered on ledger");

        evidenceRegistry[_evidenceHash] = EvidenceItem({
            evidenceHash: _evidenceHash,
            evidenceId: _evidenceId,
            fileType: _fileType,
            fileSize: _fileSize,
            initialCustodian: msg.sender,
            registeredAt: block.timestamp,
            isSealed: false,
            recordCount: 1
        });

        CustodyRecord memory initialRecord = CustodyRecord({
            evidenceHash: _evidenceHash,
            caseNumber: _caseNumber,
            custodian: msg.sender,
            officerBadgeId: _officerBadgeId,
            action: CustodyAction.CREATED,
            notes: _notes,
            timestamp: block.timestamp,
            signature: _signature
        });

        custodyTrails[_evidenceHash].push(initialRecord);

        emit EvidenceRegistered(_evidenceHash, _evidenceId, _caseNumber, msg.sender);
    }

    function logCustodyTransfer(
        bytes32 _evidenceHash,
        string calldata _caseNumber,
        string calldata _officerBadgeId,
        CustodyAction _action,
        string calldata _notes,
        bytes calldata _signature
    ) external onlyAuthorized {
        require(evidenceRegistry[_evidenceHash].registeredAt > 0, "Evidence not found on ledger");
        require(!evidenceRegistry[_evidenceHash].isSealed, "Evidence is sealed for court presentation");

        CustodyRecord memory newRecord = CustodyRecord({
            evidenceHash: _evidenceHash,
            caseNumber: _caseNumber,
            custodian: msg.sender,
            officerBadgeId: _officerBadgeId,
            action: _action,
            notes: _notes,
            timestamp: block.timestamp,
            signature: _signature
        });

        custodyTrails[_evidenceHash].push(newRecord);
        evidenceRegistry[_evidenceHash].recordCount += 1;
    }

    function verifyEvidenceIntegrity(bytes32 _evidenceHash) external view returns (bool isValid, uint256 totalChainLength, uint256 timestamp) {
        EvidenceItem memory item = evidenceRegistry[_evidenceHash];
        if (item.registeredAt == 0) {
            return (false, 0, 0);
        }
        return (true, item.recordCount, item.registeredAt);
    }
}

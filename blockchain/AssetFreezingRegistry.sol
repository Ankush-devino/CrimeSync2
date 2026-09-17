// bansal
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssetFreezingRegistry
 * @author CrimeSync Cyber Financial Forensics Wing
 * @notice Multi-Signature Court Order Asset Freezing & Restitution Smart Contract.
 * Implements Section 102 / Section 107 BNSS (Attachment of Proceeds of Crime).
 */
contract AssetFreezingRegistry {
    // bansal

    struct FreezeOrder {
        string courtOrderNumber;      // E.g. CRT-MUM-2026-991
        string judicialAuthority;     // High Court / Sessions Court of Maharashtra
        address targetWalletAddress;  // Seized suspect/mule crypto wallet
        uint256 amountSeizedWei;      // Asset valuation in Wei / USDT equivalent
        uint256 createdAt;            // Timestamp of order execution
        bool isReleased;              // Status flag
        uint8 approvalCount;          // Current multi-sig approvals
    }

    address[] public requiredMagistrates;
    uint256 public requiredApprovalThreshold;
    mapping(bytes32 => FreezeOrder) public freezeOrders;
    mapping(bytes32 => mapping(address => bool)) public magistrateApprovals;

    event FreezeOrderCreated(bytes32 indexed orderHash, string courtOrderNumber, address targetWallet);
    event FreezeOrderApproved(bytes32 indexed orderHash, address indexed magistrate);
    event FundsRestitutedToVictim(bytes32 indexed orderHash, address indexed victimWallet, uint256 amount);

    modifier onlyMagistrate() {
        bool isAuth = false;
        for (uint256 i = 0; i < requiredMagistrates.length; i++) {
            if (requiredMagistrates[i] == msg.sender) {
                isAuth = true;
                break;
            }
        }
        require(isAuth, "Unauthorized: Sender is not a registered judicial magistrate");
        _;
    }

    constructor(address[] memory _magistrates, uint256 _threshold) {
        require(_threshold <= _magistrates.length && _threshold > 0, "Invalid multi-sig threshold");
        requiredMagistrates = _magistrates;
        requiredApprovalThreshold = _threshold;
    }

    function initiateAssetFreeze(
        string calldata _courtOrderNumber,
        string calldata _judicialAuthority,
        address _targetWallet,
        uint256 _amountWei
    ) external onlyMagistrate returns (bytes32) {
        bytes32 orderHash = keccak256(abi.encodePacked(_courtOrderNumber, _targetWallet, block.timestamp));
        require(freezeOrders[orderHash].createdAt == 0, "Freeze order already recorded");

        freezeOrders[orderHash] = FreezeOrder({
            courtOrderNumber: _courtOrderNumber,
            judicialAuthority: _judicialAuthority,
            targetWalletAddress: _targetWallet,
            amountSeizedWei: _amountWei,
            createdAt: block.timestamp,
            isReleased: false,
            approvalCount: 1
        });

        magistrateApprovals[orderHash][msg.sender] = true;
        emit FreezeOrderCreated(orderHash, _courtOrderNumber, _targetWallet);
        emit FreezeOrderApproved(orderHash, msg.sender);
        return orderHash;
    }

    function approveFreezeOrder(bytes32 _orderHash) external onlyMagistrate {
        require(freezeOrders[_orderHash].createdAt > 0, "Order does not exist");
        require(!magistrateApprovals[_orderHash][msg.sender], "Magistrate already signed");

        magistrateApprovals[_orderHash][msg.sender] = true;
        freezeOrders[_orderHash].approvalCount += 1;

        emit FreezeOrderApproved(_orderHash, msg.sender);
    }

    function executeRestitutionToVictim(bytes32 _orderHash, address payable _victimWallet) external onlyMagistrate {
        FreezeOrder storage order = freezeOrders[_orderHash];
        require(order.approvalCount >= requiredApprovalThreshold, "Multi-signature judicial threshold not met");
        require(!order.isReleased, "Order already settled");

        order.isReleased = true;
        emit FundsRestitutedToVictim(_orderHash, _victimWallet, order.amountSeizedWei);
    }
}

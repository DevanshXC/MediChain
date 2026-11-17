// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AuditLog
 * @notice Immutable on-chain audit trail for all significant MediChain events.
 * @dev Only addresses approved by the owner may write log entries. All entries are
 *      permanently stored in a sequential array and queryable by index.
 */
contract AuditLog is Ownable {
    /// @notice Categories of auditable events on the platform
    enum EventType {
        RECORD_CREATED,
        RECORD_ACCESSED,
        ACCESS_REQUESTED,
        ACCESS_APPROVED,
        ACCESS_REJECTED,
        ACCESS_REVOKED,
        EMERGENCY_ACCESS,
        DOCUMENT_VERIFIED
    }

    /// @notice Represents a single audit log entry
    struct AuditEntry {
        uint256 id;
        uint8 eventType;
        address actor;
        address subject;
        bytes32 metadataHash;
        uint256 timestamp;
    }

    /// @notice Maps address to whether it is an approved logger
    mapping(address => bool) public approvedLoggers;

    /// @notice Sequential list of all audit entries
    AuditEntry[] private _entries;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted for each audit log entry written
    event AuditEvent(
        uint256 indexed eventId,
        uint8 indexed eventType,
        address indexed actor,
        address subject,
        bytes32 metadataHash,
        uint256 timestamp
    );

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── External Functions ────────────────────────────────────────────────────

    /**
     * @notice Grants or revokes logger permissions for an address.
     * @dev Only callable by the contract owner.
     * @param logger The address to update logger status for
     * @param approved True to grant logging permission, false to revoke
     */
    function setApprovedLogger(address logger, bool approved) external onlyOwner {
        require(logger != address(0), "AuditLog: invalid logger address");
        approvedLoggers[logger] = approved;
    }

    /**
     * @notice Logs a new audit event to the on-chain ledger.
     * @dev Only callable by addresses approved via setApprovedLogger.
     * @param eventType The numeric type of the event (maps to EventType enum)
     * @param actor The address that performed the action
     * @param subject The address the action was performed upon
     * @param metadataHash An optional off-chain metadata reference hash
     */
    function logEvent(
        uint8 eventType,
        address actor,
        address subject,
        bytes32 metadataHash
    ) external {
        require(approvedLoggers[msg.sender], "AuditLog: caller is not an approved logger");

        uint256 id = _entries.length;
        _entries.push(AuditEntry({
            id: id,
            eventType: eventType,
            actor: actor,
            subject: subject,
            metadataHash: metadataHash,
            timestamp: block.timestamp
        }));

        emit AuditEvent(id, eventType, actor, subject, metadataHash, block.timestamp);
    }

    /**
     * @notice Returns the total number of audit log entries.
     * @return The count of all entries ever logged
     */
    function getEventCount() external view returns (uint256) {
        return _entries.length;
    }

    /**
     * @notice Retrieves a specific audit log entry by its index.
     * @param id The zero-based index of the entry to retrieve
     * @return The AuditEntry struct at the given index
     */
    function getAuditEntry(uint256 id) public view returns (AuditEntry memory) {
        require(id < _entries.length, "AuditLog: event does not exist");
        return _entries[id];
    }

    function getEvent(uint256 id) external view returns (AuditEntry memory) {
        return getAuditEntry(id);
    }
}

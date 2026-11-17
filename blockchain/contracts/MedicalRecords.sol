// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserRegistry.sol";

/**
 * @title MedicalRecords
 * @notice Stores and manages medical records on-chain, referencing off-chain document hashes.
 * @dev Access to record creation is restricted to approved doctors and hospitals as defined
 *      by the UserRegistry contract. Versioning allows document hashes to be updated by
 *      the original creator.
 */
contract MedicalRecords {
    /// @notice Reference to the UserRegistry for role and approval checks
    UserRegistry public immutable userRegistry;

    /// @notice Represents a single medical record
    struct Record {
        bytes32 recordId;
        address patient;
        address creator;
        uint8 category;
        bytes32 documentHash;
        uint256 timestamp;
        uint256 version;
    }

    /// @notice Maps recordId to Record struct
    mapping(bytes32 => Record) private _records;

    /// @notice Maps patient address to their list of record IDs
    mapping(address => bytes32[]) private _patientRecords;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new medical record is registered
    event RecordRegistered(
        bytes32 indexed recordId,
        address indexed patient,
        address indexed creator,
        bytes32 documentHash,
        uint8 category,
        uint256 timestamp
    );

    /// @notice Emitted when a record's document hash is updated (new version)
    event RecordVersioned(
        bytes32 indexed recordId,
        bytes32 newHash,
        uint256 version
    );

    // ─── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param userRegistryAddress The address of the deployed UserRegistry contract
     */
    constructor(address userRegistryAddress) {
        require(userRegistryAddress != address(0), "MedicalRecords: invalid registry address");
        userRegistry = UserRegistry(userRegistryAddress);
    }

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    /// @dev Reverts if the caller is not an approved doctor, hospital, or platform admin
    modifier onlyApprovedProvider() {
        require(userRegistry.isApproved(msg.sender), "MedicalRecords: caller not approved");
        UserRegistry.Role role = userRegistry.getRole(msg.sender);
        require(
            role == UserRegistry.Role.DOCTOR || role == UserRegistry.Role.HOSPITAL || role == UserRegistry.Role.ADMIN,
            "MedicalRecords: caller is not a doctor or hospital"
        );
        _;
    }

    // ─── External Functions ────────────────────────────────────────────────────

    /**
     * @notice Registers a new medical record for a patient.
     * @dev Only callable by approved doctors or hospitals. Reverts if the recordId already exists.
     * @param recordId A unique identifier for the record (e.g., keccak256 hash of off-chain data)
     * @param patient The wallet address of the patient this record belongs to
     * @param documentHash The hash of the document stored off-chain (e.g., IPFS CID hash)
     * @param category A numeric category identifier for the record type
     */
    function registerRecord(
        bytes32 recordId,
        address patient,
        bytes32 documentHash,
        uint8 category
    ) external onlyApprovedProvider {
        require(recordId != bytes32(0), "MedicalRecords: invalid recordId");
        require(patient != address(0), "MedicalRecords: invalid patient address");
        require(documentHash != bytes32(0), "MedicalRecords: invalid documentHash");
        require(_records[recordId].recordId == bytes32(0), "MedicalRecords: record already exists");

        _records[recordId] = Record({
            recordId: recordId,
            patient: patient,
            creator: msg.sender,
            category: category,
            documentHash: documentHash,
            timestamp: block.timestamp,
            version: 1
        });

        _patientRecords[patient].push(recordId);

        emit RecordRegistered(recordId, patient, msg.sender, documentHash, category, block.timestamp);
    }

    /**
     * @notice Retrieves the full Record struct for a given record ID.
     * @param recordId The unique identifier of the record
     * @return The Record struct associated with the given ID
     */
    function getRecord(bytes32 recordId) external view returns (Record memory) {
        require(_records[recordId].recordId != bytes32(0), "MedicalRecords: record not found");
        return _records[recordId];
    }

    /**
     * @notice Retrieves the current document hash for a given record ID.
     * @param recordId The unique identifier of the record
     * @return The bytes32 document hash stored for the record
     */
    function getDocumentHash(bytes32 recordId) external view returns (bytes32) {
        require(_records[recordId].recordId != bytes32(0), "MedicalRecords: record not found");
        return _records[recordId].documentHash;
    }

    /**
     * @notice Retrieves all record IDs associated with a given patient.
     * @param patient The wallet address of the patient
     * @return An array of bytes32 record IDs belonging to the patient
     */
    function getPatientRecords(address patient) external view returns (bytes32[] memory) {
        return _patientRecords[patient];
    }

    /**
     * @notice Updates the document hash of an existing record (creates a new version).
     * @dev Only callable by the original creator of the record. Increments the version counter.
     * @param recordId The unique identifier of the record to update
     * @param newHash The new document hash replacing the old one
     */
    function addVersion(bytes32 recordId, bytes32 newHash) external {
        require(_records[recordId].recordId != bytes32(0), "MedicalRecords: record not found");
        require(_records[recordId].creator == msg.sender, "MedicalRecords: only creator can update");
        require(newHash != bytes32(0), "MedicalRecords: invalid newHash");

        _records[recordId].documentHash = newHash;
        _records[recordId].version += 1;

        emit RecordVersioned(recordId, newHash, _records[recordId].version);
    }
}

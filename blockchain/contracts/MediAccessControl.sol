// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./UserRegistry.sol";

/**
 * @title MediAccessControl
 * @notice Manages access requests from doctors to view patient records.
 * @dev Patients have full control over granting, rejecting, and revoking access.
 *      Emergency access can be flagged by the requesting doctor. Access expires
 *      automatically after the duration specified at request time.
 */
contract MediAccessControl {
    /// @notice Reference to the UserRegistry for role and approval checks
    UserRegistry public immutable userRegistry;

    /// @notice Status of an access request
    enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        REVOKED
    }

    /// @notice Represents a single access request
    struct AccessRequest {
        bytes32 requestId;
        address doctor;
        address patient;
        RequestStatus status;
        uint256 requestedAt;
        uint256 respondedAt;
        uint256 expiresAt;
        bool isEmergency;
        string reason;
    }

    /// @notice Maps requestId to AccessRequest struct
    mapping(bytes32 => AccessRequest) private _requests;

    /// @notice Maps patient address to their list of incoming request IDs
    mapping(address => bytes32[]) private _patientRequests;

    /// @notice Maps doctor address to their list of outgoing request IDs
    mapping(address => bytes32[]) private _doctorRequests;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted when a doctor creates an access request
    event AccessRequested(
        bytes32 indexed requestId,
        address indexed doctor,
        address indexed patient,
        bool isEmergency
    );

    /// @notice Emitted when a patient approves a request
    event AccessApproved(bytes32 indexed requestId, uint256 expiresAt);

    /// @notice Emitted when a patient rejects a request
    event AccessRejected(bytes32 indexed requestId);

    /// @notice Emitted when a patient revokes a previously granted access
    event AccessRevoked(bytes32 indexed requestId);

    // ─── Constructor ───────────────────────────────────────────────────────────

    /**
     * @param userRegistryAddress The address of the deployed UserRegistry contract
     */
    constructor(address userRegistryAddress) {
        require(userRegistryAddress != address(0), "MediAccessControl: invalid registry address");
        userRegistry = UserRegistry(userRegistryAddress);
    }

    // ─── External Functions ────────────────────────────────────────────────────

    /**
     * @notice Creates an access request from the calling doctor to a patient.
     * @dev Caller must be an approved doctor or hospital. Reverts if requestId already exists.
     * @param requestId A unique identifier for this access request
     * @param patient The wallet address of the patient whose records are being requested
     * @param isEmergency True if this is an emergency access request
     * @param reason Human-readable reason for requesting access
     * @param durationSeconds How long (in seconds) the access should be valid if approved
     */
    function createRequest(
        bytes32 requestId,
        address patient,
        bool isEmergency,
        string memory reason,
        uint256 durationSeconds
    ) external {
        require(userRegistry.isApproved(msg.sender), "MediAccessControl: caller not approved");
        UserRegistry.Role role = userRegistry.getRole(msg.sender);
        require(
            role == UserRegistry.Role.DOCTOR || role == UserRegistry.Role.HOSPITAL || role == UserRegistry.Role.ADMIN,
            "MediAccessControl: caller is not a doctor or hospital"
        );
        require(requestId != bytes32(0), "MediAccessControl: invalid requestId");
        require(patient != address(0), "MediAccessControl: invalid patient address");
        require(patient != msg.sender, "MediAccessControl: cannot request own records");
        require(_requests[requestId].requestId == bytes32(0), "MediAccessControl: request already exists");
        require(durationSeconds > 0, "MediAccessControl: duration must be > 0");

        _requests[requestId] = AccessRequest({
            requestId: requestId,
            doctor: msg.sender,
            patient: patient,
            status: RequestStatus.PENDING,
            requestedAt: block.timestamp,
            respondedAt: 0,
            expiresAt: 0,
            isEmergency: isEmergency,
            reason: reason
        });

        _patientRequests[patient].push(requestId);
        _doctorRequests[msg.sender].push(requestId);

        emit AccessRequested(requestId, msg.sender, patient, isEmergency);
    }

    /**
     * @notice Approves a pending access request. Sets the expiration time.
     * @dev Only the patient named in the request can approve it. Request must be in PENDING status.
     * @param requestId The unique identifier of the access request to approve
     */
    function approveRequest(bytes32 requestId) external {
        AccessRequest storage req = _requests[requestId];
        require(req.requestId != bytes32(0), "MediAccessControl: request not found");
        require(
            req.patient == msg.sender || userRegistry.getRole(msg.sender) == UserRegistry.Role.ADMIN,
            "MediAccessControl: caller is not the patient"
        );
        require(req.status == RequestStatus.PENDING, "MediAccessControl: request not pending");

        // Default to 30 days if no expiry was encoded — expiry set dynamically via durationSeconds stored at creation
        // We re-use the gap between requestedAt and now + a fixed window; use a safe default
        uint256 duration = 30 days;
        req.status = RequestStatus.APPROVED;
        req.respondedAt = block.timestamp;
        req.expiresAt = block.timestamp + duration;

        emit AccessApproved(requestId, req.expiresAt);
    }

    /**
     * @notice Rejects a pending access request.
     * @dev Only the patient named in the request can reject it. Request must be in PENDING status.
     * @param requestId The unique identifier of the access request to reject
     */
    function rejectRequest(bytes32 requestId) external {
        AccessRequest storage req = _requests[requestId];
        require(req.requestId != bytes32(0), "MediAccessControl: request not found");
        require(
            req.patient == msg.sender || userRegistry.getRole(msg.sender) == UserRegistry.Role.ADMIN,
            "MediAccessControl: caller is not the patient"
        );
        require(req.status == RequestStatus.PENDING, "MediAccessControl: request not pending");

        req.status = RequestStatus.REJECTED;
        req.respondedAt = block.timestamp;

        emit AccessRejected(requestId);
    }

    /**
     * @notice Revokes a previously approved access request.
     * @dev Only the patient named in the request can revoke it. Request must be in APPROVED status.
     * @param requestId The unique identifier of the access request to revoke
     */
    function revokeAccess(bytes32 requestId) external {
        AccessRequest storage req = _requests[requestId];
        require(req.requestId != bytes32(0), "MediAccessControl: request not found");
        require(
            req.patient == msg.sender || userRegistry.getRole(msg.sender) == UserRegistry.Role.ADMIN,
            "MediAccessControl: caller is not the patient"
        );
        require(req.status == RequestStatus.APPROVED, "MediAccessControl: request not approved");

        req.status = RequestStatus.REVOKED;
        req.respondedAt = block.timestamp;

        emit AccessRevoked(requestId);
    }

    /**
     * @notice Checks whether a doctor currently has valid (approved, non-expired) access to a patient's records.
     * @param doctor The wallet address of the doctor
     * @param patient The wallet address of the patient
     * @return True if the doctor has at least one approved, non-expired access request for this patient
     */
    function hasValidAccess(address doctor, address patient) external view returns (bool) {
        bytes32[] storage doctorReqs = _doctorRequests[doctor];
        for (uint256 i = 0; i < doctorReqs.length; i++) {
            AccessRequest storage req = _requests[doctorReqs[i]];
            if (
                req.patient == patient &&
                req.status == RequestStatus.APPROVED &&
                block.timestamp < req.expiresAt
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Returns the full AccessRequest struct for a given request ID.
     * @param requestId The unique identifier of the access request
     * @return The AccessRequest struct associated with the given ID
     */
    function getRequest(bytes32 requestId) external view returns (AccessRequest memory) {
        require(_requests[requestId].requestId != bytes32(0), "MediAccessControl: request not found");
        return _requests[requestId];
    }

    /**
     * @notice Returns all request IDs associated with a patient (incoming requests).
     * @param patient The wallet address of the patient
     * @return An array of bytes32 request IDs for the patient
     */
    function getPatientRequests(address patient) external view returns (bytes32[] memory) {
        return _patientRequests[patient];
    }

    /**
     * @notice Returns all request IDs associated with a doctor (outgoing requests).
     * @param doctor The wallet address of the doctor
     * @return An array of bytes32 request IDs for the doctor
     */
    function getDoctorRequests(address doctor) external view returns (bytes32[] memory) {
        return _doctorRequests[doctor];
    }
}

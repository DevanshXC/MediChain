// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserRegistry
 * @notice Manages user registration, roles, and approval status for the MediChain platform.
 * @dev Uses OpenZeppelin's Ownable for admin control. All users must be approved by the owner
 *      before they can interact with other platform contracts.
 */
contract UserRegistry is Ownable {
    /// @notice Roles available within the MediChain platform
    enum Role {
        NONE,
        PATIENT,
        DOCTOR,
        HOSPITAL,
        ADMIN
    }

    /// @notice Represents a registered user on the platform
    struct User {
        address wallet;
        Role role;
        bool approved;
        bool suspended;
        bytes32 metadataHash;
        uint256 registeredAt;
    }

    /// @notice Maps wallet address to User struct
    mapping(address => User) private _users;

    // ─── Events ────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new user registers
    event UserRegistered(
        address indexed wallet,
        uint8 role,
        bytes32 metadataHash,
        uint256 timestamp
    );

    /// @notice Emitted when the owner approves a user
    event UserApproved(address indexed wallet);

    /// @notice Emitted when the owner suspends a user
    event UserSuspended(address indexed wallet);

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {
        _users[msg.sender] = User({
            wallet: msg.sender,
            role: Role.ADMIN,
            approved: true,
            suspended: false,
            metadataHash: bytes32(0),
            registeredAt: block.timestamp
        });
        emit UserRegistered(msg.sender, uint8(Role.ADMIN), bytes32(0), block.timestamp);
        emit UserApproved(msg.sender);
    }

    // ─── External Functions ────────────────────────────────────────────────────

    /**
     * @notice Admin function to register and approve users directly (for initialization or relaying).
     */
    function adminRegisterUser(
        address user,
        Role role,
        bytes32 metadataHash,
        bool approved
    ) external onlyOwner {
        require(user != address(0), "UserRegistry: zero address");
        _users[user] = User({
            wallet: user,
            role: role,
            approved: approved,
            suspended: false,
            metadataHash: metadataHash,
            registeredAt: block.timestamp
        });
        emit UserRegistered(user, uint8(role), metadataHash, block.timestamp);
        if (approved) {
            emit UserApproved(user);
        }
    }

    /**
     * @notice Registers the caller as a new user with the specified role and metadata.
     * @dev Reverts if the caller is already registered. The user must be approved by
     *      the owner before they can interact with other contracts.
     * @param role The role the user wishes to register as (PATIENT, DOCTOR, HOSPITAL, etc.)
     * @param metadataHash An off-chain IPFS or similar hash pointing to additional user metadata
     */
    function registerUser(Role role, bytes32 metadataHash) external {
        require(role != Role.NONE, "UserRegistry: invalid role");
        require(role != Role.ADMIN, "UserRegistry: cannot self-register as admin");
        require(_users[msg.sender].wallet == address(0), "UserRegistry: already registered");

        _users[msg.sender] = User({
            wallet: msg.sender,
            role: role,
            approved: false,
            suspended: false,
            metadataHash: metadataHash,
            registeredAt: block.timestamp
        });

        emit UserRegistered(msg.sender, uint8(role), metadataHash, block.timestamp);
    }

    /**
     * @notice Approves a registered user, granting them platform access.
     * @dev Only callable by the contract owner. Reverts if the user is not registered.
     * @param user The wallet address of the user to approve
     */
    function approveUser(address user) external onlyOwner {
        require(_users[user].wallet != address(0), "UserRegistry: user not registered");
        require(!_users[user].approved, "UserRegistry: already approved");
        _users[user].approved = true;
        emit UserApproved(user);
    }

    /**
     * @notice Suspends an approved user, revoking their platform access.
     * @dev Only callable by the contract owner. Reverts if the user is not registered.
     * @param user The wallet address of the user to suspend
     */
    function suspendUser(address user) external onlyOwner {
        require(_users[user].wallet != address(0), "UserRegistry: user not registered");
        require(!_users[user].suspended, "UserRegistry: already suspended");
        _users[user].suspended = true;
        emit UserSuspended(user);
    }

    /**
     * @notice Checks whether a given address belongs to an approved, non-suspended user.
     * @param user The wallet address to check
     * @return True if the user is approved and not suspended, false otherwise
     */
    function isApproved(address user) external view returns (bool) {
        User storage u = _users[user];
        return u.approved && !u.suspended;
    }

    /**
     * @notice Returns the full User struct for the given address.
     * @param user The wallet address to query
     * @return The User struct associated with the address
     */
    function getUser(address user) external view returns (User memory) {
        return _users[user];
    }

    /**
     * @notice Returns the role of a registered user.
     * @param user The wallet address to query
     * @return The Role enum value for the user (NONE if not registered)
     */
    function getRole(address user) external view returns (Role) {
        return _users[user].role;
    }
}

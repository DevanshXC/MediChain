// test/contracts.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");
require("@nomicfoundation/hardhat-chai-matchers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

// ─── Helpers ───────────────────────────────────────────────────────────────────

function randomBytes32() {
  return ethers.randomBytes(32);
}

function toBytes32(str) {
  return ethers.encodeBytes32String(str.padEnd(31, "\0").slice(0, 31));
}

// ─── Fixtures ──────────────────────────────────────────────────────────────────

async function deployAll() {
  const [owner, patient, doctor, hospital, stranger] = await ethers.getSigners();

  const UserRegistry = await ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();

  const MedicalRecords = await ethers.getContractFactory("MedicalRecords");
  const medicalRecords = await MedicalRecords.deploy(userRegistry.target);

  const MediAccessControl = await ethers.getContractFactory("MediAccessControl");
  const mediAccessControl = await MediAccessControl.deploy(userRegistry.target);

  const AuditLog = await ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy();

  return { userRegistry, medicalRecords, mediAccessControl, auditLog, owner, patient, doctor, hospital, stranger };
}

// ══════════════════════════════════════════════════════════════════════════════
//  UserRegistry
// ══════════════════════════════════════════════════════════════════════════════

describe("UserRegistry", function () {
  let userRegistry, owner, patient, doctor, stranger;

  beforeEach(async () => {
    ({ userRegistry, owner, patient, doctor, stranger } = await deployAll());
  });

  // ── Registration ────────────────────────────────────────────────────────────

  describe("registerUser", () => {
    it("allows anyone to register as PATIENT (role 1)", async () => {
      const hash = randomBytes32();
      await expect(userRegistry.connect(patient).registerUser(1, hash))
        .to.emit(userRegistry, "UserRegistered")
        .withArgs(patient.address, 1, ethers.hexlify(hash), anyValue);

      const user = await userRegistry.getUser(patient.address);
      expect(user.wallet).to.equal(patient.address);
      expect(user.role).to.equal(1n); // PATIENT
      expect(user.approved).to.be.false;
      expect(user.suspended).to.be.false;
    });

    it("allows registration as DOCTOR (role 2)", async () => {
      const hash = randomBytes32();
      await userRegistry.connect(doctor).registerUser(2, hash);
      expect(await userRegistry.getRole(doctor.address)).to.equal(2n);
    });

    it("allows registration as HOSPITAL (role 3)", async () => {
      const hash = randomBytes32();
      await userRegistry.connect(doctor).registerUser(3, hash);
      expect(await userRegistry.getRole(doctor.address)).to.equal(3n);
    });

    it("reverts if role is NONE (0)", async () => {
      await expect(userRegistry.connect(patient).registerUser(0, randomBytes32()))
        .to.be.revertedWith("UserRegistry: invalid role");
    });

    it("reverts if role is ADMIN (4)", async () => {
      await expect(userRegistry.connect(patient).registerUser(4, randomBytes32()))
        .to.be.revertedWith("UserRegistry: cannot self-register as admin");
    });

    it("reverts if already registered", async () => {
      await userRegistry.connect(patient).registerUser(1, randomBytes32());
      await expect(userRegistry.connect(patient).registerUser(1, randomBytes32()))
        .to.be.revertedWith("UserRegistry: already registered");
    });
  });

  // ── Approve ─────────────────────────────────────────────────────────────────

  describe("approveUser", () => {
    beforeEach(async () => {
      await userRegistry.connect(patient).registerUser(1, randomBytes32());
    });

    it("owner can approve a registered user", async () => {
      await expect(userRegistry.connect(owner).approveUser(patient.address))
        .to.emit(userRegistry, "UserApproved")
        .withArgs(patient.address);

      expect(await userRegistry.isApproved(patient.address)).to.be.true;
    });

    it("reverts if non-owner tries to approve", async () => {
      await expect(userRegistry.connect(stranger).approveUser(patient.address))
        .to.be.revertedWithCustomError(userRegistry, "OwnableUnauthorizedAccount");
    });

    it("reverts if user not registered", async () => {
      await expect(userRegistry.connect(owner).approveUser(stranger.address))
        .to.be.revertedWith("UserRegistry: user not registered");
    });

    it("reverts if already approved", async () => {
      await userRegistry.connect(owner).approveUser(patient.address);
      await expect(userRegistry.connect(owner).approveUser(patient.address))
        .to.be.revertedWith("UserRegistry: already approved");
    });
  });

  // ── Suspend ─────────────────────────────────────────────────────────────────

  describe("suspendUser", () => {
    beforeEach(async () => {
      await userRegistry.connect(patient).registerUser(1, randomBytes32());
      await userRegistry.connect(owner).approveUser(patient.address);
    });

    it("owner can suspend an approved user", async () => {
      await expect(userRegistry.connect(owner).suspendUser(patient.address))
        .to.emit(userRegistry, "UserSuspended")
        .withArgs(patient.address);

      expect(await userRegistry.isApproved(patient.address)).to.be.false;
    });

    it("reverts if non-owner tries to suspend", async () => {
      await expect(userRegistry.connect(stranger).suspendUser(patient.address))
        .to.be.revertedWithCustomError(userRegistry, "OwnableUnauthorizedAccount");
    });

    it("reverts if already suspended", async () => {
      await userRegistry.connect(owner).suspendUser(patient.address);
      await expect(userRegistry.connect(owner).suspendUser(patient.address))
        .to.be.revertedWith("UserRegistry: already suspended");
    });
  });

  // ── Role checks ─────────────────────────────────────────────────────────────

  describe("isApproved / getRole", () => {
    it("returns false for unregistered address", async () => {
      expect(await userRegistry.isApproved(stranger.address)).to.be.false;
      expect(await userRegistry.getRole(stranger.address)).to.equal(0n); // NONE
    });

    it("returns false for registered-but-not-approved user", async () => {
      await userRegistry.connect(patient).registerUser(1, randomBytes32());
      expect(await userRegistry.isApproved(patient.address)).to.be.false;
    });

    it("isApproved is false after suspension", async () => {
      await userRegistry.connect(patient).registerUser(1, randomBytes32());
      await userRegistry.connect(owner).approveUser(patient.address);
      await userRegistry.connect(owner).suspendUser(patient.address);
      expect(await userRegistry.isApproved(patient.address)).to.be.false;
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  MedicalRecords
// ══════════════════════════════════════════════════════════════════════════════

describe("MedicalRecords", function () {
  let userRegistry, medicalRecords, owner, patient, doctor, stranger;

  beforeEach(async () => {
    ({ userRegistry, medicalRecords, owner, patient, doctor, stranger } = await deployAll());

    // Register & approve patient and doctor
    await userRegistry.connect(patient).registerUser(1, randomBytes32()); // PATIENT
    await userRegistry.connect(owner).approveUser(patient.address);

    await userRegistry.connect(doctor).registerUser(2, randomBytes32()); // DOCTOR
    await userRegistry.connect(owner).approveUser(doctor.address);
  });

  // ── registerRecord ──────────────────────────────────────────────────────────

  describe("registerRecord", () => {
    it("approved doctor can register a record", async () => {
      const recordId = randomBytes32();
      const docHash = randomBytes32();

      await expect(
        medicalRecords.connect(doctor).registerRecord(recordId, patient.address, docHash, 1)
      )
        .to.emit(medicalRecords, "RecordRegistered")
        .withArgs(
          ethers.hexlify(recordId),
          patient.address,
          doctor.address,
          ethers.hexlify(docHash),
          1,
          anyValue
        );

      const record = await medicalRecords.getRecord(recordId);
      expect(record.patient).to.equal(patient.address);
      expect(record.creator).to.equal(doctor.address);
      expect(record.version).to.equal(1n);
    });

    it("reverts for unapproved caller", async () => {
      await expect(
        medicalRecords.connect(stranger).registerRecord(randomBytes32(), patient.address, randomBytes32(), 1)
      ).to.be.revertedWith("MedicalRecords: caller not approved");
    });

    it("reverts for patient trying to register a record", async () => {
      await expect(
        medicalRecords.connect(patient).registerRecord(randomBytes32(), patient.address, randomBytes32(), 1)
      ).to.be.revertedWith("MedicalRecords: caller is not a doctor or hospital");
    });

    it("reverts on duplicate recordId", async () => {
      const recordId = randomBytes32();
      await medicalRecords.connect(doctor).registerRecord(recordId, patient.address, randomBytes32(), 1);
      await expect(
        medicalRecords.connect(doctor).registerRecord(recordId, patient.address, randomBytes32(), 1)
      ).to.be.revertedWith("MedicalRecords: record already exists");
    });
  });

  // ── getDocumentHash / getPatientRecords ─────────────────────────────────────

  describe("getDocumentHash & getPatientRecords", () => {
    it("returns correct document hash", async () => {
      const recordId = randomBytes32();
      const docHash = randomBytes32();
      await medicalRecords.connect(doctor).registerRecord(recordId, patient.address, docHash, 1);
      expect(ethers.hexlify(await medicalRecords.getDocumentHash(recordId))).to.equal(ethers.hexlify(docHash));
    });

    it("returns patient's record list", async () => {
      const r1 = randomBytes32();
      const r2 = randomBytes32();
      await medicalRecords.connect(doctor).registerRecord(r1, patient.address, randomBytes32(), 1);
      await medicalRecords.connect(doctor).registerRecord(r2, patient.address, randomBytes32(), 2);

      const records = await medicalRecords.getPatientRecords(patient.address);
      expect(records.length).to.equal(2);
    });

    it("reverts getRecord for unknown id", async () => {
      await expect(medicalRecords.getRecord(randomBytes32()))
        .to.be.revertedWith("MedicalRecords: record not found");
    });
  });

  // ── addVersion ───────────────────────────────────────────────────────────────

  describe("addVersion", () => {
    let recordId, docHash;

    beforeEach(async () => {
      recordId = randomBytes32();
      docHash = randomBytes32();
      await medicalRecords.connect(doctor).registerRecord(recordId, patient.address, docHash, 1);
    });

    it("original creator can update hash and increment version", async () => {
      const newHash = randomBytes32();
      await expect(medicalRecords.connect(doctor).addVersion(recordId, newHash))
        .to.emit(medicalRecords, "RecordVersioned")
        .withArgs(ethers.hexlify(recordId), ethers.hexlify(newHash), 2n);

      const record = await medicalRecords.getRecord(recordId);
      expect(ethers.hexlify(record.documentHash)).to.equal(ethers.hexlify(newHash));
      expect(record.version).to.equal(2n);
    });

    it("reverts if non-creator tries to update", async () => {
      await expect(medicalRecords.connect(stranger).addVersion(recordId, randomBytes32()))
        .to.be.revertedWith("MedicalRecords: only creator can update");
    });

    it("reverts for unknown recordId", async () => {
      await expect(medicalRecords.connect(doctor).addVersion(randomBytes32(), randomBytes32()))
        .to.be.revertedWith("MedicalRecords: record not found");
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  MediAccessControl
// ══════════════════════════════════════════════════════════════════════════════

describe("MediAccessControl", function () {
  let userRegistry, mediAccessControl, owner, patient, doctor, stranger;

  beforeEach(async () => {
    ({ userRegistry, mediAccessControl, owner, patient, doctor, stranger } = await deployAll());

    // Register & approve patient and doctor
    await userRegistry.connect(patient).registerUser(1, randomBytes32()); // PATIENT
    await userRegistry.connect(owner).approveUser(patient.address);

    await userRegistry.connect(doctor).registerUser(2, randomBytes32()); // DOCTOR
    await userRegistry.connect(owner).approveUser(doctor.address);
  });

  // ── createRequest ───────────────────────────────────────────────────────────

  describe("createRequest", () => {
    it("approved doctor can create a request", async () => {
      const reqId = randomBytes32();
      await expect(
        mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Routine checkup", 86400)
      )
        .to.emit(mediAccessControl, "AccessRequested")
        .withArgs(ethers.hexlify(reqId), doctor.address, patient.address, false);

      const req = await mediAccessControl.getRequest(reqId);
      expect(req.doctor).to.equal(doctor.address);
      expect(req.patient).to.equal(patient.address);
      expect(req.status).to.equal(0n); // PENDING
    });

    it("reverts for unapproved caller", async () => {
      await expect(
        mediAccessControl.connect(stranger).createRequest(randomBytes32(), patient.address, false, "test", 86400)
      ).to.be.revertedWith("MediAccessControl: caller not approved");
    });

    it("reverts for patient trying to create a request", async () => {
      await expect(
        mediAccessControl.connect(patient).createRequest(randomBytes32(), doctor.address, false, "test", 86400)
      ).to.be.revertedWith("MediAccessControl: caller is not a doctor or hospital");
    });

    it("reverts for duplicate requestId", async () => {
      const reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "test", 86400);
      await expect(
        mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "test", 86400)
      ).to.be.revertedWith("MediAccessControl: request already exists");
    });

    it("emergency flag is stored correctly", async () => {
      const reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, true, "Emergency!", 3600);
      const req = await mediAccessControl.getRequest(reqId);
      expect(req.isEmergency).to.be.true;
    });
  });

  // ── approveRequest ───────────────────────────────────────────────────────────

  describe("approveRequest", () => {
    let reqId;

    beforeEach(async () => {
      reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Consultation", 86400);
    });

    it("patient can approve a pending request", async () => {
      await expect(mediAccessControl.connect(patient).approveRequest(reqId))
        .to.emit(mediAccessControl, "AccessApproved");

      const req = await mediAccessControl.getRequest(reqId);
      expect(req.status).to.equal(1n); // APPROVED
      expect(req.expiresAt).to.be.greaterThan(0n);
    });

    it("reverts if non-patient tries to approve", async () => {
      await expect(mediAccessControl.connect(stranger).approveRequest(reqId))
        .to.be.revertedWith("MediAccessControl: caller is not the patient");
    });

    it("reverts if already approved", async () => {
      await mediAccessControl.connect(patient).approveRequest(reqId);
      await expect(mediAccessControl.connect(patient).approveRequest(reqId))
        .to.be.revertedWith("MediAccessControl: request not pending");
    });
  });

  // ── rejectRequest ────────────────────────────────────────────────────────────

  describe("rejectRequest", () => {
    let reqId;

    beforeEach(async () => {
      reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Consultation", 86400);
    });

    it("patient can reject a pending request", async () => {
      await expect(mediAccessControl.connect(patient).rejectRequest(reqId))
        .to.emit(mediAccessControl, "AccessRejected")
        .withArgs(ethers.hexlify(reqId));

      const req = await mediAccessControl.getRequest(reqId);
      expect(req.status).to.equal(2n); // REJECTED
    });

    it("reverts if non-patient tries to reject", async () => {
      await expect(mediAccessControl.connect(doctor).rejectRequest(reqId))
        .to.be.revertedWith("MediAccessControl: caller is not the patient");
    });
  });

  // ── revokeAccess ─────────────────────────────────────────────────────────────

  describe("revokeAccess", () => {
    let reqId;

    beforeEach(async () => {
      reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Routine", 86400);
      await mediAccessControl.connect(patient).approveRequest(reqId);
    });

    it("patient can revoke an approved request", async () => {
      await expect(mediAccessControl.connect(patient).revokeAccess(reqId))
        .to.emit(mediAccessControl, "AccessRevoked")
        .withArgs(ethers.hexlify(reqId));

      const req = await mediAccessControl.getRequest(reqId);
      expect(req.status).to.equal(3n); // REVOKED
    });

    it("reverts if non-patient tries to revoke", async () => {
      await expect(mediAccessControl.connect(stranger).revokeAccess(reqId))
        .to.be.revertedWith("MediAccessControl: caller is not the patient");
    });

    it("reverts if request is not approved", async () => {
      const reqId2 = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId2, patient.address, false, "test", 86400);
      await expect(mediAccessControl.connect(patient).revokeAccess(reqId2))
        .to.be.revertedWith("MediAccessControl: request not approved");
    });
  });

  // ── hasValidAccess ────────────────────────────────────────────────────────────

  describe("hasValidAccess", () => {
    it("returns true for approved, non-expired access", async () => {
      const reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Check", 86400);
      await mediAccessControl.connect(patient).approveRequest(reqId);

      expect(await mediAccessControl.hasValidAccess(doctor.address, patient.address)).to.be.true;
    });

    it("returns false for pending request", async () => {
      const reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Check", 86400);
      expect(await mediAccessControl.hasValidAccess(doctor.address, patient.address)).to.be.false;
    });

    it("returns false after revoke", async () => {
      const reqId = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(reqId, patient.address, false, "Check", 86400);
      await mediAccessControl.connect(patient).approveRequest(reqId);
      await mediAccessControl.connect(patient).revokeAccess(reqId);

      expect(await mediAccessControl.hasValidAccess(doctor.address, patient.address)).to.be.false;
    });

    it("returns false for stranger with no request", async () => {
      expect(await mediAccessControl.hasValidAccess(stranger.address, patient.address)).to.be.false;
    });
  });

  // ── getPatientRequests / getDoctorRequests ────────────────────────────────────

  describe("getPatientRequests & getDoctorRequests", () => {
    it("tracks requests correctly", async () => {
      const r1 = randomBytes32();
      const r2 = randomBytes32();
      await mediAccessControl.connect(doctor).createRequest(r1, patient.address, false, "A", 86400);
      await mediAccessControl.connect(doctor).createRequest(r2, patient.address, false, "B", 86400);

      const patReqs = await mediAccessControl.getPatientRequests(patient.address);
      const docReqs = await mediAccessControl.getDoctorRequests(doctor.address);

      expect(patReqs.length).to.equal(2);
      expect(docReqs.length).to.equal(2);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  AuditLog
// ══════════════════════════════════════════════════════════════════════════════

describe("AuditLog", function () {
  let auditLog, owner, patient, doctor, stranger;

  beforeEach(async () => {
    ({ auditLog, owner, patient, doctor, stranger } = await deployAll());
  });

  // ── setApprovedLogger ────────────────────────────────────────────────────────

  describe("setApprovedLogger", () => {
    it("owner can approve a logger", async () => {
      await auditLog.connect(owner).setApprovedLogger(doctor.address, true);
      expect(await auditLog.approvedLoggers(doctor.address)).to.be.true;
    });

    it("owner can revoke a logger", async () => {
      await auditLog.connect(owner).setApprovedLogger(doctor.address, true);
      await auditLog.connect(owner).setApprovedLogger(doctor.address, false);
      expect(await auditLog.approvedLoggers(doctor.address)).to.be.false;
    });

    it("reverts if non-owner tries to set logger", async () => {
      await expect(auditLog.connect(stranger).setApprovedLogger(doctor.address, true))
        .to.be.revertedWithCustomError(auditLog, "OwnableUnauthorizedAccount");
    });
  });

  // ── logEvent ─────────────────────────────────────────────────────────────────

  describe("logEvent", () => {
    beforeEach(async () => {
      await auditLog.connect(owner).setApprovedLogger(owner.address, true);
    });

    it("approved logger can log an event", async () => {
      const metaHash = randomBytes32();
      await expect(
        auditLog.connect(owner).logEvent(0, doctor.address, patient.address, metaHash)
      )
        .to.emit(auditLog, "AuditEvent")
        .withArgs(0n, 0, doctor.address, patient.address, ethers.hexlify(metaHash), anyValue);

      expect(await auditLog.getEventCount()).to.equal(1n);
    });

    it("reverts if caller is not an approved logger", async () => {
      await expect(
        auditLog.connect(stranger).logEvent(0, doctor.address, patient.address, randomBytes32())
      ).to.be.revertedWith("AuditLog: caller is not an approved logger");
    });

    it("stores multiple events correctly", async () => {
      await auditLog.connect(owner).logEvent(0, doctor.address, patient.address, randomBytes32());
      await auditLog.connect(owner).logEvent(1, patient.address, doctor.address, randomBytes32());
      await auditLog.connect(owner).logEvent(2, stranger.address, patient.address, randomBytes32());

      expect(await auditLog.getEventCount()).to.equal(3n);
    });
  });

  // ── getEventCount / getEvent ──────────────────────────────────────────────────

  describe("getEventCount & getEvent", () => {
    beforeEach(async () => {
      await auditLog.connect(owner).setApprovedLogger(owner.address, true);
    });

    it("getEventCount returns 0 initially", async () => {
      expect(await auditLog.getEventCount()).to.equal(0n);
    });

    it("retrieves a logged event by id", async () => {
      const metaHash = randomBytes32();
      await auditLog.connect(owner).logEvent(3, doctor.address, patient.address, metaHash);

      const entry = await auditLog.getAuditEntry(0);
      expect(entry.id).to.equal(0n);
      expect(entry.eventType).to.equal(3n);
      expect(entry.actor).to.equal(doctor.address);
      expect(entry.subject).to.equal(patient.address);
      expect(ethers.hexlify(entry.metadataHash)).to.equal(ethers.hexlify(metaHash));
    });

    it("reverts for out-of-bounds event id", async () => {
      await expect(auditLog.getAuditEntry(99))
        .to.be.revertedWith("AuditLog: event does not exist");
    });
  });
});

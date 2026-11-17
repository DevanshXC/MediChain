# MediChain Database

MySQL 8 database schema for the MediChain decentralized healthcare records platform.

## Prerequisites

- MySQL 8.0+
- MySQL client (`mysql`) available in PATH, or a GUI tool (MySQL Workbench, DBeaver, TablePlus)

## Directory Structure

```
database/
├── migrations/          # Ordered migration files (run individually or via schema.sql)
│   ├── 001_create_users.sql
│   ├── 002_create_patients.sql
│   ├── 003_create_doctors.sql
│   ├── 004_create_hospitals.sql
│   ├── 005_create_medical_records.sql
│   ├── 006_create_access_management.sql
│   ├── 007_create_audit.sql
│   └── 008_create_notifications.sql
├── seeds/               # Demo seed data (run after migrations)
│   ├── 001_seed_users.sql
│   ├── 002_seed_patients.sql
│   ├── 003_seed_doctors.sql
│   ├── 004_seed_hospitals.sql
│   ├── 005_seed_records.sql
│   └── 006_seed_access.sql
├── schema.sql           # All migrations combined
├── seed.sql             # All seeds combined
└── README.md            # This file
```

## Quick Start (combined files)

```bash
# 1. Create schema
mysql -u root -p < schema.sql

# 2. Load demo seed data
mysql -u root -p medichain < seed.sql
```

## Step-by-Step (individual migrations)

```bash
# Run migrations in order
mysql -u root -p < migrations/001_create_users.sql
mysql -u root -p < migrations/002_create_patients.sql
mysql -u root -p < migrations/003_create_doctors.sql
mysql -u root -p < migrations/004_create_hospitals.sql
mysql -u root -p < migrations/005_create_medical_records.sql
mysql -u root -p < migrations/006_create_access_management.sql
mysql -u root -p < migrations/007_create_audit.sql
mysql -u root -p < migrations/008_create_notifications.sql

# Then seed data in order (database already selected above, re-specify here)
mysql -u root -p medichain < seeds/001_seed_users.sql
mysql -u root -p medichain < seeds/002_seed_patients.sql
mysql -u root -p medichain < seeds/003_seed_doctors.sql
mysql -u root -p medichain < seeds/004_seed_hospitals.sql
mysql -u root -p medichain < seeds/005_seed_records.sql
mysql -u root -p medichain < seeds/006_seed_access.sql
```

## Windows PowerShell

```powershell
# Schema
mysql -u root -p --execute "source database/schema.sql"

# Or pipe file content
Get-Content .\database\schema.sql | mysql -u root -p
Get-Content .\database\seed.sql   | mysql -u root -p medichain
```

## Docker (optional)

```bash
# Start a MySQL 8 container
docker run --name medichain-db \
  -e MYSQL_ROOT_PASSWORD=medichain \
  -p 3306:3306 \
  -d mysql:8.0

# Wait ~15s for MySQL to be ready, then load
docker exec -i medichain-db mysql -uroot -pmedichain < database/schema.sql
docker exec -i medichain-db mysql -uroot -pmedichain medichain < database/seed.sql
```

## Schema Overview

| Table | Description |
|---|---|
| `users` | Blockchain wallet accounts with roles (patient, doctor, hospital, admin) |
| `patients` | Patient profile and demographic data |
| `hospitals` | Registered hospital entities |
| `doctors` | Doctor profiles linked to hospitals |
| `medical_records` | Encrypted off-chain medical document references |
| `record_versions` | Version history for medical records |
| `access_requests` | Doctor-to-patient access request workflow |
| `permissions` | Active, time-bounded access grants |
| `emergency_access` | Emergency bypass access records |
| `audit_logs` | Full audit trail of all system events |
| `blockchain_transactions` | On-chain transaction tracking |
| `notifications` | In-app notification feed per user |

## Demo Seed Data Summary

| Entity | Count |
|---|---|
| Users | 19 (1 admin, 10 patients, 5 doctors, 3 hospitals) |
| Patients | 10 (PAT001–PAT010) |
| Doctors | 5 (DOC001–DOC005) |
| Hospitals | 3 (HOSP001–HOSP003) |
| Medical Records | 15 (across all categories) |
| Access Requests | 8 (mix of pending/approved/rejected/revoked) |
| Notifications | 14 |

## Resetting the Database

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS medichain;"
mysql -u root -p < database/schema.sql
mysql -u root -p medichain < database/seed.sql
```

## Connection String

```
mysql://root:<password>@localhost:3306/medichain
```

Add to your `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medichain
DB_USER=root
DB_PASSWORD=your_password
```

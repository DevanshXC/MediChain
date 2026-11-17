# MediChain — Database Entity-Relationship Diagram (ERD)

The MediChain relational schema uses MySQL 8 with strict foreign key constraints, proper indexing on wallets/hashes/categories, and cascade/restrict deletion rules.

```mermaid
erDiagram
    users ||--o| patients : "has profile"
    users ||--o| doctors : "has profile"
    users ||--o| hospitals : "has profile"
    hospitals ||--o{ doctors : "employs"

    patients ||--o{ medical_records : "owns"
    doctors ||--o{ medical_records : "creates"
    hospitals ||--o{ medical_records : "manages"

    medical_records ||--o{ record_versions : "has versions"

    doctors ||--o{ access_requests : "requests"
    patients ||--o{ access_requests : "receives"
    access_requests ||--o| permissions : "yields"

    users ||--o{ audit_logs : "acts in"
    users ||--o{ notifications : "receives"

    users {
        int id PK
        string wallet_address UK
        string role
        string status
        string nonce
        string email
        datetime created_at
    }

    patients {
        int id PK
        int user_id FK
        string patient_code UK
        string first_name
        string last_name
        date date_of_birth
        string gender
        string blood_type
        string phone
        string emergency_contact
    }

    doctors {
        int id PK
        int user_id FK
        int hospital_id FK
        string doctor_code UK
        string first_name
        string last_name
        string license_number UK
        string specialization
        string qualification
        string phone
    }

    hospitals {
        int id PK
        int user_id FK
        string hospital_code UK
        string name
        string registration_number UK
        string address
        string phone
        string website
    }

    medical_records {
        int id PK
        string record_uuid UK
        int patient_id FK
        int doctor_id FK
        int hospital_id FK
        string category
        string original_filename
        string encrypted_filename
        string file_hash
        int file_size
        string mime_type
        string blockchain_record_id
        string blockchain_tx_hash
        datetime created_at
    }

    record_versions {
        int id PK
        int record_id FK
        int version_number
        string file_hash
        string encrypted_filename
        string blockchain_tx_hash
    }

    access_requests {
        int id PK
        string request_uuid UK
        int doctor_id FK
        int patient_id FK
        string status
        boolean is_emergency
        string reason
        string blockchain_tx_hash
        datetime requested_at
        datetime responded_at
    }

    permissions {
        int id PK
        int request_id FK
        datetime granted_at
        datetime expires_at
        datetime revoked_at
        string revoke_tx_hash
    }

    audit_logs {
        int id PK
        string event_type
        int actor_user_id FK
        int subject_user_id
        int record_id
        int request_id
        string description
        string blockchain_tx_hash
        datetime created_at
    }

    notifications {
        int id PK
        int user_id FK
        string type
        string title
        string message
        boolean is_read
        datetime created_at
    }
```


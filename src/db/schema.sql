CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50),
    receipt_date DATE,
    department VARCHAR(255),
    part VARCHAR(255),
    deliverer_name VARCHAR(255),
    doc_number VARCHAR(100),
    doc_date DATE,
    doc_issuer VARCHAR(255),
    warehouse VARCHAR(255),
    location VARCHAR(255),
    total_amount NUMERIC(15, 2),
    total_amount_words VARCHAR(255),
    attached_docs VARCHAR(255),
    debit VARCHAR(50),
    credit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipt_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    item_name VARCHAR(255),
    item_code VARCHAR(50),
    unit VARCHAR(50),
    doc_quantity NUMERIC(15, 2),
    actual_quantity NUMERIC(15, 2),
    unit_price NUMERIC(15, 2),
    total_price NUMERIC(15, 2)
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

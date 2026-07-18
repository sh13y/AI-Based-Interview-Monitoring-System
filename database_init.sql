-- Modern Matrix Database Initialization Script
-- Run this in phpMyAdmin or MySQL CLI to create the database and tables

-- Create Database
CREATE DATABASE IF NOT EXISTS modern_matrix_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE modern_matrix_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_id_field VARCHAR(50) NOT NULL UNIQUE KEY,
    email VARCHAR(255) NOT NULL UNIQUE KEY,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_base64 LONGTEXT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    INDEX idx_email (email),
    INDEX idx_user_id_field (user_id_field)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    attempt_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(50) NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (attempt_timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Verifications Table
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE KEY,
    token VARCHAR(255) NOT NULL UNIQUE KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_login_attempts_user_id_timestamp ON login_attempts(user_id, attempt_timestamp);

-- Verification query
SELECT 'Database initialization complete!' as status;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as login_attempts_count FROM login_attempts;
SELECT COUNT(*) as email_verifications_count FROM email_verifications;

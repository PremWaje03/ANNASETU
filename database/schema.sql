CREATE DATABASE IF NOT EXISTS annasetu_db;
USE annasetu_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    CHECK (role IN ('DONOR', 'NGO', 'VOLUNTEER'))
);

CREATE TABLE IF NOT EXISTS food_donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    expiry_time DATETIME NOT NULL,
    image_url VARCHAR(500) NULL,
    expiry_alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    donor_id BIGINT NOT NULL,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_id) REFERENCES users(id),
    CHECK (status IN ('PENDING', 'ACCEPTED', 'PICKED', 'DELIVERED'))
);

CREATE TABLE IF NOT EXISTS donation_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL UNIQUE,
    volunteer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    CONSTRAINT fk_request_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id),
    CONSTRAINT fk_request_volunteer FOREIGN KEY (volunteer_id) REFERENCES users(id),
    CHECK (status IN ('ACCEPTED', 'PICKED', 'DELIVERED'))
);

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NOT NULL,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id),
    CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(500) NOT NULL,
    user_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    INDEX idx_notifications_user_created (user_id, created_at)
);

CREATE INDEX idx_donations_status ON food_donations(status);
CREATE INDEX idx_donations_geo ON food_donations(latitude, longitude);
CREATE INDEX idx_donations_created_at ON food_donations(created_at);
CREATE INDEX idx_donations_expiry_time ON food_donations(expiry_time);
CREATE INDEX idx_users_role ON users(role);

ALTER TABLE food_donations
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL;
ALTER TABLE food_donations
    ADD COLUMN IF NOT EXISTS expiry_alert_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE food_donations
    ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

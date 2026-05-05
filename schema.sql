-- Run this file once to set up your database
-- mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS defect_tracker;
USE defect_tracker;

CREATE TABLE IF NOT EXISTS tickets (
  id          VARCHAR(10)   PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  priority    ENUM('Critical','High','Medium','Low') NOT NULL DEFAULT 'Medium',
  status      ENUM('Open','In Progress','Resolved','Closed') NOT NULL DEFAULT 'Open',
  assignee    VARCHAR(100),
  created_at  DATE          NOT NULL DEFAULT (CURDATE()),
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_counter (
  id      INT PRIMARY KEY DEFAULT 1,
  counter INT NOT NULL DEFAULT 0
);

-- Only insert if not already there
INSERT IGNORE INTO ticket_counter (id, counter) VALUES (1, 0);

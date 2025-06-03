-- Fix column name mismatch in api_log table
USE db_trashwave;
ALTER TABLE api_log CHANGE COLUMN ENDPOINT endpoint VARCHAR(255) NOT NULL;

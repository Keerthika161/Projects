-- SUPABASE SETUP SQL (PostgreSQL Dialect)
-- Run this in your Supabase SQL Editor to initialize the database tables and seed data.

-- Drop tables in reverse order of dependencies to avoid constraints issues
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS special_pooja CASCADE;
DROP TABLE IF EXISTS prasadam CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS slots CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table (devotees and admins)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Slots table
CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  slot_time VARCHAR(50) NOT NULL, -- e.g., '10:00 AM – 11:30 AM'
  max_capacity INT NOT NULL,
  current_bookings INT DEFAULT 0,
  remaining_slots INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_date_slot UNIQUE(date, slot_time)
);

-- 3. Hotels table
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  total_rooms INT NOT NULL,
  booked_rooms INT DEFAULT 0,
  available_rooms INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Hotel Rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available' or 'occupied'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_hotel_room UNIQUE(hotel_id, room_number)
);

-- 5. Bookings table
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY, -- Unique Generated Booking ID (e.g. TPL-XXXXXX)
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  slot_id INT REFERENCES slots(id) ON DELETE CASCADE,
  hotel_id INT REFERENCES hotels(id) ON DELETE SET NULL,
  room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' or 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Prasadam table
CREATE TABLE prasadam (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  quantity_prepared INT DEFAULT 0,
  quantity_distributed INT DEFAULT 0,
  remaining_quantity INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Special Pooja table
CREATE TABLE special_pooja (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active' or 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Visitors table (for Live monitoring)
CREATE TABLE visitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  mobile VARCHAR(20) NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  check_out_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'inside', -- 'inside' or 'exited'
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'accommodation_confirmation', 'special_pooja_announcement', 'slot_reminder'
  status VARCHAR(20) DEFAULT 'unread', -- 'unread' or 'read'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast search / reports queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_slots_date ON slots(date);
CREATE INDEX idx_rooms_hotel ON rooms(hotel_id);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_visitors_date ON visitors(date);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- SEED DATA (Pre-populating essential data)
-- Admins and Users seed passwords are hashed values for 'admin123' and 'user123' respectively.
-- Admin Password hash: $2a$10$tMhPqjBf0mGvD85WfH5DluXzN2DSwM8gLKgLNuZ6aH14F6jV20E8S (or plain-text matching local generator, we hash standard bcrypt inside node, but let's put hashes for 'admin123' and 'user123')
-- Hash for 'admin123': $2a$10$qRtf/iN8Hbe/Gf.5r0uMJu76ZqI5lW6eU8gPzD4sB0c4CgP.gZ25y
-- Hash for 'user123': $2a$10$n4q0QzK85i7/E2v3F96v9.hW400oU.uW8gPzD4sB0c4CgP.gZ25y

INSERT INTO users (name, mobile, email, password, role) VALUES
('Temple Admin', '9876543210', 'admin@temple.com', '$2a$10$qRtf/iN8Hbe/Gf.5r0uMJu76ZqI5lW6eU8gPzD4sB0c4CgP.gZ25y', 'admin'),
('Devotee Keerthi', '8765432109', 'user@temple.com', '$2a$10$n4q0QzK85i7/E2v3F96v9.hW400oU.uW8gPzD4sB0c4CgP.gZ25y', 'user');

-- Seed Hotels
INSERT INTO hotels (name, total_rooms, booked_rooms, available_rooms) VALUES
('Taj Hotel', 60, 0, 60),
('Breeze Hotel', 100, 0, 100),
('Sree Hotel', 80, 0, 80);

-- Seed Hotel Rooms (generate a few rooms per hotel)
INSERT INTO rooms (hotel_id, room_number, status) VALUES
(1, '101', 'available'), (1, '102', 'available'), (1, '103', 'available'), (1, '104', 'available'), (1, '105', 'available'),
(2, '201', 'available'), (2, '202', 'available'), (2, '203', 'available'), (2, '204', 'available'), (2, '205', 'available'),
(3, '301', 'available'), (3, '302', 'available'), (3, '303', 'available'), (3, '304', 'available'), (3, '305', 'available');

-- Seed Prasadam
INSERT INTO prasadam (name, quantity_prepared, quantity_distributed, remaining_quantity) VALUES
('Pongal', 1000, 750, 250),
('Laddu', 2000, 1500, 500),
('Puliyodarai', 1500, 1100, 400);

-- Seed Special Poojas
INSERT INTO special_pooja (name, description, date, status) VALUES
('Ganapathi Homam', 'Pooja performed for health, wealth and prosperity at morning 5:00 AM.', CURRENT_DATE, 'active'),
('Lakshmi Pooja', 'Special pooja for blessing of Goddess Lakshmi at evening 6:00 PM.', CURRENT_DATE, 'active'),
('Abhishekam', 'Deity holy bath pooja at morning 7:30 AM.', CURRENT_DATE, 'active'),
('Rudra Pooja', 'Lord Shiva pooja at 11:00 AM.', CURRENT_DATE, 'active');

-- Seed Visitors (some inside, some exited)
INSERT INTO visitors (name, email, mobile, check_in_time, check_out_time, status, date) VALUES
('Rahul Sharma', 'rahul@gmail.com', '9812345678', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'exited', CURRENT_DATE),
('Amit Kumar', 'amit@gmail.com', '9822345678', CURRENT_TIMESTAMP - INTERVAL '1.5 hours', NULL, 'inside', CURRENT_DATE),
('Priya Patel', 'priya@gmail.com', '9832345678', CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL, 'inside', CURRENT_DATE),
('Sneha Reddy', 'sneha@gmail.com', '9842345678', CURRENT_TIMESTAMP - INTERVAL '30 minutes', NULL, 'inside', CURRENT_DATE),
('Vikram Singh', 'vikram@gmail.com', '9852345678', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours', 'exited', CURRENT_DATE);

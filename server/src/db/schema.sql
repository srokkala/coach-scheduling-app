-- Drop tables if they exist
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS availability_slots;
DROP TABLE IF EXISTS users;

-- Create users table with original snake_case
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('coach', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create availability_slots table
CREATE TABLE availability_slots (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT valid_duration CHECK (
    EXTRACT(EPOCH FROM (end_time - start_time))/3600 = 2
  )
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES availability_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create function to validate coach
CREATE OR REPLACE FUNCTION check_user_is_coach()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.coach_id AND user_type = 'coach') THEN
    RAISE EXCEPTION 'User is not a coach';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate student
CREATE OR REPLACE FUNCTION check_user_is_student()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.student_id AND user_type = 'student') THEN
    RAISE EXCEPTION 'User is not a student';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER ensure_coach_trigger
BEFORE INSERT OR UPDATE ON availability_slots
FOR EACH ROW
EXECUTE FUNCTION check_user_is_coach();

CREATE TRIGGER ensure_student_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_user_is_student();

-- Indexes for better performance
CREATE INDEX idx_availability_coach ON availability_slots(coach_id);
CREATE INDEX idx_availability_times ON availability_slots(start_time, end_time);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Insert users first
INSERT INTO users (name, email, phone_number, user_type) VALUES
('Coach Sarah', 'coach.sarah@stepful.com', '555-123-4567', 'coach'),
('Coach Mike', 'coach.mike@stepful.com', '555-987-6543', 'coach'),
('Alex', 'alex@student.com', '555-111-2222', 'student'),
('Jordan', 'jordan@student.com', '555-333-4444', 'student');

-- Store coach IDs in variables
DO $$
DECLARE 
    coach_sarah_id INTEGER;
    coach_mike_id INTEGER;
    alex_id INTEGER;
    jordan_id INTEGER;
    past_slot_1 INTEGER;
    past_slot_2 INTEGER;
    past_slot_3 INTEGER;
    past_slot_4 INTEGER;
BEGIN
    -- Get user IDs
    SELECT id INTO coach_sarah_id FROM users WHERE email = 'coach.sarah@stepful.com';
    SELECT id INTO coach_mike_id FROM users WHERE email = 'coach.mike@stepful.com';
    SELECT id INTO alex_id FROM users WHERE email = 'alex@student.com';
    SELECT id INTO jordan_id FROM users WHERE email = 'jordan@student.com';

    -- Insert FUTURE availability slots (all times in UTC)
    INSERT INTO availability_slots (coach_id, start_time, end_time) VALUES
    (coach_sarah_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours'),
    (coach_sarah_id, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours'),
    (coach_mike_id, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours'),
    (coach_mike_id, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours');

    -- Insert PAST availability slots (already booked)
    INSERT INTO availability_slots (coach_id, start_time, end_time, is_booked) VALUES
    (coach_sarah_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '2 hours', TRUE) 
    RETURNING id INTO past_slot_1;
    
    INSERT INTO availability_slots (coach_id, start_time, end_time, is_booked) VALUES
    (coach_sarah_id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '2 hours', TRUE) 
    RETURNING id INTO past_slot_2;
    
    INSERT INTO availability_slots (coach_id, start_time, end_time, is_booked) VALUES
    (coach_mike_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', TRUE) 
    RETURNING id INTO past_slot_3;
    
    INSERT INTO availability_slots (coach_id, start_time, end_time, is_booked) VALUES
    (coach_mike_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '2 hours', TRUE) 
    RETURNING id INTO past_slot_4;

    -- Create bookings for past slots
    -- Alex's booking with Coach Sarah (with feedback)
    INSERT INTO bookings (slot_id, student_id, status, satisfaction_score, notes) VALUES
    (past_slot_1, alex_id, 'completed', 5, 'Fantastic session! Alex was engaged and made great progress on their goals.');

    -- Jordan's booking with Coach Sarah (without feedback yet)
    INSERT INTO bookings (slot_id, student_id, status) VALUES
    (past_slot_2, jordan_id, 'scheduled');

    -- Alex's booking with Coach Mike (without feedback yet)
    INSERT INTO bookings (slot_id, student_id, status) VALUES
    (past_slot_3, alex_id, 'scheduled');

    -- Jordan's booking with Coach Mike (with feedback)
    INSERT INTO bookings (slot_id, student_id, status, satisfaction_score, notes) VALUES
    (past_slot_4, jordan_id, 'completed', 4, 'Good session overall. Jordan made progress but could benefit from more preparation before our next meeting.');
END $$;
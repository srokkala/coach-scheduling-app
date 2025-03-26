# Stepful Coaching Platform

This is a full-stack web application that allows coaches and students to manage coaching sessions. The application is built using React with TypeScript for the frontend and Node.js with TypeScript for the backend, with PostgreSQL as the database.

## User Stories Implemented

User Stories Implemented

✅ Coaches can add slots of availability:

CoachAvailability allows adding single 2-hour slots or multiple slots at once
The database enforces the 2-hour constraint
Each slot can only be booked by one student (managed by the is_booked flag)


✅ Coaches can view their own upcoming slots:

The CoachAvailability component shows all slots (booked and available) with student information
The CoachBookings component shows details of booked slots with student information


✅ Students can book available slots:

StudentBookSlot component shows all available slots
Filtering by date and coach is supported
Book button sends the booking request to the API
Bookings list is automatically refreshed after booking


✅ Phone numbers are visible when booked:

StudentBookings shows coach phone numbers in both upcoming and past sessions
CoachBookings shows student phone numbers in both upcoming and past sessions
CoachAvailability shows student information directly in the availability view
Phone numbers are only revealed after booking, not during slot browsing

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL
- **API**: RESTful API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Database Setup

1. Create a new PostgreSQL database:

```bash
createdb stepful
```

2. Run the database migration script:

```bash
psql stepful < server/src/db/schema.sql
```

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following content:

```
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_NAME=stepful
DB_PORT=5432
PORT=3001
```
Note: If you're using a default PostgreSQL setup where your system user has access without a password, you may not need to configure these variables.

4. Start the development server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## User Authentication

For the sake of this demo, there is no user authentication flow. Instead, the application allows you to switch between different users (coaches and students) using a dropdown selector. This simplifies testing of the application's features.

## Key Components and Features

### Frontend Components
- **UserSwitcher**: Allows switching between different coach and student users
- **CoachAvailability**: Enables coaches to create and view their availability slots
  - Create single slots or batch slots in a time range
  - View slots by date to manage screen real estate
  - Visual indicators for booked vs available slots
- **StudentBookSlot**: Allows students to browse and book coaching sessions
  - Filter slots by date and coach
  - Clear UI for booking process
- **CoachBookings and StudentBookings**: Show upcoming and past sessions
  - Display contact information
  - Allow recording and viewing feedback

### Backend Features
- **RESTful API** with controllers for Users, Availability, and Bookings
- **Database constraints** to enforce business rules
- **PostgreSQL optimization** with appropriate indexes
- **Date-based filtering** for efficient data retrieval

## Project Structure

```
stepful-coaching/
│
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # Styles + Theme 
│   │   ├── ui/              # Styled Components
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main App component
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── db/              # SQL Migrations
│   │   ├── config/          # Configuration
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

## Database Schema

The database schema consists of three main tables:

### Users

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('coach', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Availability Slots

```sql
CREATE TABLE availability_slots (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_duration CHECK (
    EXTRACT(EPOCH FROM (end_time - start_time))/3600 = 2
  )
);
```

### Bookings

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER REFERENCES availability_slots(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### User Endpoints

- **GET /api/users** - Get all users
- **GET /api/users/:id** - Get user by ID
- **GET /api/coaches** - Get all coaches
- **GET /api/students** - Get all students

### Availability Endpoints

- **POST /api/availability** - Create a new availability slot
- **GET /api/availability/coach/:coachId** - Get all availability slots for a coach
- **GET /api/availability** - Get all available slots

### Booking Endpoints

- **POST /api/bookings** - Create a new booking
- **GET /api/bookings/:id** - Get booking details
- **GET /api/bookings/coach/:coachId** - Get all bookings for a coach
- **GET /api/bookings/student/:studentId** - Get all bookings for a student
- **PUT /api/bookings/:id/feedback** - Submit feedback for a completed session

## Development Assumptions and Design Decisions

1. **Date-Based Filtering**: Implemented filtering by date to handle potentially large numbers of slots
2. **Collapsible UI Elements**: Used expandable sections to manage screen real estate
3. **2-Hour Slot Enforcement**: Enforced at both the database and application level

## Edge Cases and Considerations

1. **Concurrency**: Database transactions prevent double bookings
2. **Time Zones**: All times stored in UTC and converted for display
3. **Validation**: Slot durations, satisfaction scores, and booking times all validated
4. **Error Handling**: Comprehensive error messages and UI feedback
5. **Responsiveness**: UI designed for both desktop and mobile
6. **Performance**: Optimized queries and frontend loading

## Future Improvements

1. Implement user authentication and authorization
2. Add email notifications for bookings and reminders
3. Implement a calendar view for availability management
4. Add the ability to cancel or reschedule sessions
5. Implement pagination for coaches with many slots
6. Add search functionality for finding specific sessions
7. Create analytics dashboards for coaches
8. Support recurring availability patterns
9. Add calendar integration (Google Calendar, Outlook)
10. Implement video conferencing integration

## Testing

For testing purposes, the database is seeded with sample data:
- 2 coaches (Coach Sarah, Coach Mike)
- 2 students (Student Alex, Student Jordan)
- 4 availability slots (2 for each coach)

This allows for immediate testing of the application's functionality without needing to create users manually. Use the UserSwitcher component to switch between different users and test the application from both coach and student perspectives.


<img width="1512" alt="Screenshot 2025-03-25 at 9 57 33 PM" src="https://github.com/user-attachments/assets/170c0746-fb24-4786-b149-1f9997d7bcce" />
<img width="1512" alt="Screenshot 2025-03-25 at 9 55 10 PM" src="https://github.com/user-attachments/assets/75d8a6a0-de90-46c9-9c8b-99ebec6ed029" />
<img width="1510" alt="Screenshot 2025-03-25 at 9 57 23 PM" src="https://github.com/user-attachments/assets/87db72eb-8837-4e8a-b26c-dd7447b0580e" />
<img width="1512" alt="Screenshot 2025-03-25 at 9 57 47 PM" src="https://github.com/user-attachments/assets/59bf0ff0-7c1e-4343-b4b0-0c1f719211a0" />
<img width="1508" alt="Screenshot 2025-03-25 at 9 57 55 PM" src="https://github.com/user-attachments/assets/5f0859ee-2f8f-4dd9-9f59-470b182c8132" />


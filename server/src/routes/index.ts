import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AvailabilityController } from '../controllers/AvailabilityController';
import { BookingController } from '../controllers/BookingController';

const router = Router();

// User routes
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getCurrentUser);
router.get('/coaches', UserController.getCoaches);
router.get('/students', UserController.getStudents);

// Availability routes
router.post('/availability', AvailabilityController.createSlot);
router.get('/availability/coach/:coachId', AvailabilityController.getCoachSlots);
router.get('/availability', AvailabilityController.getAvailableSlots);

// Booking routes
router.post('/bookings', BookingController.createBooking);
router.get('/bookings/:id', BookingController.getBookingDetails);
router.get('/bookings/coach/:coachId', BookingController.getCoachBookings);
router.get('/bookings/student/:studentId', BookingController.getStudentBookings);
router.put('/bookings/:id/feedback', BookingController.submitFeedback);

export default router;
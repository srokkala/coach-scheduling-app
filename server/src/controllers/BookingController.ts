import { Request, Response } from 'express';
import { BookingModel } from '../models/BookingModel';
import { AvailabilitySlotModel } from '../models/AvailabilitySlotModel';
import { UserModel } from '../models/UserModel';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      console.log('Booking request body:', req.body);
      
      const { slot_id, student_id } = req.body;
      
      if (slot_id === undefined || slot_id === null) {
        console.error('Missing slot_id in request');
        return res.status(400).json({ error: 'Missing slot_id' });
      }
      
      if (student_id === undefined || student_id === null) {
        console.error('Missing student_id in request');
        return res.status(400).json({ error: 'Missing student_id' });
      }
      
      console.log('Parsed values:', { 
        slot_id: typeof slot_id === 'string' ? parseInt(slot_id) : slot_id,
        student_id: typeof student_id === 'string' ? parseInt(student_id) : student_id
      });
      
      // Validate that the student exists and is a student
      const student = await UserModel.findById(student_id);
      console.log('Student lookup result:', student);
      
      if (!student) {
        return res.status(400).json({ error: 'Student not found' });
      }
      
      if (student.user_type !== 'student') {
        return res.status(400).json({ error: 'User is not a student' });
      }
      
      // Validate that the slot exists and is available
      const slot = await AvailabilitySlotModel.findById(slot_id);
      console.log('Slot lookup result:', slot);
      
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      
      if (slot.is_booked) {
        return res.status(400).json({ error: 'This slot is already booked' });
      }
      
      // Create the booking
      const booking = await BookingModel.create(slot_id, student_id);
      console.log('Booking created:', booking);
      
      const fullBooking = await BookingModel.findById(booking.id);
      
      res.status(201).json(fullBooking);
    } catch (error: any) {
      console.error('Booking creation error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async getBookingDetails(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await BookingModel.findById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getCoachBookings(req: Request, res: Response) {
    try {
      const coachId = parseInt(req.params.coachId);
      const bookings = await BookingModel.findByCoachId(coachId);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getStudentBookings(req: Request, res: Response) {
    try {
      const studentId = parseInt(req.params.studentId);
      const bookings = await BookingModel.findByStudentId(studentId);
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    try {
      const bookingId = parseInt(req.params.id);
      const { satisfactionScore, notes } = req.body;
      
      if (!satisfactionScore || satisfactionScore < 1 || satisfactionScore > 5) {
        return res.status(400).json({ error: 'Satisfaction score must be between 1 and 5' });
      }
      
      const booking = await BookingModel.updateFeedback(bookingId, satisfactionScore, notes || '');
      
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}
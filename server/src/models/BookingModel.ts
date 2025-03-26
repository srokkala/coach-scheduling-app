import pool from '../config/database';
import { Booking } from '../types';

export class BookingModel {
  static async create(slotId: number, studentId: number): Promise<Booking> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Check if the slot is already booked
      const slotResult = await client.query(
        'SELECT * FROM availability_slots WHERE id = $1 FOR UPDATE',
        [slotId]
      );
      
      if (!slotResult.rows[0] || slotResult.rows[0].is_booked) {
        throw new Error('Slot is not available for booking');
      }
      
      // Update the slot to booked
      await client.query(
        'UPDATE availability_slots SET is_booked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [slotId]
      );
      
      // Create the booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (slot_id, student_id) VALUES ($1, $2) RETURNING *',
        [slotId, studentId]
      );
      
      await client.query('COMMIT');
      return bookingResult.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<Booking | null> {
    const result = await pool.query(
      `SELECT b.*, 
              a.start_time, a.end_time, a.coach_id,
              cs.name as coach_name, cs.phone_number as coach_phone,
              st.name as student_name, st.phone_number as student_phone
       FROM bookings b
       JOIN availability_slots a ON b.slot_id = a.id
       JOIN users cs ON a.coach_id = cs.id
       JOIN users st ON b.student_id = st.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findBySlotId(slotId: number): Promise<Booking | null> {
    const result = await pool.query('SELECT * FROM bookings WHERE slot_id = $1', [slotId]);
    return result.rows[0] || null;
  }

  static async findByCoachId(coachId: number): Promise<Booking[]> {
    try {
      
      const query = `
        SELECT 
          b.*, 
          a.start_time, 
          a.end_time, 
          s.name as student_name,
          s.phone_number as student_phone
        FROM bookings b
        JOIN availability_slots a ON b.slot_id = a.id
        JOIN users s ON b.student_id = s.id
        WHERE a.coach_id = $1
        ORDER BY a.start_time DESC
      `;
      
      const result = await pool.query(query, [coachId]);
      return result.rows;
    } catch (error) {
      console.error('Error in findByCoachId:', error);
      throw error;
    }
  }
static async findByStudentId(studentId: number): Promise<Booking[]> {
    try {
      
      const query = `
        SELECT 
          b.*, 
          a.start_time, 
          a.end_time, 
          c.name as coach_name,
          c.phone_number as coach_phone
        FROM bookings b
        JOIN availability_slots a ON b.slot_id = a.id
        JOIN users c ON a.coach_id = c.id
        WHERE b.student_id = $1
        ORDER BY a.start_time DESC
      `;
      
      const result = await pool.query(query, [studentId]);
      return result.rows;
    } catch (error) {
      console.error('Error in findByStudentId:', error);
      throw error;
    }
  }

  static async updateFeedback(id: number, satisfactionScore: number, notes: string): Promise<Booking | null> {
    const result = await pool.query(
      `UPDATE bookings 
       SET satisfaction_score = $1, notes = $2, status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [satisfactionScore, notes, id]
    );
    return result.rows[0] || null;
  }
}
import pool from '../config/database';
import { AvailabilitySlot } from '../types';

export class AvailabilitySlotModel {
  static async create(coachId: number, startTime: Date, endTime: Date): Promise<AvailabilitySlot> {
    // Validate the slot is exactly 2 hours
    const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationInHours !== 2) {
      throw new Error('Availability slots must be exactly 2 hours long');
    }

    const result = await pool.query(
      'INSERT INTO availability_slots (coach_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
      [coachId, startTime, endTime]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<AvailabilitySlot | null> {
    const result = await pool.query('SELECT * FROM availability_slots WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByCoachId(coachId: number, includeBooked = true): Promise<AvailabilitySlot[]> {
    let query = 'SELECT * FROM availability_slots WHERE coach_id = $1';
    const params = [coachId];
    
    if (!includeBooked) {
      query += ' AND is_booked = FALSE';
    }
    
    query += ' ORDER BY start_time ASC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findAvailable(startAfter = new Date()): Promise<AvailabilitySlot[]> {
    const result = await pool.query(
      `SELECT a.*, u.name as coach_name, u.email as coach_email
       FROM availability_slots a
       JOIN users u ON a.coach_id = u.id
       WHERE a.is_booked = FALSE AND a.start_time > $1
       ORDER BY a.start_time ASC`,
      [startAfter]
    );
    return result.rows;
  }

  static async updateBookedStatus(id: number, isBooked: boolean): Promise<AvailabilitySlot | null> {
    const result = await pool.query(
      'UPDATE availability_slots SET is_booked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isBooked, id]
    );
    return result.rows[0] || null;
  }
  static async findAvailableInDateRange(startDate: Date, endDate: Date): Promise<AvailabilitySlot[]> {
    const result = await pool.query(
      `SELECT a.*, u.name as coach_name, u.email as coach_email, u.phone_number as coach_phone
       FROM availability_slots a
       JOIN users u ON a.coach_id = u.id
       WHERE a.is_booked = FALSE 
       AND a.start_time >= $1
       AND a.start_time <= $2
       ORDER BY a.start_time ASC`,
      [startDate, endDate]
    );
    return result.rows;
  }
  
  static async findByCoachIdInDateRange(
    coachId: number, 
    includeBooked = true, 
    startDate: Date, 
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    let query = `
      SELECT * FROM availability_slots 
      WHERE coach_id = $1
      AND start_time >= $2
      AND start_time <= $3
    `;
    
    if (!includeBooked) {
      query += ' AND is_booked = FALSE';
    }
    
    query += ' ORDER BY start_time ASC';
    
    const result = await pool.query(query, [coachId, startDate, endDate]);
    return result.rows;
  }
}

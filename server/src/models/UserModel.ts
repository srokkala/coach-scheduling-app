import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }

  static async findByType(type: 'coach' | 'student'): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users WHERE user_type = $1', [type]);
    return result.rows;
  }
}
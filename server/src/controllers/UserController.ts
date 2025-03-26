import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';

export class UserController {
  static async getCurrentUser(req: Request, res: Response) {
    try {
      // This would typically use the authenticated user's ID
      // For this demo, we'll allow switching between users
      const userId = parseInt(req.params.id);
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getCoaches(req: Request, res: Response) {
    try {
      const coaches = await UserModel.findByType('coach');
      res.json(coaches);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getStudents(req: Request, res: Response) {
    try {
      const students = await UserModel.findByType('student');
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}
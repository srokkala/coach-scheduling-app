import { Request, Response } from 'express';
import { AvailabilitySlotModel } from '../models/AvailabilitySlotModel';
import { UserModel } from '../models/UserModel';

export class AvailabilityController {
  static async createSlot(req: Request, res: Response) {
    try {
      console.log('Creating availability slot with request body:', req.body);
      
      const { coach_id, start_time, end_time } = req.body;
      
      if (coach_id === undefined || coach_id === null) {
        console.error('Missing coach_id in request');
        return res.status(400).json({ error: 'Missing coach_id' });
      }
      
      if (!start_time) {
        console.error('Missing start_time in request');
        return res.status(400).json({ error: 'Missing start_time' });
      }
      
      if (!end_time) {
        console.error('Missing end_time in request');
        return res.status(400).json({ error: 'Missing end_time' });
      }
      
      console.log('Validated values:', { 
        coach_id: typeof coach_id === 'string' ? parseInt(coach_id) : coach_id,
        start_time,
        end_time
      });
      
      const coach = await UserModel.findById(coach_id);
      console.log('Coach lookup result:', coach);
      
      if (!coach) {
        return res.status(400).json({ error: 'Coach not found' });
      }
      
      if (coach.user_type !== 'coach') {
        return res.status(400).json({ error: 'User is not a coach' });
      }
      
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      
      // Validate start time is in the future
      if (startDate <= new Date()) {
        return res.status(400).json({ error: 'Start time must be in the future' });
      }
      
      // Validate the slot is exactly 2 hours
      const durationInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      console.log('Slot duration in hours:', durationInHours);
      
      if (Math.abs(durationInHours - 2) > 0.001) { 
        return res.status(400).json({ error: 'Availability slots must be exactly 2 hours long' });
      }
      
      const slot = await AvailabilitySlotModel.create(coach_id, startDate, endDate);
      console.log('Slot created successfully:', slot);
      res.status(201).json(slot);
    } catch (error: any) {
      console.error('Error in createSlot:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async getAvailableSlots(req: Request, res: Response) {
    try {
      const dateParam = req.query.date as string;
      
      if (dateParam) {
        const [month, day, year] = dateParam.split('/').map(part => parseInt(part));
        
        // Create start and end of the selected date (in local timezone)
        const startDate = new Date(year, month - 1, day, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);
        
        console.log(`Filtering slots between ${startDate.toISOString()} and ${endDate.toISOString()}`);
        
        const slots = await AvailabilitySlotModel.findAvailableInDateRange(startDate, endDate);
        res.json(slots);
      } else {
        const startAfter = req.query.startAfter ? new Date(req.query.startAfter as string) : new Date();
        const slots = await AvailabilitySlotModel.findAvailable(startAfter);
        res.json(slots);
      }
    } catch (error) {
      console.error("Error in getAvailableSlots:", error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async getCoachSlots(req: Request, res: Response) {
    try {
      const coachId = parseInt(req.params.coachId);
      const includeBooked = req.query.includeBooked === 'true';
      const dateParam = req.query.date as string;
      
      if (dateParam) {
        const [month, day, year] = dateParam.split('/').map(part => parseInt(part));
        
        const startDate = new Date(year, month - 1, day, 0, 0, 0);
        const endDate = new Date(year, month - 1, day, 23, 59, 59);
        
        const slots = await AvailabilitySlotModel.findByCoachIdInDateRange(coachId, includeBooked, startDate, endDate);
        res.json(slots);
      } else {
        const slots = await AvailabilitySlotModel.findByCoachId(coachId, includeBooked);
        res.json(slots);
      }
    } catch (error) {
      console.error("Error in getCoachSlots:", error);
      res.status(500).json({ error: 'Server error' });
    }
  }}

import axios from 'axios';
import { User, AvailabilitySlot, Booking } from '../types';

const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  getCoaches: async (): Promise<User[]> => {
    const response = await api.get('/coaches');
    return response.data;
  },
  getStudents: async (): Promise<User[]> => {
    const response = await api.get('/students');
    return response.data;
  },
};

export const availabilityApi = {
  createSlot: async (coachId: number, startTime: string, endTime: string): Promise<AvailabilitySlot> => {
    console.log('Creating availability slot with exact values:', {
      coach_id: coachId,
      start_time: startTime,
      end_time: endTime
    });
    
    const requestBody = {
      coach_id: coachId,
      start_time: startTime,
      end_time: endTime
    };
    
    try {
      const response = await api.post('/availability', requestBody);
      console.log('Slot created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating slot:', error.response?.data);
      throw error;
    }
  },
  getCoachSlots: async (coachId: number, options: { 
    includeBooked?: boolean,
    date?: string
  } = {}): Promise<AvailabilitySlot[]> => {
    const { includeBooked = true, date } = options;
    let url = `/availability/coach/${coachId}?includeBooked=${includeBooked}`;
    
    if (date) {
      url += `&date=${encodeURIComponent(date)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  getAvailableSlots: async (date?: string): Promise<AvailabilitySlot[]> => {
    let url = '/availability';
    
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  getAvailableDates: async (): Promise<string[]> => {
    const response = await api.get('/availability/dates');
    return response.data;
  },
};

export const bookingsApi = {
  createBooking: async (slotId: number, studentId: number): Promise<Booking> => {
    const requestBody = {
      slot_id: slotId,
      student_id: studentId
    };
    
    console.log('Creating booking with exact payload:', JSON.stringify(requestBody));
    
    try {
      const response = await api.post('/bookings', requestBody);
      return response.data;
    } catch (error: any) {
      console.error('Booking API error details:', error.response?.data);
      throw error;
    }
  },
  getBookingDetails: async (id: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  getCoachBookings: async (coachId: number, date?: string): Promise<Booking[]> => {
    let url = `/bookings/coach/${coachId}`;
    
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  getStudentBookings: async (studentId: number, date?: string): Promise<Booking[]> => {
    let url = `/bookings/student/${studentId}`;
    
    if (date) {
      url += `?date=${encodeURIComponent(date)}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },
  submitFeedback: async (id: number, satisfactionScore: number, notes: string): Promise<Booking> => {
    const response = await api.put(`/bookings/${id}/feedback`, { 
      satisfaction_score: satisfactionScore, 
      notes 
    });
    return response.data;
  },
};
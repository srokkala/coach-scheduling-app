export interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;  
    user_type: 'coach' | 'student'; 
    created_at?: string; 
    updated_at?: string;
  }
  
  export interface AvailabilitySlot {
    id: number;
    coachId: number;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    coachName?: string;
  }
  
  export interface Booking {
    id: number;
    slotId: number;
    studentId: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    satisfactionScore?: number;
    notes?: string;
    startTime?: string;
    endTime?: string;
    coachId?: number;
    coachName?: string;
    studentName?: string;
    coachPhone?: string;
    studentPhone?: string;
  }
  
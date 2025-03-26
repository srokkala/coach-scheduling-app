export interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    user_type: 'coach' | 'student';
    created_at: Date;
    updated_at: Date;
  }
  
  export interface AvailabilitySlot {
    id: number;
    coach_id: number;
    start_time: Date;
    end_time: Date;
    is_booked: boolean;
    created_at: Date;
    updated_at: Date;
    coach?: User;
    coach_name?: string;
    coach_email?: string;
    coach_phone?: string;
  }
  
  export interface Booking {
    id: number;
    slot_id: number;
    student_id: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    satisfaction_score?: number;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    slot?: AvailabilitySlot;
    student?: User;
    start_time?: Date;
    end_time?: Date;
    coach_name?: string;
    coach_phone?: string;
    student_name?: string;
    student_phone?: string;
  }
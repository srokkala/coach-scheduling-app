import React, { useState, useEffect } from 'react';
import { AvailabilitySlot } from '../types';
import { availabilityApi, bookingsApi } from '../services/api';
import { useUser } from '../context/UserContext';

interface StudentBookSlotProps {
  onBookingComplete?: () => void; 
}

const StudentBookSlot: React.FC<StudentBookSlotProps> = ({ onBookingComplete }) => {
  const { currentUser } = useUser();
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [availableCoaches, setAvailableCoaches] = useState<{id: number, name: string}[]>([]);

  // Load available dates
  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      // This would ideally be a new API endpoint, but for now we'll use the existing one
      const slots = await availabilityApi.getAvailableSlots();
      
      // Extract unique dates and coaches
      const uniqueDates = new Set<string>();
      const uniqueCoaches = new Map<number, string>();
      
      slots.forEach((slot: any) => {
        if (slot.start_time) {
          const date = new Date(slot.start_time).toLocaleDateString();
          uniqueDates.add(date);
        }
        
        if (slot.coach_id && slot.coach_name) {
          uniqueCoaches.set(slot.coach_id, slot.coach_name);
        }
      });
      
      const sortedDates = Array.from(uniqueDates).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      setAvailableDates(sortedDates);
      
      // Default to the earliest date available
      if (sortedDates.length > 0 && !selectedDate) {
        setSelectedDate(sortedDates[0]);
      }
      
      setAvailableCoaches(Array.from(uniqueCoaches.entries()).map(([id, name]) => ({ id, name })));
      
    } catch (err) {
      console.error("Error loading available dates:", err);
      setError('Failed to load available dates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const slots = await availabilityApi.getAvailableSlots(selectedDate);
      console.log("Available slots:", slots);
      setAvailableSlots(slots);
      
      if (slots.length === 0) {
        setError("No available coaching slots found for the selected date.");
      } else {
        setError('');
      }
    } catch (err) {
      console.error("Error loading available slots:", err);
      setError('Failed to load available slots. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // First load available dates
  useEffect(() => {
    if (currentUser && currentUser.user_type === 'student') {
      loadAvailableDates();
    }
  }, [currentUser]);

  // Then load slots for the selected date
  useEffect(() => {
    if (currentUser && currentUser.user_type === 'student' && selectedDate) {
      loadAvailableSlots();
    }
  }, [currentUser, selectedDate]);

  const handleBookSlot = async (slotId: number) => {
    if (!currentUser) return;
    
    try {
      setBooking(true);
      setError('');
      setSuccess('');
      
      console.log(`Booking slot ${slotId} for student ${currentUser.id}`);
      
      const result = await bookingsApi.createBooking(slotId, currentUser.id);
      console.log("Booking result:", result);
      
      setSuccess('Slot booked successfully! Coach contact information is now available in Your Coaching Sessions.');
      
      // Call the callback to refresh upcoming bookings
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      // Refresh available slots
      loadAvailableSlots();
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.response?.data?.error || 'Failed to book slot');
    } finally {
      setBooking(false);
    }
  };

  // Filter slots based on selected coach
  const getFilteredSlots = () => {
    if (!selectedCoach) return availableSlots;
    
    return availableSlots.filter((slot: any) => {
      return String(slot.coach_id) === selectedCoach;
    });
  };

  if (!currentUser || currentUser.user_type !== 'student') {
    return <div>Please log in as a student to book coaching slots.</div>;
  }

  const filteredSlots = getFilteredSlots();

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Book a Coaching Session</h2>
      
      {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '16px' }}>{success}</div>}
      
      {loading ? (
        <div>Loading available slots...</div>
      ) : (
        <div>
          {/* Filters */}
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px',
              alignItems: 'flex-end'
            }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Select Date
                </label>
                <select 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc' 
                  }}
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                  {availableDates.length === 0 && <option value="">No dates available</option>}
                </select>
              </div>
              
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Select Coach
                </label>
                <select 
                  value={selectedCoach} 
                  onChange={(e) => setSelectedCoach(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc' 
                  }}
                >
                  <option value="">All Coaches</option>
                  {availableCoaches.map(coach => (
                    <option key={coach.id} value={coach.id.toString()}>{coach.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Available slots */}
          {availableSlots.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px', textAlign: 'center' }}>
              No available coaching slots found for the selected date.
            </div>
          ) : filteredSlots.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px', textAlign: 'center' }}>
              No slots available with the selected coach on this date.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                Showing {filteredSlots.length} available slot{filteredSlots.length !== 1 ? 's' : ''}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {filteredSlots.map((slot: any) => {
                  try {
                    const startTime = slot.start_time;
                    const endTime = slot.end_time;
                    const coachName = slot.coach_name;
                    
                    return (
                      <div 
                        key={slot.id} 
                        style={{ 
                          padding: '16px', 
                          borderRadius: '8px', 
                          border: '1px solid #ccc',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{ fontWeight: 'bold' }}>
                          {startTime ? new Date(startTime).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : 'Date unavailable'}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          {startTime ? new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} 
                          {' - '}
                          {endTime ? new Date(endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                        </div>
                        <div style={{ color: '#6b7280', marginBottom: '12px' }}>
                          <strong>Coach:</strong> {coachName || 'Unknown'}
                        </div>
                        <button
                          onClick={() => handleBookSlot(slot.id)}
                          disabled={booking}
                          style={{ 
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: booking ? 'not-allowed' : 'pointer',
                            opacity: booking ? 0.7 : 1
                          }}
                        >
                          {booking ? 'Booking...' : 'Book This Slot'}
                        </button>
                      </div>
                    );
                  } catch (error) {
                    console.error("Error rendering slot:", slot, error);
                    return null;
                  }
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentBookSlot;
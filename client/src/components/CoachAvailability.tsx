import React, { useState, useEffect, useCallback } from 'react';
import { AvailabilitySlot } from '../types';
import { availabilityApi, bookingsApi } from '../services/api';
import { useUser } from '../context/UserContext';
import { addHours, isAfter } from 'date-fns';

const CoachAvailability: React.FC = () => {
  const { currentUser } = useUser();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<{[slotId: number]: any}>({});

  const loadAvailableDates = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await availabilityApi.getCoachSlots(currentUser.id);
      
      const uniqueDates = new Set<string>();
      response.forEach((slot: any) => {
        if (slot.start_time) {
          const date = new Date(slot.start_time).toLocaleDateString();
          uniqueDates.add(date);
        }
      });
      
      const sortedDates = Array.from(uniqueDates).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );
      
      setAvailableDates(sortedDates);
      
      // Set first date as selected if none is selected
      if (sortedDates.length > 0 && !selectedDate) {
        setSelectedDate(sortedDates[0]);
      }
      
    } catch (err) {
      console.error("Error loading available dates:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedDate]);

  // Load student details for booked slots
  const loadBookingDetails = async (slots: AvailabilitySlot[]) => {
    try {
      const bookedSlots = slots.filter((slot: any) => slot.is_booked);
      
      if (bookedSlots.length > 0) {
        // Get all bookings for this coach
        const bookings = await bookingsApi.getCoachBookings(currentUser!.id);
        
        // Create a map of slot_id to booking details
        const bookingMap: {[slotId: number]: any} = {};
        bookings.forEach((booking: any) => {
          if (booking.slot_id) {
            bookingMap[booking.slot_id] = {
              studentName: booking.student_name || 'Unknown',
              studentPhone: booking.student_phone || 'Not available'
            };
          }
        });
        
        setBookingDetails(bookingMap);
      }
    } catch (err) {
      console.error("Error loading booking details:", err);
    }
  };

  const loadSlots = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await availabilityApi.getCoachSlots(currentUser.id, { 
        date: selectedDate 
      });
      console.log("Loaded slots:", response);
      setSlots(response);
      
      // Load booking details for booked slots
      await loadBookingDetails(response);
    } catch (err) {
      console.error("Error loading slots:", err);
      setError('Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedDate]);

  useEffect(() => {
    if (currentUser && currentUser.user_type === 'coach') {
      loadAvailableDates();
    }
  }, [currentUser, loadAvailableDates]);

  useEffect(() => {
    if (currentUser && currentUser.user_type === 'coach' && selectedDate) {
      loadSlots();
    }
  }, [currentUser, selectedDate, loadSlots]);

  const handleCreateSingleSlot = async (startDateTime: Date, endDateTime: Date) => {
    try {
      console.log(`Attempting to create slot: ${startDateTime.toISOString()} - ${endDateTime.toISOString()}`);
      await availabilityApi.createSlot(
        currentUser!.id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
      return true;
    } catch (err: any) {
      console.error("Error creating individual slot:", err);
      setError(err.response?.data?.error || 'Failed to create availability slot');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setCreating(true);
      setError('');
      setSuccess('');

      if (!startDate || !startTime) {
        setError('Please select both date and time');
        return;
      }

      // For single slot
      if (!endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const slotEndTime = addHours(startDateTime, 2);
        
        if (!isAfter(startDateTime, new Date())) {
          setError('Start time must be in the future');
          return;
        }

        const success = await handleCreateSingleSlot(startDateTime, slotEndTime);
        if (success) {
          setSuccess('Availability slot created successfully');
        }
      } 
      // For multiple slots in a range
      else {
        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${startDate}T${endTime}`);
        
        if (!isAfter(startDateTime, new Date())) {
          setError('Start time must be in the future');
          return;
        }
        
        if (!isAfter(endDateTime, startDateTime)) {
          setError('End time must be after start time');
          return;
        }
        
        // Create slots in 2-hour increments
        let currentStart = new Date(startDateTime);
        let slotsCreated = 0;
        let anyFailures = false;
        
        // Continue creating slots until we reach the end time
        while (currentStart.getTime() + (2 * 60 * 60 * 1000) <= endDateTime.getTime()) {
          let currentEnd = new Date(currentStart);
          currentEnd.setHours(currentEnd.getHours() + 2);
          
          console.log(`Creating slot from ${currentStart.toISOString()} to ${currentEnd.toISOString()}`);
          
          const success = await handleCreateSingleSlot(currentStart, currentEnd);
          
          if (success) {
            slotsCreated++;
          } else {
            anyFailures = true;
          }
          
          currentStart = new Date(currentEnd);
        }
        
        if (slotsCreated > 0) {
          if (anyFailures) {
            setSuccess(`${slotsCreated} availability slot(s) created successfully, but some failed.`);
          } else {
            setSuccess(`${slotsCreated} availability slot(s) created successfully`);
          }
        } else {
          setError('Failed to create any availability slots');
        }
      }
      
      setStartDate('');
      setStartTime('');
      setEndTime('');
      await loadAvailableDates();
      await loadSlots();
    } catch (err: any) {
      console.error("Error creating slot:", err);
      setError(err.response?.data?.error || 'Failed to create availability slot');
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser || currentUser.user_type !== 'coach') {
    return <div>Please log in as a coach to manage availability.</div>;
  }

  return (
    <div>
      <h2>Manage Your Availability</h2>
      
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Add New Availability Slot</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>End Time (Optional)</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
              Leave blank for single slot
            </small>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            flex: '0 0 auto', 
            marginTop: 'auto' 
          }}>
            <button 
              type="submit" 
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: creating ? 0.7 : 1
              }}
              disabled={creating}
            >
              {creating ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </div>
        {error && <div style={{ marginTop: '12px', color: 'red' }}>{error}</div>}
        {success && <div style={{ marginTop: '12px', color: 'green' }}>{success}</div>}
        <div style={{ marginTop: '12px', color: '#666' }}>
          <p>Note: All availability slots are 2 hours long</p>
        </div>
      </form>
      
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Your Upcoming Availability</h3>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px' }}>View Date:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              padding: '6px 12px',
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
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : slots.length === 0 ? (
        <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
          No availability slots found for the selected date.
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          {slots.map((slot: any) => {
            const startTime = slot.start_time;
            const endTime = slot.end_time;
            const isBooked = slot.is_booked;
            const slotId = slot.id;
            
            // Get booking details if this slot is booked
            const booking = isBooked ? bookingDetails[slotId] : null;
            
            return (
              <div 
                key={slot.id} 
                style={{ 
                  padding: '16px', 
                  borderRadius: '8px', 
                  border: '1px solid #ccc',
                  backgroundColor: isBooked ? '#f3f4f6' : 'white'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {startTime ? new Date(startTime).toLocaleDateString() : 'Date unavailable'}
                </div>
                <div style={{ marginBottom: isBooked ? '12px' : '0' }}>
                  {startTime ? new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} 
                  {' - '}
                  {endTime ? new Date(endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                </div>
                
                {isBooked && booking && (
                  <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                    <div><strong>Student:</strong> {booking.studentName}</div>
                    <div><strong>Phone:</strong> {booking.studentPhone}</div>
                  </div>
                )}
                
                <div style={{ marginTop: '12px' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    backgroundColor: isBooked ? '#fee2e2' : '#dcfce7',
                    color: isBooked ? '#991b1b' : '#166534'
                  }}>
                    {isBooked ? 'Booked' : 'Available'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CoachAvailability;
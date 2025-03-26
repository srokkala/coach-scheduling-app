import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingsApi } from '../services/api';
import { useUser } from '../context/UserContext';
import { isValidDate } from '../utils/dateUtils';

const StudentBookings: React.FC = () => {
  const { currentUser } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.user_type === 'student') {
      loadBookings();
    }
  }, [currentUser]);

  const loadBookings = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log("Fetching bookings for student:", currentUser.id);
      const response = await bookingsApi.getStudentBookings(currentUser.id);
      console.log("Received student bookings:", response);
      setBookings(response);
    } catch (err) {
      console.error("Error loading student bookings:", err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.user_type !== 'student') {
    return <div>Please log in as a student to view your bookings.</div>;
  }

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const anyB = b as any;
    const startTime = anyB.start_time;
    if (!startTime || !isValidDate(new Date(startTime))) return false;
    return new Date(startTime) > now;
  });
  
  const pastBookings = bookings.filter(b => {
    const anyB = b as any;
    const startTime = anyB.start_time;
    if (!startTime || !isValidDate(new Date(startTime))) return false;
    return new Date(startTime) <= now;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Your Coaching Sessions</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Upcoming Sessions</h3>
            {upcomingBookings.length === 0 ? (
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                No upcoming sessions.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {upcomingBookings.map(booking => {
                  // Use the snake_case properties and convert to any to avoid TS errors
                  const anyBooking = booking as any;
                  return (
                    <div key={booking.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: 'white' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : 'Date unavailable'}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} - {' '}
                        {anyBooking.end_time ? new Date(anyBooking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div><strong>Coach:</strong> {anyBooking.coach_name || 'Unknown'}</div>
                        <div><strong>Phone:</strong> {anyBooking.coach_phone || 'Not available'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '12px' }}>Past Sessions</h3>
            {pastBookings.length === 0 ? (
              <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                No past sessions.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                {pastBookings.map(booking => {
                  const anyBooking = booking as any;
                  return (
                    <div key={booking.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', backgroundColor: 'white' }}>
                      <div style={{ fontWeight: 'bold' }}>
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}) : 'Date unavailable'}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} - {' '}
                        {anyBooking.end_time ? new Date(anyBooking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div><strong>Coach:</strong> {anyBooking.coach_name || 'Unknown'}</div>
                        <div><strong>Phone:</strong> {anyBooking.coach_phone || 'Not available'}</div>
                      </div>
                      {anyBooking.status === 'completed' && (
                        <div style={{ 
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          borderLeft: '4px solid #10b981'
                        }}>
                          <div><strong>Satisfaction Score:</strong> {anyBooking.satisfaction_score || 'N/A'}/5</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentBookings;
import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingsApi } from '../services/api';
import { useUser } from '../context/UserContext';
import { isValidDate } from '../utils/dateUtils';

const CoachBookings: React.FC = () => {
  const { currentUser } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackBooking, setFeedbackBooking] = useState<number | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.user_type === 'coach') {
      loadBookings();
    }
  }, [currentUser]);

  const loadBookings = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      console.log("Fetching bookings for coach:", currentUser.id);
      const response = await bookingsApi.getCoachBookings(currentUser.id);
      console.log("Received coach bookings:", response);
      setBookings(response);
    } catch (err) {
      console.error("Error loading coach bookings:", err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (bookingId: number) => {
    try {
      setSubmitting(true);
      await bookingsApi.submitFeedback(bookingId, satisfactionScore, notes);
      setFeedbackBooking(null);
      setSatisfactionScore(5);
      setNotes('');
      loadBookings();
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser || currentUser.user_type !== 'coach') {
    return <div>Please log in as a coach to view your bookings.</div>;
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
      
      {error && <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>{error}</div>}
      
      {loading ? (
        <div>Loading bookings...</div>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Upcoming Sessions</h3>
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
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} - 
                        {anyBooking.end_time ? new Date(anyBooking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                      </div>
                      <div>
                        <div><strong>Student:</strong> {anyBooking.student_name || 'Unknown'}</div>
                        <div><strong>Phone:</strong> {anyBooking.student_phone || 'Not available'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '16px' }}>Past Sessions</h3>
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
                        {anyBooking.start_time ? new Date(anyBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'} - 
                        {anyBooking.end_time ? new Date(anyBooking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time unavailable'}
                      </div>
                      <div>
                        <div><strong>Student:</strong> {anyBooking.student_name || 'Unknown'}</div>
                        <div><strong>Phone:</strong> {anyBooking.student_phone || 'Not available'}</div>
                      </div>
                      
                      {booking.status === 'completed' ? (
                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                          <div><strong>Satisfaction Score:</strong> {anyBooking.satisfaction_score || 0}/5</div>
                          <div><strong>Notes:</strong> {anyBooking.notes || 'No notes provided'}</div>
                        </div>
                      ) : feedbackBooking === booking.id ? (
                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                          <h4 style={{ marginBottom: '12px', fontWeight: '500' }}>Record Feedback</h4>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Satisfaction Score (1-5)</label>
                            <select
                              value={satisfactionScore}
                              onChange={(e) => setSatisfactionScore(parseInt(e.target.value))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                            >
                              {[1, 2, 3, 4, 5].map(score => (
                                <option key={score} value={score}>{score}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Notes</label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', resize: 'vertical' }}
                              placeholder="Enter session notes here..."
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleSubmitFeedback(booking.id)}
                              disabled={submitting}
                              style={{ 
                                padding: '8px 12px', 
                                backgroundColor: '#3b82f6', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                fontWeight: '500', 
                                cursor: 'pointer',
                                opacity: submitting ? 0.7 : 1 
                              }}
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                              onClick={() => setFeedbackBooking(null)}
                              style={{ 
                                padding: '8px 12px', 
                                backgroundColor: '#f3f4f6', 
                                color: '#1f2937', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '4px', 
                                fontWeight: '500', 
                                cursor: 'pointer' 
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setFeedbackBooking(booking.id)}
                          style={{ 
                            marginTop: '12px',
                            padding: '8px 12px', 
                            backgroundColor: '#10b981', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            fontWeight: '500', 
                            cursor: 'pointer' 
                          }}
                        >
                          Record Feedback
                        </button>
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

export default CoachBookings;
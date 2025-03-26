import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import UserSwitcher from '../components/UserSwitcher';
import CoachAvailability from '../components/CoachAvailability';
import CoachBookings from '../components/CoachBookings';
import StudentBookSlot from '../components/StudentBookSlot';
import StudentBookings from '../components/StudentBookings';

const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [bookingsKey, setBookingsKey] = useState(0); 

  const refreshBookings = () => {
    setBookingsKey(prevKey => prevKey + 1);
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px'
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        marginBottom: '24px'
      }}>
        Stepful Coaching Platform
      </h1>
      
      <UserSwitcher />
      
      {currentUser && currentUser.user_type === 'coach' && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <CoachAvailability />
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '20px'
          }}>
            <CoachBookings />
          </div>
        </div>
      )}
      
      {currentUser && currentUser.user_type === 'student' && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <StudentBookSlot onBookingComplete={refreshBookings} />
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            padding: '20px'
          }}>
            <StudentBookings key={bookingsKey} /> 
          </div>
        </div>
      )}
      
      {!currentUser && (
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px', 
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '18px' }}>Please select a user above to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
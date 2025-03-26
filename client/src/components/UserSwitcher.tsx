import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';

const UserSwitcher: React.FC = () => {
  const { currentUser, switchUser, users, loadUsers } = useUser();

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginBottom: '24px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>Coaches:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {users
            .filter(user => user.user_type === 'coach')
            .map(user => (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                style={{ 
                  padding: '8px 16px',
                  border: currentUser?.id === user.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: currentUser?.id === user.id ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: currentUser?.id === user.id ? '600' : 'normal'
                }}
              >
                {user.name}
              </button>
            ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>Students:</h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {users
            .filter(user => user.user_type === 'student')
            .map(user => (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                style={{ 
                  padding: '8px 16px',
                  border: currentUser?.id === user.id ? '2px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: currentUser?.id === user.id ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  fontWeight: currentUser?.id === user.id ? '600' : 'normal'
                }}
              >
                {user.name}
              </button>
            ))}
        </div>
      </div>
      
      {currentUser ? (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ display: 'inline-block', width: '120px' }}>Current User:</strong>
            <span>{currentUser.name}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ display: 'inline-block', width: '120px' }}>Role:</strong>
            <span>{currentUser.user_type === 'coach' ? 'Coach' : 'Student'}</span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ display: 'inline-block', width: '120px' }}>Email:</strong>
            <span>{currentUser.email}</span>
          </div>
          <div>
            <strong style={{ display: 'inline-block', width: '120px' }}>Phone:</strong>
            <span>{currentUser.phone_number}</span>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#6b7280'
        }}>
          No user selected
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
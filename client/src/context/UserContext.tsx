import React, { createContext, useState, useContext, useCallback } from 'react';
import { User } from '../types';
import { usersApi } from '../services/api';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: number) => Promise<void>;
  users: User[];
  loadUsers: () => Promise<User[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      console.log("FETCHING USERS...");
      const response = await usersApi.getAll();
      console.log("USERS RECEIVED:", response);
      setUsers(response);
      return response;
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }, []);

  const switchUser = useCallback(async (userId: number) => {
    try {
      console.log("SWITCHING TO USER ID:", userId);
      const user = await usersApi.getById(userId);
      console.log("USER DETAILS RECEIVED:", user);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, switchUser, users, loadUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase-config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { createUser, getUser, updateUser, UserData } from '../services/firestore';
// Use UserData from firestore service

interface AuthContextType {
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, userData: Omit<UserData, 'uid' | 'createdAt' | 'emailVerified' | 'phoneVerified' | 'isActive'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        setError(null);

        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          // Fetch user data from Firestore
          const userData = await getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            // User doesn't exist in Firestore yet
            setUser(null);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני המשתמש');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const register = async (
    email: string,
    password: string,
    userData: Omit<UserData, 'uid' | 'createdAt' | 'emailVerified' | 'phoneVerified' | 'isActive'>
  ) => {
    try {
      setError(null);
      setLoading(true);

      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: userData.fullName,
      });

      // Create user document in Firestore
      const newUserData: UserData = {
        ...userData,
        uid: firebaseUser.uid,
        email,
        createdAt: new Date(),
        emailVerified: false,
        phoneVerified: false,
        isActive: true,
        currentMonthParcels: 0,
      };

      await createUser(newUserData);
      setUser(newUserData);
      setFirebaseUser(firebaseUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בהרשמה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Fetch user data from Firestore
      const userData = await getUser(firebaseUser.uid);
      if (!userData) {
        throw new Error('משתמש לא נמצא בבסיס הנתונים');
      }

      setFirebaseUser(firebaseUser);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בכניסה';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בהתנתקות';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserData>) => {
    try {
      setError(null);
      setLoading(true);

      if (!firebaseUser) {
        throw new Error('משתמש לא מחובר');
      }

      // Update Firebase Auth profile if needed
      if (updates.fullName) {
        await updateProfile(firebaseUser, {
          displayName: updates.fullName,
        });
      }

      // Update Firestore user document
      await updateUser(firebaseUser.uid, updates);

      // Update local state
      if (user) {
        setUser({
          ...user,
          ...updates,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'שגיאה בעדכון הפרופיל';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


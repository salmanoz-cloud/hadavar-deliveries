import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface Courier {
  id: string;
  fullName: string;
  phone: string;
  username: string;
  assignedAreas: string[];
  isActive: boolean;
  stats: {
    totalPickups: number;
    totalDeliveries: number;
    todayPickups: number;
    todayDeliveries: number;
  };
  createdAt: Date;
}

interface AuthContextType {
  user: FirebaseUser | null;
  courierData: Courier | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [courierData, setCourierData] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Fetch courier data from Firestore
          const courierRef = doc(db, 'couriers', firebaseUser.uid);
          const courierSnap = await getDoc(courierRef);
          
          if (courierSnap.exists()) {
            setCourierData(courierSnap.data() as Courier);
          }
        } else {
          setUser(null);
          setCourierData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // In a real app, you would look up the email by username first
      // For now, we'll use username as email
      const email = `${username}@hadavar.local`;
      
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setCourierData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, courierData, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


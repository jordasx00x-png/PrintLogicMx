import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logoutFirebase } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export const MASTER_USER: User = {
  id: 'printfix_master_admin',
  name: 'Administrador General',
  email: 'admin@printfix.com'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const session = localStorage.getItem('printfix_session');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return MASTER_USER;
      }
    }
    // Auto-login into the single unified master account by default
    localStorage.setItem('printfix_session', JSON.stringify(MASTER_USER));
    return MASTER_USER;
  });

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check Firebase auth state if available, otherwise keep master session
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: 'Administrador General',
          email: firebaseUser.email || 'admin@printfix.com',
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(userData);
        localStorage.setItem('printfix_session', JSON.stringify(userData));
      } else {
        // Maintain local master user session
        const session = localStorage.getItem('printfix_session');
        if (session) {
          try {
            setUser(JSON.parse(session));
          } catch (e) {
            setUser(MASTER_USER);
          }
        }
      }
      setIsAuthReady(true);
    });

    // Ensure auth ready immediately if firebase listener is delayed
    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 300);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (password?: string): Promise<{ success: boolean; error?: string }> => {
    if (password && password.trim() !== '' && password.trim() !== 'PrintLogic2026*' && password.trim() !== 'admin123') {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    setUser(MASTER_USER);
    localStorage.setItem('printfix_session', JSON.stringify(MASTER_USER));
    return { success: true };
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    localStorage.removeItem('printfix_session');
  };

  const isAuthenticated = Boolean(user);

  return { 
    user, 
    isAuthReady, 
    isAuthenticated,
    login, 
    logout 
  };
}

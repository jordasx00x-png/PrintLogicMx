import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logoutFirebase, signInWithGoogle } from '../lib/firebase';

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
        const parsed = JSON.parse(session);
        // If it was the old auto-login dummy master user, let's allow them to log in with Google
        if (parsed && parsed.id && parsed.id !== 'printfix_master_admin') {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario de Google',
          email: firebaseUser.email || 'admin@printfix.com',
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(userData);
        localStorage.setItem('printfix_session', JSON.stringify(userData));
      } else {
        const session = localStorage.getItem('printfix_session');
        if (session) {
          try {
            const parsed = JSON.parse(session);
            // If it's a valid saved session and not the old placeholder
            if (parsed && parsed.id && parsed.id !== 'printfix_master_admin') {
              setUser(parsed);
            } else {
              setUser(null);
            }
          } catch (e) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsAuthReady(true);
    });

    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 400);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await signInWithGoogle();
      if (res.success && res.user) {
        const userData: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          photoURL: res.user.photoURL
        };
        setUser(userData);
        localStorage.setItem('printfix_session', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: res.error || 'No se pudo iniciar sesión con Google' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error inesperado al conectar con Google' };
    }
  };

  const loginWithPassword = async (password?: string): Promise<{ success: boolean; error?: string }> => {
    if (password && password.trim() !== '' && password.trim() !== 'PrintLogic2026*' && password.trim() !== 'admin123') {
      return { success: false, error: 'Contraseña de taller incorrecta' };
    }

    setUser(MASTER_USER);
    localStorage.setItem('printfix_session', JSON.stringify(MASTER_USER));
    return { success: true };
  };

  const login = loginWithPassword; // Backward compatibility

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
    loginWithGoogle,
    loginWithPassword,
    logout 
  };
}

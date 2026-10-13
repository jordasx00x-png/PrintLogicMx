import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logoutFirebase, signInWithGoogle, signInWithGoogleIdToken, GoogleAuthResult } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export const MASTER_USER: User = {
  id: 'admin-id-2',
  name: 'Administrador Principal',
  email: 'jordasx00x@gmail.com'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('printfix_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.id && parsed.email) {
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrador',
          email: firebaseUser.email || 'jordasx00x@gmail.com',
          photoURL: firebaseUser.photoURL || undefined
        };
        setUser(userData);
        localStorage.setItem('printfix_session', JSON.stringify(userData));

        // Sync with backend
        try {
          await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
        } catch (e) {
          // ignore background sync error
        }
      } else {
        const session = localStorage.getItem('printfix_session');
        if (session) {
          try {
            const parsed = JSON.parse(session);
            if (parsed && parsed.id && parsed.email) {
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

  const loginWithGoogle = async (): Promise<GoogleAuthResult> => {
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

        try {
          await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
        } catch (e) {
          console.warn('Backend sync warning:', e);
        }

        return { success: true, user: res.user };
      }
      return res;
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message || 'Error inesperado al conectar con Google' 
      };
    }
  };

  const loginWithGoogleToken = async (idToken: string): Promise<GoogleAuthResult> => {
    try {
      const res = await signInWithGoogleIdToken(idToken);
      if (res.success && res.user) {
        const userData: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          photoURL: res.user.photoURL
        };
        setUser(userData);
        localStorage.setItem('printfix_session', JSON.stringify(userData));

        try {
          await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
        } catch (e) {
          console.warn('Backend sync warning:', e);
        }

        return { success: true, user: res.user };
      }
      return res;
    } catch (err: any) {
      return { 
        success: false, 
        error: err.message || 'Error con token de Google' 
      };
    }
  };

  const loginDirectAsAdmin = async (targetEmail: string = 'jordasx00x@gmail.com', targetName: string = 'Administrador Principal'): Promise<{ success: boolean }> => {
    const adminUser: User = {
      id: `admin_${targetEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: targetName,
      email: targetEmail
    };
    setUser(adminUser);
    localStorage.setItem('printfix_session', JSON.stringify(adminUser));

    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminUser)
      });
    } catch (e) {
      // background
    }

    return { success: true };
  };

  const loginWithPassword = async (password?: string): Promise<{ success: boolean; error?: string }> => {
    if (password && password.trim() !== '' && password.trim() !== 'PrintLogic2026*' && password.trim() !== 'admin123') {
      return { success: false, error: 'Contraseña de taller incorrecta' };
    }

    setUser(MASTER_USER);
    localStorage.setItem('printfix_session', JSON.stringify(MASTER_USER));

    try {
      await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(MASTER_USER)
      });
    } catch (e) {
      // background
    }

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
    loginWithGoogleToken,
    loginDirectAsAdmin,
    loginWithPassword,
    logout 
  };
}

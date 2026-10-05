import { useState } from 'react';
import { signInWithGoogle, logoutFirebase } from '../lib/firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const session = localStorage.getItem('printfix_session');
    return session ? JSON.parse(session) : null;
  });

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        return { success: false, error: googleRes.error || 'No se pudo iniciar sesión con Google' };
      }

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleRes.user),
      });

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('printfix_session', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al autenticar en el servidor' };
      }
    } catch (error: any) {
      console.error('Login with Google failed:', error);
      return { success: false, error: 'Error al conectar con Google' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('printfix_session', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('printfix_session', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al registrarse' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    await logoutFirebase();
    setUser(null);
    localStorage.removeItem('printfix_session');
  };

  return { user, login, loginWithGoogle, register, logout };
}

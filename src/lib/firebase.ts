import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

export function getActiveFirebaseConfig() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('printfix_firebase_config');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        // Only keep if it matches our active project mudix-489022
        if (parsed && parsed.apiKey && parsed.projectId === defaultFirebaseConfig.projectId) {
          return parsed;
        } else {
          // Remove outdated configuration pointing to old project
          localStorage.removeItem('printfix_firebase_config');
        }
      } catch (e) {
        console.warn('Error reading custom firebase config:', e);
      }
    }
  }
  return defaultFirebaseConfig;
}

export function saveCustomFirebaseConfig(config: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('printfix_firebase_config', JSON.stringify(config));
    window.location.reload();
  }
}

export function resetFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('printfix_firebase_config');
    window.location.reload();
  }
}

export const activeConfig = getActiveFirebaseConfig();

const app = !getApps().length ? initializeApp(activeConfig) : getApp();
export const db = activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, activeConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface GoogleAuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
  };
  error?: string;
  errorCode?: string;
  domain?: string;
  projectId?: string;
  settingsUrl?: string;
  providersUrl?: string;
}

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Usuario de Google',
        email: user.email || '',
        photoURL: user.photoURL || undefined
      }
    };
  } catch (error: any) {
    console.error('Google Auth error:', error);
    const code = error.code || '';
    const msg = error.message || '';
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        errorCode: code,
        error: 'La ventana de inicio de sesión con Google fue cerrada antes de completarse.'
      };
    }

    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return {
        success: false,
        errorCode: 'auth/unauthorized-domain',
        domain: currentDomain,
        projectId: activeConfig.projectId,
        settingsUrl: `https://console.firebase.google.com/project/${activeConfig.projectId}/authentication/settings`,
        error: `El dominio '${currentDomain}' aún no está en la lista de dominios autorizados de tu proyecto Firebase '${activeConfig.projectId}'.`
      };
    }

    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      return {
        success: false,
        errorCode: 'auth/operation-not-allowed',
        projectId: activeConfig.projectId,
        providersUrl: `https://console.firebase.google.com/project/${activeConfig.projectId}/authentication/providers`,
        error: `El proveedor 'Google' no está habilitado en tu proyecto Firebase '${activeConfig.projectId}'.`
      };
    }

    if (code === 'auth/popup-blocked') {
      return {
        success: false,
        errorCode: 'auth/popup-blocked',
        error: 'El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para este sitio en la barra de direcciones.'
      };
    }

    return {
      success: false,
      errorCode: code,
      error: msg || 'Error al autenticar con Google. Por favor intenta nuevamente.'
    };
  }
};

export const signInWithGoogleIdToken = async (idToken: string): Promise<GoogleAuthResult> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;
    return {
      success: true,
      user: {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Usuario de Google',
        email: user.email || '',
        photoURL: user.photoURL || undefined
      }
    };
  } catch (error: any) {
    console.error('Error signing in with Google ID token:', error);
    return {
      success: false,
      errorCode: error.code || '',
      error: error.message || 'Error al validar credencial de Google.'
    };
  }
};

export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out from Firebase:', error);
  }
};

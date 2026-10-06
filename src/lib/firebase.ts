import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
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

    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        errorCode: code,
        error: 'Inicio de sesión cancelado'
      };
    }
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return {
        success: false,
        errorCode: 'auth/unauthorized-domain',
        error: `El dominio '${window.location.hostname}' no está autorizado en la Consola de Firebase.`
      };
    }
    if (code === 'auth/popup-blocked') {
      return {
        success: false,
        errorCode: 'auth/popup-blocked',
        error: 'El navegador bloqueó la ventana emergente de Google.'
      };
    }
    return {
      success: false,
      errorCode: code,
      error: msg || 'Error al autenticar con Google'
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

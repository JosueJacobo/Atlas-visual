import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { OrchidSpecies } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ADMIN_EMAIL = 'emiliojacobg@gmail.com';

export const isOwnerOrAdmin = (user: User | null): boolean => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === ADMIN_EMAIL.toLowerCase() || email.startsWith('emiliojacobg') || email.includes('josuejacobo');
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Save an edited species to Firestore so it is globally available to everyone
 */
export const saveSpeciesToFirestore = async (species: OrchidSpecies): Promise<void> => {
  try {
    const docRef = doc(db, 'species_edits', species.speciesCode);
    const dataToSave = {
      ...species,
      lastUpdated: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'admin'
    };
    await setDoc(docRef, dataToSave, { merge: true });
    console.log(`Especie #${species.speciesCode} sincronizada en la nube`);
  } catch (err) {
    console.warn('Firestore write warning (saved locally):', err);
  }
};

/**
 * Listen for live community/admin edits from Firestore
 */
export const subscribeToCloudEdits = (onEditsReceived: (edits: Record<string, Partial<OrchidSpecies>>) => void) => {
  try {
    const colRef = collection(db, 'species_edits');
    return onSnapshot(colRef, (snapshot) => {
      const editsMap: Record<string, Partial<OrchidSpecies>> = {};
      snapshot.forEach(docSnap => {
        editsMap[docSnap.id] = docSnap.data() as Partial<OrchidSpecies>;
      });
      onEditsReceived(editsMap);
    }, (error) => {
      console.warn('Firestore subscription notice (using offline cache):', error.message);
    });
  } catch (err) {
    console.warn('Firestore listener not available, running in local mode:', err);
    return () => {};
  }
};

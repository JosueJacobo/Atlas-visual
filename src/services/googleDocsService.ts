import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrchidSpecies } from '../types';
import { generateGoogleDocsCardHtml, generateContinuousListHtml } from '../utils/googleDocsExport';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is logged in but token was reset on reload, prompt for login when action performed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Creates a new Google Doc via Google Drive Multipart upload.
 * Converting HTML to application/vnd.google-apps.document creates an editable
 * Google Doc that preserves all tables, cells, colors, headers, and formatting!
 */
export async function createGoogleDocFromCard(
  species: OrchidSpecies,
  accessToken: string
): Promise<{ docId: string; docUrl: string; title: string }> {
  const docTitle = `Atlas Orquídeas - ${species.speciesCode} - ${species.scientificName}`;
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @page { size: 6in 9in; margin: 0.35in; }
    body { font-family: Arial, sans-serif; font-size: 9.5pt; color: #1e293b; }
  </style>
</head>
<body>
  ${generateGoogleDocsCardHtml(species)}
</body>
</html>`;

  // Multipart request to Google Drive API
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: docTitle,
    mimeType: 'application/vnd.google-apps.document',
    description: `Ficha botánica de ${species.scientificName} para Atlas de Orquídeas de México (KDP 6x9).`
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    htmlContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error Google Drive API:', errorText);
    throw new Error(`Error al crear documento en Google Docs: ${response.statusText}`);
  }

  const result = await response.json();
  const docId = result.id;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  return {
    docId,
    docUrl,
    title: docTitle
  };
}

/**
 * Creates a master Google Doc containing the continuous numbered catalogue of all species
 */
export async function createGoogleDocMasterCatalogue(
  speciesList: OrchidSpecies[],
  accessToken: string
): Promise<{ docId: string; docUrl: string; title: string }> {
  const docTitle = `Catálogo Continuo - Orquídeas de México (${speciesList.length} Especies)`;
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @page { size: 6in 9in; margin: 0.4in; }
    body { font-family: Arial, sans-serif; font-size: 9pt; }
  </style>
</head>
<body>
  ${generateContinuousListHtml(speciesList)}
</body>
</html>`;

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: docTitle,
    mimeType: 'application/vnd.google-apps.document',
    description: `Catálogo completo numerado de ${speciesList.length} especies de orquídeas mexicanas.`
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    htmlContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error Google Drive API:', errorText);
    throw new Error(`Error al crear catálogo en Google Docs: ${response.statusText}`);
  }

  const result = await response.json();
  const docId = result.id;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  return {
    docId,
    docUrl,
    title: docTitle
  };
}

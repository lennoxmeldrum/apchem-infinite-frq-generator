import { getStorage, ref, uploadBytes, FirebaseStorage } from 'firebase/storage';
import { GeneratedFRQ } from '../types';
import { generateStoragePDF, generatePDFFilename } from './pdfService';
import { getFirebaseAppWithAuth, isStorageConfigured } from './firebaseService';

let storage: FirebaseStorage | null = null;

const initializeFirebaseStorage = async (): Promise<FirebaseStorage | null> => {
  if (!isStorageConfigured()) {
    console.log('Firebase not configured - storage disabled');
    return null;
  }

  if (!storage) {
    const app = await getFirebaseAppWithAuth();
    if (!app) {
      return null;
    }

    storage = getStorage(app);
  }

  return storage;
};

// Upload generated FRQ PDF to Cloud Storage
export const uploadFRQToStorage = async (frq: GeneratedFRQ): Promise<string | null> => {
  const storageInstance = await initializeFirebaseStorage();

  if (!storageInstance) {
    console.log('Storage not available - skipping upload');
    return null;
  }

  try {
    const pdfBlob = await generateStoragePDF(frq);
    const filename = generatePDFFilename(frq);
    const storageRef = ref(storageInstance, `frq-archive/${filename}`);

    const snapshot = await uploadBytes(storageRef, pdfBlob, {
      contentType: 'application/pdf',
      customMetadata: {
        frqType: frq.metadata.frqTypeShort,
        unit: frq.metadata.unit,
        subTopics: frq.metadata.selectedSubTopics.join(', '),
        maxPoints: frq.maxPoints.toString(),
        generatedAt: new Date().toISOString()
      }
    });

    console.log('FRQ PDF uploaded to storage:', snapshot.ref.fullPath);
    return snapshot.ref.fullPath;
  } catch (error) {
    console.error('Failed to upload FRQ to storage:', error);
    return null;
  }
};

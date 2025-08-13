import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON;
    
    if (!serviceAccount) {
      console.warn('FIREBASE_ADMIN_SDK_JSON not found. Admin features will be disabled.');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;

export default admin; 
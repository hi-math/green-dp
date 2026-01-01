import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getEnv(name: string) {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function isFirebaseAdminConfigured() {
  return !!(
    getEnv("FIREBASE_ADMIN_PROJECT_ID") &&
    getEnv("FIREBASE_ADMIN_CLIENT_EMAIL") &&
    getEnv("FIREBASE_ADMIN_PRIVATE_KEY")
  );
}

export function getFirebaseAdminDb() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY.");
  }

  const projectId = getEnv("FIREBASE_ADMIN_PROJECT_ID")!;
  const clientEmail = getEnv("FIREBASE_ADMIN_CLIENT_EMAIL")!;
  const privateKey = getEnv("FIREBASE_ADMIN_PRIVATE_KEY")!.replace(/\\n/g, "\n");

  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });

  return getFirestore(app);
}



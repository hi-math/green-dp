// lib/firebase.ts
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function getPublicEnv(name: string) {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function getFirebaseConfig() {
  const apiKey = getPublicEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = getPublicEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = getPublicEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = getPublicEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = getPublicEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = getPublicEnv("NEXT_PUBLIC_FIREBASE_APP_ID");

  // 서버/빌드에서 불필요하게 죽지 않게 "명확한" 에러로 처리
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    throw new Error(
      "Firebase client config missing. Set NEXT_PUBLIC_FIREBASE_* env vars in the runtime environment.",
    );
  }

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _persistenceSet = false;

function getFirebaseApp() {
  // Firebase client SDK는 브라우저에서만 쓰는 걸 전제로 함
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK called on the server. Use server API routes instead.");
  }

  if (_app) return _app;
  const config = getFirebaseConfig();
  _app = getApps().length ? getApp() : initializeApp(config);
  return _app;
}

export function getFirebaseAuth() {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  _auth = getAuth(app);
  if (!_persistenceSet) {
    _persistenceSet = true;
    setPersistence(_auth, browserSessionPersistence).catch((e) => {
      console.warn("[AUTH] setPersistence failed:", e);
    });
  }
  return _auth;
}

export function getFirebaseDb() {
  if (_db) return _db;
  const app = getFirebaseApp();
  _db = getFirestore(app);
  return _db;
}

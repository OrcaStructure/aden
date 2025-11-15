// src/lib/firebaseAdmin.js
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawPrivateKey) {
  throw new Error("Missing Firebase admin environment variables");
}

const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

const adminConfig = {
  credential: cert({
    projectId,
    clientEmail,
    privateKey,
  }),
};

const app = getApps().length ? getApp() : initializeApp(adminConfig);

const adminAuth = getAuth(app);

export { adminAuth };

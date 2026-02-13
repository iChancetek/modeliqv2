import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Debug logging to understand build environment
if (typeof window === "undefined") {
    console.log("=== FIREBASE CONFIG DEBUG ===");
    console.log("FIREBASE_APP_HOSTING:", process.env.FIREBASE_APP_HOSTING);
    console.log("FIREBASE_WEBAPP_CONFIG exists:", !!process.env.FIREBASE_WEBAPP_CONFIG);
    if (process.env.FIREBASE_WEBAPP_CONFIG) {
        try {
            const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
            console.log("FIREBASE_WEBAPP_CONFIG keys:", Object.keys(config));
            console.log("apiKey present:", !!config.apiKey);
        } catch (e) {
            console.error("Error parsing FIREBASE_WEBAPP_CONFIG:", e);
        }
    }
    console.log("============================");
}

const firebaseConfig = process.env.FIREBASE_WEBAPP_CONFIG
    ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG)
    : {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    import("firebase/analytics").then((isSupported) => {
        isSupported.isSupported().then((supported) => {
            if (supported) {
                analytics = isSupported.getAnalytics(app);
            }
        });
    });
}

export { app, auth, db, storage, analytics };

import type { NextConfig } from "next";

// Parse Firebase App Hosting config to make it available at runtime via environment encoding
let firebaseConfig: any = {};
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  } catch (e) {
    console.error("Error parsing FIREBASE_WEBAPP_CONFIG in next.config.ts", e);
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    // Inject Firebase config vars so they are properly inlined during build
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId,
  }
};

export default nextConfig;

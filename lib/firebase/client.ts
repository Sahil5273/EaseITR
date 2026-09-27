"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebasePublicConfig } from "./public-config";

let app: FirebaseApp | null = null;

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebasePublicConfig);
  }
  return getAuth(app);
}

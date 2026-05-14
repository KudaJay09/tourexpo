"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

function getFriendlyFirebaseAuthError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const authError = error as { code?: unknown; message?: unknown };
    const code = typeof authError.code === "string" ? authError.code : "";

    switch (code) {
      case "auth/configuration-not-found":
        return "Firebase Authentication is not configured for this project. Check the Firebase web app settings and make sure Email/Password or Google sign-in is enabled.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for Firebase Authentication. Add the current site to the authorized domains list in Firebase.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/email-already-in-use":
        return "That email is already registered. Try signing in instead.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/operation-not-allowed":
        return "Email/password sign-up is disabled in Firebase. Enable it in the Firebase console.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/user-not-found":
        return "No account found for that email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        break;
    }

    if (typeof authError.message === "string" && authError.message.trim()) {
      return authError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Authentication failed.";
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      throw new Error(getFriendlyFirebaseAuthError(error));
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase Auth not initialized");
    }

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error: unknown) {
      throw new Error(getFriendlyFirebaseAuthError(error));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

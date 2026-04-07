"use client";

// lib/auth-context.tsx
// React context providing Firebase Auth state to the entire application.
// Exposes: user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, authError, isNewUser

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  profileComplete: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check profile completion from MongoDB
        try {
          const res = await fetch(`/api/auth/profile?uid=${encodeURIComponent(firebaseUser.uid)}`);
          if (res.ok) {
            const data = await res.json();
            setProfileComplete(data.profileComplete || false);
          }
        } catch {
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
        setIsNewUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Sync user to MongoDB and return isNew ────────────────────
  const syncToMongoDB = async (firebaseUser: User) => {
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.isNewUser as boolean;
      }
    } catch (err) {
      console.warn("[Auth] MongoDB sync failed:", err);
    }
    return false;
  };

  // ── Google Sign-In ───────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    try {
      setAuthError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const newUser = await syncToMongoDB(firebaseUser);

      // Check profile completion
      const profileRes = await fetch(`/api/auth/profile?uid=${encodeURIComponent(firebaseUser.uid)}`);
      let complete = false;
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        complete = profileData.profileComplete || false;
      }
      setProfileComplete(complete);
      setIsNewUser(newUser || !complete);
      setUser(firebaseUser);
    } catch (error: any) {
      console.error("[Auth] Google sign-in error:", error);
      const msg =
        error.code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled. Please try again."
          : error.code === "auth/network-request-failed"
          ? "Network error. Check your connection."
          : "Sign-in failed. Please try again.";
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Email/Password Sign-In ───────────────────────────────────
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      await syncToMongoDB(firebaseUser);

      const profileRes = await fetch(`/api/auth/profile?uid=${encodeURIComponent(firebaseUser.uid)}`);
      let complete = false;
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        complete = profileData.profileComplete || false;
      }
      setProfileComplete(complete);
      setIsNewUser(!complete);
      setUser(firebaseUser);
    } catch (error: any) {
      console.error("[Auth] Email sign-in error:", error);
      const msg =
        error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : error.code === "auth/too-many-requests"
          ? "Too many attempts. Please try again later."
          : error.code === "auth/network-request-failed"
          ? "Network error. Check your connection."
          : "Sign-in failed. Please try again.";
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Email/Password Sign-Up ───────────────────────────────────
  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    try {
      setAuthError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Set display name in Firebase
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Sync to MongoDB — will be a new user
      await syncToMongoDB(firebaseUser);
      setProfileComplete(false);
      setIsNewUser(true);
      setUser(firebaseUser);
    } catch (error: any) {
      console.error("[Auth] Email sign-up error:", error);
      const msg =
        error.code === "auth/email-already-in-use"
          ? "This email is already registered. Please sign in."
          : error.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : error.code === "auth/invalid-email"
          ? "Please enter a valid email address."
          : "Sign-up failed. Please try again.";
      setAuthError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sign Out ─────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsNewUser(false);
      setProfileComplete(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("studypath_page");
      }
    } catch (error) {
      console.error("[Auth] Sign-out error:", error);
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        profileComplete,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

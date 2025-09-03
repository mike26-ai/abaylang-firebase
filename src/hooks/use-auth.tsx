
"use client";

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { PropsWithChildren} from 'react';
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/config/site";
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

type UserType = FirebaseUser & { isAdmin?: boolean };

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Correctly check against the imported ADMIN_EMAIL constant
        const isAdminUser = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        setUser({ ...firebaseUser, isAdmin: isAdminUser });
        setIsAdmin(isAdminUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      router.push('/'); // Redirect to home on sign out
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle error appropriately, e.g., show a toast notification
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // New user, create a profile in Firestore
        const userRole = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "student";
        const newUserProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || "New User",
          email: user.email || "",
          role: userRole,
          createdAt: Timestamp.now(),
          photoURL: user.photoURL || null,
          amharicLevel: "not-set", // Default value for new Google sign-ups
        };
        await setDoc(userDocRef, newUserProfile);
      }
      // For both new and existing users, redirect after sign-in
      const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      router.push(isAdminUser ? "/admin/dashboard" : "/profile");
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // Handle errors here, e.g., show a toast notification
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

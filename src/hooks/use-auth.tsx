
"use client";

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import type { PropsWithChildren} from 'react';
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/config/site";
import { useRouter } from 'next/navigation';

type UserType = FirebaseUser & { isAdmin?: boolean };

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
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
  
  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
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

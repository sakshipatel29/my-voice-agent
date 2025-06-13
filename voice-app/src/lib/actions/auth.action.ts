"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { User } from "@/types";

// Set session duration to 2 weeks (maximum allowed by Firebase)
const SESSION_DURATION = 60 * 60 * 24 * 14; // 14 days in seconds

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // Convert to milliseconds
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

type SignUpParams = {
  uid: string;
  name: string;
  email: string;
  password: string;
  userType: "doctor" | "patient";
};

type SignInParams = {
  email: string;
  idToken: string;
};

export const signUp = async (params: SignUpParams) => {
  try {
    // Save user data to Firestore
    await db.collection("users").doc(params.uid).set({
      name: params.name,
      email: params.email,
      userType: params.userType,
      createdAt: new Date().toISOString()
    });

    return { success: true, message: "Success" };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, message: "Failed to sign up" };
  }
};

export const signIn = async (params: SignInParams) => {
  try {
    // Get user data from Firebase Auth
    const userRecord = await auth.getUserByEmail(params.email);
    
    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      // If user doesn't exist in Firestore, create it
      await db.collection("users").doc(userRecord.uid).set({
        name: userRecord.displayName || "",
        email: userRecord.email,
        userType: "patient", // Default to patient if not specified
        createdAt: new Date().toISOString()
      });
    }

    return { success: true, message: "Success" };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, message: "Failed to sign in" };
  }
};

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
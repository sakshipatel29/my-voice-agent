"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const SESSION_DURATION = 60 * 60 * 24 * 7 * 30;

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
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
    // Add your sign up logic here
    return { success: true, message: "Success" };
  } catch (error) {
    return { success: false, message: "Failed to sign up" };
  }
};

export const signIn = async (params: SignInParams) => {
  try {
    // Add your sign in logic here
    return { success: true, message: "Success" };
  } catch (error) {
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
    console.log(error);
    return null;
  }
}
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
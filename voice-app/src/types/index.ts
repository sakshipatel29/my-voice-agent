export interface User {
  id: string;
  name: string;
  email: string;
  userType: "doctor" | "patient";
  expertise?: string;
  createdAt: string;
  photoURL?: string;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
  userType: "doctor" | "patient";
} 
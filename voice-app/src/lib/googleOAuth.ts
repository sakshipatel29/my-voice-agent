import { google } from 'googleapis';

export const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    `${process.env.NEXTAUTH_URL}/api/auth/google-calendar/callback`
  );
}
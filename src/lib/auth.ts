import { db } from "./db";

// For now, using a simple admin check. In a real application,
// you would use a proper authentication system like NextAuth.js
export async function checkAdminCredentials(email: string, password: string) {
  // In a real application, you'd hash the password and verify against a database
  // For this implementation, we'll use hardcoded admin credentials
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "arush221617@gmail.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "amir1386"; // In real app, this should be hashed

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      id: "admin",
      email: ADMIN_EMAIL,
      name: "Admin User",
    };
  }

  return null;
}

// Set admin session token
export function setAdminSession() {
  // This function should be called from a server action or API route
  // Implementation moved to the API route
}

// Clear admin session
export function clearAdminSession() {
  // This function should be called from a server action or API route
  // Implementation moved to the API route
}

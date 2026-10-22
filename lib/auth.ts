"use client";

import type { UserProfile } from "@itoolbox/ui/types";

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
}

const TOKEN_KEY = "itoolbox_access_token";
const USER_KEY = "itoolbox_user_profile";

// NEXT_PUBLIC_API_URL is baked in at build time (the static export doesn't read
// env vars at runtime). When none was baked in, fall back to the host the browser
// loaded this page from, on the API's default port, so a local or LAN deploy
// follows IP changes without a rebuild.
export function apiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined") return `http://${window.location.hostname}:8100`;
  return "http://localhost:8100";
}

export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  return { token, user: userStr ? (JSON.parse(userStr) as UserProfile) : null };
}

export function storeAuth(token: string, user: UserProfile): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const res = await fetch(`${apiUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : "Sign-in failed");
  }
  const data = await res.json();
  storeAuth(data.access_token, data.user);
  return { token: data.access_token, user: data.user };
}

export function logout(): void {
  clearAuth();
  window.location.href = "/login";
}

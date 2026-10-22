"use client";

import { createContext, useContext } from "react";
import { DEFAULT_BRANDING, type Branding } from "@/lib/branding";

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING);

/** Visual identity (name, logo, tagline). Call sites never read lib/branding directly,
 * so a runtime overlay from the backend can be added here without touching them. */
export function useBranding(): Branding {
  return useContext(BrandingContext);
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  return <BrandingContext.Provider value={DEFAULT_BRANDING}>{children}</BrandingContext.Provider>;
}

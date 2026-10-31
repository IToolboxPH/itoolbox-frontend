"use client";

import { createContext, useContext } from "react";
import { DEFAULT_BRANDING, type Branding } from "@/lib/branding";
import type { ModuleContentOverride } from "@/lib/platform-apps";

interface PlatformConfig {
  branding: Branding;
  moduleContent: Record<string, ModuleContentOverride>;
  moduleVisibility: Record<string, boolean>;
}

// itoolbox-backend has no platform-settings route yet, so this is the
// build-time config. When one lands, fetch it here and every page follows.
const DEFAULT_CONFIG: PlatformConfig = {
  branding: DEFAULT_BRANDING,
  moduleContent: {},
  moduleVisibility: {},
};

const PlatformConfigContext = createContext<PlatformConfig>(DEFAULT_CONFIG);

/** Visual identity (name, logo, tagline). Call sites never read lib/branding directly,
 * so a runtime overlay from the backend can be added here without touching them. */
export function useBranding(): Branding {
  return useContext(PlatformConfigContext).branding;
}

/** Per-module overrides layered on top of PLATFORM_APPS (lib/platform-apps.ts). */
export function useModuleOverrides() {
  const { moduleContent, moduleVisibility } = useContext(PlatformConfigContext);
  return { moduleContent, moduleVisibility };
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  return <PlatformConfigContext.Provider value={DEFAULT_CONFIG}>{children}</PlatformConfigContext.Provider>;
}

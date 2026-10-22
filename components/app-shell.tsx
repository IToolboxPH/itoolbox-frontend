"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Database, LogOut, Moon, Sparkles, Sun } from "lucide-react";

import { useBranding } from "@/components/branding-provider";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { getStoredAuth, logout } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@itoolbox/ui/types";

const NAV = [
  { href: "/agent", label: "Ask Why", icon: Sparkles },
  { href: "/sources", label: "Data sources", icon: Database },
];

/** Signed-in frame: top bar, navigation, and the redirect to /login without a token. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const branding = useBranding();
  const { dark, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const { token, user } = getStoredAuth();
    if (!token) router.replace("/login");
    else setUser(user);
  }, [router]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
          <Link href="/agent" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images unoptimized */}
            <img src={branding.iconSrc} alt="" className="size-7" />
            <span className="font-semibold">{branding.shortName}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith(href)
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.full_name || user.email}</span>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredAuth } from "@/lib/auth";

/** The static export has no server to redirect from, so the root page routes in the browser. */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredAuth().token ? "/agent" : "/login");
  }, [router]);

  return null;
}

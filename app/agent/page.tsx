"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ask Why moved to /bantay; old /agent?id= links still open their investigation. */
export default function AgentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/bantay${window.location.search}`);
  }, [router]);

  return null;
}

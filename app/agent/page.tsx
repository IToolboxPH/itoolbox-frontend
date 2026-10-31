"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ask Why moved to /bantai; old /agent?id= links still open their investigation. */
export default function AgentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/bantai${window.location.search}`);
  }, [router]);

  return null;
}

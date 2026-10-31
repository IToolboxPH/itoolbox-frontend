"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Data sources moved under BantAI Strategic Intelligence. */
export default function SourcesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/intelligence/sources");
  }, [router]);

  return null;
}

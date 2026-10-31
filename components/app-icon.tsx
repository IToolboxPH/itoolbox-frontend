"use client";

import { useState } from "react";

// Shared branded-icon-with-emoji-fallback renderer, so a module's icon looks
// the same everywhere it's shown (dashboard, account menu) instead of some
// pages using a real image and others silently falling back to plain emoji
// for the exact same module.
export function AppIcon({ icon, imgSrc, name, emojiClassName = "text-3xl", imgClassName = "w-8 h-8" }: {
  icon: string;
  imgSrc?: string;
  name: string;
  emojiClassName?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!imgSrc || failed) return <span className={emojiClassName}>{icon}</span>;
  return (
    <img src={imgSrc} alt={name} className={`${imgClassName} object-cover rounded-lg`} onError={() => setFailed(true)} />
  );
}

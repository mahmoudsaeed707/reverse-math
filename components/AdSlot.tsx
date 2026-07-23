"use client";

import { useEffect, useRef } from "react";

/**
 * Renders an Adsterra/PropellerAds ad unit for the given slot.
 * Falls back to a labeled placeholder box when no zone id is configured,
 * so layout and spacing can be reviewed before real ad codes exist.
 */
export function AdSlot({ slot }: { slot: "top" | "bottom" }) {
  const zoneId =
    slot === "top"
      ? process.env.NEXT_PUBLIC_ADSTERRA_ZONE_TOP
      : process.env.NEXT_PUBLIC_ADSTERRA_ZONE_BOTTOM;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!zoneId || !containerRef.current) return;

    // Adsterra's native banner snippet: an atOptions config object + a script tag
    // that document.write()s the ad into the current script's location.
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `
      atOptions = {
        key: '${zoneId}',
        format: 'iframe',
        height: 90,
        width: 728,
        params: {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;

    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(invokeScript);
  }, [zoneId]);

  if (!zoneId) {
    return (
      <div className="flex h-[90px] w-full max-w-[728px] mx-auto items-center justify-center rounded-lg border border-dashed border-white/20 text-xs text-white/40">
        Ad space ({slot}) — set NEXT_PUBLIC_ADSTERRA_ZONE_{slot.toUpperCase()} to activate
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}

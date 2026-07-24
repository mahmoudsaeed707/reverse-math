"use client";

import { useEffect, useRef } from "react";

/**
 * Renders an Adsterra/PropellerAds ad unit for the given slot.
 * Falls back to a labeled placeholder box when no zone id is configured,
 * so layout and spacing can be reviewed before real ad codes exist.
 */
const SIZES: Record<"top" | "bottom", { width: number; height: number }> = {
  top: { width: 728, height: 90 },
  bottom: { width: 300, height: 250 },
};

export function AdSlot({ slot }: { slot: "top" | "bottom" }) {
  const zoneId =
    slot === "top"
      ? process.env.NEXT_PUBLIC_ADSTERRA_ZONE_TOP
      : process.env.NEXT_PUBLIC_ADSTERRA_ZONE_BOTTOM;
  const { width, height } = SIZES[slot];

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
        height: ${height},
        width: ${width},
        params: {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;

    containerRef.current.appendChild(configScript);
    containerRef.current.appendChild(invokeScript);
  }, [zoneId, width, height]);

  if (!zoneId) {
    return (
      <div
        className="mx-auto flex w-full items-center justify-center rounded-lg border border-dashed border-white/20 text-xs text-white/40"
        style={{ height, maxWidth: width }}
      >
        Ad space ({slot}) — set NEXT_PUBLIC_ADSTERRA_ZONE_{slot.toUpperCase()} to activate
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}

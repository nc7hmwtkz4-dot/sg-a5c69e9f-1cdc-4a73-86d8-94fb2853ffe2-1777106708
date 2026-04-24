import { useEffect } from "react";

/**
 * Google AdSense Component
 * 
 * PRD Requirements:
 * - Sticky banner at bottom on mobile
 * - Horizontal banner between validation form and results
 * - Sidebar on desktop (simulator page)
 * - Never block upload buttons or critical results
 */

type AdSenseProps = {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export function AdSense({ 
  slot, 
  format = "auto", 
  responsive = true,
  style,
  className = ""
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Push ad to AdSense queue
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        ...style
      }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}

/**
 * Sticky Bottom Ad (Mobile)
 * Appears at bottom of screen, doesn't block content
 */
export function StickyBottomAd() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-lg p-2 md:hidden">
      <AdSense 
        slot="sticky-bottom"
        format="horizontal"
        className="min-h-[50px]"
      />
    </div>
  );
}

/**
 * Horizontal Ad (Between sections)
 * Used between form and results
 */
export function HorizontalAd() {
  return (
    <div className="w-full py-4 flex justify-center">
      <AdSense 
        slot="horizontal"
        format="horizontal"
        className="max-w-4xl w-full"
        style={{ minHeight: "90px" }}
      />
    </div>
  );
}

/**
 * Sidebar Ad (Desktop only)
 * Appears on sides of simulator
 */
export function SidebarAd() {
  return (
    <div className="hidden lg:block sticky top-20">
      <AdSense 
        slot="sidebar"
        format="vertical"
        className="w-full"
        style={{ minHeight: "600px", maxWidth: "300px" }}
      />
    </div>
  );
}
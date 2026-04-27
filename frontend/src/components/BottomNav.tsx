import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { NAV_ITEMS } from "../data";
import { theme } from "../theme";
import type { NavId } from "../types";

type BottomNavProps = {
  activeNav: NavId;
  onNavigate: (id: NavId) => void;
  disabledNavIds?: NavId[];
  onStartTour?: () => void;
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export function BottomNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onStartTour,
}: BottomNavProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <SidebarNav
        activeNav={activeNav}
        onNavigate={onNavigate}
        disabledNavIds={disabledNavIds}
        onStartTour={onStartTour}
      />
    );
  }

  return (
    <MobileNav
      activeNav={activeNav}
      onNavigate={onNavigate}
      disabledNavIds={disabledNavIds}
      onStartTour={onStartTour}
    />
  );
}

// ----------------------------------------------------------------------------
// Sidebar (desktop)
// ----------------------------------------------------------------------------
function SidebarNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onStartTour,
}: BottomNavProps) {
  return (
    <div
      style={{
        background: theme.components.nav.background,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        width: "250px",
        padding: "32px 0 24px",
        gap: 4,
      }}
    >
      {/* App title / logo area */}
      <div
        style={{
          padding: "0 24px 32px",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 20,
          color: theme.components.nav.icon,
          letterSpacing: "0.04em",
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          marginBottom: 8,
        }}
      >
        TigerArt
      </div>

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          const isDisabled = disabledNavIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-tour={`nav-${item.id.replace(/_/g, "-")}`}
              aria-label={item.label}
              aria-disabled={isDisabled}
              style={{
                background:
                  isActive && !isDisabled
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 24px",
                borderRadius: 8,
                margin: "0 12px",
                opacity: isDisabled ? 0.35 : 1,
                transition: "opacity 0.2s, background 0.2s",
              }}
            >
              <item.icon
                size={20}
                strokeWidth={isActive && !isDisabled ? 2.2 : 1.9}
                color={theme.components.nav.icon}
              />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: isActive && !isDisabled ? 600 : 400,
                  color: theme.components.nav.icon,
                  letterSpacing: "0.01em",
                }}
              >
                {item.label}
              </span>
              {/* Active indicator bar */}
              {isActive && !isDisabled && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: theme.components.nav.icon,
                    opacity: 0.7,
                  }}
                />
              )}
            </button>
          );
        })}

        {onStartTour && (
          <div style={{ marginTop: "auto", padding: "16px 12px 0" }}>
            <button
              data-tour="nav-tour"
              onClick={onStartTour}
              aria-label="Take tour"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme.components.button.primaryText}`,
                background: `linear-gradient(180deg, ${theme.components.button.primaryBackground}, rgba(255,255,255,0.18))`,
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.18)",
                color: theme.components.button.primaryText,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Info size={16} strokeWidth={2.2} />
              Take tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Bottom bar (mobile / tablet)
// ----------------------------------------------------------------------------
function MobileNav({
  activeNav,
  onNavigate,
  disabledNavIds = [],
  onStartTour,
}: BottomNavProps) {
  return (
    <div
      style={{
        background: theme.components.nav.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "10px 0 12px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isDisabled = disabledNavIds.includes(item.id);
          const isActive = activeNav === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-tour={`nav-${item.id.replace(/_/g, "-")}`}
              style={{
                background: theme.components.button.ghostBackground,
                border: theme.components.button.ghostBorder,
                cursor: "pointer",
                opacity: isDisabled
                  ? 0.35
                  : isActive
                    ? 1
                    : theme.components.nav.inactiveOpacity,
                transition: "opacity 0.2s",
                padding: "4px 10px",
              }}
              aria-label={item.label}
              aria-disabled={isDisabled}
            >
              <item.icon
                size={22}
                strokeWidth={1.9}
                color={theme.components.nav.icon}
              />
            </button>
          );
        })}
      </div>

      {onStartTour && (
        <button
          data-tour="nav-tour"
          onClick={onStartTour}
          aria-label="Take tour"
          style={{
            margin: "10px 12px 0",
            padding: "10px 14px",
            borderRadius: 12,
            border: `1px solid ${theme.components.button.primaryText}`,
            background: `linear-gradient(180deg, ${theme.components.button.primaryBackground}, rgba(255,255,255,0.18))`,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.16)",
            color: theme.components.button.primaryText,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Info size={15} strokeWidth={2.2} />
          Take tour
        </button>
      )}
    </div>
  );
}
